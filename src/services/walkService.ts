import AsyncStorage from "@react-native-async-storage/async-storage";

export type Coord = { latitude: number; longitude: number };

export type Walk = {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  inicio: number; // milisegundos (fecha y hora de inicio)
  fin: number; // milisegundos (fecha y hora de fin)
  duracionSeg: number;
  distanciaM: number;
  ruta: Coord[];
};

const keyFor = (userId: string) => `walks:${userId}`;

export async function getWalks(userId: string): Promise<Walk[]> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  const lista: Walk[] = raw ? JSON.parse(raw) : [];
  return lista.sort((a, b) => b.inicio - a.inicio); // el más reciente primero
}

export async function getWalkById(userId: string, id: string) {
  const lista = await getWalks(userId);
  return lista.find((w) => w.id === id);
}

export async function saveWalk(userId: string, walk: Walk) {
  const lista = await getWalks(userId);
  lista.push(walk);
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(lista));
}

// Distancia en metros entre dos puntos (fórmula de Haversine)
export function distanciaEntre(a: Coord, b: Coord): number {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatTiempo(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  const dos = (n: number) => n.toString().padStart(2, "0");
  return `${dos(h)}:${dos(m)}:${dos(s)}`;
}

export function formatDistancia(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
}