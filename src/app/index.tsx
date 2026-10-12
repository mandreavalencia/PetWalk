import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Encabezado */}
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>PetWalk</Text>
        <Text style={styles.subtitle}>
          Paseos más seguros y organizados para tus mascotas
        </Text>

        {/* Bloque 1: crear cuenta */}
        <Text style={styles.sectionTitle}>Crear una cuenta como</Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/registro",
              params: { tipo: "Propietario" },
            })
          }
        >
          <Text style={styles.buttonText}>🐶 Propietario</Text>
          <Text style={styles.buttonHint}>Registra a tus mascotas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/registro",
              params: { tipo: "Paseador" },
            })
          }
        >
          <Text style={styles.buttonText}>🦮 Paseador</Text>
          <Text style={styles.buttonHint}>Realiza y registra paseos</Text>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Bloque 2: iniciar sesión */}
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>
            Ya tengo cuenta · Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF7F4",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  content: {
    width: "100%",
    maxWidth: 420,
  },
  emoji: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2E7D6E",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2E7D6E",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonHint: {
    color: "#D6EFE9",
    textAlign: "center",
    fontSize: 13,
    marginTop: 3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#B9D9D2",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#688176",
    fontSize: 14,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: "#2E7D6E",
    paddingVertical: 14,
    borderRadius: 15,
  },
  loginButtonText: {
    color: "#2E7D6E",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
