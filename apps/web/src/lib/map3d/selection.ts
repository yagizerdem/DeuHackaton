/** Entity id prefixes, one per kind of thing the user can click on the globe. */
export const ENTITY_ID = {
  parcel: "parcel-",
  plant: "plant-",
  pole: "pole-",
  observation: "obs-",
} as const;

export type MapSelection =
  | { kind: "parcel"; id: string }
  | { kind: "plant"; id: string }
  | { kind: "observation"; id: string };

export function selectionFromEntityId(id: unknown): MapSelection | null {
  if (typeof id !== "string") return null;
  if (id.startsWith(ENTITY_ID.parcel)) {
    return { kind: "parcel", id: id.slice(ENTITY_ID.parcel.length) };
  }
  if (id.startsWith(ENTITY_ID.pole)) {
    return { kind: "plant", id: id.slice(ENTITY_ID.pole.length) };
  }
  if (id.startsWith(ENTITY_ID.plant)) {
    return { kind: "plant", id: id.slice(ENTITY_ID.plant.length) };
  }
  if (id.startsWith(ENTITY_ID.observation)) {
    return { kind: "observation", id: id.slice(ENTITY_ID.observation.length) };
  }
  return null;
}
