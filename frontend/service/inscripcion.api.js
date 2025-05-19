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

export const getInscripcionesPorRegistro = async (idRegistro) => {
  try {
    const response = await axiosInstance.get(`/inscripciones-registro/${idRegistro}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las inscripciones dado el reigstro:", error);
    throw error;
  }
};

export const createInscripcion = async (data) => {
  try {
    const response = await axiosInstance.post("/inscripciones", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear la inscripcion:", error);
    throw error;
  }
}

export const deleteInscripcion = async (idInscripcion) => {
  try {
    const response = await axiosInstance.delete(`/inscripciones/${idInscripcion}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la inscripcion:", error);
    throw error;
  }
};