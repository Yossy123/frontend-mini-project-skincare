'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

type Coordinates = { latitude: number; longitude: number };

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position, Math.max(map.getZoom(), 15)); }, [map, position]);
  return null;
}

const pinIcon = L.divIcon({
  className: 'instant-delivery-pin',
  html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#b77c27;border:3px solid white;box-shadow:0 1px 5px #333"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export function OpenStreetMapPicker({ value, onChange }: { value: Coordinates; onChange: (value: Coordinates) => void }) {
  const position: [number, number] = [value.latitude, value.longitude];

  return (
    <MapContainer center={position} zoom={15} className="h-64 w-full rounded-xl border border-rose-100" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter position={position} />
      <Marker
        position={position}
        icon={pinIcon}
        draggable
        eventHandlers={{ dragend: (event) => {
          const point = event.target.getLatLng();
          onChange({ latitude: point.lat, longitude: point.lng });
        } }}
      />
    </MapContainer>
  );
}
