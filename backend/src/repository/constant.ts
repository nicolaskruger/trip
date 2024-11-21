import { RouteRequest, Way } from './maps.repository';

export const REQUEST_MAP = ({ destination, origin }: Way): RouteRequest => ({
  origin: {
    address: origin,
  },
  destination: {
    address: destination,
  },
  travelMode: 'DRIVE',
  routingPreference: 'TRAFFIC_AWARE',
  computeAlternativeRoutes: false,
  routeModifiers: {
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false,
  },
  languageCode: 'en-US',
  units: 'IMPERIAL',
});
