import React from 'react'
import { useState } from 'react'

const areasConfig = [
  {
    nombre: "Informática",
    niveles: [
      { categoria: "1p", grado: "1ro de primaria" },
      { categoria: "2p", grado: "2do de primaria" },
      { categoria: "1s", grado: "1ro de secundaria" },
      { categoria: "2s", grado: "2do de secundaria" },
      { categoria: "Guacamayo", grado: "3ro a 6to de secundaria" },
    ],
  },
  {
    nombre: "Física",
    niveles: [
      { categoria: "1s", grado: "1ro de secundaria" },
      { categoria: "2s", grado: "2do de secundaria" },
    ],
  },
  {
    nombre: "Química",
    niveles: [
      { categoria: "1s", grado: "1ro de secundaria" },
    ],
  },
];

const Detalles = () => {
  const [selectedArea, setSelectedArea] = useState(areasConfig[0]);

  return (
    <div>

      <div className="flex flex-col p-4 w-full">
        <h2 className="text-xl font-bold mb-4">Detalles de áreas</h2>
        <div className="flex border rounded shadow-md p-4">
          {/* Lista de Áreas */}
          <div className="w-1/3 border-r p-2">
            {areasConfig.map((area) => (
              <div
                key={area.nombre}
                className={`p-2 cursor-pointer rounded ${selectedArea.nombre === area.nombre ? "bg-blue-200" : "bg-gray-100"
                  }`}
                onClick={() => setSelectedArea(area)}
              >
                {area.nombre}
              </div>
            ))}
          </div>

          {/* Detalles del Área */}
          <div className="w-2/3 p-4">
            <h3 className="text-lg font-semibold">{selectedArea.nombre}</h3>
            <p className="text-sm text-gray-600">Divisiones: Nivel - Categoría - Grado</p>
            <table className="mt-2 w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Nivel/Categoría</th>
                  <th className="border p-2">Grados</th>
                </tr>
              </thead>
              <tbody>
                {selectedArea.niveles.map((nivel, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{nivel.categoria}</td>
                    <td className="border p-2">{nivel.grado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>

    </div>
  )
}

export default Detalles
