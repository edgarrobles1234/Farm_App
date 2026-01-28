import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Coords } from '@/lib/location';

type PermissionStatus = 'unknown' | 'granted' | 'denied';

export function useCurrentLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationText, setLocationText] = useState<string>('Getting location…');
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('unknown');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus('denied');
        setCoords(null);
        setLocationText('Location permission denied');
        return;
      }

      setPermissionStatus('granted');

      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;

      setCoords({ latitude, longitude });

      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const p = places?.[0];

      if (p) {
        const pretty = [p.city, p.region].filter(Boolean).join(', ');
        setLocationText(pretty || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } else {
        setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (e) {
      setError('Could not get location');
      setLocationText('Could not get location');
      setCoords(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await refresh();
    })();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  return { coords, locationText, permissionStatus, error, refresh };
}
