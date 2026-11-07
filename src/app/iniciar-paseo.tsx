import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser } from "../services/authService";
import { getPets, Pet } from "../services/petService";

export default function IniciarPaseoScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login");
          return;
        }
        const lista = await getPets(user.id);
        setPets(lista);
        setSeleccionada((prev) =>
          prev && lista.some((p) => p.id === prev)
            ? prev
            : (lista[0]?.id ?? null),
        );
        setCargado(true);
      })();
    }, []),
  );

  const iniciar = () => {
    if (!seleccionada) return;
    router.push({ pathname: "/paseo", params: { petId: seleccionada } });
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.contenido}>
        {cargado && pets.length === 0 ? (
          <>
            <Text style={styles.vacio}>
              Primero registra la mascota que vas a pasear 🐾
            </Text>
            <TouchableOpacity
              style={styles.boton}
              activeOpacity={0.8}
              onPress={() => router.push("/mascotas")}
            >
              <Text style={styles.textoBoton}>Ir a Mis mascotas</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.titulo}>
              Elige la mascota que sale a pasear
            </Text>

            {pets.map((pet) => {
              const activa = pet.id === seleccionada;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.tarjeta, activa && styles.tarjetaActiva]}
                  activeOpacity={0.8}
                  onPress={() => setSeleccionada(pet.id)}
                >
                  <View style={styles.foto}>
                    <Text style={{ fontSize: 24 }}>🐶</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nombre}>{pet.name}</Text>
                    <Text style={styles.detalle}>
                      {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.radio}>{activa ? "●" : "○"}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.boton, !seleccionada && styles.botonInactivo]}
              activeOpacity={0.8}
              disabled={!seleccionada}
              onPress={iniciar}
            >
              <Text style={styles.textoBoton}>Iniciar paseo</Text>
              <Text style={styles.textoAyuda}>
                Se activará el GPS del celular
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: Colores.fondo,
  },
  contenido: { width: "100%", maxWidth: 420 },
  titulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colores.texto,
    marginBottom: 16,
  },
  vacio: {
    textAlign: "center",
    color: Colores.textoApagado,
    fontSize: 16,
    marginVertical: 30,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: Colores.tarjeta,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colores.borde,
  },
  tarjetaActiva: { borderColor: Colores.primario, borderWidth: 3 },
  foto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colores.fondoClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: { fontSize: 17, fontWeight: "bold", color: Colores.texto },
  detalle: { fontSize: 13, color: Colores.textoSuave, marginTop: 2 },
  radio: { fontSize: 22, color: Colores.primario },
  boton: {
    backgroundColor: Colores.primario,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 12,
  },
  botonInactivo: { backgroundColor: Colores.gris },
  textoBoton: { color: Colores.blanco, fontSize: 17, fontWeight: "bold" },
  textoAyuda: { color: Colores.fondoClaro, fontSize: 13, marginTop: 3 },
});
