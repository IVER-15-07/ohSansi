import React from 'react';
import { FormField } from '.';
import { Button } from '../ui';
import { Search, Trash2 } from 'lucide-react'; 

const TutorForm = ({
  tutor,
  index,
  rolesTutor,
  onTutorChange,
  onBuscarTutor,
  onEliminarTutor,
  formErrors = {},
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1">
          <FormField
            label="Carnet de Identidad"
            value={tutor.ci}
            type="text"
            onChange={(e) => onTutorChange(index, "ci", e.target.value)}
            disabled={tutor.idPersona}
            required
            error={formErrors[`tutor.${index}.ci`]}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onBuscarTutor(index)} 
            disabled={tutor.idTutor}
            variant="primary"
            size="lg"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>

          <Button 
            onClick={() => onEliminarTutor(index)}
            variant="danger"
            size="md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {tutor.buscado && (
        <div className="mt-4 space-y-4">
          <FormField
            label="Nombre(s)"
            value={tutor.nombres}
            onChange={(e) => onTutorChange(index, "nombres", e.target.value)}
            disabled={tutor.idPersona}
            required
            error={formErrors[`tutor.${index}.nombres`]}
          />

          <FormField
            label="Apellido(s)"
            value={tutor.apellidos}
            onChange={(e) => onTutorChange(index, "apellidos", e.target.value)}
            disabled={tutor.idPersona}
            required
            error={formErrors[`tutor.${index}.apellidos`]}
          />

          {tutor.datos.map((campo, idx) => (
            <FormField
              key={idx}
              label={campo.nombre_campo}
              type={campo.tipo_campo}
              value={campo.valor}
              onChange={(e) => onTutorChange(index, campo.nombre_campo, e.target.value)}
              required={campo.esObligatorio}
              error={formErrors[`tutor.${index}.datos.${idx}`]}
            />
          ))}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Relación con el Postulante <span className="text-red-500">*</span>
            </label>
            <select
              value={tutor.idRol}
              onChange={(e) => onTutorChange(index, 'idRol', e.target.value)}
              className={`w-full mt-1 px-3 py-2 border rounded-md ${
                tutor.idRegistroTutor ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={tutor.idRegistroTutor}
            >
              <option value="">Seleccione un Rol</option>
              {Object.entries(rolesTutor).map(([id, rolTutor]) => (
                <option key={rolTutor.id} value={rolTutor.id}>
                  {rolTutor.nombre}
                </option>
              ))}
            </select>
            {formErrors[`tutor.${index}.idRol`] && (
              <span className="text-sm text-red-500">{formErrors[`tutor.${index}.idRol`]}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorForm;
