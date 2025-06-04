import React from 'react'

function Formulario({secciones, formValues, handleInputChange}) {
    return (
        <form className="overflow-y-auto max-h-[70vh]">
            {secciones.map((seccion) => (
                <div key={seccion.id} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {seccion.nombre}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {seccion.campos_inscripcion.map((campo) => {
                      const valorActual = formValues[campo.id] || "No asignado";
                      switch (campo.tipo_campo.nombre) {
                        case "text":
                          return (
                            <div key={campo.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {campo.nombre}
                              </label>
                              <input
                                type="text"
                                value={formValues[campo.id] || ""}
                                onChange={(e) => handleInputChange(campo.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Valor registrado: {valorActual}
                              </p>
                            </div>
                          );
                        case "number":
                          const isMaxAreasField = campo.nombre.toLowerCase().includes("máxima cantidad de áreas");
                          return (
                            <div key={campo.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {campo.nombre}
                              </label>
                              <input
                                type="number"
                                min={isMaxAreasField ? "0" : undefined}
                                value={formValues[campo.id] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (isMaxAreasField && Number(value) < 0) {
                                    alert("La cantidad máxima de áreas no puede ser menor a 0");
                                    return;
                                  }
                                  handleInputChange(campo.id, value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Valor registrado: {valorActual}
                              </p>
                            </div>
                          );
                        case "email":
                          return (
                            <div key={campo.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {campo.nombre}
                              </label>
                              <input
                                type="email"
                                value={formValues[campo.id] || ""}
                                onChange={(e) => handleInputChange(campo.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ejemplo@correo.com"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Valor registrado: {valorActual}
                              </p>
                            </div>
                          );
                        default:
                          return (
                            <div key={campo.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {campo.nombre}
                              </label>
                              <input
                                type="text"
                                value={formValues[campo.id] || ""}
                                onChange={(e) => handleInputChange(campo.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Valor registrado: {valorActual}
                              </p>
                            </div>
                          );
                      }
                    })}
                  </div>
                </div>
            ))}
        </form>
    );
}
export default Formulario