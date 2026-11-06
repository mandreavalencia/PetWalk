
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function PaseoResumenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.title}>Resumen del paseo</Text>
      <Text style={styles.text}>
        ¡Tu paseo ha finalizado!
      </Text>
      <Text style={styles.text}>
        Identificador del paseo: {id}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF7F4",
    padding: 20,
  },
  emoji: {
    fontSize: 55,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
  },
});
