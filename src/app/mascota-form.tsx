import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser } from "../services/authService";
import { getPetById, savePet } from "../services/petService";

export default function MascotaFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Si venimos a "Editar", cargamos los datos de esa mascota
  useEffect(() => {
    if (!id) return;
    (async () => {
      const user = await getCurrentUser();
      if (!user) return;
      const pet = await getPetById(user.id, id);
      if (!pet) return;
      setName(pet.name);
      setSpecies(pet.species);
      setBreed(pet.breed);
      setAge(pet.age.toString());
      setPhoto(pet.photo);
      setNotes(pet.notes);
    })();
  }, [id]);

  const elegirFoto = async () => {
    setError("");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Necesitamos acceso a tus fotos para agregar la imagen.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!resultado.canceled) setPhoto(resultado.assets[0].uri);
  };

  const validar = () => {
    if (!name.trim()) return "El nombre es obligatorio.";
    if (!species.trim()) return "La especie es obligatoria.";
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 0)
      return "Ingresa una edad válida.";
    return "";
  };

  const guardar = async () => {
    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }

    const user = await getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }

        const r = await savePet(user.id, {
      id,
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      age: Number(age),
      photo,
      notes: notes.trim(),
    });
        if (!r.ok) {
      setError(r.error ?? "No se pudo guardar la mascota.");
      return;
    }
    router.back();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenido}>
        <Text style={styles.titulo}>
          {id ? "Editar mascota" : "Nueva mascota"}
        </Text>

        <TouchableOpacity onPress={elegirFoto} style={styles.cajaFoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.foto} />
          ) : (
            <Text style={styles.textoFoto}>📷{"\n"}Agregar foto</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.etiqueta}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la mascota"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.etiqueta}>Especie</Text>
        <TextInput
          style={styles.input}
          placeholder="Perro, gato…"
          value={species}
          onChangeText={setSpecies}
        />

        <Text style={styles.etiqueta}>Raza</Text>
        <TextInput
          style={styles.input}
          placeholder="Raza (opcional)"
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.etiqueta}>Edad (años)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 3"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.etiqueta}>Información adicional</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: "top" }]}
          placeholder="Alergias, carácter, cuidados…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.boton}
          activeOpacity={0.8}
          onPress={guardar}
        >
          <Text style={styles.textoBoton}>
            {id ? "Guardar cambios" : "Guardar mascota"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: "center",
    padding: 25,
    backgroundColor: Colores.fondo,
  },
  contenido: { width: "100%", maxWidth: 420 },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colores.primario,
    textAlign: "center",
    marginBottom: 20,
  },
  cajaFoto: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colores.fondoClaro,
    borderWidth: 2,
    borderColor: Colores.borde,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  foto: { width: "100%", height: "100%" },
  textoFoto: {
    textAlign: "center",
    color: Colores.primario,
    fontWeight: "600",
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: "600",
    color: Colores.texto,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colores.tarjeta,
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  error: {
    color: Colores.peligro,
    fontSize: 14,
    marginTop: 14,
    textAlign: "center",
  },
  boton: {
    backgroundColor: Colores.primario,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 24,
  },
  textoBoton: { color: Colores.blanco, fontSize: 17, fontWeight: "bold" },
});
