# Sistema de Diseño OhSansi

## Descripción
Este documento describe el sistema de diseño implementado para la aplicación frontend de OhSansi utilizando Tailwind CSS v4.

## Colores del Sistema

### Paleta Principal

#### Primary (Azul Principal)
- **50**: #eff6ff - Fondo muy claro
- **100**: #dbeafe - Fondo claro
- **200**: #bfdbfe - Bordes suaves
- **300**: #93c5fd - Elementos secundarios
- **400**: #60a5fa - Elementos interactivos
- **500**: #3b82f6 - Color base principal
- **600**: #2563eb - Botones y enlaces
- **700**: #1d4ed8 - Estados hover
- **800**: #1e40af - Estados activos
- **900**: #1e3a8a - Textos de énfasis
- **950**: #172554 - Textos más oscuros

#### Secondary (Gris)
- **50**: #f8fafc - Fondos neutros
- **100**: #f1f5f9 - Fondos de tarjetas
- **200**: #e2e8f0 - Bordes
- **300**: #cbd5e1 - Bordes de input
- **400**: #94a3b8 - Texto secundario
- **500**: #64748b - Texto normal
- **600**: #475569 - Texto de énfasis
- **700**: #334155 - Títulos
- **800**: #1e293b - Texto principal
- **900**: #0f172a - Texto más oscuro
- **950**: #020617 - Texto máximo contraste

#### Accent (Rosa/Rojo)
- **50**: #fff1f2 - Fondos de alerta suave
- **100**: #ffe4e6 - Fondos de alerta
- **200**: #fecdd3 - Bordes de alerta
- **300**: #fda4af - Elementos decorativos
- **400**: #fb7185 - Elementos interactivos
- **500**: #f43f5e - Color base de acento
- **600**: #e11d48 - Estados hover
- **700**: #be185d - Estados activos
- **800**: #9f1239 - Texto de énfasis
- **900**: #881337 - Texto más oscuro
- **950**: #4c0519 - Texto máximo contraste

#### Success (Verde)
- **50**: #f0fdf4 - Fondo de éxito suave
- **100**: #dcfce7 - Fondo de éxito
- **200**: #bbf7d0 - Bordes de éxito
- **300**: #86efac - Elementos decorativos
- **400**: #4ade80 - Elementos interactivos
- **500**: #22c55e - Color base de éxito
- **600**: #16a34a - Estados hover
- **700**: #15803d - Estados activos
- **800**: #166534 - Texto de énfasis
- **900**: #14532d - Texto más oscuro
- **950**: #052e16 - Texto máximo contraste

#### Warning (Amarillo)
- **50**: #fffbeb - Fondo de advertencia suave
- **100**: #fef3c7 - Fondo de advertencia
- **200**: #fde68a - Bordes de advertencia
- **300**: #fcd34d - Elementos decorativos
- **400**: #fbbf24 - Elementos interactivos
- **500**: #f59e0b - Color base de advertencia
- **600**: #d97706 - Estados hover
- **700**: #b45309 - Estados activos
- **800**: #92400e - Texto de énfasis
- **900**: #78350f - Texto más oscuro
- **950**: #451a03 - Texto máximo contraste

#### Danger (Rojo)
- **50**: #fef2f2 - Fondo de error suave
- **100**: #fee2e2 - Fondo de error
- **200**: #fecaca - Bordes de error
- **300**: #fca5a5 - Elementos decorativos
- **400**: #f87171 - Elementos interactivos
- **500**: #ef4444 - Color base de error
- **600**: #dc2626 - Estados hover
- **700**: #b91c1c - Estados activos
- **800**: #991b1b - Texto de énfasis
- **900**: #7f1d1d - Texto más oscuro
- **950**: #450a0a - Texto máximo contraste

## Componentes UI

### Componentes Principales

#### Button
```jsx
import { Button } from '../components/ui'

<Button variant="primary" size="md">Texto del botón</Button>
<Button variant="secondary" size="lg">Botón secundario</Button>
<Button variant="danger" size="sm">Botón de peligro</Button>
```

**Variantes disponibles:**
- `primary` (por defecto)
- `secondary`
- `outline`
- `ghost`
- `danger`

**Tamaños disponibles:**
- `sm` - Pequeño
- `md` - Mediano (por defecto)
- `lg` - Grande

#### Input
```jsx
import { Input } from '../components/ui'

<Input 
  label="Nombre"
  placeholder="Ingrese su nombre"
  error={errors.name}
/>
```

#### Select
```jsx
import { Select } from '../components/ui'

<Select
  label="País"
  value={selectedCountry}
  onChange={handleChange}
  options={countries}
  error={errors.country}
/>
```

