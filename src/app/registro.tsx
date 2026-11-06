import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colores } from "../constants/colores";
import { registerUser } from "../services/authService";

export default function RegistroScreen() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const esPaseador = tipo?.toLowerCase().includes("pase") ?? false;

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [zona, setZona] = useState("");
  const [error, setError] = useState("");

  const registrarUsuario = async () => {
    setError("");

    if (!nombre.trim() || !correo.trim() || !contrasena.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (!correo.includes("@")) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (esPaseador) {
      if (!telefono.trim() || !zona.trim()) {
        setError("Escribe tu teléfono y la zona donde paseas.");
        return;
      }
      if (telefono.replace(/\D/g, "").length < 7) {
        setError("Escribe un teléfono válido.");
        return;
      }
    }

    const resultado = await registerUser({
      nombre: nombre.trim(),
      correo,
      contrasena,
      tipo: esPaseador ? "paseador" : "propietario",
      ...(esPaseador 
        ? { 
          telefono: telefono.trim(), 
          zona: zona.trim() } : {}),
    });

    if (!resultado.ok) {
      setError(resultado.error ?? "No se pudo crear la cuenta.");
      return;
    }

    router.replace({ pathname: "/login", params: { registrado: "1" } });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenido}>
        <Text style={styles.icono}>{esPaseador ? "🦮" : "🐶"}</Text>
        <Text style={styles.titulo}>Únete a PetWalk</Text>
        <Text style={styles.subtitulo}>
          {esPaseador ? "Registro como paseador" : "Registro como propietario"}
        </Text>

        <Text style={styles.etiqueta}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu nombre"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />

        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.etiqueta}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        {esPaseador && (
          <>
            <Text style={styles.etiqueta}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="300 123 4567"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <Text style={styles.etiqueta}>Zona donde paseas</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Centro, barrio..."
              value={zona}
              onChangeText={setZona}
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.boton}
          onPress={registrarUsuario}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBoton}>Crear mi cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.enlace}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: Colores.fondo,
  },
  contenido: { width: "100%", maxWidth: 420 },
  icono: { fontSize: 56, textAlign: "center", marginBottom: 8 },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colores.primario,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: Colores.textoSuave,
    textAlign: "center",
    marginBottom: 28,
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
  enlace: {
    textAlign: "center",
    color: Colores.primario,
    fontWeight: "bold",
    marginTop: 22,
  },
});