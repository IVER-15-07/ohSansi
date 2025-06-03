import { CheckCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { deleteOlimpiadaCampoPostulante } from '../../../service/olimpiada_campos_postulante.api';
import { Card, Badge, Button, Modal } from '../../components/ui';

const ElegirCamposPostulante = ({disponibles, seleccionadas, setSeleccionadas, idOlimpiada, getCampoKey}) => {
    const [modal, setModal] = useState({open: false, nombre: ''});
    const handleAdd = (campoPostulante) => {
        if(campoPostulante.id_dependencia !== null){
            const campoDependencia = disponibles.find(
                c => c.id === campoPostulante.id_dependencia
            );
            if(campoDependencia){
                setModal({
                    open: true,
                    nombre: `${campoPostulante.nombre} depende de ${campoDependencia.nombre}`,
                });
                return;
            }
        }
        const olimpiadaCampoPostulante = {
            id: null,
            id_olimpiada: idOlimpiada,
            id_campo_postulante: campoPostulante.id,
            campo_postulante: campoPostulante,
            esObligatorio: false
        };
        setSeleccionadas([...seleccionadas, olimpiadaCampoPostulante]);
    };

    const handleRemove = async (olimpiadaCampoPostulante) => {
        if(olimpiadaCampoPostulante.campo_postulante.id !== null){
            const olimpiadaCampoDependiente = seleccionadas.find(
                c => c.campo_postulante.id_dependencia === olimpiadaCampoPostulante.campo_postulante.id
            );
            if(olimpiadaCampoDependiente){
                setModal({
                    open: true,
                    nombre: `${olimpiadaCampoDependiente.campo_postulante.nombre} depende de ${olimpiadaCampoPostulante.campo_postulante.nombre}`,
                });
                return;
            }
        }
        if(olimpiadaCampoPostulante.id !== null){
            try {
                await deleteOlimpiadaCampoPostulante(olimpiadaCampoPostulante.id);
            } catch (error) {
                setModal({
                    open: true,
                    nombre: 'Error al eliminar el campo del postulante. Por favor, inténtelo de nuevo más tarde.',
                });
                return;
            }
        }
        setSeleccionadas(seleccionadas.filter((a) => a.id_campo_postulante !== olimpiadaCampoPostulante.id_campo_postulante));
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Áreas disponibles */}
            <Card className="w-full md:w-1/2 border shadow-sm bg-white">
                {modal.open && (
                    <Modal
                        variant='info'
                        message={modal.nombre}
                        isOpen={modal.open}
                        onClose={() => setModal({open: false, nombre: ''})}
                    />
                )}
                <h3 className="font-semibold text-gray-700 text-lg mb-2">Campos para el Postulante Disponibles</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-1">
                    <ul className="flex flex-col gap-3">
                        {disponibles.map((campoPostulante) => (
                            <li
                                key={campoPostulante.id}
                                className="flex justify-between items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition"
                            >
                                <span className="text-gray-800 font-medium flex items-center gap-2">
                                    {campoPostulante.nombre}
                                    {campoPostulante.id_dependencia && (
                                        <Badge variant="warning" size="sm">Depende</Badge>
                                    )}
                                </span>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleAdd(campoPostulante)}
                                    className="flex items-center gap-1"
                                >
                                    <CheckCheck size={16} /> Añadir
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>

            {/* Áreas seleccionadas */}
            <Card className="w-full md:w-1/2 border shadow-sm bg-white">
                <h3 className="font-semibold text-gray-700 text-lg mb-2">Campos para el Postulante seleccionados</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-4">
                    <ul className="flex flex-col gap-3">
                        {seleccionadas.map((olimpiadaCampoPostulante, idx) => {
                            const handleObligatorioChange = (e) => {
                                if(olimpiadaCampoPostulante.campo_postulante.id_dependencia !== null){
                                    const olimpiadaCampoDependencia = seleccionadas.find(
                                        c => c.campo_postulante.id === olimpiadaCampoPostulante.campo_postulante.id_dependencia
                                    );
                                    if(olimpiadaCampoDependencia && !olimpiadaCampoDependencia.esObligatorio && !olimpiadaCampoPostulante.esObligatorio){
                                        setModal({
                                            open: true,
                                            nombre: `${olimpiadaCampoDependencia.campo_postulante.nombre} debe de ser obligatorio primero`,
                                        });
                                        return;
                                    }
                                }
                                if(olimpiadaCampoPostulante.campo_postulante.id !== null){
                                    const olimpiadaCampoDependiente = seleccionadas.find(
                                        c => c.campo_postulante.id_dependencia === olimpiadaCampoPostulante.campo_postulante.id
                                    );
                                    if(olimpiadaCampoDependiente && olimpiadaCampoDependiente.esObligatorio && olimpiadaCampoPostulante.esObligatorio){
                                        setModal({
                                            open: true,
                                            nombre: `${olimpiadaCampoDependiente.campo_postulante.nombre} debe dejar de ser obligatorio primero`,
                                        });
                                        return;
                                    }
                                }
                                const nuevas = [...seleccionadas];
                                nuevas[idx] = {
                                    ...nuevas[idx],
                                    esObligatorio: e.target.checked
                                };
                                setSeleccionadas(nuevas);
                            };
                            const key = typeof getCampoKey === 'function'
                              ? getCampoKey(olimpiadaCampoPostulante, idx, 'postulante')
                              : (olimpiadaCampoPostulante.id || `tmp-postulante-${olimpiadaCampoPostulante.campo_postulante?.id || 'x'}-${idx}`);
                            return (
                                <li
                                    key={key}
                                    className="flex justify-between items-center gap-4 p-3 rounded-xl bg-blue-50 border border-blue-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-900 font-medium">{olimpiadaCampoPostulante.campo_postulante.nombre}</span>
                                        {olimpiadaCampoPostulante.campo_postulante.id_dependencia && (
                                            <Badge variant="warning" size="sm">Depende</Badge>
                                        )}
                                        <label className="flex items-center gap-1 text-xs text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={!!olimpiadaCampoPostulante.esObligatorio}
                                                onChange={handleObligatorioChange}
                                                className="accent-blue-600"
                                            />
                                            Obligatorio
                                        </label>
                                    </div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleRemove(olimpiadaCampoPostulante)}
                                        className="flex items-center gap-1"
                                        title="Quitar campo"
                                    >
                                        <X size={16} /> Quitar
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Card>
        </div>
    );
}

export default ElegirCamposPostulante;
