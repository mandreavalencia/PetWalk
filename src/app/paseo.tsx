import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapaPaseo from "../components/MapaPaseo";
import { Colores } from "../constants/colores";
import { getCurrentUser } from "../services/authService";
import { getPets } from "../services/petService";
import {
  Coord,
  distanciaEntre,
  formatDistancia,
  formatTiempo,
  saveWalk,
  Walk,
} from "../services/walkService";

export default function PaseoScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();

  const [petName, setPetName] = useState("");
  const [ruta, setRuta] = useState<Coord[]>([]);
  const [segundos, setSegundos] = useState(0);
  const [distancia, setDistancia] = useState(0);
  const [estado, setEstado] = useState<"cargando" | "activo" | "error">("cargando");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const userIdRef = useRef("");
  const inicioRef = useRef(Date.now());
  const rutaRef = useRef<Coord[]>([]);
  const distRef = useRef(0);
  const subRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const detener = () => {
    subRef.current?.remove();
    subRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const agregarPunto = (p: Coord) => {
    const ultimo = rutaRef.current[rutaRef.current.length - 1];
    if (ultimo) distRef.current += distanciaEntre(ultimo, p);
    rutaRef.current = [...rutaRef.current, p];
    setRuta(rutaRef.current);
    setDistancia(distRef.current);
  };

  const fallar = (mensaje: string) => {
    setError(mensaje);
    setEstado("error");
  };

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      userIdRef.current = user.id;

      const pets = await getPets(user.id);
      setPetName(pets.find((p) => p.id === petId)?.name ?? "tu mascota");

      try {
        // 1. Pedir permiso de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          fallar("Necesitamos el permiso de ubicación para registrar el paseo. Actívalo en los ajustes del celular.");
          return;
        }

        // 2. Revisar que el GPS esté encendido
        const gpsActivo = await Location.hasServicesEnabledAsync();
        if (!gpsActivo) {
          fallar("El GPS está apagado. Enciéndelo e inténtalo de nuevo.");
          return;
        }

        // 3. Obtener la ubicación actual (punto de inicio)
        const inicial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelado) return;
        inicioRef.current = Date.now();
        agregarPunto({
          latitude: inicial.coords.latitude,
          longitude: inicial.coords.longitude,
        });

        // 4. Seguir la ubicación mientras camina
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 2000 },
          (loc) => {
            // Ignora lecturas muy imprecisas
            if (loc.coords.accuracy && loc.coords.accuracy > 50) return;
            agregarPunto({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
        if (cancelado) {
          sub.remove();
          return;
        }
        subRef.current = sub;

        // 5. Cronómetro
        timerRef.current = setInterval(() => {
          setSegundos(Math.floor((Date.now() - inicioRef.current) / 1000));
        }, 1000);

        setEstado("activo");
      } catch {
        fallar("No se pudo obtener la ubicación. Revisa que el GPS esté activado e inténtalo de nuevo.");
      }
    })();

    return () => {
      cancelado = true;
      detener();
    };
  }, []);

  // Evita salir del paseo con el botón "atrás" de Android
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const finalizar = async () => {
    if (guardando) return;
    setGuardando(true);
    detener();

    const fin = Date.now();
    const walk: Walk = {
      id: fin.toString(),
      userId: userIdRef.current,
      petId: petId ?? "",
      petName,
      inicio: inicioRef.current,
      fin,
      duracionSeg: Math.floor((fin - inicioRef.current) / 1000),
      distanciaM: distRef.current,
      ruta: rutaRef.current,
    };

    await saveWalk(userIdRef.current, walk);
    router.replace({ pathname: "/paseo-resumen", params: { id: walk.id } });
  };

  if (estado === "error") {
    return (
      <View style={styles.centro}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.boton} onPress={() => router.back()}>
          <Text style={styles.textoBoton}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (estado === "cargando") {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={Colores.primario} />
        <Text style={styles.cargando}>Obteniendo tu ubicación…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>🐶 Paseando con {petName}</Text>

        <MapaPaseo ruta={ruta} modo="vivo" />

        <View style={styles.fila}>
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>Tiempo</Text>
            <Text style={styles.datoValor}>{formatTiempo(segundos)}</Text>
          </View>
          <View style={styles.dato}>
            <Text style={styles.datoEtiqueta}>Distancia</Text>
            <Text style={styles.datoValor}>{formatDistancia(distancia)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.boton, styles.botonFinalizar]}
          activeOpacity={0.8}
          onPress={finalizar}
          disabled={guardando}
        >
          <Text style={styles.textoBoton}>
            {guardando ? "Guardando…" : "Finalizar paseo"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, alignItems: "center", padding: 20, backgroundColor: Colores.fondo },
  contenido: { width: "100%", maxWidth: 420, gap: 14 },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: Colores.fondo,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  cargando: { marginTop: 14, color: Colores.textoSuave, fontSize: 16 },
  error: { color: Colores.peligro, textAlign: "center", fontSize: 16, marginBottom: 24 },
  titulo: { fontSize: 17, fontWeight: "bold", color: Colores.texto },
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
  botonFinalizar: { backgroundColor: Colores.peligro },
  textoBoton: { color: Colores.blanco, fontSize: 17, fontWeight: "bold" },
});