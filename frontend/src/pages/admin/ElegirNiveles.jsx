import { useState } from 'react';
import { CheckCheck, X, Info } from 'lucide-react';

const ElegirNiveles = ({ areas, nivelesCatalogo, nivelesPorArea, setNivelesPorArea, nivelesConPostulantesPorArea = {} }) => {
    console.log("Eligiendo Niveles", areas, nivelesCatalogo, nivelesPorArea);
    const [areaActiva, setAreaActiva] = useState(areas[0]?.id || null);

    const handleAñadir = (nivel) => {
        if (!nivelesPorArea[areaActiva]?.some(n => n.id === nivel.id)) {
            setNivelesPorArea({
                ...nivelesPorArea,
                [areaActiva]: [...(nivelesPorArea[areaActiva] || []), nivel],
            });
        }
    };

    const handleQuitar = (nivel) => {
        // Eliminar el nivel sin importar si tiene postulantes
        setNivelesPorArea({
            ...nivelesPorArea,
            [areaActiva]: nivelesPorArea[areaActiva]?.filter(n => n.id !== nivel.id),
        });
    };

    const obtenerGradosAsociados = (grados) => {
        return grados.map((grado) => grado.nombre); // Ajusta según la estructura de datos
    };

    const area = areas.find((a) => a.id === areaActiva);
    
    // Obtener áreas que tienen niveles seleccionados
    const areasConNiveles = areas.filter(area => 
        nivelesPorArea[area.id] && nivelesPorArea[area.id].length > 0
    );

    return (
        <div className="space-y-6">
            {/* Header de Resumen de Configuración */}
            <div className="bg-gray-50 border rounded-2xl p-4 shadow-sm">
                <h2 className="font-bold text-gray-800 text-xl mb-3">Resumen de Configuración</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {areasConNiveles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {areasConNiveles.map((area) => (
                                <span 
                                    key={area.id}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                    {area.nombre} ({nivelesPorArea[area.id]?.length || 0})
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-500 text-sm italic">Ninguna área configurada</span>
                    )}
                </div>
            </div>

            {/* Selector de Áreas */}
            <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    <span className="font-medium text-gray-700 text-xl">Áreas:</span>
                    {areas.map((a) => (
                        <button
                            key={a.id}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                                areaActiva === a.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                            onClick={() => setAreaActiva(a.id)}
                        >
                            {a.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido Principal con Grid Equilibrado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {area && (
                    <>
                        {/* Niveles disponibles */}
                        <div className="border rounded-2xl p-4 shadow-sm bg-white">
                            <h3 className="font-semibold text-gray-700 text-lg mb-4">
                                Nivel/Categoría Disponibles
                            </h3>
                            <div className="overflow-y-auto max-h-[400px] pr-2">
                                <div className="space-y-3">
                                    {nivelesCatalogo.map((nivel) => (
                                        <div
                                            key={nivel.id}
                                            className="p-4 border border-gray-300 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-blue-300 hover:shadow-md"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-gray-800 font-medium text-base mb-1">
                                                        {nivel.nombre}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 break-words">
                                                        <span className="font-medium">Grados:</span> {obtenerGradosAsociados(nivel.grados).join(', ')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleAñadir(nivel)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                                                >
                                                    <CheckCheck size={18} />
                                                    Añadir
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Niveles seleccionados */}
                        <div className="border rounded-2xl p-4 shadow-sm bg-white">
                            <h3 className="font-semibold text-gray-700 text-lg mb-4">
                                Nivel/Categoría de {area.nombre}
                            </h3>
                            <div className="overflow-y-auto max-h-[400px] pr-2">
                                {(nivelesPorArea[areaActiva] || []).length > 0 ? (
                                    <div className="space-y-3">
                                        {(nivelesPorArea[areaActiva] || []).map((nivel) => (
                                            <div
                                                key={nivel.id}
                                                className="p-4 border border-blue-300 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-red-400 hover:shadow-md"
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-blue-900 font-medium text-base mb-1">
                                                            {nivel.nombre}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 break-words">
                                                            <span className="font-medium">Grados:</span> {obtenerGradosAsociados(nivel.grados).join(', ')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleQuitar(nivel)}
                                                        className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                                                    >
                                                        <X size={18} />
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Info size={48} className="mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-500 text-sm">
                                            No hay niveles seleccionados para esta área
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ElegirNiveles;
