import { Injectable } from '@nestjs/common';
import { ESTIMATE } from './constantes';

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

  private validateCostumer(costumer) {
    [this.validateNullableCostumer, this.validateCostumerSameAddress].forEach(
      (callback) => callback(costumer),
    );
  }

  async estimate(costumer: Costumer): Promise<Estimate> {
    this.validateCostumer(costumer);
    return ESTIMATE;
  }
}
