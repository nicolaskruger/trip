import { MapRoute, MapsRepository } from 'src/repository/maps.repository';
import { Costumer, RideService } from './ride.service';
import { MongoTripRepository } from 'src/repository/mongo.trip.repository';
import { Driver } from 'src/repository/schema/driver.schema';

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

describe('ride test', () => {
  const mapRepository = jest.mocked({} as MapsRepository);
  const mongoTripRepository = jest.mocked({} as MongoTripRepository);

  mapRepository.calc = jest.fn();
  mapRepository.calc.mockResolvedValue(getMapRoute());

  mongoTripRepository.pickDriver = jest.fn();
  mongoTripRepository.pickDriver.mockResolvedValue([getDriver()]);

  mongoTripRepository.updatePreOrder = jest.fn();

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
      }
    });
  });
});
