import { supabase } from "../lib/supabase";

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  photo: string | null;
  notes: string;
};

export type PetConDueno = Pet & { ownerId: string; ownerName: string };

const aMascota = (r: any): Pet => ({
  id: r.id,
  name: r.name,
  species: r.species,
  breed: r.breed ?? "",
  age: Number(r.age),
  photo: r.photo ?? null,
  notes: r.notes ?? "",
});

export async function getPets(userId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(aMascota);
}

export async function getPetById(userId: string, id: string) {
  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .eq("owner_id", userId)
    .maybeSingle();
  return data ? aMascota(data) : undefined;
}

export async function savePet(
  userId: string,
  pet: Omit<Pet, "id"> & { id?: string }
): Promise<{ ok: boolean; error?: string }> {
  const campos = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed || null,
    age: pet.age,
    photo: pet.photo,
    notes: pet.notes || null,
  };

  const { error } = pet.id
    ? await supabase.from("pets").update(campos).eq("id", pet.id).eq("owner_id", userId)
    : await supabase.from("pets").insert({ ...campos, owner_id: userId });

  return error
    ? { ok: false, error: "No se pudo guardar la mascota: " + error.message }
    : { ok: true };
}

export async function deletePet(userId: string, id: string) {
  await supabase.from("pets").delete().eq("id", id).eq("owner_id", userId);
}

// Mascotas de todos los propietarios (para que el paseador elija)
export async function getAllPets(): Promise<PetConDueno[]> {
  const { data, error } = await supabase
    .from("pets")
    .select("*, profiles(nombre)")
    .order("created_at", { ascending: true });
  if (error || !data) return [];

  return data.map((r: any) => {
    const perfil = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      ...aMascota(r),
      ownerId: r.owner_id,
      ownerName: perfil?.nombre ?? "Propietario",
    };
  });
}