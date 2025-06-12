import axiosInstance from "../helpers/axios-config";

export const getOlimpiadaCamposTutor = async (idOlimpiada, idTutor = null) => {
  try {
    if(!idTutor) {
      const response = await axiosInstance.get(
        `/olimpiadas-campos_tutor/${idOlimpiada}`
      );
      return response.data;
    }else{
      const response = await axiosInstance.get(
        `/olimpiadas-campos_tutor/${idOlimpiada}/${idTutor}`
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching Olimpiada Campos Tutor:", error);
    throw error;
  }
}

export const deleteOlimpiadaCampoTutor = async (idOlimpiadaCampoTutor) => {
  try {
    const response = await axiosInstance.delete(
      `/olimpiadas-campos_tutor/${idOlimpiadaCampoTutor}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Olimpiada Campo Tutor:", error);
    throw error;
  }
}

export const postOlimpiadaCampoTutor = async (olimpiadaCampoTutor) => {
  try {
    const response = await axiosInstance.post(
      `/olimpiadas-campos_tutor/`,
      olimpiadaCampoTutor,
    );
    return response.data;
  } catch (error) {
    console.error("Error posting Olimpiada Campo Tutor:", error);
    throw error;
  }
}