import { useEffect } from "react";
import { getAreas } from '../../service/areas.api';

const TestGetAreas = () => {
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await getAreas();
        console.log("Datos obtenidos de getAreas:", areas);
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      }
    };

    fetchAreas();
  }, []);

  return <div>Prueba de getAreas en consola</div>;
};

export default TestGetAreas;