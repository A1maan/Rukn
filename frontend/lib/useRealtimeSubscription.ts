// frontend/lib/useRealtimeSubscription.ts
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeRequests(onUpdate: () => void) {
  useEffect(() => {
    // Subscribe to INSERT, UPDATE, DELETE on requests table
    const channel: RealtimeChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'requests'
        },
        (payload) => {
          console.log('📡 Realtime update received:', payload);
          onUpdate(); // Trigger refresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

export function useRealtimeAlerts(onUpdate: () => void) {
  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('🚨 Alert update received:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

export function useRealtimeRegionStats(onUpdate: () => void) {
  useEffect(() => {
    // Listen to requests changes to update region stats
    const channel: RealtimeChannel = supabase
      .channel('region-stats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only care about new requests for stats
          schema: 'public',
          table: 'requests'
        },
        (payload) => {
          console.log('📊 New request for region stats:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}