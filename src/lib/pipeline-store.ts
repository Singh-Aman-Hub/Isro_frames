// Simple client-side selected scenario store using localStorage-like memory
let selectedId = "cyclone";

export const getSelectedScenarioId = () => {
  if (typeof window === "undefined") return selectedId;
  return window.localStorage.getItem("selected-scenario") ?? selectedId;
};

export const setSelectedScenarioId = (id: string) => {
  selectedId = id;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("selected-scenario", id);
  }
};
