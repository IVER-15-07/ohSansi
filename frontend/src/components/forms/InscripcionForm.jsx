import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui';

const InscripcionForm = ({
  opcionesInscripcion,
  opcionesSeleccionadas,
  onAgregarOpcion,
  onActualizarOpcion,
  onEliminarOpcion,
  maxArea,
  formErrors = {},
}) => {
  const opcionesDisponibles = opcionesInscripcion.reduce((acc, area) => acc + area.niveles_categorias.length, 0);
  const puedeAgregarMas = typeof maxArea === 'number' ? opcionesSeleccionadas.length < maxArea : true;
  const todasOcupadas = opcionesSeleccionadas.length === opcionesDisponibles;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Áreas de Inscripción</h3>

      {opcionesSeleccionadas.map((opcionSeleccionada, index) => (
        <div key={index} className="flex flex-col md:flex-row gap-4 items-center">
          <select
            value={opcionSeleccionada.idOpcionInscripcion || ""}
            onChange={e => onActualizarOpcion(index, 'idOpcionInscripcion', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md ${
              opcionSeleccionada.idInscripcion ? "bg-gray-100" : ""
            } ${formErrors[`opcion.${index}`] ? "border-red-500" : ""}`}
            disabled={opcionSeleccionada.idInscripcion}
          >
            <option value="">Seleccione área y categoría</option>
            {opcionesInscripcion.flatMap(area =>
              area.niveles_categorias
                .filter(cat =>
                  !opcionesSeleccionadas.some(
                    (sel, idx) => sel.idOpcionInscripcion === String(cat.id_opcion_inscripcion) && idx !== index
                  )
                )
                .map(cat => (
                  <option key={cat.id_opcion_inscripcion} value={cat.id_opcion_inscripcion}>
                    {area.nombre} - {cat.nombre}
                  </option>
                ))
            )}
          </select>

          <Button
            onClick={() => onEliminarOpcion(index)}
            variant="danger"
            size="md"
            disabled={opcionSeleccionada.idPago}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {formErrors.opciones && (
        <span className="text-sm text-red-500 block mt-1">{formErrors.opciones}</span>
      )}

      <Button
        onClick={onAgregarOpcion}
        disabled={!puedeAgregarMas || todasOcupadas || opcionesInscripcion.length === 0}
        variant="primary"
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar Área
      </Button>
    </div>
  );
};

export default InscripcionForm;
