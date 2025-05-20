import axiosInstance from "../helpers/axios-config";

export const getOlimpiadaCamposTutor = async (idOlimpiada, idTutor = null) => {
  try {
    if(!idTutor) {
      const response = await axiosInstance.get(
        `/olimpiadas/${idOlimpiada}/campos_tutor/`
      );
      return response.data;
    }else{
      const response = await axiosInstance.get(
        `/olimpiadas/${idOlimpiada}/campos_tutor/${idTutor}`
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching Olimpiada Campos Tutor:", error);
    throw error;
  }
}