# Componente SubirArchivo

## Descripción

El componente `SubirArchivo` es un componente React flexible para subir archivos con validación robusta. Soporta múltiples formatos de archivo y proporciona feedback visual claro sobre el estado del archivo.

## Validación de Estado del Archivo

La variable `archivoSubido` se valida mediante una lógica robusta que determina si hay un archivo cargado:

### Lógica de Validación

1. **Prioridad máxima**: Prop `hasExistingFile` (boolean explícito)
2. **Análisis del nombre**: Valida que `nombreArchivo` sea un nombre de archivo válido
3. **Filtrado de mensajes**: Excluye mensajes como "Subir archivo", "Ningún archivo seleccionado"
4. **Validación de extensión**: Verifica que tenga una extensión válida según `acceptedFormats`

### Criterios para Archivo Válido

Un archivo se considera válido cuando:
- `hasExistingFile` es explícitamente `true`, O
- `nombreArchivo` no es un mensaje de placeholder
- Tiene al menos 4 caracteres
- Tiene una extensión válida (formato: `.ext`)
- La extensión está en la lista de `acceptedFormats`

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `nombreArchivo` | string | - | Nombre del archivo o mensaje a mostrar |
| `tipoArchivo` | string | - | Tipo de archivo para la UI |
| `hasExistingFile` | boolean | false | **IMPORTANTE**: Indica explícitamente si hay archivo |
| `acceptedFormats` | array | ['pdf'] | Formatos permitidos ['pdf', 'jpg', 'png'] |
| `acceptedMimeTypes` | array | ['application/pdf'] | MIME types permitidos |
| `acceptAttribute` | string | ".pdf,application/pdf" | Atributo accept del input |
| `maxFileSize` | number | 10MB | Tamaño máximo en bytes |
| `allowEdit` | boolean | true | Permitir cambiar archivo existente |

## Ejemplos de Uso

### Caso 1: Solo PDF
```jsx
<SubirArchivo
  acceptedFormats={['pdf']}
  acceptedMimeTypes={['application/pdf']}
  acceptAttribute=".pdf,application/pdf"
  nombreArchivo={archivo ? archivo.name : "Subir archivo PDF"}
  hasExistingFile={false}
  handleArchivo={handleArchivo}
  inputRef={inputRef}
  id="input-pdf"
/>
```

### Caso 2: Con archivo existente (como en ConfParamOlimpiada)
```jsx
<SubirArchivo
  acceptedFormats={['pdf']}
  acceptedMimeTypes={['application/pdf']}
  acceptAttribute=".pdf,application/pdf"
  nombreArchivo={
    archivo ? archivo.name : 
    (tieneArchivoExistente ? archivoActualNombre : 'Subir archivo PDF')
  }
  hasExistingFile={tieneArchivoExistente && !archivo}
  handleArchivo={handleArchivo}
  inputRef={inputRef}
  id="input-convocatoria"
/>
```

### Caso 3: Múltiples formatos
```jsx
<SubirArchivo
  acceptedFormats={['pdf', 'jpg', 'jpeg', 'png']}
  acceptedMimeTypes={['application/pdf', 'image/jpeg', 'image/png']}
  acceptAttribute=".pdf,.jpg,.jpeg,.png"
  nombreArchivo="Subir documento o imagen"
  hasExistingFile={false}
  handleArchivo={handleArchivo}
  inputRef={inputRef}
  id="input-multiple"
/>
```

## Estados del Componente

### Archivo No Subido
- Botón azul: "Subir archivo de tipo [TIPO]"
- Icono: `FileUp`
- Color: `bg-primary-600`

### Archivo Subido
- Botón verde: "Cambiar archivo" (si `allowEdit=true`) 
- Icono: `CheckCircle2` + `Edit3`
- Color: `bg-green-600`

### Error de Validación
- Alerta roja con detalles del error
- Sugerencias de formatos válidos
- Auto-ocultado después de 6 segundos

## Validación de Archivos

El componente valida:
1. **Formato por extensión**: Debe estar en `acceptedFormats`
2. **MIME type**: Debe estar en `acceptedMimeTypes`
3. **Tamaño**: No debe superar `maxFileSize`

### Mensajes de Error
- Formato inválido: "El archivo no tiene un formato válido"
- Tamaño excedido: "El archivo es demasiado grande"
- Con sugerencias específicas por tipo de archivo

## Tips de Implementación

### Para Archivos Existentes
```jsx
// Estados recomendados
const [archivo, setArchivo] = useState(null); // Nuevo archivo seleccionado
const [tieneArchivoExistente, setTieneArchivoExistente] = useState(false);
const [archivoActualNombre, setArchivoActualNombre] = useState('');

// Configuración del componente
<SubirArchivo
  hasExistingFile={tieneArchivoExistente && !archivo}
  nombreArchivo={
    archivo ? archivo.name : 
    (tieneArchivoExistente ? archivoActualNombre : 'Subir archivo')
  }
  // ... otras props
/>
```

### Manejo de Errores
```jsx
const [errores, setErrores] = useState({});

<SubirArchivo
  onFileValidationError={(error) => {
    setErrores(prev => ({ ...prev, archivo: error }));
  }}
  // ... otras props
/>
```

## Casos de Uso Comunes

1. **Convocatorias de Olimpiadas**: Solo PDF
2. **Imágenes de Perfil**: JPG, PNG
3. **Documentos Generales**: PDF, DOC, DOCX
4. **Multimedia**: Imágenes + Videos
