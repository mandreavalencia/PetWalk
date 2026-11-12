import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser, User } from "../services/authService";
import {
  formatDistancia,
  formatDuracion,
  formatFecha,
  getWalks,
  getWalksDeMisMascotas,
  Walk,
} from "../services/walkService";

export default function HistorialScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const u = await getCurrentUser();
        if (!u) {
          router.replace("/login");
          return;
        }
        setUser(u);
        setWalks(u.tipo === "paseador" ? await getWalks(u.id) : await getWalksDeMisMascotas(u.id));
        setCargando(false);
      })();
    }, [])
  );

  const esPaseador = user?.tipo === "paseador";
  const distanciaTotal = walks.reduce((suma, w) => suma + w.distanciaM, 0);
  const mascotas = Array.from(new Set(walks.map((w) => w.petName)));

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Stack.Screen
        options={{ title: esPaseador ? "Historial de paseos" : "Paseos de mis mascotas" }}
      />
      <View style={styles.contenido}>
        {cargando ? (
          <ActivityIndicator size="large" color={Colores.primario} style={{ marginTop: 40 }} />
        ) : (
          <>
            {esPaseador && walks.length > 0 && (
              <View style={styles.resumen}>
                <View style={styles.fila}>
                  <View style={styles.dato}>
                    <Text style={styles.datoEtiqueta}>Paseos</Text>
                    <Text style={styles.datoValor}>{walks.length}</Text>
                  </View>
                  <View style={styles.dato}>
                    <Text style={styles.datoEtiqueta}>Distancia total</Text>
                    <Text style={styles.datoValor}>{formatDistancia(distanciaTotal)}</Text>
                  </View>
                </View>
                <Text style={styles.mascotas}>🐕 Mascotas paseadas: {mascotas.join(", ")}</Text>
              </View>
            )}

            {walks.length === 0 ? (
              <Text style={styles.vacio}>
                {esPaseador
                  ? "Todavía no has realizado paseos 🐾"
                  : "Todavía no hay paseos de tus mascotas 🐾"}
              </Text>
            ) : (
              walks.map((w, i) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.tarjeta}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: "/paseo-detalle", params: { id: w.id } })}
                >
                  <Text style={styles.numero}>Paseo #{String(walks.length - i).padStart(2, "0")}</Text>
                  <Text style={styles.linea}>
                    📅 {formatFecha(w.inicio)}    🐕 {w.petName}
                  </Text>
                  <Text style={styles.linea}>
                    ⏱️ {formatDuracion(w.duracionSeg)}    📏 {formatDistancia(w.distanciaM)}
                  </Text>
                  {!esPaseador && w.walkerName ? (
                    <Text style={styles.linea}>🦮 Paseador: {w.walkerName}</Text>
                  ) : null}
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, alignItems: "center", padding: 20, backgroundColor: Colores.fondo },
  contenido: { width: "100%", maxWidth: 420, gap: 12 },
  resumen: { gap: 10, marginBottom: 4 },
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
  mascotas: { fontSize: 14, color: Colores.textoSuave },
  vacio: { textAlign: "center", color: Colores.textoApagado, fontSize: 16, marginTop: 40 },
  tarjeta: {
    backgroundColor: Colores.tarjeta,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colores.borde,
    padding: 14,
    gap: 6,
  },
  numero: { fontSize: 17, fontWeight: "bold", color: Colores.primario },
  linea: { fontSize: 14, color: Colores.textoSuave },
});