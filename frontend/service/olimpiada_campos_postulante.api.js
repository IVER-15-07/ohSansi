import axiosInstance from "../helpers/axios-config";

export const getOlimpiadaCamposPostulante = async (idOlimpiada, idPostulante = null) => {
  try {
    if(!idPostulante) {
      const response = await axiosInstance.get(
      `/olimpiadas/${idOlimpiada}/campos_postulante/`,
      );
      return response.data;
    }else{
      const response = await axiosInstance.get(
      `/olimpiadas/${idOlimpiada}/campos_postulante/${idPostulante}`,
      );
      return response.data;
    }
    
  } catch (error) {
    console.error("Error fetching Olimpiada Campos Postulante:", error);
    throw error;
  }
}

export const deleteOlimpiadaCampoPostulante = async (idOlimpiadaCampoPostulante) => {
  try {
    const response = await axiosInstance.delete(
      `/olimpiadas/campos_postulante/${idOlimpiadaCampoPostulante}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Olimpiada Campo Postulante:", error);
    throw error;
  }
}

export const postOlimpiadaCampoPostulante = async (olimpiadaCampoPostulante) => {
  try {
    const response = await axiosInstance.post(
      `/olimpiadas/campos_postulante/`,
      olimpiadaCampoPostulante,
    );
    return response.data;
  } catch (error) {
    console.error("Error posting Olimpiada Campo Postulante:", error);
    throw error;
  }
}
