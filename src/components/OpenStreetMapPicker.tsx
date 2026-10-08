'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

export type Coordinates = { latitude: number; longitude: number };

/** Where the map opens when no pin is set yet. It is only a view, never saved as the address location. */
const DEFAULT_VIEW: [number, number] = [-6.2088, 106.8456];

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position, Math.max(map.getZoom(), 15)); }, [map, position]);
  return null;
}

function PlacePinOnClick({ onChange }: { onChange: (value: Coordinates) => void }) {
  useMapEvents({
    click: (event) => onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  });
  return null;
}

const pinIcon = L.divIcon({
  className: 'instant-delivery-pin',
  html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#b77c27;border:3px solid white;box-shadow:0 1px 5px #333"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

/**
 * Map for choosing the delivery pin. `value` is null until the customer places a pin by tapping
 * the map, dragging it, or using their location, so a default point is never saved by accident.
 */
export function OpenStreetMapPicker({ value, onChange }: { value: Coordinates | null; onChange: (value: Coordinates) => void }) {
  const center: [number, number] = value ? [value.latitude, value.longitude] : DEFAULT_VIEW;

  return (
    <MapContainer center={center} zoom={value ? 15 : 12} className="h-64 w-full rounded-xl border border-rose-100" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <PlacePinOnClick onChange={onChange} />
      {value && (
        <>
          <Recenter position={center} />
          <Marker
            position={center}
            icon={pinIcon}
            draggable
            eventHandlers={{ dragend: (event) => {
              const point = event.target.getLatLng();
              onChange({ latitude: point.lat, longitude: point.lng });
            } }}
          />
        </>
      )}
    </MapContainer>
  );
}
