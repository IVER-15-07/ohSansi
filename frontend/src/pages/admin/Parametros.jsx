import React, { useEffect, useState } from 'react';
import { getAreas } from '../../../service/areas.api';
import { getDivisiones } from '../../../service/divisiones.api';

const Areas = () => {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const areas = getAreas();
    areas.then((response) => {
      setAreas(response.data);
    }).catch((error) => {
      console.error("Error fetching areas:", error);
    });
  }, []);

  return (
    <div>
        <div className='p-6 bg-blue-500 text-white'>
          <h1>Areas</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {areas.map((area, index) => (
              <li key={index} className='p-2'>{area.nombre}</li>
            ))}

          </ol>
        </div>

        <div className='p-2 bg-gray-200 flex justify-end'> 
          <button className='bg-blue-500 text-white px-6 py-2 rounded'>
            Agregar Area
          </button>
        </div>
    </div>
  );
};

const Divisiones = () => {
  const [divisiones, setDivisiones] = useState([]);

  useEffect(() => {
    const divisiones = getDivisiones();
    divisiones.then((response) => {
      setDivisiones(response.data);
    }).catch((error) => {
      console.error("Error fetching divisiones:", error);
    });
  }, []);

  return (
    <div>
        <div className='p-10 bg-blue-500 text-white'>
          <h1>Divisiones</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {divisiones.map((division, index) => (
              <li key={index} className='p-2'>{division.nombre}</li>
            ))}

          </ol>
        </div>
        
      </div>
  )
};

const Grados = () => {
  return (
    <div>
        <div className='p-10 bg-blue-500 text-white'>
          <h1>Grados</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            <li className='p-2'>Grado 1</li>
            <li className='p-2'>Grado 2</li>
            <li className='p-2'>Grado 3</li>
            <li className='p-2'>Grado 4</li>
            <li className='p-2'>Grado 5</li>
          </ol>
        </div>
        
      </div>
  )
};

const Parametros = () => {
  return (
    <div> 
      
      <Areas />
      <Divisiones />
      <Grados />
    </div>
    
  )
}

export default Parametros;

