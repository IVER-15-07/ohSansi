import React, { useState, useCallback, useMemo } from 'react';
import { CheckCheck, X, AlertTriangle } from 'lucide-react';
import { Modal, Card, Badge, Button } from '../../components/ui/';
import { deleteOlimpiadaCampoTutor } from '../../../service/olimpiada_campos_tutor.api';
import { useDeviceAgent } from '../../hooks/useDeviceAgent';

const ElegirCamposTutor = ({ disponibles, seleccionadas, setSeleccionadas, idOlimpiada }) => {
    const { isMobile, isTablet } = useDeviceAgent();
    const [modal, setModal] = useState({ open: false, nombre: '', type: 'info' });

    // Responsive classes
    const containerClasses = useMemo(() => {
        const base = 'flex gap-4 overflow-hidden';
        if (isMobile) return `${base} flex-col`;
        return `${base} flex-col lg:flex-row`;
    }, [isMobile]);

    const cardClasses = useMemo(() => {
        const base = 'border shadow-sm bg-white';
        if (isMobile) return `${base} w-full p-4`;
        if (isTablet) return `${base} w-full lg:w-1/2 p-6`;
        return `${base} w-full lg:w-1/2 p-8`;
    }, [isMobile, isTablet]);

    const listContainerClasses = useMemo(() => {
        const base = 'overflow-y-auto px-1';
        if (isMobile) return `${base} max-h-[280px] sm:max-h-[320px]`;
        return `${base} max-h-[360px] sm:px-2 lg:px-1`;
    }, [isMobile]);

    const closeModal = useCallback(() => {
        setModal({ open: false, nombre: '', type: 'info' });
    }, []);

    const showModal = useCallback((nombre, type = 'info') => {
        setModal({ open: true, nombre, type });
    }, []);

    // Añadir campo a seleccionadas, respetando dependencias
    const handleAdd = useCallback((campoTutor) => {
        if (campoTutor.id_dependencia !== null) {
            const dependenciaNoSeleccionada = !seleccionadas.some(
                c => c.campo_tutor.id === campoTutor.id_dependencia
            );
            if (dependenciaNoSeleccionada) {
                const campoDependencia = disponibles.find(c => c.id === campoTutor.id_dependencia);
                showModal(
                    `${campoTutor.nombre} depende de ${campoDependencia ? campoDependencia.nombre : 'otro campo'}. Debe agregar primero el campo de dependencia.`,
                    'warning'
                );
                return;
            }
        }
        const olimpiadaCampoTutor = {
            id: null,
            tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            id_olimpiada: idOlimpiada,
            id_campo_tutor: campoTutor.id,
            campo_tutor: campoTutor,
            esObligatorio: false
        };
        setSeleccionadas(prev => [...prev, olimpiadaCampoTutor]);
    }, [disponibles, seleccionadas, idOlimpiada, setSeleccionadas, showModal]);

    // Quitar campo de seleccionadas, respetando dependencias
    const handleRemove = useCallback(async (olimpiadaCampoTutor) => {
        // No permitir quitar si hay dependientes
        const dependiente = seleccionadas.find(
            c => c.campo_tutor.id_dependencia === olimpiadaCampoTutor.campo_tutor.id
        );
        if (dependiente) {
            showModal(
                `${dependiente.campo_tutor.nombre} depende de ${olimpiadaCampoTutor.campo_tutor.nombre}. Debe eliminar primero el campo dependiente.`,
                'warning'
            );
            return;
        }
        if (olimpiadaCampoTutor.id !== null) {
            try {
                await deleteOlimpiadaCampoTutor(olimpiadaCampoTutor.id);
            } catch (error) {
                showModal('Error al eliminar el campo del tutor. Por favor, inténtelo de nuevo más tarde.', 'error');
                return;
            }
        }
        setSeleccionadas(prev => prev.filter(a => a.id_campo_tutor !== olimpiadaCampoTutor.id_campo_tutor));
    }, [seleccionadas, setSeleccionadas, showModal]);

    // Cambiar obligatorio, respetando dependencias
    const handleObligatorioChange = useCallback((olimpiadaCampoTutor, idx, checked) => {
        // Si es dependiente, su dependencia debe ser obligatoria
        if (olimpiadaCampoTutor.campo_tutor.id_dependencia !== null) {
            const dependencia = seleccionadas.find(
                c => c.campo_tutor.id === olimpiadaCampoTutor.campo_tutor.id_dependencia
            );
            if (dependencia && !dependencia.esObligatorio && checked) {
                showModal(
                    `${dependencia.campo_tutor.nombre} debe ser obligatorio primero`,
                    'warning'
                );
                return;
            }
        }
        // Si tiene dependientes, no puede dejar de ser obligatorio si alguno lo es
        const dependiente = seleccionadas.find(
            c => c.campo_tutor.id_dependencia === olimpiadaCampoTutor.campo_tutor.id
        );
        if (dependiente && dependiente.esObligatorio && !checked) {
            showModal(
                `${dependiente.campo_tutor.nombre} debe dejar de ser obligatorio primero`,
                'warning'
            );
            return;
        }
        setSeleccionadas(prev => {
            const nuevas = [...prev];
            nuevas[idx] = { ...nuevas[idx], esObligatorio: checked };
            return nuevas;
        });
    }, [seleccionadas, showModal, setSeleccionadas]);

    return (
        <div className={containerClasses}>
            {/* Modal for warnings and errors */}
            <Modal
                variant={modal.type}
                message={modal.nombre}
                isOpen={modal.open}
                onClose={closeModal}
            />

            {/* Available Fields Card */}
            <Card className={cardClasses}>
                <div className="flex items-center gap-2 mb-4">
                    <h3 className={`font-semibold text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>Campos Disponibles para Tutor</h3>
                    <Badge variant="secondary" size="sm">{disponibles.length}</Badge>
                </div>
                <div className={listContainerClasses}>
                    {disponibles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <AlertTriangle size={32} className="mb-2" />
                            <p className="text-sm text-center">No hay campos disponibles para agregar</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {disponibles.map((campoTutor) => (
                                <li
                                    key={campoTutor.id}
                                    className="flex justify-between items-center gap-2 sm:gap-4 p-3 rounded-xl hover:bg-green-50 transition-colors duration-200 border border-transparent hover:border-green-200"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-gray-800 font-medium truncate ${isMobile ? 'text-sm' : 'text-base'}`}>{campoTutor.nombre}</span>
                                            {campoTutor.id_dependencia && (
                                                <Badge variant="warning" size="sm">Dependiente</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size={isMobile ? "sm" : "md"}
                                        onClick={() => handleAdd(campoTutor)}
                                        className="flex items-center gap-1 shrink-0"
                                    >
                                        <CheckCheck size={isMobile ? 14 : 16} />
                                        {!isMobile && "Añadir"}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Card>

            {/* Selected Fields Card */}
            <Card className={cardClasses}>
                <div className="flex items-center gap-2 mb-4">
                    <h3 className={`font-semibold text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>Campos Seleccionados para Tutor</h3>
                    <Badge variant="primary" size="sm">{seleccionadas.length}</Badge>
                </div>
                <div className={listContainerClasses}>
                    {seleccionadas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <AlertTriangle size={32} className="mb-2" />
                            <p className="text-sm text-center">No hay campos seleccionados aún</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {seleccionadas.map((olimpiadaCampoTutor, idx) => {
                                const key = olimpiadaCampoTutor.id || olimpiadaCampoTutor.tempId || `fallback-tutor-${olimpiadaCampoTutor.campo_tutor?.id || 'unknown'}-${idx}`;
                                return (
                                    <li
                                        key={key}
                                        className="flex justify-between items-center gap-2 sm:gap-4 p-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                                    >
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-blue-900 font-medium truncate ${isMobile ? 'text-sm' : 'text-base'}`}>{olimpiadaCampoTutor.campo_tutor.nombre}</span>
                                                {olimpiadaCampoTutor.campo_tutor.id_dependencia && (
                                                    <Badge variant="warning" size="sm">Dependiente</Badge>
                                                )}
                                            </div>
                                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!olimpiadaCampoTutor.esObligatorio}
                                                    onChange={e => handleObligatorioChange(olimpiadaCampoTutor, idx, e.target.checked)}
                                                    className="accent-blue-600 w-4 h-4"
                                                />
                                                <span className={isMobile ? 'text-xs' : 'text-sm'}>Campo obligatorio</span>
                                            </label>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size={isMobile ? "sm" : "md"}
                                            onClick={() => handleRemove(olimpiadaCampoTutor)}
                                            className="flex items-center gap-1 shrink-0"
                                            title="Quitar campo"
                                        >
                                            <X size={isMobile ? 14 : 16} />
                                            {!isMobile && "Quitar"}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ElegirCamposTutor;
