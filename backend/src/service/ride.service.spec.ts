import { MapRoute, MapsRepository } from 'src/repository/maps.repository';
import { Costumer, RideService } from './ride.service';
import { MongoTripRepository } from 'src/repository/mongo.trip.repository';
import { Driver } from 'src/repository/schema/driver.schema';
import { Document } from 'mongoose';

const getDriver = (): Driver =>
  ({
    id: 1,
    name: 'John Doe',
    description: 'Experienced driver with excellent reviews',
    vehicle: 'Sedan',
    review: {
      rating: 4.9,
      comment: 'Punctual and professional service.',
    },
    tax: 1.25,
    minKm: 10,
  }) as Driver;

const getMapRoute = (): MapRoute => ({
  routes: [
    {
      distanceMeters: 12000,
      duration: '5000s',
      legs: [
        {
          startLocation: {
            latLng: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          },
          endLocation: {
            latLng: {
              latitude: 37.7849,
              longitude: -122.4294,
            },
          },
        },
        {
          startLocation: {
            latLng: {
              latitude: 37.7849,
              longitude: -122.4294,
            },
          },
          endLocation: {
            latLng: {
              latitude: 37.7949,
              longitude: -122.4394,
            },
          },
        },
      ],
    },
  ],
});

const getCostumer = (): Costumer => ({
  customer_id: '1234',
  origin: 'São Leopoldo',
  destination: 'Novo Hamburgo',
});

type Order = {
  customer_id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: { id: number; name: string };
  value: number;
};

const getOrder = (): Order => ({
  customer_id: '12345-abcde',
  origin: 'New York, NY',
  destination: 'Los Angeles, CA',
  distance: 4500.5,
  duration: '40h',
  driver: {
    id: 1,
    name: 'John Doe',
  },
  value: 1250.75,
});

describe('ride test', () => {
  const mapRepository = jest.mocked({} as MapsRepository);
  const mongoTripRepository = jest.mocked({} as MongoTripRepository);
  mapRepository.calc = jest.fn();
  mongoTripRepository.pickDriver = jest.fn();
  mongoTripRepository.findDriver = jest.fn();
  mongoTripRepository.updatePreOrder = jest.fn();
  mongoTripRepository.saveOrder = jest.fn();

  beforeEach(() => {
    mapRepository.calc.mockResolvedValue(getMapRoute());
    mongoTripRepository.pickDriver.mockResolvedValue([getDriver()]);
    mongoTripRepository.findDriver.mockResolvedValue(getDriver() as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const rideService: RideService = new RideService(
    mapRepository,
    mongoTripRepository,
  );

  describe('estimate', () => {
    it('empty origin', async () => {
      const costumer = getCostumer();
      delete costumer.origin;
      try {
        await rideService.estimate(costumer);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(typeof error).toBe('string');
      }
    });

    it('empty destination', async () => {
      const costumer = getCostumer();
      delete costumer.destination;
      try {
        await rideService.estimate(costumer);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(typeof error).toBe('string');
      }
    });

    it('empty customer_id', async () => {
      const costumer = getCostumer();
      delete costumer.customer_id;
      try {
        await rideService.estimate(costumer);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(typeof error).toBe('string');
      }
    });

    it('same address', async () => {
      const costumer = getCostumer();
      costumer.origin = costumer.destination;
      try {
        await rideService.estimate(costumer);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(typeof error).toBe('string');
      }
    });
    it('success', async () => {
      const costumer = getCostumer();
      try {
        const estimate = await rideService.estimate(costumer);
        expect(estimate.options.length).toBe(1);
        expect(estimate.origin).toStrictEqual({
          latitude: 37.7749,
          longitude: -122.4194,
        });
        expect(estimate.destination).toStrictEqual({
          latitude: 37.7949,
          longitude: -122.4394,
        });
        expect(estimate.distance).toBe(12000);
        expect(estimate.duration).toBe('5000s');
        expect(estimate.routeResponse).toBeTruthy();
      } catch (error) {
        expect(true).toBeFalsy();
        expect(error).toBeFalsy();
      }
    });
  });

  describe('confirm', () => {
    it('empty origin', async () => {
      try {
        const order = getOrder();
        delete order.origin;
        await rideService.confirm(order);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error.code).toBe(400);
        expect(error.error_code).toBe('INVALID_DATA');
      }
    });

    it('empty destination', async () => {
      try {
        const order = getOrder();
        delete order.destination;
        await rideService.confirm(order);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error.code).toBe(400);
        expect(error.error_code).toBe('INVALID_DATA');
      }
    });

    it('empty costumer', async () => {
      try {
        const order = getOrder();
        delete order.customer_id;
        await rideService.confirm(order);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error.code).toBe(400);
        expect(error.error_code).toBe('INVALID_DATA');
      }
    });

    it('invalid driver', async () => {
      try {
        const order = getOrder();
        mongoTripRepository.findDriver.mockResolvedValue(null);
        await rideService.confirm(order);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error.code).toBe(404);
        expect(error.error_code).toBe('DRIVER_NOT_FOUND');
      }
    });

    it('invalid meters', async () => {
      try {
        const order = getOrder();
        order.distance = 0;
        await rideService.confirm(order);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error.code).toBe(406);
        expect(error.error_code).toBe('INVALID_DISTANCE');
      }
    });
    it('success', async () => {
      try {
        const order = getOrder();
        order.distance = 100000000;
        await rideService.confirm(order);
        expect(true).toBeTruthy();
      } catch (error) {
        expect(error).toBeFalsy();
        expect(true).toBeFalsy();
      }
    });
  });
});
