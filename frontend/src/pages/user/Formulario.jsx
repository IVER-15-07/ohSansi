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
                      switch (campo.tipo_campo.nombre) {
                        case "text":
                        case "number":
                          return (
                            <div key={campo.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {campo.nombre}
                              </label>
                              <input
                                type={campo.tipo_campo.nombre}
                                value={formValues[campo.id]}
                                onChange={(e) =>
                                  handleInputChange(campo.id, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
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
                                value={formValues[campo.id]}
                                onChange={(e) =>
                                  handleInputChange(campo.id, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ejemplo@correo.com"
                              />
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
                                value={formValues[campo.id]}
                                onChange={(e) =>
                                  handleInputChange(campo.id, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
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