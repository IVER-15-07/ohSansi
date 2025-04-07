import axiosInstance from "../helpers/axios-config";

export const getNivelesCategorias = async () => {
  try {
    const response = await axiosInstance.get("/niveles_categorias");
    return response.data;
  } catch (error) {
    console.error("Error fetching niveles/categorias:", error);
    throw error;
  }
}

export const createNivelCategoria = async (data) => {
    try {
      const response = await axiosInstance.post("/niveles_categorias", data);
      return response.data;
    } catch (error) {
      console.error("Error creating nivel/categoria:", error);
      throw error;
    }
  }

  export const addGradoToNivelCategoria = async (data, id_nivel_categoria) => {
    try {
      const response = await axiosInstance.post(`/niveles_categorias/:${id_nivel_categoria}/grados`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding grados to nivel/categoria:", error);
      throw error;
    }
  }
