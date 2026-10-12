import AsyncStorage from '@react-native-async-storage/async-storage';

export type TipoUsuario = 'propietario' | 'paseador';

export type User = {
  id: string;
  nombre: string;
  correo: string;
  contrasena: string;
  tipo: TipoUsuario;
};

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function registerUser(data: Omit<User, 'id'>) {
  const users = await getUsers();
  const correo = data.correo.trim().toLowerCase();

  if (users.some((u) => u.correo === correo)) {
    return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
  }

  users.push({ ...data, correo, id: Date.now().toString() });
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true };
}

export async function loginUser(correo: string, contrasena: string) {
  const users = await getUsers();
  const user = users.find(
    (u) => u.correo === correo.trim().toLowerCase() && u.contrasena === contrasena
  );

  if (!user) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }

  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user };
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function logout() {
  await AsyncStorage.removeItem(SESSION_KEY);
}