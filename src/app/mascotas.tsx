import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser } from "../services/authService";
import { deletePet, getPets, Pet } from "../services/petService";

export default function MascotasScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);

  const load = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setPets(await getPets(user.id));
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const borrar = async (pet: Pet) => {
    const user = await getCurrentUser();
    if (user) await deletePet(user.id, pet.id);
    load();
  };

  const confirmarBorrado = (pet: Pet) => {
    if (Platform.OS === "web") {
      if (window.confirm(`¿Eliminar a ${pet.name}?`)) borrar(pet);
      return;
    }
    Alert.alert("Eliminar mascota", `¿Eliminar a ${pet.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => borrar(pet) },
    ]);
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.contenido}>
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              Aún no tienes mascotas registradas 🐾
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.foto} />
              ) : (
                <View style={[styles.foto, styles.sinFoto]}>
                  <Text style={{ fontSize: 24 }}>🐶</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{item.name}</Text>
                <Text style={styles.detalle}>
                  {item.species}
                  {item.breed ? ` · ${item.breed}` : ""} · {item.age} años
                </Text>
              </View>

              <View style={styles.acciones}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/mascota-form",
                      params: { id: item.id },
                    })
                  }
                >
                  <Text style={styles.editar}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmarBorrado(item)}>
                  <Text style={styles.eliminar}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.boton}
          activeOpacity={0.8}
          onPress={() => router.push("/mascota-form")}
        >
          <Text style={styles.textoBoton}>+ Registrar mascota</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondo,
    alignItems: "center",
    padding: 20,
  },
  contenido: { flex: 1, width: "100%", maxWidth: 420 },
  vacio: {
    textAlign: "center",
    marginTop: 40,
    color: Colores.textoApagado,
    fontSize: 16,
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
  foto: { width: 58, height: 58, borderRadius: 29 },
  sinFoto: {
    backgroundColor: Colores.fondoClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: { fontSize: 17, fontWeight: "bold", color: Colores.texto },
  detalle: { fontSize: 13, color: Colores.textoSuave, marginTop: 2 },
  acciones: { gap: 8, alignItems: "flex-end" },
  editar: { color: Colores.primario, fontWeight: "bold" },
  eliminar: { color: Colores.peligro, fontWeight: "bold" },
  boton: {
    backgroundColor: Colores.primario,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  textoBoton: { color: Colores.blanco, fontSize: 17, fontWeight: "bold" },
});