### Componentes de Layout

#### Card
```jsx
import { Card } from '../components/ui'

<Card title="Título" subtitle="Subtítulo" icon="📊">
  Contenido de la tarjeta
</Card>
```

#### Badge
```jsx
import { Badge } from '../components/ui'

<Badge variant="primary">Activo</Badge>
<Badge variant="success">Completado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="danger">Error</Badge>
```

### Componentes de Datos

#### Table
```jsx
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Juan Pérez</TableCell>
      <TableCell>juan@email.com</TableCell>
      <TableCell>
        <Button size="sm">Editar</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Skeleton
```jsx
import { Skeleton } from '../components/ui'

<Skeleton className="h-4 w-full" />
<Skeleton variant="circular" className="h-12 w-12" />
<Skeleton variant="rectangular" className="h-32 w-full" />
```

### Componentes de Formulario

#### ToggleSwitch
```jsx
import { ToggleSwitch } from '../components/ui'

<ToggleSwitch 
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Habilitar notificaciones"
/>
```

#### RegistrationForm
```jsx
import { RegistrationForm } from '../components/ui'

<RegistrationForm />
```

#### SubirArchivo
```jsx
import { SubirArchivo } from '../components/ui'

<SubirArchivo
  nombreArchivo={fileName}
  tipoArchivo="pdf"
  handleArchivo={handleFileUpload}
  inputRef={fileInputRef}
/>
```

### Componentes de Feedback

#### ConfirmationModal
```jsx
import { ConfirmationModal } from '../components/ui'

<ConfirmationModal
  isOpen={showModal}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Confirmar acción"
  message="¿Está seguro de realizar esta acción?"
  confirmText="Confirmar"
  cancelText="Cancelar"
/>
```

## Uso de Colores

### En código
Los colores se usan con las clases de Tailwind:

```jsx
// Texto
<p className="text-primary-600">Texto principal</p>
<p className="text-secondary-500">Texto secundario</p>
<p className="text-danger-600">Texto de error</p>

// Fondos
<div className="bg-primary-50">Fondo suave</div>
<div className="bg-success-100">Fondo de éxito</div>

// Bordes
<div className="border border-secondary-300">Con borde</div>
<div className="border-2 border-primary-600">Borde de énfasis</div>
```

### Estados de Focus
```jsx
<input className="
  border border-secondary-300 
  focus:ring-2 focus:ring-primary-200 
  focus:border-primary-600
" />
```

## Buenas Prácticas

### 1. Consistencia de Colores
- Usar siempre los colores del sistema
- No usar colores hardcodeados como `#ff0000`
- Mantener consistencia entre estados (hover, focus, active)

### 2. Componentes
- Importar desde `../components/ui` cuando sea posible
- Usar las props disponibles antes de crear estilos personalizados
- Seguir la convención de naming para variantes

### 3. Accesibilidad
- Mantener contraste adecuado entre texto y fondo
- Usar focus states visibles
- Proporcionar labels apropiados

### 4. Responsive Design
- Usar las clases responsive de Tailwind (`sm:`, `md:`, `lg:`, `xl:`)
- Probar en diferentes tamaños de pantalla
- Dar prioridad a mobile-first

## Estructura de Archivos

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Table.jsx
│   │   ├── Badge.jsx
│   │   ├── Skeleton.jsx
│   │   ├── ToggleSwitch.jsx
│   │   ├── ConfirmationModal.jsx
│   │   ├── RegistrationForm.jsx
│   │   ├── SubirArchivo.jsx
│   │   └── index.js
│   └── layout/
│       ├── NavBar.jsx
│       ├── SideBar.jsx
│       └── Footer.jsx
├── index.css (configuración de colores)
└── ...
```

## Migración

### De componentes antiguos a nuevos
1. Cambiar importaciones: `import Button from '../components/Button'` → `import { Button } from '../components/ui'`
2. Actualizar props según la nueva API
3. Reemplazar clases de colores hardcodeadas por el sistema de colores
4. Probar funcionalidad

### Ejemplo de migración
```jsx
// Antes
import Button from '../components/Button'
<Button className="bg-blue-600 text-white">Guardar</Button>

// Después
import { Button } from '../components/ui'
<Button variant="primary">Guardar</Button>
```

## Próximos Pasos
- [ ] Crear componentes Modal y Alert
- [ ] Implementar componente LoadingSpinner
- [ ] Añadir variantes de tema (dark mode)
- [ ] Crear más utilidades de layout
- [ ] Documentar patrones de diseño complejos
