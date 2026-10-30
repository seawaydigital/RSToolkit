import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Component to imperatively fly the map to a location
export default function FlyToHandler({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom ?? 10);
    }
  }, [map, target]);

  return null;
}
