import React from "react";

function DatosPostulante({ formValues, handleInputChange }) {
    return (
        <div className="space-y-6">
        <h2 className="text-lg font-semibold">Datos del Postulante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre(s)
            </label>
            <input
                type="text"
                value={formValues.nombre || ""}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido(s)
            </label>
            <input
                type="text"
                value={formValues.apellido || ""}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Carnet de Identidad
            </label>
            <input
                type="text"
                value={formValues.ci|| ""}
                onChange={(e) => handleInputChange("ci", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
        </div>
        {/* Agregar más campos según sea necesario */}
        </div>
    );
}
export default DatosPostulante;