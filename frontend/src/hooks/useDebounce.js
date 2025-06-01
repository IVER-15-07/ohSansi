import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce
 * 
 * @param {Function} callback - Función que se ejecutará después del delay
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function} Función debounced
 * 
 * @example
 * const debouncedSearch = useDebounce((searchTerm) => {
 *   // Realizar búsqueda
 *   console.log('Searching for:', searchTerm);
 * }, 500);
 * 
 * // En el onChange del input
 * onChange={(e) => debouncedSearch(e.target.value)}
 */
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    // Cancelar el timeout anterior si existe
    clearTimeout(timeoutRef.current);
    
    // Crear un nuevo timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Hook para debounce de valores (alternativa)
 * Este hook devuelve el valor debounced en lugar de una función
 * 
 * @param {any} value - Valor a debouncer
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {any} Valor debounced
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounceValue(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Realizar búsqueda
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounceValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
