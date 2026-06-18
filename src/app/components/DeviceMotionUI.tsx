import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import useDeviceMotion from "@/hooks/useDevicemotion";

const DeviceMotionUI = () => {
  const {
    acceleration,
    accelerationIncludingGravity,
    rotationRate,
    rotation,
    orientation,
    interval,
  } = useDeviceMotion();

  const SensorCard = ({
    title,
    data,
  }: {
    title: string;
    data: any;
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {Object.entries(data).map(([key, value]) => (
        <View style={styles.row} key={key}>
          <Text style={styles.label}>{key}</Text>
          <Text style={styles.value}>
            {typeof value === "number" ? value.toFixed(3) : value}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Device Motion</Text>

      <View style={styles.intervalCard}>
        <Text style={styles.intervalLabel}>Update Interval</Text>
        <Text style={styles.intervalValue}>
          {interval} ms
        </Text>
      </View>

      <SensorCard
        title="Acceleration"
        data={acceleration}
      />

      <SensorCard
        title="Acceleration + Gravity"
        data={accelerationIncludingGravity}
      />

      <SensorCard
        title="Rotation Rate"
        data={rotationRate}
      />

      <SensorCard
        title="Rotation"
        data={rotation}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Orientation
        </Text>

        <Text style={styles.orientation}>
          {orientation}
        </Text>
      </View>

    </ScrollView>
  );
};

export default DeviceMotionUI;


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#0F172A",
    flexGrow: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },

  intervalCard: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  intervalLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },

  intervalValue: {
    color: "#38BDF8",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  cardTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#94A3B8",
    fontSize: 15,
    textTransform: "capitalize",
  },

  value: {
    color: "#22C55E",
    fontSize: 15,
    fontWeight: "600",
  },

  orientation: {
    color: "#FACC15",
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
  },
});