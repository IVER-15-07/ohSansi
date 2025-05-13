import axiosInstance from "../helpers/axios-config";

export const getOpcionesInscripcion = async ($idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/opciones_inscripcion/${$idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching opciones de inscripcion:", error);
    throw error;
  }
}

export const getAreasByOlimpiada = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/opciones_inscripcion/${idOlimpiada}/areas`);
    return response.data;
  } catch (error) {
    console.error("Error fetching areas de una olimpiada:", error);
    throw error;
  }
}

export const getMapOfOlimpiada = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/opciones_inscripcion/${idOlimpiada}/mapa`);
    return response.data;
  } catch (error) {
    console.error("Error fetching las areas y niveles/categorias de una olimpiada:", error);
    throw error;
  }
}

export const deleteOpcionesInscripcionByOlimpiada = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.delete(`/opciones_inscripcion/${idOlimpiada}`);
    return response.data;
  } catch (error) {
    console.error("Error eliminando las opciones de inscripcion de una olimpiada:", error);
    throw error;
  }
}


export const createOpcionInscripcion = async (data) => {
  try {
    const response = await axiosInstance.post("/opciones_inscripcion", data);
    return response.data;
  } catch (error) {
    console.error("Error creating opcion de inscripcion:", error);
    throw error;
  }
}

export const getOpcionesConPostulantes = async (idOlimpiada) => {
  try {
    const response = await axiosInstance.get(`/opciones_inscripcion/${idOlimpiada}/con-postulantes`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener opciones con postulantes:", error);
    throw error;
  }
}
  