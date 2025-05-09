import axiosInstance from "../helpers/axios-config";

export const getEncargados = async () => {
  try {
      const response = await axiosInstance.get("/encargados");
      return response.data;
  } catch (error) {
      console.error("Error fetching encargados:", error);
      throw error;
  }
}

export const createEncargado = async (data) => {
  try {
    const response = await axiosInstance.post("/encargados", data);
    return response.data;
  } catch (error) {
    console.error("Error creating encargado:", error);
    throw error;
  }
}

export const verificarEncargado = async (ci) => {
  return await axiosInstance.get(`/encargados/verificar/${ci}`);
};

export const getEncargado = async (idEncargado) => {
  try {
    const response = await axiosInstance.get(`/encargados/${idEncargado}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching encargado:", error);
    throw error;
  }
}

export const obtenerConteoRegistrosPorEncargado = async (idEncargado, idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/encargados/registrosTotales/${idEncargado}/${idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conteo de registros:", error);
    throw error;
  }
};