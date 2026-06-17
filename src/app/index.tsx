import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccelerometerGame from "./components/AccelerometerGame";
import GyroscopeGame from "./components/GyroscopeGame";
import Light from "./components/Light";


export default function Index() {
 

  
  return (
    <SafeAreaView style={styles.container}>
      <Light/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
