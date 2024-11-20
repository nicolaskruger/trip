export const ESTIMATE = {
  origin: {
    latitude: 40.712776,
    longitude: -74.005974,
  },
  destination: {
    latitude: 34.052235,
    longitude: -118.243683,
  },
  distance: 450.5,
  duration: '6 hours 30 minutes',
  options: [
    {
      id: 1,
      name: 'Option 1',
      description: 'Standard ride option.',
      vehicle: 'Sedan',
      review: {
        rating: 4.5,
        comment: 'Comfortable ride, but a bit slow.',
      },
      value: 50.0,
    },
    {
      id: 2,
      name: 'Option 2',
      description: 'Fast and efficient ride.',
      vehicle: 'SUV',
      review: {
        rating: 4.8,
        comment: 'Great ride, very quick!',
      },
      value: 70.0,
    },
  ],
  routeResponse: {},
};
