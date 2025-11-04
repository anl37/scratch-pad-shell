import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GeolocationData } from './useGeolocation';
import { useAuth } from './useAuth';

interface UseLocationRecordingOptions {
  location: GeolocationData | null;
  enabled: boolean;
}

/**
 * Records user location visits in the background to build activity patterns
 * Calls the record-location edge function periodically
 */
export const useLocationRecording = ({ location, enabled }: UseLocationRecordingOptions) => {
  const { user } = useAuth();
  const lastRecordedRef = useRef<number>(0);
  const recordingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || !user || !location || recordingRef.current) {
      return;
    }

    const now = Date.now();
    // Record location every 5 minutes
    if (now - lastRecordedRef.current < 5 * 60 * 1000) {
      return;
    }

    const recordLocation = async () => {
      recordingRef.current = true;
      try {
        const { error } = await supabase.functions.invoke('record-location', {
          body: {
            latitude: location.lat,
            longitude: location.lng,
          },
        });

        if (error) {
          console.error('[LocationRecording] Error:', error);
        } else {
          lastRecordedRef.current = now;
        }
      } catch (err) {
        console.error('[LocationRecording] Exception:', err);
      } finally {
        recordingRef.current = false;
      }
    };

    recordLocation();
  }, [location, enabled, user]);
};
