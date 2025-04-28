import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from "react-router-dom";
import { getOlimpiadasActivas } from "../../../service/olimpiadas.api";
import Cargando from "../Cargando";

const SeleccionarOlimpiada = () => {
  const { idEncargado } = useParams();
  const navigate = useNavigate();
  const { data: olimpiadas, isLoading, error: errorOlimpiadas } = useQuery({
    queryKey: ['olimpiadas'],
    queryFn: getOlimpiadasActivas ,
  });
  const [mensaje, setMensaje] = useState(null);


  if(isLoading) return <Cargando/>;
  if (errorOlimpiadas) return <Error error={errorOlimpiadas} />;

  console.log(olimpiadas);

  const handleSeleccionarOlimpiada = async (olimpiada) => {
    const fechaActual = new Date();
    const inicioInscripcion = new Date(olimpiada.inicio_inscripcion);
    const finInscripcion = new Date(olimpiada.fin_inscripcion);
  
    // Verificar si la fecha actual está fuera del rango de inscripción
   // if (fechaActual < inicioInscripcion || fechaActual > finInscripcion) {
    //  setMensaje(
     //   `Fuera del periodo de inscripción. Las inscripciones comienzan el ${inicioInscripcion.toLocaleDateString()} y terminan el ${finInscripcion.toLocaleDateString()}.`
    //  );
    //  return;
   // }
  
    navigate(`/RegistrosPostulantes/${idEncargado}/${olimpiada.id}`); 
  };


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seleccionar Olimpiada</h1>
      {mensaje && <p className="text-red-600 mb-4">{mensaje}</p>}
      <ul className="space-y-4">
        {olimpiadas.data.map((olimpiada) => (
          <li key={olimpiada.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
            <span>{olimpiada.nombre}</span>
            <button
              onClick={() => handleSeleccionarOlimpiada(olimpiada)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Seleccionar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeleccionarOlimpiada;