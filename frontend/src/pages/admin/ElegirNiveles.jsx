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
        setNivelesPorArea({
            ...nivelesPorArea,
            [areaActiva]: nivelesPorArea[areaActiva]?.filter(n => n.id !== nivel.id),
        });
    };

    const obtenerGradosAsociados = (grados) => {
        return grados.map((grado) => grado.nombre);
    };

    const area = areas.find((a) => a.id === areaActiva);
    
    const areasConNiveles = areas.filter(area => 
        nivelesPorArea[area.id] && nivelesPorArea[area.id].length > 0
    );

    return (
        <div className="space-y-6">
            {/* Header de Resumen de Configuración */}
                <h2 className="font-bold text-gray-800 text-xl mb-3">Resumen de Configuración</h2>

            {/* Selector de Áreas */}
            <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2">
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
                            {a.nombre} ({nivelesPorArea[a.id]?.length || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido Principal con Grid Equilibrado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {area && (
                    <>
                        {/* Niveles disponibles */}
                        <div className="border rounded-2xl p-4 shadow-sm bg-white overflow-hidden">
                            <h3 className="font-semibold text-gray-700 text-lg mb-4">
                                Niveles/Categorías Disponibles
                            </h3>
                            {/* Contenedor con overflow específico */}
                            <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <div className="space-y-3 pr-2">
                                    {nivelesCatalogo.map((nivel) => (
                                        <div
                                            key={nivel.id}
                                            className="p-4 border border-gray-300 rounded-xl shadow-sm bg-white
                                                     transition-all duration-200 ease-in-out 
                                                     hover:border-blue-300 hover:shadow-lg hover:bg-blue-50
                                                     transform hover:-translate-y-1
                                                     cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-gray-800 font-medium text-base mb-1 truncate">
                                                        {nivel.nombre}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        <span className="font-medium">Grados:</span> {obtenerGradosAsociados(nivel.grados).join(', ')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleAñadir(nivel)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 
                                                             text-sm font-medium whitespace-nowrap
                                                             transition-all duration-150 hover:scale-105
                                                             px-2 py-1 rounded-lg hover:bg-blue-100"
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
                        <div className="border rounded-2xl p-4 shadow-sm bg-white overflow-hidden">
                            <h3 className="font-semibold text-gray-700 text-lg mb-4">
                                Niveles/Categorías de {area.nombre}
                            </h3>
                            {/* Contenedor con overflow específico */}
                            <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {(nivelesPorArea[areaActiva] || []).length > 0 ? (
                                    <div className="space-y-3 pr-2">
                                        {(nivelesPorArea[areaActiva] || []).map((nivel) => (
                                            <div
                                                key={nivel.id}
                                                className="p-4 border border-blue-300 rounded-xl shadow-sm bg-blue-50
                                                         transition-all duration-200 ease-in-out 
                                                         hover:border-red-400 hover:shadow-lg hover:bg-red-50
                                                         transform hover:-translate-y-1
                                                         cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-blue-900 font-medium text-base mb-1 truncate">
                                                            {nivel.nombre}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            <span className="font-medium">Grados:</span> {obtenerGradosAsociados(nivel.grados).join(', ')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleQuitar(nivel)}
                                                        className="flex items-center gap-1 text-sm font-medium 
                                                                 text-red-600 hover:text-red-800 whitespace-nowrap
                                                                 transition-all duration-150 hover:scale-105
                                                                 px-2 py-1 rounded-lg hover:bg-red-100"
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
