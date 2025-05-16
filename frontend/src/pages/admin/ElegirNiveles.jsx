import React from 'react'
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
        // Verificar si el nivel tiene postulantes
        const nivelesConPostulantes = nivelesConPostulantesPorArea[areaActiva] || [];
        if (nivelesConPostulantes.includes(nivel.id)) {
            return; // No permitir eliminar niveles con postulantes
        }
        
        setNivelesPorArea({
            ...nivelesPorArea,
            [areaActiva]: nivelesPorArea[areaActiva]?.filter(n => n.id !== nivel.id),
        });
    };

    const obtenerGradosAsociados = (grados) => {
        return grados.map((grado) => grado.nombre); // Ajusta según la estructura de datos
    };

    const area = areas.find((a) => a.id === areaActiva);
    return (
        <>

            <div className="overflow-x-auto whitespace-nowrap flex gap-2 ">
                {areas.map((a) => (
                    <button
                        key={a.id}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${areaActiva === a.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        onClick={() => setAreaActiva(a.id)}
                    >
                        {a.nombre}
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 overflow-hidden">
                {area && (
                    <>
                        {/* Niveles disponibles */}
                        <div className="w-full md:w-1/3 border rounded-2xl p-4 shadow-sm bg-white">
                            <h3 className="font-semibold text-gray-700 text-lg mb-2">Niveles disponibles</h3>
                            <div className="overflow-y-auto max-h-[320px] px-1 sm:px-2 md:px-1">
                                <ul className="flex flex-col gap-2">
                                    {nivelesCatalogo.map((nivel) => (
                                        <li
                                            key={nivel.id}
                                            className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]
                                                ${nivel.id % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}
                                        >
                                            <span className="text-gray-800 font-medium">{nivel.nombre}</span>
                                            <button
                                                onClick={() => handleAñadir(nivel)}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                 <CheckCheck size={18} />
                                                Añadir
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Niveles seleccionados */}
                        <div className="w-full md:w-2/3 border rounded-2xl p-4 shadow-sm bg-white">
                            <h3 className="font-semibold text-gray-700 text-lg mb-2">Niveles de {area.nombre}</h3>
                            <div className="overflow-y-auto max-h-[320px] px-1 sm:px-2 md:px-1">
                                <ul className="flex flex-col gap-2">
                                    {(nivelesPorArea[areaActiva] || []).map((nivel) => {
                                        const tienePostulantes = (nivelesConPostulantesPorArea[areaActiva] || []).includes(nivel.id);
                                        return (
                                            <li
                                                key={nivel.id}
                                                className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]
                                                    ${nivel.id % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'}
                                                    ${tienePostulantes ? 'border-2 border-yellow-400' : ''}`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-900 font-medium">{nivel.nombre}</span>
                                                        {tienePostulantes && (
                                                            <div className="inline-flex items-center text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded-full">
                                                                <Info size={14} className="mr-1" />
                                                                Con postulantes
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">Grados: {obtenerGradosAsociados(nivel.grados).join(', ')}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleQuitar(nivel)}
                                                    disabled={tienePostulantes}
                                                    className={`flex items-center gap-1 text-sm font-medium ${
                                                        tienePostulantes 
                                                            ? 'text-gray-400 cursor-not-allowed' 
                                                            : 'text-red-600 hover:text-red-800'
                                                    }`}
                                                >
                                                    <X size={18} />
                                                    {tienePostulantes ? 'No se puede quitar' : 'Quitar'}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
export default ElegirNiveles
