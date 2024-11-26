import { MapsRepository } from 'src/repository/maps.repository';
import { Costumer, RideService } from './ride.service';
import { MongoTripRepository } from 'src/repository/mongo.trip.repository';

const getCostumer = (): Costumer => ({
  customer_id: '1234',
  origin: 'São Leopoldo',
  destination: 'Novo Hamburgo',
});

describe('ride test', () => {
  const mapRepository = jest.mocked({} as MapsRepository);
  const mongoTripRepository = jest.mocked({} as MongoTripRepository);

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
  });
});
