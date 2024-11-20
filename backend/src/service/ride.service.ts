import { Injectable } from '@nestjs/common';
import { ESTIMATE } from './constantes';
import { MapsRepository } from 'src/repository/maps.repository';

export type Costumer = {
  customer_id: string;
  origin: string;
  destination: string;
};

type Estimate = {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  duration: string;
  options: {
    id: number;
    name: string;
    description: string;
    vehicle: string;
    review: {
      rating: number;
      comment: string;
    };
    value: number;
  }[];
  routeResponse: object;
};

@Injectable()
export class RideService {
  constructor(private mapsRepository: MapsRepository) {}
  private validateNullableCostumer(costumer: Costumer) {
    if (!costumer) throw 'empty costumer';
    (['customer_id', 'destination', 'origin'] as (keyof Costumer)[]).forEach(
      (key) => {
        if (!costumer[key]) throw `empty ${key}`;
      },
    );
  }
  private validateCostumerSameAddress(costumer: Costumer) {
    if (costumer.destination === costumer.origin) throw 'same address';
  }

  private validateCostumer(costumer: Costumer) {
    [this.validateNullableCostumer, this.validateCostumerSameAddress].forEach(
      (callback) => callback(costumer),
    );
  }

  async estimate(costumer: Costumer): Promise<Estimate> {
    this.validateCostumer(costumer);
    const routeResponse = await this.mapsRepository.calc(costumer);
    return { ...ESTIMATE, routeResponse };
  }
}
