import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { REQUEST_MAP_MOCK } from './constant';
import { lastValueFrom } from 'rxjs';

type RouteRequest = {
  origin: {
    address: string;
    location?: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  };
  destination: {
    address: string;
    location?: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
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

type MapRoute = {
  routes: {
    distanceMeters: number;
    duration: string;
    polyline: {
      encodedPolyline: string;
    };
  }[];
};

type Way = {
  origin: string;
  destination: string;
};

const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const API_KEY = process.env.GOOGLE_API_KEY;

@Injectable()
export class MapsRepository {
  constructor(private readonly httpService: HttpService) {}
  async calc({ destination, origin }: Way): Promise<MapRoute> {
    const response = this.httpService.post<MapRoute>(
      URL,
      {
        ...REQUEST_MAP_MOCK,
        ...{
          origin: { address: origin },
          destination: { address: destination },
        },
      },
      {
        headers: {
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          'X-Goog-Api-Key': API_KEY,
        },
      },
    );
    const { data } = await lastValueFrom(response);
    return data;
  }
}
