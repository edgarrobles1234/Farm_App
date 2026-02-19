import { Linking, Platform } from "react-native";

export async function openDirections(destination: string) {
  const encoded = encodeURIComponent(destination);

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${encoded}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;

  await Linking.openURL(url);
}
