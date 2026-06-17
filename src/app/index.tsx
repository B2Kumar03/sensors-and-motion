import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccelerometerGame from "./AccelerometerGame";


export default function Index() {
 

  
  return (
    <SafeAreaView style={styles.container}>
      <AccelerometerGame/>
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
