import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser } from "../services/authService";
import { getAllPets, PetConDueno } from "../services/petService";

export default function IniciarPaseoScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<PetConDueno[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);

  const claveDe = (p: PetConDueno) => `${p.ownerId}:${p.id}`;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login");
          return;
        }
        const lista = await getAllPets();
        setPets(lista);
        setSeleccionada((prev) =>
          prev && lista.some((p) => claveDe(p) === prev) ? prev : lista[0] ? claveDe(lista[0]) : null
        );
        setCargado(true);
      })();
    }, [])
  );

  const iniciar = () => {
    const pet = pets.find((p) => claveDe(p) === seleccionada);
    if (!pet) return;
    router.push({ pathname: "/paseo", params: { petId: pet.id, ownerId: pet.ownerId } });
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.contenido}>
        {cargado && pets.length === 0 ? (
          <>
            <Text style={styles.vacio}>
              Todavía no hay mascotas registradas. Un propietario debe registrar a su
              mascota desde su cuenta 🐾
            </Text>
            <TouchableOpacity
              style={styles.boton}
              activeOpacity={0.8}
              onPress={() => router.replace("/inicio")}
            >
              <Text style={styles.textoBoton}>Volver al inicio</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.titulo}>Elige la mascota que vas a pasear</Text>

            {pets.map((pet) => {
              const activa = claveDe(pet) === seleccionada;
              return (
                <TouchableOpacity
                  key={claveDe(pet)}
                  style={[styles.tarjeta, activa && styles.tarjetaActiva]}
                  activeOpacity={0.8}
                  onPress={() => setSeleccionada(claveDe(pet))}
                >
                  <View style={styles.foto}>
                    <Text style={{ fontSize: 24 }}>🐶</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nombre}>{pet.name}</Text>
                    <Text style={styles.detalle}>
                      {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ""} · Dueño/a: {pet.ownerName}
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
              <Text style={styles.textoAyuda}>Se activará el GPS del celular</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, alignItems: "center", padding: 20, backgroundColor: Colores.fondo },
  contenido: { width: "100%", maxWidth: 420 },
  titulo: { fontSize: 17, fontWeight: "bold", color: Colores.texto, marginBottom: 16 },
  vacio: { textAlign: "center", color: Colores.textoApagado, fontSize: 16, marginVertical: 30 },
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