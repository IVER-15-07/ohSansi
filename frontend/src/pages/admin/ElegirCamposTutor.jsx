import { CheckCheck, X } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import React, { useState } from 'react';
import { deleteOlimpiadaCampoTutor } from '../../../service/olimpiada_campos_tutor.api';
const ElegirCamposTutor = ({disponibles, seleccionadas, setSeleccionadas, idOlimpiada}) => {
    const [modal, setModal] = useState({open: false, nombre: ''});
    const handleAdd = (campoTutor) => {
        if(campoTutor.id_dependencia !== null){
            const campoDependencia = disponibles.find(
                c => c.id === campoTutor.id_dependencia
            );
            if(campoDependencia){
                setModal({
                    open: true,
                    nombre: `${campoTutor.nombre} depende de ${campoDependencia.nombre}`,
                });
                return;
            }
        }
        const olimpiadaCampoTutor = {
            id: null,
            id_olimpiada: idOlimpiada,
            id_campo_tutor: campoTutor.id,
            campo_tutor: campoTutor,
            esObligatorio: false
        };
        setSeleccionadas([...seleccionadas, olimpiadaCampoTutor]);
    };

    const handleRemove = async (olimpiadaCampoTutor) => {
        if(olimpiadaCampoTutor.campo_tutor.id !== null){
            const olimpiadaCampoDependiente = seleccionadas.find(
                c => c.campo_tutor.id_dependencia === olimpiadaCampoTutor.campo_tutor.id
            );
            if(olimpiadaCampoDependiente){
                setModal({
                    open: true,
                    nombre: `${olimpiadaCampoDependiente.campo_tutor.nombre} depende de ${olimpiadaCampoTutor.campo_tutor.nombre}`,
                });
                return;
            }
        }
        if(olimpiadaCampoTutor.id !== null){
            try {
                await deleteOlimpiadaCampoTutor(olimpiadaCampoTutor.id);
            } catch (error) {
                console.error('Error al eliminar el campo del tutor:', error);
                setModal({
                    open: true,
                    nombre: 'Error al eliminar el campo del postulante. Por favor, inténtelo de nuevo más tarde.',
                });
                return;
            }
        }
        setSeleccionadas(seleccionadas.filter((a) => a.id_campo_tutor !== olimpiadaCampoTutor.id_campo_tutor));
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Áreas disponibles */}
            <div className="w-full md:w-1/2 border rounded-2xl p-4 shadow-sm bg-white">
            {modal.open && (
                <Modal
                    variant='warning'
                    isOpen={modal.open}
                    message={modal.nombre}
                    onConfirm={() => setModal({open: false, nombre: ''})}
                />)}

                <h3 className="font-semibold text-gray-700 text-lg mb-2">Campos para el Tutor Disponibles</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-1">
                    <ul className="flex flex-col gap-3">
                        {disponibles.map((campoTutor) => (
                            <li
                                key={campoTutor.id}
                                className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]`}
                            >
                            <span className="text-gray-800 font-medium">{campoTutor.nombre}</span>
                            <button
                                onClick={() => handleAdd(campoTutor)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                <CheckCheck size={18} />
                                Añadir
                            </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Áreas seleccionadas */}
            <div className="w-full md:w-1/2 border rounded-2xl p-4 shadow-sm bg-white">
                <h3 className="font-semibold text-gray-700 text-lg mb-2">Campos para el Tutor seleccionados</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-4">
                    <ul className="flex flex-col gap-3">
                        {seleccionadas.map((olimpiadaCampoTutor, idx) => {
                            const handleObligatorioChange = (e) => {
                                if(olimpiadaCampoTutor.campo_tutor.id_dependencia !== null){
                                    const olimpiadaCampoDependencia = seleccionadas.find(
                                        c => c.campo_tutor.id === olimpiadaCampoTutor.campo_tutor.id_dependencia
                                    );
                                    if(olimpiadaCampoDependencia && !olimpiadaCampoDependencia.esObligatorio && !olimpiadaCampoTutor.esObligatorio){
                                        setModal({
                                            open: true,
                                            nombre: `${olimpiadaCampoDependencia.campo_tutor.nombre} debe de ser obligatorio primero`,
                                        });
                                        return;
                                    }
                                }

                                if(olimpiadaCampoTutor.campo_tutor.id !== null){
                                    const olimpiadaCampoDependiente = seleccionadas.find(
                                        c => c.campo_tutor.id_dependencia === olimpiadaCampoTutor.campo_tutor.id
                                    );

                                    if(olimpiadaCampoDependiente && olimpiadaCampoDependiente.esObligatorio && olimpiadaCampoTutor.esObligatorio){
                                        setModal({
                                            open: true,
                                            nombre: `${olimpiadaCampoDependiente.campo_tutor.nombre} debe dejar de ser obligatorio primero`,
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
                            return (
                                <li
                                    key={olimpiadaCampoTutor.id}
                                    className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-900 font-medium">{olimpiadaCampoTutor.campo_tutor.nombre}</span>
                                        <label className="flex items-center gap-1 text-xs text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={!!olimpiadaCampoTutor.esObligatorio}
                                                onChange={handleObligatorioChange}
                                                className="accent-blue-600"
                                            />
                                            Obligatorio
                                        </label>
                                    </div>

                                    <button
                                        onClick={() => handleRemove(olimpiadaCampoTutor)}
                                        className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        <X size={18} />
                                        Quitar
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ElegirCamposTutor;
