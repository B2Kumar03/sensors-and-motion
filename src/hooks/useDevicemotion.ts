import { useEffect, useState } from "react";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type Rotation = {
  alpha: number;
  beta: number;
  gamma: number;
};

const useDeviceMotion = () => {
  const [acceleration, setAcceleration] = useState<Vector3>({
    x: 0,
    y: 0,
    z: 0,
  });

  const [accelerationIncludingGravity, setAccelerationIncludingGravity] =
    useState<Vector3>({
      x: 0,
      y: 0,
      z: 0,
    });

  const [rotationRate, setRotationRate] = useState<Rotation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const [rotation, setRotation] = useState<Rotation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const [orientation, setOrientation] = useState<number>(0);

  const [interval, setInterval] = useState<number>(0);

  useEffect(() => {
    let subscription: any;

    const start = async () => {
      const available = await DeviceMotion.isAvailableAsync();

      if (!available) return;
      DeviceMotion.setUpdateInterval(100);
      subscription = DeviceMotion.addListener(
        (data: DeviceMotionMeasurement) => {
          setAcceleration(data?.acceleration || acceleration);

          setAccelerationIncludingGravity(
            data.accelerationIncludingGravity
          );

          setRotationRate(data?.rotationRate || rotationRate);

          setRotation(data.rotation);

          setOrientation(data.orientation);

          setInterval(data.interval);
        }
      );
    };

    start();

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    acceleration,
    accelerationIncludingGravity,
    rotationRate,
    rotation,
    orientation,
    interval,
  };
};

export default useDeviceMotion;