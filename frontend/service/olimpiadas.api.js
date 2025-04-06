
export const getAreas = async () => {
    try {
        const response = await axiosInstance.get("/olimpiadas");
        return response.data;
    } catch (error) {
        console.error("Error fetching olimpiadas:", error);
        throw error;
    }
}

export const createArea = async (data) => {
    try {
        const response = await axiosInstance.post("/olimpiadas", data);
        return response.data;
    } catch (error) {
        console.error("Error creating olimpiada:", error);
        throw error;
    }
}