import { Accelerometer } from "expo-sensors";
import { useEffect, useState } from "react";

export const useAccelerometer = () => {
  const [available, setAvailable] = useState(false);
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    let subscription = { remove: () => {} };

    const startAccelerometer = async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();

        setAvailable(isAvailable);

        if (!isAvailable) {
          return;
        }

        Accelerometer.setUpdateInterval(100);

        subscription = Accelerometer.addListener((accelerometerData) => {
          setData({
            x: accelerometerData.x,
            y: accelerometerData.y,
            z: accelerometerData.z,
          });
        });
      } catch (error) {
        console.log("Accelerometer error:", error);
        setAvailable(false);
      }
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    available,
    x: data.x,
    y: data.y,
    z: data.z,
  };
};
