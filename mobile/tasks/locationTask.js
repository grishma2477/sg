import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { updateDriverLocation } from '../api/rides.api';

export const LOCATION_TASK_NAME = 'sg-driver-background-location';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) return;
  try {
    const { locations } = data;
    if (!locations?.length) return;

    const { latitude, longitude } = locations[0].coords;

    const isOnline = await SecureStore.getItemAsync('driver_online');
    if (isOnline !== 'true') {
      await stopBackgroundLocation();
      return;
    }

    await updateDriverLocation(latitude, longitude);
  } catch (_) {}
});

export async function startBackgroundLocation(hasActiveRide = false) {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') return false;

    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isTracking) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy:          Location.Accuracy.High,
      timeInterval:      hasActiveRide ? 5000 : 15000,
      distanceInterval:  10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "SG — You're Online",
        notificationBody:  'Accepting ride requests',
        notificationColor: '#4f46e5',
      },
    });

    await SecureStore.setItemAsync('driver_online', 'true');
    return true;
  } catch (_) {
    return false;
  }
}

export async function stopBackgroundLocation() {
  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isTracking) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    await SecureStore.deleteItemAsync('driver_online');
  } catch (_) {}
}

export async function updateLocationInterval(hasActiveRide) {
  const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isTracking) await startBackgroundLocation(hasActiveRide);
}
