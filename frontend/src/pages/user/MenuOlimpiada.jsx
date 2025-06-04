import { useEffect, useState } from 'react'
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { useNavigate, useParams } from "react-router-dom";
import { getOlimpiada } from '../../../service/olimpiadas.api'; // Ajusta la ruta según tu estructura

const MenuOlimpiada = () => {
    const { idOlimpiada } = useParams();
    const [olimpiada, setOlimpiada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const hoy = dayjs();
    const inicioInscripcion = olimpiada?.inicio_inscripcion ? dayjs(olimpiada.inicio_inscripcion) : null;
    const finInscripcion = olimpiada?.fin_inscripcion ? dayjs(olimpiada.fin_inscripcion) : null;

    const inscripcionHabilitada =
        inicioInscripcion &&
        finInscripcion &&
        hoy.isSameOrAfter(inicioInscripcion, 'day') &&
        hoy.isSameOrBefore(finInscripcion, 'day');



    useEffect(() => {
        const detallesOlimpiada = async () => {
            try {
                const data = await getOlimpiada(idOlimpiada);
                console.log("Respuesta olimpiada:", data); // <-- Agrega esto
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

    const handleVolver = () => {
        navigate("/");
    };


    const handleInscripcion = () => {
        navigate(`/identificarEncargado`, { state: { idOlimpiada } });
    };


    if (loading) return <div className="pt-24 text-center">Cargando información...</div>;
    if (error) return <div className="pt-24 text-center text-red-600">{error}</div>;



    console.log("Hoy:", hoy.format("YYYY-MM-DD"));
    console.log("Inicio inscripción:", inicioInscripcion?.format("YYYY-MM-DD"));
    console.log("Fin inscripción:", finInscripcion?.format("YYYY-MM-DD"));
    console.log("¿Inscripción habilitada?:", inscripcionHabilitada);

    return (


        <div className="pt-24 container mx-auto max-w-2xl bg-white rounded-lg shadow-md p-8">
            <div className="mb-4">
                <button
                    onClick={handleVolver}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-blue-900 font-semibold"
                >
                    ← Volver atrás
                </button>
            </div>
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
                    className="px-6 py-2 rounded-md text-white bg-black hover:bg-gray-800 disabled:bg-gray-400"
                    disabled={!inscripcionHabilitada}
                >
                    {inscripcionHabilitada
                        ? "Inscribirse"
                        : "La inscripción no está disponible en este momento."
                    }
                </button>

            </div>
        </div>


    )
}

export default MenuOlimpiada
