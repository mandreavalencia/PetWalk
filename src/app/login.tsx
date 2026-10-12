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
import { loginUser } from "../services/authService";

export default function LoginScreen() {
  const router = useRouter();
  const { registrado } = useLocalSearchParams<{ registrado?: string }>();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const iniciarSesion = async () => {
    setError("");

    if (!correo.trim() || !contrasena.trim()) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }

    const resultado = await loginUser(correo, contrasena);

    if (!resultado.ok) {
      setError(resultado.error ?? "No se pudo iniciar sesión.");
      return;
    }

    router.replace("/inicio");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contenido}>
        <Text style={styles.icono}>🐾</Text>
        <Text style={styles.titulo}>Bienvenido a PetWalk</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar.</Text>

        {registrado ? (
          <Text style={styles.exito}>
            ¡Cuenta creada! Ahora inicia sesión.
          </Text>
        ) : null}

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
          placeholder="Tu contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.boton}
          onPress={iniciarSesion}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBoton}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={styles.enlace}>¿No tienes cuenta? Regístrate</Text>
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
  exito: {
    backgroundColor: Colores.fondoClaro,
    color: Colores.primario,
    fontWeight: "600",
    textAlign: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
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