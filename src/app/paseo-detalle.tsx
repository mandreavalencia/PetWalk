import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import MapaPaseo from "../components/MapaPaseo";
import { Colores } from "../constants/colores";
import { getCurrentUser, User } from "../services/authService";
import {
  formatDistancia,
  formatFecha,
  formatHora,
  formatTiempo,
  getWalkById,
  Walk,
} from "../services/walkService";

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

export default function PaseoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [walk, setWalk] = useState<Walk | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (id) setWalk((await getWalkById(u?.id ?? "", id)) ?? null);
      setCargando(false);
    })();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={Colores.primario} />
      </View>
    );
  }

  if (!walk) {
    return (
      <View style={styles.centro}>
        <Text style={styles.vacio}>No se encontró este paseo.</Text>
      </View>
    );
  }

  const esPaseador = user?.tipo === "paseador";

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.contenido}>
        {walk.ruta.length > 0 ? (
          <MapaPaseo ruta={walk.ruta} modo="resumen" style={{ height: 300 }} />
        ) : (
          <Text style={styles.vacio}>Este paseo no tiene puntos de ubicación.</Text>
        )}

        <View style={styles.tarjeta}>
          <Fila etiqueta="📅 Fecha" valor={formatFecha(walk.inicio)} />
          <Fila etiqueta="🐕 Mascota" valor={walk.petName} />
          {esPaseador ? (
            <Fila etiqueta="👤 Dueño/a" valor={walk.ownerName || "—"} />
          ) : (
            <Fila etiqueta="🦮 Paseador" valor={walk.walkerName || "—"} />
          )}
          <Fila etiqueta="Hora de inicio" valor={formatHora(walk.inicio)} />
          <Fila etiqueta="Hora de fin" valor={formatHora(walk.fin)} />
          <Fila etiqueta="⏱️ Duración" valor={formatTiempo(walk.duracionSeg)} />
          <Fila etiqueta="📏 Distancia" valor={formatDistancia(walk.distanciaM)} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, alignItems: "center", padding: 20, backgroundColor: Colores.fondo },
  contenido: { width: "100%", maxWidth: 420, gap: 16 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colores.fondo },
  vacio: { textAlign: "center", color: Colores.textoApagado, fontSize: 16 },
  tarjeta: {
    backgroundColor: Colores.tarjeta,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colores.borde,
    padding: 16,
    gap: 10,
  },
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  etiqueta: { fontSize: 15, color: Colores.textoApagado },
  valor: { fontSize: 15, fontWeight: "600", color: Colores.texto, flexShrink: 1, textAlign: "right" },
});