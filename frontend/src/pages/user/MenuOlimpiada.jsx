import { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { getOlimpiada } from '../../../service/olimpiadas.api'; // Ajusta la ruta según tu estructura

const MenuOlimpiada = () => {
    const { idOlimpiada } = useParams();
    const [olimpiada, setOlimpiada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const detallesOlimpiada = async () => {
            try {
                const data = await getOlimpiada(idOlimpiada);
                setOlimpiada(data);
            } catch (error) {
                console.error(error);
                setError("No se pudo cargar la información de la olimpiada.");
            } finally {
                setLoading(false);
            }
        };
        detallesOlimpiada();
    }, [idOlimpiada]);


    const handleInscripcion = () => {
        navigate(`/identificarEncargado`, { state: { idOlimpiada } });
    };


    if (loading) return <div className="pt-24 text-center">Cargando información...</div>;
    if (error) return <div className="pt-24 text-center text-red-600">{error}</div>;

    return (
        <div>

            <div className="pt-24 container mx-auto max-w-2xl bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold mb-4 text-center">{olimpiada?.nombre || "Olimpiada"}</h1>
                <p className="mb-2">
                    <strong>Convocatoria:</strong>{" "}
                    {olimpiada?.convocatoria
                        ? (
                            <a
                                href={`http://localhost:8000/storage/${olimpiada.convocatoria}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                Ver PDF
                            </a>
                        )
                        : "No disponible"}
                </p>
                <p className="mb-2"><strong>Detalles:</strong> {olimpiada?.descripcion || "No disponible"}</p>
                <p className="mb-2"><strong>Fecha de inicio:</strong> {olimpiada?.fecha_inicio || "No disponible"}</p>
                <p className="mb-6"><strong>Fecha de cierre:</strong> {olimpiada?.fecha_fin || "No disponible"}</p>
                {/* Agrega aquí más campos según tu modelo */}

                <div className="flex justify-center">
                    <button
                        onClick={handleInscripcion}
                        className="px-6 py-2 rounded-md text-white bg-black hover:bg-gray-800"
                    >
                        Inscribirse
                    </button>
                </div>
            </div>

        </div>
    )
}

export default MenuOlimpiada
