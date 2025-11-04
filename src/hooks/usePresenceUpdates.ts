import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GeolocationData } from './useGeolocation';
import { toGeohash, distanceMeters } from '@/lib/geo';
import { FEATURE_FLAGS } from '@/config/featureFlags';

interface UsePresenceUpdatesOptions {
  enabled: boolean;
  location: GeolocationData | null;
}

/**
 * Hook to manage presence updates with intelligent throttling
 * Publishes to Supabase when:
 * - Moved ≥ minDisplacementMeters
 * - ≥ minInterval seconds elapsed
 * - First update after enabling
 */
export const usePresenceUpdates = ({ enabled, location }: UsePresenceUpdatesOptions) => {
  const { user } = useAuth();
  const lastPublishedRef = useRef<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);
  const publishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shouldPublish = useCallback((newLocation: GeolocationData): boolean => {
    if (!lastPublishedRef.current) {
      // First update, always publish
      return true;
    }

    const { lat: lastLat, lng: lastLng, timestamp: lastTime } = lastPublishedRef.current;
    const now = Date.now();
    const timeSinceLastPublish = (now - lastTime) / 1000; // seconds

    // Check displacement
    const displacement = distanceMeters(lastLat, lastLng, newLocation.lat, newLocation.lng);

    // Determine if user is stationary
    const isStationary = (newLocation.speed ?? 0) < FEATURE_FLAGS.locationThrottle.stationarySpeedThreshold;

    const minInterval = isStationary 
      ? FEATURE_FLAGS.locationThrottle.minIntervalStationarySeconds
      : FEATURE_FLAGS.locationThrottle.minIntervalMovingSeconds;

    // Publish if moved enough OR enough time has passed
    if (displacement >= FEATURE_FLAGS.locationThrottle.minDisplacementMeters) {
      if (FEATURE_FLAGS.debugPresenceLogging) {
        console.log('[Presence] Publishing due to displacement:', {
          displacement: displacement.toFixed(1),
          threshold: FEATURE_FLAGS.locationThrottle.minDisplacementMeters,
        });
      }
      return true;
    }

    if (timeSinceLastPublish >= minInterval) {
      if (FEATURE_FLAGS.debugPresenceLogging) {
        console.log('[Presence] Publishing due to time interval:', {
          elapsed: timeSinceLastPublish.toFixed(0),
          threshold: minInterval,
          state: isStationary ? 'stationary' : 'moving',
        });
      }
      return true;
    }

    return false;
  }, []);

  const publishPresence = useCallback(async (locationData: GeolocationData) => {
    if (!user) return;

    const geohash = toGeohash(locationData.lat, locationData.lng);

    try {
      // Update presence table (single row per user)
      const { error: presenceError } = await supabase
        .from('presence')
        .upsert({
          user_id: user.id,
          lat: locationData.lat,
          lng: locationData.lng,
          geohash: geohash,
          updated_at: new Date().toISOString(),
        });

      if (presenceError) {
        console.error('[Presence] Error updating presence:', presenceError);
        return;
      }

      // Also update profile location (for historical tracking)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          lat: locationData.lat,
          lng: locationData.lng,
          geohash: geohash,
          location_accuracy: locationData.accuracy,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[Presence] Error updating profile location:', profileError);
      }

      // Update last published reference
      lastPublishedRef.current = {
        lat: locationData.lat,
        lng: locationData.lng,
        timestamp: Date.now(),
      };

      if (FEATURE_FLAGS.debugPresenceLogging) {
        console.log('[Presence] Published:', {
          lat: locationData.lat.toFixed(6),
          lng: locationData.lng.toFixed(6),
          geohash,
          accuracy: locationData.accuracy,
        });
      }
    } catch (error) {
      console.error('[Presence] Unexpected error:', error);
    }
  }, [user]);

  // Main effect: handle location updates
  useEffect(() => {
    if (!enabled || !location || !user) {
      return;
    }

    // Clear any pending timeout
    if (publishTimeoutRef.current) {
      clearTimeout(publishTimeoutRef.current);
    }

    // Debounce: wait 5 seconds before checking if we should publish
    publishTimeoutRef.current = setTimeout(() => {
      if (shouldPublish(location)) {
        publishPresence(location);
      }
    }, 5000);

    return () => {
      if (publishTimeoutRef.current) {
        clearTimeout(publishTimeoutRef.current);
      }
    };
  }, [enabled, location, user, shouldPublish, publishPresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (publishTimeoutRef.current) {
        clearTimeout(publishTimeoutRef.current);
      }
    };
  }, []);

  return {
    lastPublished: lastPublishedRef.current,
  };
};
