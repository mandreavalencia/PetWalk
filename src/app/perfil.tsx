import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colores } from "../constants/colores";
import { getCurrentUser, logout, updateProfile, User } from "../services/authService";

export default function PerfilScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [zona, setZona] = useState("");
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargar = (u: User) => {
    setUser(u);
    setNombre(u.nombre);
    setTelefono(u.telefono ?? "");
    setZona(u.zona ?? "");
  };

  useFocusEffect(
    useCallback(() => {
      getCurrentUser().then((u) => {
        if (!u) router.replace("/login");
        else cargar(u);
      });
    }, [])
  );

  if (!user) return null;

  const esPaseador = user.tipo === "paseador";

  const guardar = async () => {
    setError("");
    setExito("");

    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }
    if (telefono.trim() && telefono.replace(/\D/g, "").length < 7) {
      setError("Escribe un teléfono válido.");
      return;
    }
    if (esPaseador && (!telefono.trim() || !zona.trim())) {
      setError("Como paseador, el teléfono y la zona son obligatorios.");
      return;
    }

    setGuardando(true);
    const r = await updateProfile(user.id, {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      zona: esPaseador ? zona.trim() : undefined,
    });
    setGuardando(false);

    if (!r.ok || !r.user) {
      setError(r.error ?? "No se pudo guardar.");
      return;
    }
    cargar(r.user);
    setEditando(false);
    setExito("Cambios guardados.");
  };

  const cancelar = () => {
    cargar(user);
    setEditando(false);
    setError("");
  };

  const cerrarSesion = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: "Mi perfil" }} />
      <View style={styles.contenido}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{esPaseador ? "🦮" : "🐶"}</Text>
        </View>

        <View style={styles.filaChip}>
          <View style={[styles.chip, esPaseador && styles.chipPaseador]}>
            <Text style={[styles.chipTexto, esPaseador && styles.chipTextoPaseador]}>
              {esPaseador ? "🦮 Paseador" : "🐶 Propietario"}
            </Text>
          </View>
        </View>

        <Text style={styles.etiqueta}>Nombre completo</Text>
        <TextInput
          style={[styles.input, !editando && styles.inputBloqueado]}
          value={nombre}
          onChangeText={setNombre}
          editable={editando}
          autoCapitalize="words"
        />

        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput style={[styles.input, styles.inputBloqueado]} value={user.correo} editable={false} />
        <Text style={styles.ayuda}>El correo no se puede cambiar desde aquí.</Text>

        <Text style={styles.etiqueta}>Teléfono</Text>
        <TextInput
          style={[styles.input, !editando && styles.inputBloqueado]}
          value={telefono}
          onChangeText={setTelefono}
          editable={editando}
          placeholder={editando ? "300 123 4567" : "Sin registrar"}
          keyboardType="phone-pad"
        />

        {esPaseador && (
          <>
            <Text style={styles.etiqueta}>Zona donde paseas</Text>
            <TextInput
              style={[styles.input, !editando && styles.inputBloqueado]}
              value={zona}
              onChangeText={setZona}
              editable={editando}
              placeholder={editando ? "Ej: Centro, barrio..." : "Sin registrar"}
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {exito ? <Text style={styles.exito}>{exito}</Text> : null}

        {editando ? (
          <>
            <TouchableOpacity
              style={[styles.boton, guardando && styles.botonInactivo]}
              activeOpacity={0.8}
              onPress={guardar}
              disabled={guardando}
            >
              <Text style={styles.textoBoton}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonSecundario}
              activeOpacity={0.8}
              onPress={cancelar}
              disabled={guardando}
            >
              <Text style={styles.textoSecundario}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.boton}
            activeOpacity={0.8}
            onPress={() => {
              setExito("");
              setEditando(true);
            }}
          >
            <Text style={styles.textoBoton}>Editar información</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.botonSecundario} activeOpacity={0.8} onPress={cerrarSesion}>
          <Text style={styles.textoSecundario}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, alignItems: "center", padding: 24, backgroundColor: Colores.fondo },
  contenido: { width: "100%", maxWidth: 420 },
  avatar: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colores.fondoClaro,
    borderWidth: 2,
    borderColor: Colores.borde,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 46 },
  filaChip: { alignItems: "center", marginBottom: 8 },
  chip: {
    backgroundColor: Colores.fondoClaro,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipPaseador: { backgroundColor: Colores.ambar },
  chipTexto: { color: Colores.primario, fontWeight: "600", fontSize: 14 },
  chipTextoPaseador: { color: Colores.ambarTexto },
  etiqueta: {
    fontSize: 15,
    fontWeight: "600",
    color: Colores.texto,
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colores.tarjeta,
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colores.texto,
  },
  inputBloqueado: { backgroundColor: "#F1F6F4", color: Colores.textoSuave },
  ayuda: { fontSize: 12, color: Colores.textoApagado, marginTop: 5 },
  error: { color: Colores.peligro, fontSize: 14, marginTop: 14, textAlign: "center" },
  exito: {
    backgroundColor: Colores.fondoClaro,
    color: Colores.primario,
    fontWeight: "600",
    textAlign: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
    overflow: "hidden",
  },
  boton: {
    backgroundColor: Colores.primario,
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 22,
  },
  botonInactivo: { backgroundColor: Colores.gris },
  textoBoton: { color: Colores.blanco, fontSize: 17, fontWeight: "bold" },
  botonSecundario: {
    borderWidth: 2,
    borderColor: Colores.primario,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 12,
  },
  textoSecundario: { color: Colores.primario, fontSize: 16, fontWeight: "bold" },
});