import * as Location from "expo-location";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export async function requestUserLocation(): Promise<UserLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
) {
  const result = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  return result[0] ?? null;
}