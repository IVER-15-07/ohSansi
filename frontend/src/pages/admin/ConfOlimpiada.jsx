import React from 'react'
import { useState } from 'react'

const ConfOlimpiada = () => {
    const [areasDisponibles, setAreasDisponibles] = useState(['Sociales', 'Biología', 'Física', 'Astronomía'])
    const [areasSeleccionadas, setAreasSeleccionadas] = useState(['Matemáticas', 'Química', 'Informática'])
    const [areaActiva, setAreaActiva] = useState('Matemáticas')
    const [nivelesDisponibles, setNivelesDisponibles] = useState(['Segundo Nivel', '1S', '3P', 'Lego'])
    const [nivelesPorArea, setNivelesPorArea] = useState({
        Matemáticas: ['Guacamayo', 'Jucumari', 'Primer Nivel'],
        Química: [],
        Informática: []
    })

    const handleSeleccionarArea = (area) => {
        setAreaActiva(area)
    }

    const handleQuitarArea = (area) => {
        const nuevasSeleccionadas = areasSeleccionadas.filter(a => a !== area)
        setAreasSeleccionadas(nuevasSeleccionadas)
        setAreasDisponibles([...areasDisponibles, area])
        if (area === areaActiva && nuevasSeleccionadas.length > 0) {
            setAreaActiva(nuevasSeleccionadas[0])
        } else if (nuevasSeleccionadas.length === 0) {
            setAreaActiva(null)
        }
    }

    const handleAñadirArea = (area) => {
        setAreasSeleccionadas([...areasSeleccionadas, area])
        setAreasDisponibles(areasDisponibles.filter(a => a !== area))
        setNivelesPorArea({ ...nivelesPorArea, [area]: [] })
        if (!areaActiva) setAreaActiva(area)
    }

    const handleAñadirNivel = (nivel) => {
        const nivelesActuales = nivelesPorArea[areaActiva] || []
        if (!nivelesActuales.includes(nivel)) {
            setNivelesPorArea({
                ...nivelesPorArea,
                [areaActiva]: [...nivelesActuales, nivel]
            })
        }
    }

    const handleQuitarNivel = (nivel) => {
        setNivelesPorArea({
            ...nivelesPorArea,
            [areaActiva]: nivelesPorArea[areaActiva].filter(n => n !== nivel)
        })
    }

    return (
        <div className="p-2 w-full h-full bg-gray-50 overflow-hidden">
  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 h-full">
    <h2 className="text-xl font-bold text-gray-800">Áreas y Niveles</h2>

    <div className="flex gap-4 flex-1 overflow-hidden">
      {/* Áreas disponibles */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-600 mb-2">Áreas disponibles</h3>
        <div className="flex flex-wrap gap-2">
          {areasDisponibles.map((area) => (
            <div key={area} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
              <span>{area}</span>
              <button
                onClick={() => handleAñadirArea(area)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Áreas seleccionadas */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-600 mb-2">Áreas seleccionadas</h3>
        <div className="flex flex-wrap gap-2">
          {areasSeleccionadas.map((area) => (
            <div key={area} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
              <span>{area}</span>
              <button
                onClick={() => handleQuitarArea(area)}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Carrusel de selección de áreas activas */}
    <div className="mt-2 overflow-x-auto whitespace-nowrap flex gap-2 pb-2">
      {areasSeleccionadas.map((area) => (
        <button
          key={area}
          className={`px-4 py-1 rounded-full text-sm font-medium transition whitespace-nowrap ${
            areaActiva === area
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => handleSeleccionarArea(area)}
        >
          {area}
        </button>
      ))}
    </div>

    {/* Configuración de niveles */}
    {areaActiva && (
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Niveles disponibles */}
        <div className="flex-1 rounded-2xl border border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-600 mb-2">Niveles disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {nivelesDisponibles.map((nivel) => (
              <div key={nivel} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                <span>{nivel}</span>
                <button
                  onClick={() => handleAñadirNivel(nivel)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
                >
                  Añadir
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Niveles seleccionados */}
        <div className="flex-1 rounded-2xl border border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-600 mb-2">Niveles de {areaActiva}</h3>
          <div className="flex flex-wrap gap-2">
            {nivelesPorArea[areaActiva]?.map((nivel) => (
              <div key={nivel} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                <span>{nivel}</span>
                <button
                  onClick={() => handleQuitarNivel(nivel)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Botones de navegación */}
    <div className="flex justify-end gap-4 mt-4">
      <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md">
        Atrás
      </button>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
        Confirmar
      </button>
    </div>
  </div>
</div>

    )
}

export default ConfOlimpiada
