import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapaPaseo from "../components/MapaPaseo";
import { Colores } from "../constants/colores";
import { getCurrentUser } from "../services/authService";
import { formatDistancia, formatTiempo, getWalkById, Walk } from "../services/walkService";

export default function PaseoResumenScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [walk, setWalk] = useState<Walk | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || !id) return;
      setWalk((await getWalkById(user.id, id)) ?? null);
    })();
  }, [id]);

  if (!walk) return null;

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.titulo}>¡Paseo finalizado!</Text>
        <Text style={styles.subtitulo}>Paseo con {walk.petName}</Text>

        {walk.ruta.length > 0 ? (
          <MapaPaseo ruta={walk.ruta} modo="resumen" style={{ height: 240 }} />
        ) : (
          <Text style={styles.sinRuta}>No se registraron puntos de ubicación.</Text>
        )}

        <View style={styles.fila}>
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>Duración</Text>
            <Text style={styles.datoValor}>{formatTiempo(walk.duracionSeg)}</Text>
          </View>
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>Distancia</Text>
            <Text style={styles.datoValor}>{formatDistancia(walk.distanciaM)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.boton}
          activeOpacity={0.8}
          onPress={() => router.replace("/historial")}
        >
          <Text style={styles.textoBoton}>Ver historial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonSecundario]}
          activeOpacity={0.8}
          onPress={() => router.replace("/inicio")}
        >
          <Text style={[styles.textoBoton, styles.textoSecundario]}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, alignItems: "center", padding: 24, backgroundColor: Colores.fondo },
  contenido: { width: "100%", maxWidth: 420, gap: 16 },
  emoji: { fontSize: 48, textAlign: "center" },
  titulo: { fontSize: 26, fontWeight: "bold", color: Colores.primario, textAlign: "center" },
  subtitulo: { fontSize: 16, color: Colores.textoSuave, textAlign: "center" },
  sinRuta: { textAlign: "center", color: Colores.textoApagado, marginVertical: 20 },
  fila: { flexDirection: "row", gap: 12 },
  dato: {
    flex: 1,
    backgroundColor: Colores.tarjeta,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colores.borde,
    padding: 14,
  },
  datoEtiqueta: { fontSize: 13, color: Colores.textoApagado },
  datoValor: { fontSize: 24, fontWeight: "bold", color: Colores.primario, marginTop: 4 },
  boton: { backgroundColor: Colores.primario, padding: 16, borderRadius: 15, alignItems: "center" },
  botonSecundario: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colores.primario,
    padding: 14,
  },
  textoBoton: { color: Colores.blanco, fontSize: 17, fontWeight: "bold" },
  textoSecundario: { color: Colores.primario, fontSize: 16 },
});