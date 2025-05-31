import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerInscripciones } from "../../../service/inscripcion.api";
import { generarDatosDeOrden, guardarOrdenPago, obtenerOrdenesDePago } from "../../../service/pagos.api";
import { getOlimpiada } from "../../../service/olimpiadas.api"; // Debes tener este método en tu service

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const [registros, setRegistros] = useState([]);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState([]);
  const [ordenesDePago, setOrdenesDePago] = useState([]);
  const [sinRegistros, setSinRegistros] = useState(false);
  const [sinOrdenes, setSinOrdenes] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [nombreOlimpiada, setNombreOlimpiada] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener nombre de la olimpiada por id
        const olimpiadaResponse = await getOlimpiada(idOlimpiada);
        setNombreOlimpiada(olimpiadaResponse.nombre);

        const inscripcionesResponse = await obtenerInscripciones(idEncargado, idOlimpiada);
        if (inscripcionesResponse.data.length === 0) {
          setSinRegistros(true);
        } else {
          setRegistros(inscripcionesResponse.data);
        }
        const ordenesResponse = await obtenerOrdenesDePago(idEncargado, idOlimpiada);
        if (ordenesResponse.data.length === 0) {
          setSinOrdenes(true);
        } else {
          setOrdenesDePago(ordenesResponse.data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
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
  const registrosPorLista = Object.entries(listasMap); // [ [id_lista, [registros...]], ... ]
  const registrosIndividuales = registros.filter(
    (r) => !r.id_lista_inscripcion || isNaN(r.id_lista_inscripcion)
  );

  // Selección individual
  const handleSeleccionarRegistro = (idInscripcion) => {
    setRegistrosSeleccionados((prev) =>
      prev.includes(idInscripcion)
        ? prev.filter((id) => id !== idInscripcion)
        : [...prev, idInscripcion]
    );
  };

  // Seleccionar todos
  const handleSeleccionarTodos = () => {
    const todosIds = registros.map((r) => r.id_inscripcion);
    if (registrosSeleccionados.length === todosIds.length) {
      setRegistrosSeleccionados([]);
    } else {
      setRegistrosSeleccionados(todosIds);
    }
  };

  // Seleccionar todos los registros de una lista
  const handleSeleccionarLista = (listaRegistros) => {
    const idsLista = listaRegistros.map((r) => r.id_inscripcion);
    const todosSeleccionados = idsLista.every((id) => registrosSeleccionados.includes(id));
    if (todosSeleccionados) {
      // Deseleccionar todos los de la lista
      setRegistrosSeleccionados((prev) => prev.filter((id) => !idsLista.includes(id)));
    } else {
      // Seleccionar todos los de la lista (sin duplicados)
      setRegistrosSeleccionados((prev) => [...prev, ...idsLista.filter((id) => !prev.includes(id))]);
    }
  };

  // Generar orden de pago (igual que antes)
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">
        {"Órdenes de Pago"}
      </h2>
      {cargando ? (
        <div className="text-center text-blue-900 font-medium text-lg">
          <h2>Buscando ordenes de pago...</h2>
        </div>
      ) : (
        <>
          {/* Registros individuales */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              Registros Individuales
            </h2>
            {sinRegistros && registrosIndividuales.length === 0 ? (
              <p className="text-center text-gray-700">
                No hay registros individuales pendientes para generar una orden de pago.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="border border-black p-2">Seleccionar</th>
                      <th className="border border-black p-2">Nombres</th>
                      <th className="border border-black p-2">Apellidos</th>
                      <th className="border border-black p-2">Área</th>
                      <th className="border border-black p-2">Grado</th>
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
                        <td className="border border-black p-2">{registro.apellidos}</td>
                        <td className="border border-black p-2">{registro.nombre_area}</td>
                        <td className="border border-black p-2">{registro.grado}</td>
                        <td className="border border-black p-2">{registro.nombre_nivel_categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Registros por lista */}
          {registrosPorLista.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
                Registros por lista
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="border border-black p-2">Seleccionar</th>
                      <th className="border border-black p-2">Concepto</th>
                      <th className="border border-black p-2">Número de lista</th>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-center mt-2 mb-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleSeleccionarTodos}
            className="px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition"
          >
            {registrosSeleccionados.length === registros.length
              ? "Deseleccionar todo"
              : "Seleccionar todo"}
          </button>
          <button
            onClick={generarOrdenDePago}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              registrosSeleccionados.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={registrosSeleccionados.length === 0}
          >
            Generar Orden de Pago
          </button>
        </div>

          {/* Órdenes de Pago */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              Órdenes de Pago
            </h2>
            {sinOrdenes ? (
              <p className="text-center text-gray-700">
                No hay órdenes de pago pendientes por pagar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="border p-2 text-left">Monto</th>
                      <th className="border p-2 text-left">Fecha Generado</th>
                      <th className="border p-2 text-left">Concepto</th>
                      <th className="border p-2 text-center">Orden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesDePago.map((orden) => (
                      <tr key={orden.id_pago} className="hover:bg-gray-50">
                        <td className="border p-2">{orden.monto} Bs.</td>
                        <td className="border p-2">{orden.fecha_generado}</td>
                        <td className="border p-2">{orden.concepto}</td>
                        <td className="border p-2 text-center min-w-[130px]">
                          <a
                            href={orden.orden}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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