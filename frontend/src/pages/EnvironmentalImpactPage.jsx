import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const pickup = [26.8467, 80.9462];
const current = [26.65, 80.75];
const destination = [26.4499, 80.3319];

const route = [
  pickup,
  [26.78, 80.86],
  [26.70, 80.80],
  current,
  [26.55, 80.55],
  destination,
];

function EnvironmentalMap() {
  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={current}
        zoom={9}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={route}
          pathOptions={{
            color: "#263a2d",
            weight: 5,
          }}
        />

        <Marker position={pickup}>
          <Popup>
            <strong>Pickup Location</strong>
            <br />
            Waste generated here.
          </Popup>
        </Marker>

        <Marker position={current}>
          <Popup>
            <strong>🚛 Waste Transporter</strong>
            <br />
            Manifest: WM-2026-00204
            <br />
            Status: IN TRANSIT
          </Popup>
        </Marker>

        <Marker position={destination}>
          <Popup>
            <strong>Destination Facility</strong>
            <br />
            Waste treatment and recovery.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default EnvironmentalMap;