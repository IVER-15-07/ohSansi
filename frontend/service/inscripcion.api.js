import axiosInstance from "../helpers/axios-config";

export const obtenerInscripciones = async (idEncargado, idOlimpiada) => {
    try {
      const response = await axiosInstance.get(`/inscripciones/${idEncargado}/${idOlimpiada}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener registros:", error);
      throw error;
    }
  };