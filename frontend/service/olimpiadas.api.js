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

export const iniciarOlimpiada = async (id) => {
    try {
        const response = await axiosInstance.post(`/activarolimpiada/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data; 
        }
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
        // Laravel returns { success: true, data: olimpiada }
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Error al obtener olimpiada');
        }
    } catch (error) {
        console.error("Error fetching olimpiada:", error);
        throw error;
    }
}

export const updateOlimpiada = async (id, data) => {
    try {
        const response = await axiosInstance.post(`/olimpiadas/${id}/modificar`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating olimpiada:", error);
        throw error;
    }
};
