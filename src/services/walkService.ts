import { supabase } from "../lib/supabase";

export type Coord = { latitude: number; longitude: number };

export type Walk = {
  id: string;
  userId: string; // paseador
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  inicio: number; // milisegundos
  fin: number;
  duracionSeg: number;
  distanciaM: number;
  ruta: Coord[];
};

const SELECT = "*, owner:profiles!owner_id(nombre)";

const aPaseo = (r: any): Walk => {
  const dueno = Array.isArray(r.owner) ? r.owner[0] : r.owner;
  return {
    id: r.id,
    userId: r.walker_id,
    petId: r.pet_id ?? "",
    petName: r.pet_name,
    ownerId: r.owner_id,
    ownerName: dueno?.nombre ?? "",
    inicio: new Date(r.inicio).getTime(),
    fin: new Date(r.fin).getTime(),
    duracionSeg: r.duracion_seg,
    distanciaM: Number(r.distancia_m),
    ruta: r.ruta ?? [],
  };
};

// Paseos realizados por un paseador (el más reciente primero)
export async function getWalks(userId: string): Promise<Walk[]> {
  const { data, error } = await supabase
    .from("walks")
    .select(SELECT)
    .eq("walker_id", userId)
    .order("inicio", { ascending: false });
  if (error || !data) return [];
  return data.map(aPaseo);
}

// Paseos de las mascotas de un propietario (para el Sprint 4)
export async function getWalksDeMisMascotas(ownerId: string): Promise<Walk[]> {
  const { data, error } = await supabase
    .from("walks")
    .select(SELECT)
    .eq("owner_id", ownerId)
    .order("inicio", { ascending: false });
  if (error || !data) return [];
  return data.map(aPaseo);
}

export async function getWalkById(_userId: string, id: string): Promise<Walk | undefined> {
  const { data } = await supabase.from("walks").select(SELECT).eq("id", id).maybeSingle();
  return data ? aPaseo(data) : undefined;
}

export async function saveWalk(
  userId: string,
  walk: Omit<Walk, "id">
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase
    .from("walks")
    .insert({
      walker_id: userId,
      owner_id: walk.ownerId,
      pet_id: walk.petId || null,
      pet_name: walk.petName,
      inicio: new Date(walk.inicio).toISOString(),
      fin: new Date(walk.fin).toISOString(),
      duracion_seg: walk.duracionSeg,
      distancia_m: walk.distanciaM,
      ruta: walk.ruta,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "No se pudo guardar el paseo: " + (error?.message ?? "sin respuesta") };
  }
  return { ok: true, id: data.id };
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