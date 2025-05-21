import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerInscripciones } from "../../../service/inscripcion.api";
import { generarDatosDeOrden, guardarOrdenPago, obtenerOrdenesDePago } from "../../../service/pagos.api";

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const [registros, setRegistros] = useState([]);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState([]);
  const [ordenesDePago, setOrdenesDePago] = useState([]);
  const [sinRegistros, setSinRegistros] = useState(false);
  const [mensajeSinRegistros, setMensajeSinRegistros] = useState("");
  const [sinOrdenes, setSinOrdenes] = useState(false);
  const [mensajeSinOrdenes, setMensajeSinOrdenes] = useState(""); // Nuevo estado para mensaje de órdenes
  const [cargando, setCargando] = useState(true);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true); // Nuevo estado para loading de órdenes

  // Obtener registros pendientes al cargar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setCargandoOrdenes(true);
      try {
        // Obtener inscripciones
        const inscripcionesResponse = await obtenerInscripciones(idEncargado, idOlimpiada);
        if (inscripcionesResponse.data.length === 0) {
          setSinRegistros(true);
          setMensajeSinRegistros(
            inscripcionesResponse.message ||
              "No se encontraron registros pendientes por generar una orden de pago."
          );
        } else {
          setRegistros(inscripcionesResponse.data);
        }

        setCargando(false);

        // Obtener órdenes de pago
        const ordenesResponse = await obtenerOrdenesDePago(idEncargado, idOlimpiada);
        if (ordenesResponse.data.length === 0) {
          setSinOrdenes(true);
          setMensajeSinOrdenes(
            ordenesResponse.message ||
              "No hay órdenes de pago pendientes por pagar."
          );
        } else {
          setOrdenesDePago(ordenesResponse.data);
        }
      } catch (error) {
        setSinRegistros(true);
        setMensajeSinRegistros("No se encontraron registros pendientes por generar una orden de pago.");
        setSinOrdenes(true);
        setMensajeSinOrdenes("No se encontraron órdenes de pago.");
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
        setCargandoOrdenes(false);
      }
    };

    cargarDatos();
  }, [idEncargado, idOlimpiada]);

  // Manejar selección de registros
  const handleSeleccionarRegistro = (idInscripcion) => {
    setRegistrosSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(idInscripcion)
        ? prevSeleccionados.filter((id) => id !== idInscripcion)
        : [...prevSeleccionados, idInscripcion]
    );
    // Agregar console.log para verificar los registros seleccionados
    console.log("Registros seleccionados:", registrosSeleccionados);
  };

  // Generar orden de pago
  const generarOrdenDePago = async () => {
    try {
      // Llamar al endpoint para generar datos de la orden
      const datosOrdenResponse = await generarDatosDeOrden({
        id_encargado: idEncargado,
        id_olimpiada: idOlimpiada,
        registros: registrosSeleccionados,
      });

      // Agregar console.log para verificar la respuesta
      console.log("Respuesta de generarDatosDeOrden:", datosOrdenResponse.data);

      const datosOrden = datosOrdenResponse.data;

      // Crear el PDF con el modelo proporcionado
      const doc = new jsPDF();

      // Encabezado
      doc.setFontSize(12);
      doc.text("Universidad Mayor de San Simón", 10, 10);
      doc.text("Facultad de ciencias y tecnología", 10, 15);
      doc.text("Secretaría administrativa", 10, 20);
      doc.setFontSize(16);
      doc.text("Orden de pago", 105, 30, { align: "center" });

      // Número de orden
      doc.setFontSize(12);
      doc.text(`Nro Orden: ${datosOrden.id_pago}`, 160, 10);

      // Información del encargado
      doc.text(`Emitido por la Unidad: ${datosOrden.nombre_olimpiada}`, 10, 40);
      doc.text(`Señor(a): ${datosOrden.nombre_completo_encargado}`, 10, 50);
      doc.text(`NIT/CI: ${datosOrden.ci_encargado}`, 10, 60);

      // Tabla de detalles
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

      // Nota y total en literal
      doc.text("Nota: no vale como factura oficial", 10, doc.lastAutoTable.finalY + 10);
      doc.text(`Son: ${datosOrden.importe_en_literal}`, 10, doc.lastAutoTable.finalY + 20);

      // Fecha y firma
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

      // Descargar el PDF
      doc.save(`orden_de_pago_${datosOrden.id_pago}.pdf`);

      // Convertir el PDF a Blob
      const pdfBlob = doc.output("blob");

      // Crear un objeto FormData para enviar el PDF generado al servidor
      const formData = new FormData();
      formData.append("id", datosOrden.id_pago);
      formData.append("monto", datosOrden.importe_total);
      formData.append("fecha_generado", datosOrden.fecha_pago);
      formData.append("concepto", `${datosOrden.concepto} - detalles: ${datosOrden.detalle}`);
      formData.append("orden", new File([pdfBlob], "orden_de_pago.pdf", { type: "application/pdf" }));

      registrosSeleccionados.forEach((id) => {
        formData.append("registros[]", id); // Laravel espera este formato para arreglos
      });

      console.log("Datos enviados al backend (guardarOrdenPago):", {
        id: datosOrden.id_pago,
        monto: datosOrden.importe_total,
        fecha_generado: datosOrden.fecha_pago,
        concepto: `${datosOrden.concepto} - detalles: ${datosOrden.detalle}`,
        registros: registrosSeleccionados,
      });
      console.log("FormData enviado al backend:", formData);
      // Guardar la orden de pago en el servidor
      await guardarOrdenPago(formData);

      // Actualizar la página
      window.location.reload();
    } catch (error) {
      console.error("Error al generar o guardar la orden de pago:", error);
      alert("Ocurrió un error al generar o guardar la orden de pago.");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {cargando ? (
        <div className="text-center text-blue-900 font-medium text-lg">
          <h2>Estamos buscando sus registros pendientes por generar una orden de pago</h2>
        </div>
      ) : (
        <>
          {/* Registros Pendientes */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              Registros Pendientes
            </h2>

            {sinRegistros ? (
              <p className="text-center text-gray-700">
                {mensajeSinRegistros}
              </p>
            ) : (
              <>
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
                      {registros.map((registro) => (
                        <tr key={registro.id_inscripcion}>
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

                <div className="text-center mt-6">
                  <button
                    onClick={generarOrdenDePago}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      registrosSeleccionados.length > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
                    disabled={registrosSeleccionados.length === 0}
                  >
                    Generar Orden de Pago
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Órdenes de Pago */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              Órdenes de Pago
            </h2>

            {cargandoOrdenes ? (
              <p className="text-center text-blue-900 font-medium text-lg">
                Estamos buscando sus órdenes de pago...
              </p>
            ) : sinOrdenes ? (
              <p className="text-center text-gray-700">
                {mensajeSinOrdenes}
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