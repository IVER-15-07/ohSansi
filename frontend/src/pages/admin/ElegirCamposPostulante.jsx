import React, { useState, useCallback, useMemo } from 'react';
import { CheckCheck, X, AlertTriangle } from 'lucide-react';
import { deleteOlimpiadaCampoPostulante } from '../../../service/olimpiada_campos_postulante.api';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { useDeviceAgent } from '../../hooks/useDeviceAgent';

const ElegirCamposPostulante = ({ disponibles, seleccionadas, setSeleccionadas, idOlimpiada }) => {
    const { isMobile, isTablet } = useDeviceAgent();
    const [modal, setModal] = useState({ open: false, nombre: '', type: 'info' });

    // Memoized responsive classes
    const containerClasses = useMemo(() => {
        const base = "flex gap-4 overflow-hidden";
        if (isMobile) return `${base} flex-col`;
        return `${base} flex-col lg:flex-row`;
    }, [isMobile]);

    const cardClasses = useMemo(() => {
        const base = "border shadow-sm bg-white";
        if (isMobile) return `${base} w-full p-4`;
        if (isTablet) return `${base} w-full lg:w-1/2 p-6`;
        return `${base} w-full lg:w-1/2 p-8`;
    }, [isMobile, isTablet]);

    const listContainerClasses = useMemo(() => {
        const base = "overflow-y-auto px-1";
        if (isMobile) return `${base} max-h-[280px] sm:max-h-[320px]`;
        return `${base} max-h-[360px] sm:px-2 lg:px-1`;
    }, [isMobile]);

    // Optimized handlers with useCallback
    const closeModal = useCallback(() => {
        setModal({ open: false, nombre: '', type: 'info' });
    }, []);

    const showModal = useCallback((nombre, type = 'info') => {
        setModal({ open: true, nombre, type });
    }, []);

    const handleAdd = useCallback((campoPostulante) => {
        if (campoPostulante.id_dependencia !== null) {
            const campoDependencia = disponibles.find(
                c => c.id === campoPostulante.id_dependencia
            );
            if (campoDependencia) {
                showModal(
                    `${campoPostulante.nombre} depende de ${campoDependencia.nombre}. 
                     Debe agregar primero el campo de dependencia.`,
                    'warning'
                );
                return;
            }
        }

        const olimpiadaCampoPostulante = {
            id: null,
            tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            id_olimpiada: idOlimpiada,
            id_campo_postulante: campoPostulante.id,
            campo_postulante: campoPostulante,
            esObligatorio: false
        };
        
        setSeleccionadas(prev => [...prev, olimpiadaCampoPostulante]);
    }, [disponibles, idOlimpiada, setSeleccionadas, showModal]);

    const handleRemove = useCallback(async (olimpiadaCampoPostulante) => {
        if (olimpiadaCampoPostulante.campo_postulante.id !== null) {
            const olimpiadaCampoDependiente = seleccionadas.find(
                c => c.campo_postulante.id_dependencia === olimpiadaCampoPostulante.campo_postulante.id
            );
            if (olimpiadaCampoDependiente) {
                showModal(
                    `${olimpiadaCampoDependiente.campo_postulante.nombre} depende de ${olimpiadaCampoPostulante.campo_postulante.nombre}. 
                     Debe eliminar primero el campo dependiente.`,
                    'warning'
                );
                return;
            }
        }

        if (olimpiadaCampoPostulante.id !== null) {
            try {
                await deleteOlimpiadaCampoPostulante(olimpiadaCampoPostulante.id);
            } catch (error) {
                showModal(
                    'Error al eliminar el campo del postulante. Por favor, inténtelo de nuevo más tarde.',
                    'error'
                );
                return;
            }
        }

        setSeleccionadas(prev => 
            prev.filter(a => a.id_campo_postulante !== olimpiadaCampoPostulante.id_campo_postulante)
        );
    }, [seleccionadas, setSeleccionadas, showModal]);
    
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
                    <h3 className={`font-semibold text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        Campos Disponibles para Postulante
                    </h3>
                    <Badge variant="secondary" size="sm">{disponibles.length}</Badge>
                </div>
                
                <div className={listContainerClasses}>
                    {disponibles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <AlertTriangle size={32} className="mb-2" />
                            <p className="text-sm text-center">
                                No hay campos disponibles para agregar
                            </p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {disponibles.map((campoPostulante) => (
                                <li
                                    key={campoPostulante.id}
                                    className="flex justify-between items-center gap-2 sm:gap-4 p-3 rounded-xl 
                                             hover:bg-green-50 transition-colors duration-200 border border-transparent 
                                             hover:border-green-200"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-gray-800 font-medium truncate ${
                                                isMobile ? 'text-sm' : 'text-base'
                                            }`}>
                                                {campoPostulante.nombre}
                                            </span>
                                            {campoPostulante.id_dependencia && (
                                                <Badge variant="warning" size="sm">
                                                    Dependiente
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size={isMobile ? "sm" : "md"}
                                        onClick={() => handleAdd(campoPostulante)}
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
                    <h3 className={`font-semibold text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        Campos Seleccionados para Postulante
                    </h3>
                    <Badge variant="primary" size="sm">{seleccionadas.length}</Badge>
                </div>
                
                <div className={listContainerClasses}>
                    {seleccionadas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <AlertTriangle size={32} className="mb-2" />
                            <p className="text-sm text-center">
                                No hay campos seleccionados aún
                            </p>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {seleccionadas.map((olimpiadaCampoPostulante, idx) => {
                                const handleObligatorioChange = (e) => {
                                    if (olimpiadaCampoPostulante.campo_postulante.id_dependencia !== null) {
                                        const olimpiadaCampoDependencia = seleccionadas.find(
                                            c => c.campo_postulante.id === olimpiadaCampoPostulante.campo_postulante.id_dependencia
                                        );
                                        if (olimpiadaCampoDependencia && !olimpiadaCampoDependencia.esObligatorio && !olimpiadaCampoPostulante.esObligatorio) {
                                            showModal(
                                                `${olimpiadaCampoDependencia.campo_postulante.nombre} debe ser obligatorio primero`,
                                                'warning'
                                            );
                                            return;
                                        }
                                    }
                                    if (olimpiadaCampoPostulante.campo_postulante.id !== null) {
                                        const olimpiadaCampoDependiente = seleccionadas.find(
                                            c => c.campo_postulante.id_dependencia === olimpiadaCampoPostulante.campo_postulante.id
                                        );
                                        if (olimpiadaCampoDependiente && olimpiadaCampoDependiente.esObligatorio && olimpiadaCampoPostulante.esObligatorio) {
                                            showModal(
                                                `${olimpiadaCampoDependiente.campo_postulante.nombre} debe dejar de ser obligatorio primero`,
                                                'warning'
                                            );
                                            return;
                                        }
                                    }
                                    setSeleccionadas(prev => {
                                        const nuevas = [...prev];
                                        nuevas[idx] = {
                                            ...nuevas[idx],
                                            esObligatorio: e.target.checked
                                        };
                                        return nuevas;
                                    });
                                };

                                const key = olimpiadaCampoPostulante.id 
                                    || olimpiadaCampoPostulante.tempId
                                    || `fallback-postulante-${olimpiadaCampoPostulante.campo_postulante?.id || 'unknown'}-${idx}`;
                                
                                return (
                                    <li
                                        key={key}
                                        className="flex justify-between items-center gap-2 sm:gap-4 p-3 rounded-xl 
                                                 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                                    >
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-blue-900 font-medium truncate ${
                                                    isMobile ? 'text-sm' : 'text-base'
                                                }`}>
                                                    {olimpiadaCampoPostulante.campo_postulante.nombre}
                                                </span>
                                                {olimpiadaCampoPostulante.campo_postulante.id_dependencia && (
                                                    <Badge variant="warning" size="sm">
                                                        Dependiente
                                                    </Badge>
                                                )}
                                            </div>
                                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!olimpiadaCampoPostulante.esObligatorio}
                                                    onChange={handleObligatorioChange}
                                                    className="accent-blue-600 w-4 h-4"
                                                />
                                                <span className={isMobile ? 'text-xs' : 'text-sm'}>
                                                    Campo obligatorio
                                                </span>
                                            </label>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size={isMobile ? "sm" : "md"}
                                            onClick={() => handleRemove(olimpiadaCampoPostulante)}
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
}

export default ElegirCamposPostulante;
