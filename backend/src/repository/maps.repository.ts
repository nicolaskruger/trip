import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { REQUEST_MAP } from './constant';
import { lastValueFrom } from 'rxjs';

export type RouteRequest = {
  origin: {
    address: string;
  };
  destination: {
    address: string;
  };
  travelMode: string; // Pode ser transformado em um tipo literal como 'DRIVE' | 'WALK' | 'BICYCLE'
  routingPreference: string; // Também pode ser ajustado para um tipo literal, por exemplo, 'TRAFFIC_AWARE' | 'TRAFFIC_UNAWARE'
  computeAlternativeRoutes: boolean;
  routeModifiers: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    avoidFerries: boolean;
  };
  languageCode: string;
  units: string; // Exemplo: 'IMPERIAL' | 'METRIC'
};

export type LatLng = {
  latLng: {
    latitude: number;
    longitude: number;
  };
};

export type Leg = { startLocation: LatLng; endLocation: LatLng };

export type Route = {
  distanceMeters: number;
  duration: string;
  legs: Leg[];
};

export type MapRoute = {
  routes: Route[];
};

export type Way = {
  origin: string;
  destination: string;
};

const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const API_KEY = process.env.GOOGLE_API_KEY;
const HEADERS = {
  headers: {
    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs',
    'X-Goog-Api-Key': API_KEY,
  },
};

@Injectable()
export class MapsRepository {
  constructor(private readonly httpService: HttpService) {}
  async calc(way: Way): Promise<MapRoute> {
    const response = this.httpService.post<MapRoute>(URL, REQUEST_MAP(way), {
      ...HEADERS,
    });
    const { data } = await lastValueFrom(response);
    return data;
  }
}
