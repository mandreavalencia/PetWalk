import { supabase } from "../lib/supabase";

export type TipoUsuario = "propietario" | "paseador";

export type User = {
  id: string;
  nombre: string;
  correo: string;
  tipo: TipoUsuario;
  telefono?: string;
  zona?: string;
};

export type RegistroData = {
  nombre: string;
  correo: string;
  contrasena: string;
  tipo: TipoUsuario;
  telefono?: string;
  zona?: string;
};

type Resultado = { ok: boolean; error?: string };

function aUsuario(row: any): User {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    tipo: row.tipo,
    telefono: row.telefono ?? undefined,
    zona: row.zona ?? undefined,
  };
}

function traducir(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con ese correo.";
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("not confirmed")) return "Debes confirmar tu correo antes de iniciar sesión.";
  if (m.includes("password")) return "La contraseña no es válida (mínimo 6 caracteres).";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("network") || m.includes("fetch")) return "Sin conexión. Revisa tu internet.";
  return msg;
}

export async function registerUser(data: RegistroData): Promise<Resultado> {
  const { data: res, error } = await supabase.auth.signUp({
    email: data.correo.trim().toLowerCase(),
    password: data.contrasena,
    options: {
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        telefono: data.telefono ?? null,
        zona: data.zona ?? null,
      },
    },
  });

  if (error) return { ok: false, error: traducir(error.message) };

  // Para que el flujo sea "registrarse y luego iniciar sesión"
  if (res.session) await supabase.auth.signOut();
  return { ok: true };
}

export async function loginUser(
  correo: string,
  contrasena: string
): Promise<Resultado & { user?: User }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: correo.trim().toLowerCase(),
    password: contrasena,
  });

  if (error) return { ok: false, error: traducir(error.message) };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No se encontró tu perfil. Vuelve a registrarte." };
  return { ok: true, user };
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return getUserById(session.user.id);
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data ? aUsuario(data) : null;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function updateProfile(
  id: string,
  datos: { nombre: string; telefono?: string; zona?: string }
): Promise<{ ok: boolean; error?: string; user?: User }> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nombre: datos.nombre,
      telefono: datos.telefono || null,
      zona: datos.zona || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return { ok: false, error: "No se pudo guardar: " + error.message };
  if (!data) return { ok: false, error: "No se pudo actualizar tu perfil." };
  return { ok: true, user: aUsuario(data) };
}