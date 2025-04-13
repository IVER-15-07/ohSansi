import React from 'react'
import { useState } from 'react';

const ElegirNiveles = ({ areas, nivelesCatalogo, nivelesPorArea, setNivelesPorArea }) => {

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

    const area = areas.find((a) => a.id === areaActiva);
    return (
        <>
            <div className="mt-2 overflow-x-auto whitespace-nowrap flex gap-2 pb-2">
                {areas.map((a) => (
                    <button
                        key={a.id}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition ${areaActiva === a.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        onClick={() => setAreaActiva(a.id)}
                    >
                        {a.nombre}
                    </button>
                ))}
            </div>

            {area && (
                <div className="flex flex-1 gap-4 overflow-hidden">
                    <div className="flex-1 border rounded-2xl p-4 overflow-y-auto">
                        <h3 className="font-semibold text-gray-600 mb-2">Niveles disponibles</h3>
                        <div className="flex flex-col gap-2">
                            {nivelesCatalogo.map((nivel) => (
                                <div key={nivel.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                    <span>{nivel.nombre}</span>
                                    <button
                                        onClick={() => handleAñadir(nivel)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                                    >
                                        Añadir
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>

                    <div className="flex-1 border rounded-2xl p-4 overflow-y-auto">
                        <h3 className="font-semibold text-gray-600 mb-2">Niveles de {area.nombre}</h3>
                        <div className="flex flex-col gap-2">
                            {(nivelesPorArea[areaActiva] || []).map((nivel) => (
                                <div key={nivel.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                    <span>{nivel.nombre}</span>
                                    <button
                                        onClick={() => handleQuitar(nivel)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default ElegirNiveles
