import { createContext, useContext } from "react";
import type { Viewer } from "cesium";

export const ViewerContext = createContext<Viewer | null>(null);

// The layer components live inside CesiumGlobe and share its viewer.
export function useViewer() {
  const viewer = useContext(ViewerContext);
  if (!viewer) throw new Error("useViewer must be used inside CesiumGlobe");
  return viewer;
}
