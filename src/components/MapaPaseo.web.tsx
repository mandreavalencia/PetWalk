import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colores } from "../constants/colores";
import { Coord } from "../services/walkService";

type Props = {
  ruta: Coord[];
  modo?: "vivo" | "resumen";
  style?: ViewStyle;
};

export default function MapaPaseo({ ruta, style }: Props) {
  return (
    <View style={[styles.caja, style]}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.texto}>
        El mapa solo está disponible en el celular (Expo Go).
      </Text>
      <Text style={styles.puntos}>Puntos registrados: {ruta.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    height: 340,
    borderRadius: 15,
    backgroundColor: Colores.fondoClaro,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emoji: { fontSize: 44, marginBottom: 8 },
  texto: { color: Colores.texto, textAlign: "center", fontSize: 15 },
  puntos: { color: Colores.textoApagado, marginTop: 8 },
});