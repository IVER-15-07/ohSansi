import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FileSpreadsheet, FileText } from "lucide-react";
const ExportarReportes = ({ reportesFiltrados, camposAdicionales, camposTutor, nombreOlimpiada }) => {
    // Etiquetas para las columnas
    const columnLabels = {
        nombres: "Nombres postulante",
        ci: "CI",
        area: "Área",
        categoria: "Categoría",
        correo: "Correo Electronico",
        encargado_nombres: "Nombres Responsablee",
        encargado_ci: "CI Responsable",
        encargado_correo: "Correo Responsable",
        estado_pago: "Estado de Pago",
        validado: "Validado",
        tipo_inscripcion: "Tipo de Inscripcion",
    };

    const visibleColumns = [
        "nombres",
        "ci",
        "area",
        "categoria",
        ...camposAdicionales,
        "encargado_nombres",
        "encargado_ci",
        "encargado_correo",
        "estado_pago",
        "validado",
        "tipo_inscripcion",
    ];

    // Prepara los datos para exportar
    const exportData = reportesFiltrados.map((r) => {
        const row = {
            nombres: `${r.postulante.nombres} ${r.postulante.apellidos || ""}`,
            ci: r.postulante.ci,
            area: r.postulante.area_categoria.area,
            categoria: r.postulante.area_categoria.categoria,
            estado_pago: r.estado_pago,
            validado: r.validado,
            tipo_inscripcion: r.tipo_inscripcion,
            encargado_nombres: `${r.encargado?.nombres || ""} ${r.encargado?.apellidos || ""}`,
            encargado_ci: r.encargado?.ci || "",
            encargado_correo: r.encargado?.correo || "",
        };
        // Campos adicionales del postulante
        camposAdicionales.forEach((campo) => {
            const dato = (r.postulante.datos_adicionales?.[0] || []).find((d) => d.campo === campo);
            row[campo] = dato ? dato.valor : "";
        });
        // Campos adicionales del tutor
        camposTutor.forEach((campo) => {
            const dato = (r.tutor?.datos_adicionales?.[0] || []).find((d) => d.campo === campo);
            row[`tutor_${campo}`] = dato ? dato.valor : "";
        });
        return row;
    });

    // Exportar a PDF
    const exportToPDF = () => {
        // Cambia aquí la orientación a landscape
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(18);
        doc.text(
            `Reporte de Inscripciones - ${nombreOlimpiada || "Olimpiada"}`,
            14,
            22
        );
        doc.setFontSize(11);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = visibleColumns.map((col) => columnLabels[col] || col);
        const tableRows = exportData.map((item) => visibleColumns.map((col) => item[col]));

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 1 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        doc.save("reporte-inscripciones.pdf");
    };

    // Exportar a Excel
    const exportToExcel = () => {
        const excelData = exportData.map((item) => {
            const row = {};
            visibleColumns.forEach((col) => {
                row[columnLabels[col] || col] = item[col];
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inscripciones");
        worksheet["!cols"] = visibleColumns.map(() => ({ wch: 20 }));
        XLSX.writeFile(workbook, "reporte-inscripciones.xlsx");
    };

    return (
        <div>
            <div className="flex gap-4 mb-6">
                <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                    <FileText size={18} /> Exportar a PDF
                </button>
                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                    <FileSpreadsheet size={18} /> Exportar a Excel
                </button>
            </div>
        </div>
    )
}

export default ExportarReportes
