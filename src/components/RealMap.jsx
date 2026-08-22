import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const marker = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const updateMap = () => {
      map.invalidateSize(true);
    };

    updateMap();

    const timer = setTimeout(updateMap, 500);

    window.addEventListener("resize", updateMap);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateMap);
    };
  }, [map]);

  return null;
}

function RealMap() {
  const position = [30.7333, 76.7794];

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      className="real-map"
      zoomControl={true}
    >
      <ResizeMap />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Marker position={position} icon={marker}>
        <Popup>
          <strong>MANZILL 777</strong>
          <br />
          Your journey starts here.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default RealMap;