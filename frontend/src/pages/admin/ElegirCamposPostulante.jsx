import { CheckCheck, X } from 'lucide-react';
import Modal from '../../components/Modal';
import React, { useState } from 'react';
const ElegirCamposPostulante = ({disponibles, seleccionadas, setSeleccionadas, idOlimpiada}) => {
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
        setSeleccionadas(seleccionadas.filter((a) => a.id_campo_postulante !== olimpiadaCampoPostulante.id_campo_postulante));
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-4 overflow-hidden">
            {/* Áreas disponibles */}
            <div className="w-full md:w-1/2 border rounded-2xl p-4 shadow-sm bg-white">
            {modal.open && (
                <Modal
                    message={modal.nombre}
                    onClose={() => setModal({open: false, nombre: ''})}
                />)};

                <h3 className="font-semibold text-gray-700 text-lg mb-2">Campos para el Postulante Disponibles</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-1">
                    <ul className="flex flex-col gap-3">
                        {disponibles.map((campoPostulante) => (
                            <li
                                key={campoPostulante.id}
                                className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]`}
                            >
                            <span className="text-gray-800 font-medium">{campoPostulante.nombre}</span>
                            <button
                                onClick={() => handleAdd(campoPostulante)}
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
                <h3 className="font-semibold text-gray-700 text-lg mb-2">Campos para el Postulante seleccionados</h3>
                <div className="overflow-y-auto max-h-[360px] px-1 sm:px-2 md:px-4">
                    <ul className="flex flex-col gap-3">
                        {seleccionadas.map((olimpiadaCampoPostulante, idx) => {
                            const handleObligatorioChange = (e) => {
                                if(olimpiadaCampoPostulante.campo_postulante.id_dependencia !== null){
                                    const olimpiadaCampoDependencia = seleccionadas.find(
                                        c => c.campo_postulante.id === olimpiadaCampoPostulante.campo_postulante.id_dependencia
                                    );
                                    console.log(olimpiadaCampoDependencia);
                                    console.log(e.target.checked);
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
                                    console.log(olimpiadaCampoDependiente);
                                    console.log(e.target.checked);
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
                            return (
                                <li
                                    key={olimpiadaCampoPostulante.id}
                                    className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-900 font-medium">{olimpiadaCampoPostulante.campo_postulante.nombre}</span>
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

                                    <button
                                        onClick={() => handleRemove(olimpiadaCampoPostulante)}
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

export default ElegirCamposPostulante;
