import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser, logout, User } from "../services/authService";

type OpcionProps = {
  titulo: string;
  ayuda: string;
  onPress?: () => void; // sin onPress = opción todavía no disponible
};

function Opcion({ titulo, ayuda, onPress }: OpcionProps) {
  const activa = !!onPress;
  return (
    <TouchableOpacity
      style={[styles.boton, !activa && styles.botonInactivo]}
      activeOpacity={0.8}
      disabled={!activa}
      onPress={onPress}
    >
      <Text style={styles.textoBoton}>{titulo}</Text>
      <Text style={styles.textoAyuda}>{activa ? ayuda : "Próximamente"}</Text>
    </TouchableOpacity>
  );
}

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

  const esPaseador = user.tipo === "paseador";

  return (
    <View style={styles.contenedor}>
      <View style={styles.contenido}>
        <Text style={styles.icono}>{esPaseador ? "🦮" : "🐶"}</Text>
        <Text style={styles.titulo}>¡Hola, {user.nombre}!</Text>
        <Text style={styles.subtitulo}>
          Cuenta de {esPaseador ? "paseador" : "propietario"}
        </Text>

        {esPaseador ? (
          <>
            <Opcion
              titulo="🦮 Iniciar paseo"
              ayuda="Elige la mascota y registra el recorrido"
              onPress={() => router.push("/iniciar-paseo")}
            />
            <Opcion
              titulo="📍 Historial de paseos"
              ayuda="Consulta tus recorridos"
            />
          </>
        ) : (
          <>
            <Opcion
              titulo="🐶 Mis mascotas"
              ayuda="Registra y administra tus mascotas"
              onPress={() => router.push("/mascotas")}
            />
            <Opcion
              titulo="📍 Paseos de mis mascotas"
              ayuda="Consulta los recorridos"
            />
          </>
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
