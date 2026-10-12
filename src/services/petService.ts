import AsyncStorage from "@react-native-async-storage/async-storage";

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  photo: string | null;
  notes: string;
};

export const getCurrentUser = "usuario-demo";

const keyFor = (userId: string) => `pets:${userId}`;

export async function getPets(userId: string): Promise<Pet[]> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function getPetById(userId: string, id: string) {
  const pets = await getPets(userId);
  return pets.find((p) => p.id === id);
}

export async function savePet(
  userId: string,
  pet: Omit<Pet, "id"> & { id?: string },
) {
  const pets = await getPets(userId);
  if (pet.id) {
    const index = pets.findIndex((p) => p.id === pet.id);
    if (index >= 0) pets[index] = pet as Pet; // editar
  } else {
    pets.push({ ...pet, id: Date.now().toString() }); // crear
  }
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(pets));
}

export async function deletePet(userId: string, id: string) {
  const pets = await getPets(userId);
  await AsyncStorage.setItem(
    keyFor(userId),
    JSON.stringify(pets.filter((p) => p.id !== id)),
  );
}
