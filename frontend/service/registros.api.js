import axiosInstance from "../helpers/axios-config";

export const obtenerRegistros = async (idEncargado, idOlimpiada) => {
    try {
      const response = await axiosInstance.get(`/registros/${idEncargado}/${idOlimpiada}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener registros:", error);
      throw error;
    }
  };