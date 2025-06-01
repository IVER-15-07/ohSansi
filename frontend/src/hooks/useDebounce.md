# useDebounce Hook

Hook personalizado para implementar debounce en React, reemplazando la dependencia de lodash.

## 📁 Ubicación
`src/hooks/useDebounce.js`

## 🚀 Uso Básico

### 1. useDebounce (Función Debounced)

```jsx
import { useDebounce } from '../../hooks/useDebounce';

const MyComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Función que se ejecutará 500ms después de que el usuario deje de escribir
  const debouncedSearch = useDebounce((term) => {
    console.log('Buscando:', term);
    // Realizar búsqueda en API
  }, 500);

  return (
    <input
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value); // Se ejecuta con delay
      }}
      placeholder="Buscar..."
    />
  );
};
```

### 2. useDebounceValue (Valor Debounced)

```jsx
import { useDebounceValue } from '../../hooks/useDebounce';

const MyComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounceValue(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Esta función se ejecuta 500ms después del último cambio
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar..."
    />
  );
};
```

## 🛠️ Ejemplo Real: Validación en CrearOlimpiada

```jsx
const CrearOlimpiada = () => {
  // Función de validación
  const validarCampo = async (nombreCampo, valor) => {
    // Lógica de validación...
  };

  // Aplicar debounce de 500ms
  const validarCampoEnTiempoReal = useDebounce(validarCampo, 500);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real para campos críticos
    if (name === 'nombre') {
      validarCampoEnTiempoReal(name, value);
    }
  };
};
```

## ⚡ Ventajas sobre Lodash

| Aspecto | useDebounce Personalizado | Lodash |
|---------|---------------------------|--------|
| **Tamaño Bundle** | ~20 líneas | ~24KB |
| **Dependencias** | 0 | 1 externa |
| **Personalización** | Total control | Limitada |
| **React Integration** | Optimizado para React | Genérico |
| **Tree Shaking** | Automático | Requiere configuración |

## 🎯 Casos de Uso Comunes

### 1. Búsqueda en tiempo real
```jsx
const debouncedSearch = useDebounce(searchAPI, 300);
```

### 2. Validación de formularios
```jsx
const debouncedValidation = useDebounce(validateField, 500);
```

### 3. Auto-guardado
```jsx
const debouncedSave = useDebounce(saveDocument, 2000);
```

### 4. Redimensionado de ventana
```jsx
const debouncedResize = useDebounce(handleResize, 150);
```

## 🔧 Parámetros

### useDebounce(callback, delay)
- **callback**: Función que se ejecutará después del delay
- **delay**: Tiempo de espera en milisegundos

### useDebounceValue(value, delay)
- **value**: Valor que se desea debouncer
- **delay**: Tiempo de espera en milisegundos

## 📝 Notas Importantes

1. **Limpieza automática**: El hook limpia automáticamente los timeouts pendientes
2. **Re-renderizado optimizado**: Usa `useCallback` para evitar re-creaciones innecesarias
3. **Parámetros múltiples**: Soporta funciones con múltiples argumentos
4. **Compatible con async/await**: Funciona perfectamente con funciones asíncronas

## 🐛 Resolución de Problemas

### Problema: El debounce no funciona
```jsx
// ❌ Incorrecto - se crea una nueva función en cada render
const debouncedFn = useDebounce(() => console.log('test'), 500);

// ✅ Correcto - función estable
const logMessage = useCallback(() => console.log('test'), []);
const debouncedFn = useDebounce(logMessage, 500);
```

### Problema: Dependencias cambiantes
```jsx
// ❌ Problemático si 'data' cambia frecuentemente
const debouncedFn = useDebounce((term) => search(term, data), 500);

// ✅ Mejor enfoque
const debouncedFn = useDebounce((term, currentData) => search(term, currentData), 500);
// Usar: debouncedFn(searchTerm, data);
```
