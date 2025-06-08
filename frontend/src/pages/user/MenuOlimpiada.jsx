import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { getOlimpiada } from '../../../service/olimpiadas.api';
import { Button, Card, CardContent, CardHeader, CardTitle, Alert, LoadingSpinner } from '../../components/ui';
import { useDeviceAgent } from '../../hooks/useDeviceAgent';
import { ArrowLeft, Calendar, FileText, DollarSign, Users, Clock, ExternalLink } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { getAreasdeOlimpiada } from '../../../service/areas.api';



import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const MenuOlimpiada = () => {
    const { idOlimpiada } = useParams();
    const [olimpiada, setOlimpiada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isMobile, isTablet, screenSize } = useDeviceAgent();
    const [areasConDetalle, setAreasConDetalle] = useState([]);


    const hoy = dayjs();
    const inicioInscripcion = olimpiada?.inicio_inscripcion ? dayjs(olimpiada.inicio_inscripcion) : null;
    const finInscripcion = olimpiada?.fin_inscripcion ? dayjs(olimpiada.fin_inscripcion) : null;

    const inscripcionHabilitada =
        inicioInscripcion &&
        finInscripcion &&
        hoy.isSameOrAfter(inicioInscripcion, 'day') &&
        hoy.isSameOrBefore(finInscripcion, 'day');

    // Memoized handlers for better performance
    const handleVolver = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const handleInscripcion = useCallback(() => {
        navigate(`/identificarEncargado`, { state: { idOlimpiada } });
    }, [navigate, idOlimpiada]);

    // Optimized data fetching with useCallback to prevent unnecessary re-renders
    const fetchOlimpiadaData = useCallback(async () => {
        if (!idOlimpiada) {
            setError("ID de olimpiada no válido");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const data = await getOlimpiada(idOlimpiada);
            setOlimpiada(data);

            // Aquí consumes tu endpoint estructurado
            const areasRes = await getAreasdeOlimpiada(idOlimpiada);
             console.log("Respuesta de getAreasByOlimpiada:", areasRes);
            setAreasConDetalle(Array.isArray(areasRes.data) ? areasRes.data : []);

        } catch (error) {
            console.error("Error fetching olimpiada:", error);
            setError("No se pudo cargar la información de la olimpiada. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    }, [idOlimpiada]);

    useEffect(() => {
        fetchOlimpiadaData();
    }, [fetchOlimpiadaData]);

    // Memoized responsive classes
    const containerClasses = useMemo(() => {
        const baseClasses = "container mx-auto bg-white rounded-lg shadow-md";

        if (isMobile) {
            return `${baseClasses} mx-4 p-4 max-w-full`;
        } else if (isTablet) {
            return `${baseClasses} mx-8 p-6 max-w-4xl`;
        } else {
            return `${baseClasses} p-8 max-w-5xl`;
        }
    }, [isMobile, isTablet]);

    const buttonSizes = useMemo(() => {
        if (isMobile) return "sm";
        if (isTablet) return "md";
        return "lg";
    }, [isMobile, isTablet]);

    // Format date helper
    const formatDate = useCallback((dateString) => {
        if (!dateString) return "No disponible";
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }, []);

    // Render PDF link component
    const PDFLink = ({ url, text }) => {
        if (!url) return <span className="text-slate-500">No disponible</span>;

        return (
            <a
                href={`http://localhost:8000/storage/${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
            >
                <ExternalLink className="h-4 w-4" />
                {text}
            </a>
        );
    };



    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-600">Cargando información de la olimpiada...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md">
                    <Alert variant="error" title="Error">
                        <p className="mb-4">{error}</p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                size={buttonSizes}
                                onClick={handleVolver}
                            >
                                Volver al inicio
                            </Button>
                            <Button
                                variant="primary"
                                size={buttonSizes}
                                onClick={fetchOlimpiadaData}
                            >
                                Reintentar
                            </Button>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    // Main content
    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-12">
            <div className={containerClasses}>
                {/* Header with back button */}
                <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Button
                            variant="outline"
                            size={buttonSizes}
                            onClick={handleVolver}
                            className="self-start"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver atrás
                        </Button>

                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-slate-600">Olimpiada activa</span>
                        </div>
                    </div>

                    <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-slate-900">
                        {olimpiada?.nombre || "Olimpiada"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Main information grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Documents card */}
                        <Card className="border border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Documentos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-slate-700">Convocatoria:</span>
                                    <div className="mt-1">
                                        <PDFLink url={olimpiada?.convocatoria} text="Ver PDF" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details card */}
                        <Card className="border border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    Detalles
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 leading-relaxed">
                                    {olimpiada?.descripcion || "No hay descripción disponible"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dates and costs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Start date */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Fecha de inicio</span>
                            </div>
                            <p className="text-blue-900 font-semibold">
                                {formatDate(olimpiada?.fecha_inicio)}
                            </p>
                        </div>

                        {/* End date */}
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Fecha de cierre</span>
                            </div>
                            <p className="text-red-900 font-semibold">
                                {formatDate(olimpiada?.fecha_fin)}
                            </p>
                        </div>

                        {/* Cost */}
                        {olimpiada?.costo && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Costo</span>
                                </div>
                                <p className="text-green-900 font-semibold">
                                    Bs. {olimpiada.costo}
                                </p>
                            </div>
                        )}

                        {/* Max areas */}
                        {olimpiada?.max_areas && (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">Máx. áreas</span>
                                </div>
                                <p className="text-purple-900 font-semibold">
                                    {olimpiada.max_areas}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Registration dates if available */}
                    {(olimpiada?.inicio_inscripcion || olimpiada?.fin_inscripcion) && (
                        <Card className="border border-amber-200 bg-amber-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                                    <Calendar className="h-5 w-5" />
                                    Periodo de Inscripción
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {olimpiada?.inicio_inscripcion && (
                                        <div>
                                            <span className="text-sm font-medium text-amber-700">Inicio:</span>
                                            <p className="text-amber-900 font-semibold">
                                                {formatDate(olimpiada.inicio_inscripcion)}
                                            </p>
                                        </div>
                                    )}
                                    {olimpiada?.fin_inscripcion && (
                                        <div>
                                            <span className="text-sm font-medium text-amber-700">Fin:</span>
                                            <p className="text-amber-900 font-semibold">
                                                {formatDate(olimpiada.fin_inscripcion)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                      
                    {Array.isArray(areasConDetalle) && areasConDetalle.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Áreas de la Olimpiada</h3>
                            <Swiper
                                spaceBetween={24}
                                slidesPerView={1}
                                breakpoints={{
                                    640: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                }}
                                className="pb-6"
                            >
                                {areasConDetalle.map((area, idx) => (
                                    <SwiperSlide key={area.id || idx}>
                                        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl shadow-lg p-6 h-full flex flex-col">
                                            <h4 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                                                {area.nombre}
                                            </h4>
                                            <p className="text-slate-700 mb-4 italic">{area.descripcion || "Sin descripción"}</p>
                                            {/* Niveles */}
                                            {Array.isArray(area.niveles) && area.niveles.length > 0 ? (
                                                <div>
                                                    <span className="font-semibold text-indigo-700">Niveles:</span>
                                                    <ul className="list-disc list-inside ml-4 mt-1">
                                                        {area.niveles.map((nivel, i) => (
                                                            <li key={nivel.id || i} className="text-indigo-900 font-medium mb-2">
                                                                <div>
                                                                    <span className="font-bold">{nivel.nombre}</span>
                                                                    {/* Grados del nivel */}
                                                                    {nivel.grados && nivel.grados.length > 0 && (
                                                                        <div className="text-blue-700 text-sm ml-2">
                                                                            Grados: {nivel.grados.map(g => g.nombre).join(', ')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <span className="ml-2 text-slate-500">No hay niveles</span>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    )}


                    {/* Action button */}
                    <div className="flex justify-center pt-6">
                        <Button
                            variant="primary"
                            size={isMobile ? "lg" : "xl"}
                            onClick={handleInscripcion}
                            className="w-full sm:w-auto min-w-48 font-semibold"
                            disabled={!inscripcionHabilitada}
                        >
                            {inscripcionHabilitada
                                ? "Inscribirse en la Olimpiada"
                                : "La inscripción no está disponible en este momento."
                            }
                        </Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
}


export default MenuOlimpiada;
