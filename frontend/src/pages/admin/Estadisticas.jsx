import React from 'react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Estadisticas = ({ reportes }) => {

     // Estadísticas por área
  const areaStats = reportes.reduce((acc, curr) => {
    const area = curr.postulante?.area_categoria?.area || "Sin área";
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});
  const areaData = Object.entries(areaStats).map(([name, value]) => ({ name, value }));

  // Estadísticas por categoría
  const nivelStats = reportes.reduce((acc, curr) => {
    const nivel = curr.postulante?.area_categoria?.categoria || "Sin categoría";
    acc[nivel] = (acc[nivel] || 0) + 1;
    return acc;
  }, {});
  const nivelData = Object.entries(nivelStats).map(([name, value]) => ({ name, value }));

  // Estadísticas por estado de pago
  const pagoStats = reportes.reduce((acc, curr) => {
    const estado = curr.estado_pago || "Sin dato";
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});
  const pagoData = Object.entries(pagoStats).map(([name, value]) => ({ name, value }));

  // Estadísticas por tipo de inscripción
  const tipoStats = reportes.reduce((acc, curr) => {
    const tipo = curr.tipo_inscripcion || "Sin tipo";
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});
  const tipoData = Object.entries(tipoStats).map(([name, value]) => ({ name, value }));

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  return (
       <div className="grid gap-4 md:grid-cols-2 mb-8">
      <div className="bg-white rounded shadow p-4">
        <h4 className="font-bold mb-2">Inscripciones por Área</h4>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h4 className="font-bold mb-2">Inscripciones por Categoría</h4>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={nivelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h4 className="font-bold mb-2">Estado de Pagos</h4>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pagoData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pagoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h4 className="font-bold mb-2">Tipo de Inscripción</h4>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={tipoData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {tipoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Estadisticas
