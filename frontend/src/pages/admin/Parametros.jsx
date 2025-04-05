import React, { useEffect, useState } from 'react';
import { getAreas } from '../../../service/areas.api';
import { getNivelesCategorias } from '../../../service/niveles_categorias.api';
import { getGrados } from '../../../service/grados.api';

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

const NivelesCategorias = () => {
  const [niveles_categorias, setNivelesCategorias] = useState([]);

  useEffect(() => {
    const niveles_categorias = getNivelesCategorias();
    niveles_categorias.then((response) => {
      setNivelesCategorias(response.data);
    }).catch((error) => {
      console.error("Error fetching niveles/categorias:", error);
    });
  }, []);

  return (
    <div>
        <div className='p-10 bg-blue-500 text-white'>
          <h1>Niveles/Categorias</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {niveles_categorias.map((nivel_categoria, index) => (
              <li key={index} className='p-2'>{nivel_categoria.nombre}  {nivel_categoria.esNivel ? "Nivel": "Categoria"}</li>
            ))}

          </ol>
        </div>
        
      </div>
  )
};

const Grados = () => {
  const [grados, setGrados] = useState([]);
  
  useEffect(() => {
    const gradosLocal = getGrados();
    gradosLocal.then((response) => {
      setGrados(response.data);
    }).catch((error) => {
      console.error("Error fetching grados:", error);
    });
  }, []);

  return (
    <div>
        <div className='p-10 bg-blue-500 text-white'>
          <h1>Grados</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {
              grados.map((grado, index) => (
                <li key={index} className='p-2 bg-green-300'>{grado.nombre}</li>
              ))
            }
          </ol>
        </div>
        
      </div>
  )
};

const Parametros = () => {
  return (
    <div> 
      <Areas />
      <NivelesCategorias />
      <Grados />
    </div>
    
  )
}

export default Parametros;

