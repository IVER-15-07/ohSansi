import axiosInstance from "../helpers/axios-config";

export const getOlimpiadas = async () => {
    try {
        const response = await axiosInstance.get("/olimpiadas");
        return response.data;
    } catch (error) {
        console.error("Error fetching olimpiadas:", error);
        throw error;
    }
}

export const getOlimpiadasActivas = async () => {
    try {
        const response = await axiosInstance.get("/olimpiadas/activas");
        return response.data;
    } catch (error) {
        console.error("Error fetching olimpiadas:", error);
        throw error;
    }
}
export const createOlimpiada = async (data) => {
    try {
        const response = await axiosInstance.post("/olimpiadas", data, {
            headers: {
                'Content-Type': 'multipart/form-data', // Asegúrate de que este encabezado esté configurado
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating olimpiada:", error);
        throw error;
    }
}

export const getOlimpiada = async (id) => {
    try {
        const response = await axiosInstance.get(`/olimpiadas/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching olimpiada:", error);
        throw error;
    }
}
