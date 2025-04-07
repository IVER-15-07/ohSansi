import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAreas } from '../../../service/areas.api';
import { getNivelesCategorias } from '../../../service/niveles_categorias.api';
import { getGrados } from '../../../service/grados.api';

const Areas = () => {
  const {data: areas, isLoading, error} = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
        <div className='p-6 bg-blue-500 text-white'>
          <h1>Areas</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {areas.data.map((area, index) => (
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
  const {data: niveles_categorias, isLoading, error} = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
  });
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
        <div className='p-10 bg-blue-500 text-white'>
          <h1>Niveles/Categorias</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {niveles_categorias.data.map((nivel_categoria, index) => (
              <li key={index} className='p-2'>{nivel_categoria.nombre}  {nivel_categoria.esNivel ? "Nivel": "Categoria"}</li>
            ))}

          </ol>
        </div>
        
      </div>
  )
};

const Grados = () => {
  const {data: grados, isLoading, error} = useQuery({
    queryKey: ['grados'],
    queryFn: getGrados,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
        <div className='p-10 bg-blue-500 text-white'>
          <h1>Grados</h1>
        </div>

        <div>
          <ol className='list-decimal list-inside'>
            {
              grados.data.map((grado, index) => (
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

