import React from 'react';
import { PlusCircle, XCircle, CheckCheck, X } from 'lucide-react';

const ElegirAreas = ({ catalogo = [], seleccionadas = [], setSeleccionadas, setNivelesPorArea }) => {
    // Validar si el catálogo está vacío
    if (!catalogo || catalogo.length === 0) {
        return (
            <div className="text-center text-gray-500">
                No hay áreas disponibles para seleccionar.
            </div>
        );
    }

    const disponibles = catalogo.filter(
        (area) => !seleccionadas.some((s) => s.id === area.id)
    );

    const handleAdd = (area) => {
        setSeleccionadas([...seleccionadas, area]);
        setNivelesPorArea((prev) => ({ ...prev, [area.id]: [] }));
    };

    const handleRemove = (area) => {
        setSeleccionadas(seleccionadas.filter((a) => a.id !== area.id));
        setNivelesPorArea((prev) => {
            const newState = { ...prev };
            delete newState[area.id];
            return newState;
        });
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Áreas disponibles */}
            <div className="w-full md:w-1/2 border rounded-2xl p-4 shadow-sm bg-white">
                <h3 className="font-semibold text-gray-700 text-lg mb-2">Áreas disponibles</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-1">
                    <ul className="flex flex-col gap-3">
                        {disponibles.map((area) => (
                            <li
                                key={area.id}
                                className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]
                                    ${area.id % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}
                            >
                                <span className="text-gray-800 font-medium">{area.nombre}</span>
                                <button
                                    onClick={() => handleAdd(area)}
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

            {/* Áreas seleccionadas */}
            <div className="w-full md:w-1/2 border rounded-2xl p-4 shadow-sm bg-white">
                <h3 className="font-semibold text-gray-700 text-lg mb-2">Áreas seleccionadas</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-4">
                    <ul className="flex flex-col gap-3">
                        {seleccionadas.map((area) => (
                            <li
                                key={area.id}
                                className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]
                                    ${area.id % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}
                            >
                                <span className="text-blue-900 font-medium">{area.nombre}</span>
                                <button
                                    onClick={() => handleRemove(area)}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    <X size={18} />
                                    Quitar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ElegirAreas;
