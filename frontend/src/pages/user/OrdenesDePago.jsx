import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerInscripciones } from "../../../service/inscripcion.api";
import { generarDatosDeOrden, guardarOrdenPago, obtenerOrdenesDePago } from "../../../service/pagos.api";
import { getOlimpiada } from "../../../service/olimpiadas.api";
import useDeviceAgent from "../../hooks/useDeviceAgent";

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const [registros, setRegistros] = useState([]);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState([]);
  const [ordenesDePago, setOrdenesDePago] = useState([]);
  const [mensajeRegistros, setMensajeRegistros] = useState("");
  const [mensajeOrdenes, setMensajeOrdenes] = useState("");
  const [cargando, setCargando] = useState(true);
  const [nombreOlimpiada, setNombreOlimpiada] = useState("");
  const [verDetallesLista, setVerDetallesLista] = useState(null);

  const device = useDeviceAgent();
  const isMobile = device.isMobile;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Inscripciones
        try {
          const inscripcionesResponse = await obtenerInscripciones(idEncargado, idOlimpiada);
          if (inscripcionesResponse.data && inscripcionesResponse.data.length > 0) {
            setRegistros(inscripcionesResponse.data);
            setMensajeRegistros("");
          } else {
            setRegistros([]);
            setMensajeRegistros(inscripcionesResponse.message || "");
          }
        } catch (error) {
          setRegistros([]);
          setMensajeRegistros(
            error.response?.data?.message ||
            "Error al cargar registros."
          );
        }

        // Órdenes de pago
        try {
          const ordenesResponse = await obtenerOrdenesDePago(idEncargado, idOlimpiada);
          if (ordenesResponse.data && ordenesResponse.data.length > 0) {
            setOrdenesDePago(ordenesResponse.data);
            setMensajeOrdenes("");
          } else {
            setOrdenesDePago([]);
            setMensajeOrdenes(ordenesResponse.message || "");
          }
        } catch (error) {
          setOrdenesDePago([]);
          setMensajeOrdenes(
            error.response?.data?.message ||
            "Error al cargar órdenes de pago."
          );
        }

        // Nombre olimpiada
        try {
          const olimpiadaResponse = await getOlimpiada(idOlimpiada);
          setNombreOlimpiada(olimpiadaResponse.nombre);
        } catch {
          setNombreOlimpiada("");
        }
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [idEncargado, idOlimpiada]);

  // Agrupar registros por id_lista_inscripcion
  const listasMap = {};
  registros.forEach((r) => {
    if (r.id_lista_inscripcion && !isNaN(r.id_lista_inscripcion)) {
      if (!listasMap[r.id_lista_inscripcion]) listasMap[r.id_lista_inscripcion] = [];
      listasMap[r.id_lista_inscripcion].push(r);
    }
  });
  const registrosPorLista = Object.entries(listasMap);
  const registrosIndividuales = registros.filter(
    (r) => !r.id_lista_inscripcion || isNaN(r.id_lista_inscripcion)
  );

  const handleSeleccionarRegistro = (idInscripcion) => {
    setRegistrosSeleccionados((prev) =>
      prev.includes(idInscripcion)
        ? prev.filter((id) => id !== idInscripcion)
        : [...prev, idInscripcion]
    );
  };

  const handleSeleccionarTodosIndividuales = () => {
    const idsIndividuales = registrosIndividuales.map((r) => r.id_inscripcion);
    const todosSeleccionados = idsIndividuales.every((id) => registrosSeleccionados.includes(id));
    if (todosSeleccionados) {
      setRegistrosSeleccionados((prev) => prev.filter((id) => !idsIndividuales.includes(id)));
    } else {
      setRegistrosSeleccionados((prev) => [
        ...prev,
        ...idsIndividuales.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSeleccionarTodosListas = () => {
    const idsListas = registrosPorLista.flatMap(([_, listaRegistros]) =>
      listaRegistros.map((r) => r.id_inscripcion)
    );
    const todosSeleccionados = idsListas.every((id) => registrosSeleccionados.includes(id));
    if (todosSeleccionados) {
      setRegistrosSeleccionados((prev) => prev.filter((id) => !idsListas.includes(id)));
    } else {
      setRegistrosSeleccionados((prev) => [
        ...prev,
        ...idsListas.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSeleccionarLista = (listaRegistros) => {
    const idsLista = listaRegistros.map((r) => r.id_inscripcion);
    const todosSeleccionados = idsLista.every((id) => registrosSeleccionados.includes(id));
    if (todosSeleccionados) {
      setRegistrosSeleccionados((prev) => prev.filter((id) => !idsLista.includes(id)));
    } else {
      setRegistrosSeleccionados((prev) => [...prev, ...idsLista.filter((id) => !prev.includes(id))]);
    }
  };

  const generarOrdenDePago = async () => {
    try {
      const datosOrdenResponse = await generarDatosDeOrden({
        id_encargado: idEncargado,
        id_olimpiada: idOlimpiada,
        registros: registrosSeleccionados,
      });
      const datosOrden = datosOrdenResponse.data;
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Universidad Mayor de San Simón", 10, 10);
      doc.text("Facultad de ciencias y tecnología", 10, 15);
      doc.text("Secretaría administrativa", 10, 20);
      doc.setFontSize(16);
      doc.text("Orden de pago", 105, 30, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Nro Orden: ${datosOrden.id_pago}`, 160, 10);
      doc.text(`Emitido por la Unidad: ${datosOrden.nombre_olimpiada}`, 10, 40);
      doc.text(`Señor(a): ${datosOrden.nombre_completo_encargado}`, 10, 50);
      doc.text(`NIT/CI: ${datosOrden.ci_encargado}`, 10, 60);
      doc.text("Por lo siguiente:", 10, 70);
      autoTable(doc, {
        startY: 75,
        head: [["Cantidad", "Concepto", "Precio por unidad", "Importe total"]],
        body: [
          [
            datosOrden.cantidad,
            `${datosOrden.concepto} - detalles: ${datosOrden.detalle}`,
            `${datosOrden.precio_por_unidad} Bs.`,
            `${datosOrden.importe_total} Bs.`,
          ],
        ],
      });
      doc.text("Nota: no vale como factura oficial", 10, doc.lastAutoTable.finalY + 10);
      doc.text(`Son: ${datosOrden.importe_en_literal}`, 10, doc.lastAutoTable.finalY + 20);
      doc.text(
        `Cochabamba, ${new Date(datosOrden.fecha_pago).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        10,
        doc.lastAutoTable.finalY + 30
      );
      doc.text("Firma del responsable: ____________________________", 10, doc.lastAutoTable.finalY + 40);
      doc.save(`orden_de_pago_${datosOrden.id_pago}.pdf`);
      const pdfBlob = doc.output("blob");
      const formData = new FormData();
      formData.append("id", datosOrden.id_pago);
      formData.append("monto", datosOrden.importe_total);
      formData.append("fecha_generado", datosOrden.fecha_pago);
      formData.append("concepto", `${datosOrden.concepto} - detalles: ${datosOrden.detalle}`);
      formData.append("orden", new File([pdfBlob], "orden_de_pago.pdf", { type: "application/pdf" }));
      registrosSeleccionados.forEach((id) => {
        formData.append("registros[]", id);
      });
      await guardarOrdenPago(formData);
      window.location.reload();
    } catch (error) {
      console.error("Error al generar o guardar la orden de pago:", error);
      alert("Ocurrió un error al generar o guardar la orden de pago.");
    }
  };

  // Pantalla de detalles de lista
  if (verDetallesLista) {
    const listaRegistros = registrosPorLista.find(([id]) => id === verDetallesLista)?.[1] || [];
    return (
      <div className={`p-2 md:p-4 max-w-4xl mx-auto`}>
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-blue-900">
          Detalles de la lista #{verDetallesLista}
        </h2>
        <div className="bg-white p-2 md:p-6 rounded-xl shadow border border-gray-200 mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="border border-black p-2">Nombres</th>
                  {!isMobile && <th className="border border-black p-2">Apellidos</th>}
                  <th className="border border-black p-2">Área</th>
                  {!isMobile && <th className="border border-black p-2">Grado</th>}
                  <th className="border border-black p-2">Nivel/Categoria</th>
                </tr>
              </thead>
              <tbody>
                {listaRegistros.map((registro) => (
                  <tr key={registro.id_inscripcion} className="hover:bg-gray-50">
                    <td className="border border-black p-2">{registro.nombres}</td>
                    {!isMobile && <td className="border border-black p-2">{registro.apellidos}</td>}
                    <td className="border border-black p-2">{registro.nombre_area}</td>
                    {!isMobile && <td className="border border-black p-2">{registro.grado}</td>}
                    <td className="border border-black p-2">{registro.nombre_nivel_categoria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition text-sm md:text-base"
            onClick={() => setVerDetallesLista(null)}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2 md:p-4 max-w-6xl mx-auto`}>
      <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-blue-900">
        {"Órdenes de Pago"}
      </h2>
      {cargando ? (
        <div className="text-center text-blue-900 font-medium text-lg">
          <h2>Buscando ordenes de pago...</h2>
        </div>
      ) : (
        <>
          {/* Registros individuales */}
          <div className="bg-white p-2 md:p-6 rounded-xl shadow border border-gray-200 mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-2 md:mb-4 text-center">
              Registros Individuales
            </h2>
            {mensajeRegistros ? (
              <p className="text-center text-gray-700">{mensajeRegistros}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="border border-black p-2">Seleccionar</th>
                      <th className="border border-black p-2">Nombres</th>
                      {!isMobile && <th className="border border-black p-2">Apellidos</th>}
                      <th className="border border-black p-2">Área</th>
                      {!isMobile && <th className="border border-black p-2">Grado</th>}
                      <th className="border border-black p-2">Nivel/Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosIndividuales.map((registro) => (
                      <tr key={registro.id_inscripcion} className="hover:bg-gray-50">
                        <td className="border border-black p-2 text-center">
                          <input
                            type="checkbox"
                            onChange={() => handleSeleccionarRegistro(registro.id_inscripcion)}
                            checked={registrosSeleccionados.includes(registro.id_inscripcion)}
                          />
                        </td>
                        <td className="border border-black p-2">{registro.nombres}</td>
                        {!isMobile && <td className="border border-black p-2">{registro.apellidos}</td>}
                        <td className="border border-black p-2">{registro.nombre_area}</td>
                        {!isMobile && <td className="border border-black p-2">{registro.grado}</td>}
                        <td className="border border-black p-2">{registro.nombre_nivel_categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Registros por lista */}
          {registrosPorLista.length > 0 ? (
            <div className="bg-white p-2 md:p-6 rounded-xl shadow border border-gray-200 mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-2 md:mb-4 text-center">
                Registros por lista
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="border border-black p-2">Seleccionar</th>
                      <th className="border border-black p-2">Concepto</th>
                      <th className="border border-black p-2">Número de lista</th>
                      <th className="border border-black p-2">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosPorLista.map(([idLista, listaRegistros]) => {
                      const idsLista = listaRegistros.map((r) => r.id_inscripcion);
                      const todosSeleccionados = idsLista.every((id) =>
                        registrosSeleccionados.includes(id)
                      );
                      return (
                        <tr key={idLista}>
                          <td className="border border-black p-2 text-center">
                            <input
                              type="checkbox"
                              onChange={() => handleSeleccionarLista(listaRegistros)}
                              checked={todosSeleccionados}
                            />
                          </td>
                          <td className="border border-black p-2">
                            Lista de {listaRegistros.length} postulantes a la olimpiada {nombreOlimpiada}
                          </td>
                          <td className="border border-black p-2">{idLista}</td>
                          <td className="border border-black p-2 text-center">
                            <button
                              className="px-3 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-base"
                              onClick={() => setVerDetallesLista(idLista)}
                            >
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-2 md:p-6 rounded-xl shadow border border-gray-200 mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-2 md:mb-4 text-center">
                Registros por lista
              </h2>
              <p className="text-center text-gray-700">
                No hay registros por lista pendientes para generar una orden de pago.
              </p>
            </div>
          )}

          <div className="text-center mt-2 mb-6 flex flex-wrap gap-2 md:gap-4 justify-center">
            <button
              onClick={handleSeleccionarTodosIndividuales}
              className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition text-xs md:text-base"
              type="button"
            >
              {registrosIndividuales.every((r) => registrosSeleccionados.includes(r.id_inscripcion)) && registrosIndividuales.length > 0
                ? "Deseleccionar todos los registros individuales"
                : "Seleccionar todos los registros individuales"}
            </button>
            <button
              onClick={handleSeleccionarTodosListas}
              className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition text-xs md:text-base"
              type="button"
            >
              {registrosPorLista.length > 0 &&
              registrosPorLista
                .flatMap(([_, listaRegistros]) => listaRegistros.map((r) => r.id_inscripcion))
                .every((id) => registrosSeleccionados.includes(id))
                ? "Deseleccionar todos los registros por listas"
                : "Seleccionar todos los registros por listas"}
            </button>
            <button
              onClick={generarOrdenDePago}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition ${
                registrosSeleccionados.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              } text-xs md:text-base`}
              disabled={registrosSeleccionados.length === 0}
              type="button"
            >
              Generar Orden de Pago
            </button>
          </div>

          {/* Órdenes de Pago */}
          <div className="bg-white p-2 md:p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-2 md:mb-4 text-center">
              Órdenes de Pago
            </h2>
            {mensajeOrdenes ? (
              <p className="text-center text-gray-700">{mensajeOrdenes}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="border p-2 text-left">Monto</th>
                      <th className="border p-2 text-left">Fecha Generado</th>
                      {!isMobile && <th className="border p-2 text-left">Concepto</th>}
                      <th className="border p-2 text-center">Orden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesDePago.map((orden) => (
                      <tr key={orden.id_pago} className="hover:bg-gray-50">
                        <td className="border p-2">{orden.monto} Bs.</td>
                        <td className="border p-2">{orden.fecha_generado}</td>
                        {!isMobile && <td className="border p-2">{orden.concepto}</td>}
                        <td className="border p-2 text-center min-w-[90px] md:min-w-[130px]">
                          <a
                            href={orden.orden}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-base"
                          >
                            Ver Orden
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrdenesDePago;