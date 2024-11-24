import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useEffect, useRef } from "react";

const containerStyle = {
  width: "100%",
  height: "250px",
};

const center = {
  lat: 37.7749, // Example Latitude
  lng: -122.4194, // Example Longitude
};

type Way = {
  origin: string;
  destination: string;
};

const Maps = ({ origin, destination }: Way) => {
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    console.log({ origin, destination });
    if (mapRef.current && origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();

      directionsRenderer.setMap(mapRef.current);

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            console.error("Error fetching directions:", status);
          }
        }
      );
    }
  }, [origin, destination]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
      <div className="">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        />
      </div>
    </LoadScript>
  );
};

export { Maps };
