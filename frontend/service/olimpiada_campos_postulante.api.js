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