import { Injectable } from '@nestjs/common';
import {
  MapRoute,
  MapsRepository,
  Route,
} from 'src/repository/maps.repository';
import { MongoTripRepository } from 'src/repository/mongo.trip.repository';
import { Driver } from 'src/repository/schema/driver.schema';
import { SimpleDriverType } from 'src/repository/schema/preorder.schema';

export type Costumer = {
  customer_id: string;
  origin: string;
  destination: string;
};

export type Option = {
  id: number;
  name: string;
  description: string;
  vehicle: string;
  review: {
    rating: number;
    comment: string;
  };
  value: number;
};

export type Estimate = {
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
  options: Option[];
  routeResponse: object;
};

type Order = {
  customer_id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: { id: number; name: string };
  value: number;
};

type ConfirmError = {
  code: number;
  error_description: string;
  error_code: 'INVALID_DATA' | 'DRIVER_NOT_FOUND' | 'INVALID_DISTANCE';
};

type OrderDto = {
  order: Order;
  driver: Driver;
};

@Injectable()
export class RideService {
  private throwConfirmError(
    code: number,
    error_description: string,
    error_code: 'INVALID_DATA' | 'DRIVER_NOT_FOUND' | 'INVALID_DISTANCE',
  ) {
    const error: ConfirmError = {
      error_description,
      code,
      error_code,
    };
    throw error;
  }

  private validateNotNullOrder({ order }: OrderDto) {
    (['origin', 'destination', 'customer_id'] as (keyof Order)[]).forEach(
      (key) => {
        if (!order[key]) {
          this.throwConfirmError(400, `empty ${key}`, 'INVALID_DATA');
        }
      },
    );
  }

  private validateSameAddressOrder({
    order: { destination, origin },
  }: OrderDto) {
    if (destination === origin) {
      this.throwConfirmError(400, 'same address', 'INVALID_DATA');
    }
  }

  private validateDriverOrder({ order, driver }: OrderDto) {
    const throwDriverError = (error_description: string) =>
      this.throwConfirmError(404, error_description, 'DRIVER_NOT_FOUND');
    if (!order.driver || !driver) throwDriverError('missing driver');
  }
  validateDistanceOrder({ driver, order }: OrderDto) {
    if (order.distance < driver.minKm * 1000)
      this.throwConfirmError(406, 'invalid distance', 'INVALID_DISTANCE');
  }

  private validateOrder(orderDto: OrderDto) {
    this.validateNotNullOrder(orderDto);
    this.validateSameAddressOrder(orderDto);
    this.validateDriverOrder(orderDto);
    this.validateDistanceOrder(orderDto);
  }

  async confirm(order: Order) {
    const driver = await this.tripRepository.findDriver(order.driver);
    const orderDto: OrderDto = { order, driver };
    this.validateOrder(orderDto);
    this.tripRepository.saveOrder(order);
  }
  constructor(
    private mapsRepository: MapsRepository,
    private tripRepository: MongoTripRepository,
  ) {}
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

  private getFirstRoute(routeResponse: MapRoute): Route {
    const [route] = routeResponse.routes;
    if (!route) throw 'unreachable area';
    return route;
  }

  private joinEstimate({
    drivers,
    routeResponse,
  }: {
    drivers: Driver[];
    routeResponse: MapRoute;
  }): Estimate {
    const route = this.getFirstRoute(routeResponse);

    const [startPoint] = route.legs;
    const [endPoint] = route.legs.slice(-1);

    const options = drivers.map<Option>(
      ({ id, description, name, review, tax, vehicle }) => ({
        id,
        description,
        name,
        review,
        value: (tax * route.distanceMeters) / 1000.0,
        vehicle,
      }),
    );

    return {
      origin: startPoint.startLocation.latLng,
      destination: endPoint.endLocation.latLng,
      distance: route.distanceMeters,
      duration: route.duration,
      options,
      routeResponse,
    };
  }

  private async savePreOrder({
    estimate,
    costumer,
  }: {
    estimate: Estimate;
    costumer: Costumer;
  }) {
    this.tripRepository.updatePreOrder({
      origin: costumer.origin,
      destination: costumer.destination,
      distance: estimate.distance,
      duration: estimate.duration,
      driver: estimate.options.map<SimpleDriverType>(({ id, name, value }) => ({
        id,
        name,
        value,
      })),
    });
  }

  async estimate(costumer: Costumer): Promise<Estimate> {
    this.validateCostumer(costumer);
    const routeResponse = await this.mapsRepository.calc(costumer);
    const drivers = await this.tripRepository.pickDriver(
      this.getFirstRoute(routeResponse),
    );
    const estimate = this.joinEstimate({ drivers, routeResponse });
    await this.savePreOrder({ estimate, costumer });
    return estimate;
  }
}
