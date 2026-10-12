import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser, logout, User } from "../services/authService";

export default function InicioScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCurrentUser().then((u) => {
        if (!u) router.replace("/login");
        else setUser(u);
      });
    }, []),
  );

  const cerrarSesion = async () => {
    await logout();
    router.replace("/login");
  };

  if (!user) return null;

  const esPropietario = user.tipo === "propietario";

  return (
    <View style={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.icono}>🐾</Text>
        <Text style={styles.titulo}>¡Hola, {user.nombre}!</Text>
        <Text style={styles.subtitulo}>
          Cuenta de {esPropietario ? "propietario" : "paseador"}
        </Text>

        {esPropietario ? (
          <TouchableOpacity
            style={styles.boton}
            activeOpacity={0.8}
            onPress={() => router.push("/mascotas")}
          >
            <Text style={styles.textoBoton}>🐶 Mis mascotas</Text>
            <Text style={styles.textoAyuda}>
              Registra y administra tus mascotas
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.boton, styles.botonInactivo]}>
            <Text style={styles.textoBoton}>🦮 Mis paseos</Text>
            <Text style={styles.textoAyuda}>Próximamente</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.botonSalir}
          activeOpacity={0.8}
          onPress={cerrarSesion}
        >
          <Text style={styles.textoSalir}>Cerrar sesión</Text>
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
    justifyContent: "center",
    padding: 25,
  },
  contenido: { width: "100%", maxWidth: 420 },
  icono: { fontSize: 56, textAlign: "center", marginBottom: 8 },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colores.primario,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 16,
    color: Colores.textoSuave,
    textAlign: "center",
    marginBottom: 32,
  },
  boton: {
    backgroundColor: Colores.primario,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginBottom: 12,
  },
  botonInactivo: { backgroundColor: Colores.gris },
  textoBoton: {
    color: Colores.blanco,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  textoAyuda: {
    color: Colores.fondoClaro,
    textAlign: "center",
    fontSize: 13,
    marginTop: 3,
  },
  botonSalir: {
    borderWidth: 2,
    borderColor: Colores.primario,
    paddingVertical: 14,
    borderRadius: 15,
    marginTop: 18,
  },
  textoSalir: {
    color: Colores.primario,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
