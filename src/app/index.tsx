import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pedometer } from "expo-sensors";

export default function Index() {
  const [isPedometerAvailable, setIsPedometerAvailable] =
    useState("checking");

  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startPedometer = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();

      setIsPedometerAvailable(String(isAvailable));

      if (!isAvailable) return;

      const end = new Date();

      const start = new Date();
      start.setDate(end.getDate() - 1);

      const pastStepCountResult = await Pedometer.getStepCountAsync(
        start,
        end
      );

      if (pastStepCountResult) {
        setPastStepCount(pastStepCountResult.steps);
      }

      subscription = Pedometer.watchStepCount((result) => {
        setCurrentStepCount(result.steps);
      });
    };

    startPedometer();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Pedometer
      </Text>

      <Text>
        Available: {isPedometerAvailable}
      </Text>

      <Text>
        Steps in last 24 hours: {pastStepCount}
      </Text>

      <Text>
        Current steps: {currentStepCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
});