import axiosInstance from "../helpers/axios-config";

export const getRegistroByCI = async ($idOlimpiada, $ci) => {
    try {
        const response = await axiosInstance.get(`/registro/olimpiada/${$idOlimpiada}/postulante/${$ci}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching registro por ci:", error);
        throw error;
    }
}

export const createRegistro = async (data) => {
    try {
        const response = await axiosInstance.post("/registro", data);
        return response.data;
    } catch (error) {
        console.error("Error creating registro:", error);
        throw error;
    }
}

export const enviarRegistrosLote = async (archivo, idOlimpiada, idEncargado) => {
    try {
        const formData = new FormData();
        formData.append("excel", archivo);
        formData.append("id_olimpiada", idOlimpiada);
        formData.append("id_encargado", idEncargado);

        const response = await axiosInstance.post("/postulantes_lote", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        // Si el backend responde con un error y tiene data, retorna esa data
        if (error.response && error.response.data) {
            return error.response.data;
        }
        // Si no, lanza el error normal
        throw error;
    }
};