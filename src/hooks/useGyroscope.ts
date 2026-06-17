import { Gyroscope } from "expo-sensors";
import { useEffect, useState } from "react";

export const useGyroscope = () => {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [z, setZ] = useState(0);

  useEffect(() => {
    let subscription = { remove: () => {} };
    (async () => {
      const isAvailable = await Gyroscope.isAvailableAsync();
      setAvailable(isAvailable);
      if (!isAvailable) {
        return;
      }
      subscription = Gyroscope.addListener((gyroscopeData) => {
        setX(gyroscopeData.x);
        setY(gyroscopeData.y);
        setZ(gyroscopeData.z);
      });
    })();
    return () => {
      subscription.remove();
    };
  }, []);

  return { available, x, y, z };
};
