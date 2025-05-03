import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerRegistros } from "../../../service/registros.api";
import { generarDatosDeOrden, guardarOrdenPago, obtenerOrdenesDePago } from "../../../service/pagos.api";

const OrdenesDePago = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const [registros, setRegistros] = useState([]);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState([]);
  const [ordenesDePago, setOrdenesDePago] = useState([]);
  const [sinRegistros, setSinRegistros] = useState(false);
  const [sinOrdenes, setSinOrdenes] = useState(false);

  // Obtener registros pendientes al cargar el componente
  useEffect(() => {
    obtenerRegistros(idEncargado, idOlimpiada)
      .then((res) => {
        if (res.data.length === 0) {
          setSinRegistros(true);
        } else {
          setRegistros(res.data);
        }
      })
      .catch((err) => console.error("Error al obtener registros:", err));

    obtenerOrdenesDePago(idEncargado, idOlimpiada)
      .then((res) => {
        if (res.data.length === 0) {
          setSinOrdenes(true);
        } else {
          setOrdenesDePago(res.data);
        }
      })
      .catch((err) => console.error("Error al obtener órdenes de pago:", err));
  }, [idEncargado, idOlimpiada]);

  // Manejar selección de registros
  const handleSeleccionarRegistro = (idRegistro) => {
    setRegistrosSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(idRegistro)
        ? prevSeleccionados.filter((id) => id !== idRegistro)
        : [...prevSeleccionados, idRegistro]
    );
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
      doc.text(`Emitido por la Unidad: ____________________________`, 10, 40);
      doc.text(`Señor: ${datosOrden.nombre_completo_encargado}`, 10, 50);
      doc.text(`NIT/CI: ${datosOrden.ci_encargado}`, 10, 60);
  
      // Tabla de detalles
      doc.text("Por lo siguiente:", 10, 70);
      autoTable(doc, {
        startY: 75,
        head: [["Cantidad", "Concepto", "Precio por unidad", "Importe"]],
        body: [
          [
            datosOrden.cantidad,
            datosOrden.concepto,
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
  
      // Convertir el PDF a Blob
      const pdfBlob = doc.output("blob");
  
      // Crear un objeto FormData para enviar el PDF generado al servidor
      const formData = new FormData();
      formData.append("id", datosOrden.id_pago);
      formData.append("monto", datosOrden.importe_total);
      formData.append("fecha_generado", datosOrden.fecha_pago);
      formData.append("concepto", datosOrden.concepto);
      formData.append("orden", new File([pdfBlob], "orden_de_pago.pdf", { type: "application/pdf" }));
      formData.append("registros", JSON.stringify(registrosSeleccionados)); // Serializar el arreglo
  
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
    <div className="p-4">
      {/* Sección de registros pendientes */}
      {sinRegistros ? (
        <div>
          <h2>No hay registros pendientes para generar una orden de pago.</h2>
        </div>
      ) : (
        <div>
          <h2>Registros Pendientes</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-black p-2">Seleccionar</th>
                <th className="border border-black p-2">Nombres</th>
                <th className="border border-black p-2">Apellidos</th>
                <th className="border border-black p-2">Área</th>
                <th className="border border-black p-2">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id_registro}>
                  <td className="border border-black p-2 text-center">
                    <input
                      type="checkbox"
                      onChange={() => handleSeleccionarRegistro(registro.id_registro)}
                      checked={registrosSeleccionados.includes(registro.id_registro)}
                    />
                  </td>
                  <td className="border border-black p-2">{registro.nombres}</td>
                  <td className="border border-black p-2">{registro.apellidos}</td>
                  <td className="border border-black p-2">{registro.nombre_area}</td>
                  <td className="border border-black p-2">{registro.nombre_nivel_categoria}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center mt-6">
            <button
              onClick={generarOrdenDePago}
              className={`px-6 py-2 rounded-lg transition duration-200 ${
                registrosSeleccionados.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
              disabled={registrosSeleccionados.length === 0}
            >
              Generar Orden de Pago
            </button>
          </div>
        </div>
      )}

      {/* Sección de órdenes de pago */}
      <div className="mt-8">
        <h2>Órdenes de Pago</h2>
        {sinOrdenes ? (
          <p>No hay órdenes de pago pendientes por pagar.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-black p-2">Monto</th>
                <th className="border border-black p-2">Fecha Generado</th>
                <th className="border border-black p-2">Concepto</th>
                <th className="border border-black p-2">Orden</th>
              </tr>
            </thead>
            <tbody>
              {ordenesDePago.map((orden) => (
                <tr key={orden.id_pago}>
                  <td className="border border-black p-2">{orden.monto} Bs.</td>
                  <td className="border border-black p-2">{orden.fecha_generado}</td>
                  <td className="border border-black p-2">{orden.concepto}</td>
                  <td className="border border-black p-2 text-center">
                    <a
                      href={orden.orden}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Ver Orden
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrdenesDePago;