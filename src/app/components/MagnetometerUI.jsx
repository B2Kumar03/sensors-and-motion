import { useMagnetometer } from "@/hooks/useMagnetometer";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MagnetometerUI = () => {
  const { x, y, z, heading } = useMagnetometer();

  const direction = () => {
    if (heading >= 337 || heading < 23) return "North";
    if (heading >= 23 && heading < 68) return "North East";
    if (heading >= 68 && heading < 113) return "East";
    if (heading >= 113 && heading < 158) return "South East";
    if (heading >= 158 && heading < 203) return "South";
    if (heading >= 203 && heading < 248) return "South West";
    if (heading >= 248 && heading < 293) return "West";
    return "North West";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Magnetometer</Text>

      <Text style={styles.subtitle}>Magnetic field & direction sensor</Text>

      {/* Compass */}
      <View style={styles.compassContainer}>
        <View style={styles.compassCircle}>
          <Text style={styles.north}>N</Text>
          <Text style={styles.east}>E</Text>
          <Text style={styles.south}>S</Text>
          <Text style={styles.west}>W</Text>

          <View style={styles.needle}>
            <View style={styles.arrow} />
          </View>

          <Text style={styles.heading}>{Math.round(heading)}°</Text>
        </View>

        <Text style={styles.direction}>{direction()}</Text>
      </View>

      {/* Axis Cards */}
      <View style={styles.valuesContainer}>
        <SensorCard label="X Axis" value={x} />

        <SensorCard label="Y Axis" value={y} />

        <SensorCard label="Z Axis" value={z} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Magnetic Reading</Text>

        <Text style={styles.infoText}>
          Keep your device away from metal objects for accurate measurement.
        </Text>
      </View>
    </View>
  );
};

const SensorCard = ({ label, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>

      <Text style={styles.cardValue}>{Number(value).toFixed(2)}</Text>
    </View>
  );
};

export default MagnetometerUI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 5,
    fontSize: 14,
  },

  compassContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  compassCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: "#38BDF8",
    justifyContent: "center",
    alignItems: "center",
  },

  north: {
    position: "absolute",
    top: 15,
    color: "#38BDF8",
    fontWeight: "800",
    fontSize: 20,
  },

  south: {
    position: "absolute",
    bottom: 15,
    color: "#fff",
    fontWeight: "800",
  },

  east: {
    position: "absolute",
    right: 20,
    color: "#fff",
    fontWeight: "800",
  },

  west: {
    position: "absolute",
    left: 20,
    color: "#fff",
    fontWeight: "800",
  },

  needle: {
    width: 4,
    height: 80,
    backgroundColor: "#38BDF8",
    position: "absolute",
    top: 35,
  },

  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#38BDF8",
    position: "absolute",
    top: -10,
    left: -8,
  },

  heading: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 20,
  },

  direction: {
    marginTop: 20,
    color: "#38BDF8",
    fontSize: 20,
    fontWeight: "600",
  },

  valuesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },

  card: {
    width: "31%",
    backgroundColor: "#162033",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
  },

  cardLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },

  cardValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },

  infoCard: {
    marginTop: 30,
    backgroundColor: "#162033",
    padding: 20,
    borderRadius: 20,
  },

  infoTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  infoText: {
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 20,
  },
});
