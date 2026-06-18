import { Magnetometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useMagnetometer = () => {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let subscription = { remove: () => {} };
    (async () => {
      const isAvailable = await Magnetometer.isAvailableAsync();
      setAvailable(isAvailable);
      if (!isAvailable) {
        return;
      }
      subscription = Magnetometer.addListener((magData) => {
        setX(magData.x);
        setY(magData.y);
        setZ(magData.z);
        setHeading(getHeading(magData.x, magData.y));
      });
    })();
    return () => {
      subscription.remove();
    };
  });

  return { available, x, y, z, heading };
};

//calculate heading
function getHeading(x: number, y: number) {
  const radians = Platform.OS === "ios" ? Math.atan2(x, y) : Math.atan2(-x, -y);

  const degrees = (radians * 180) / Math.PI;
  return (degrees + 360) % 360;
}
