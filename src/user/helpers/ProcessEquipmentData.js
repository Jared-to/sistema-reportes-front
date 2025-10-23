
// Función para procesar los datos de la API
export const processEquipmentData = (registros, periodo) => {
  if (!registros || registros.length === 0) {
    return {
      timestamps: [],
      corriente_chiller: [],
      corriente_compresor: [],
      temp_linea_chiller: [],
      temp_linea_aux: [],
      flujo_chiller: [],
      flujo_linea_aux: [],
      estado_linea_principal: [],
      estado_linea_aux: [],
      rawData: [] // Datos crudos para exportación
    };
  }

  // Ordenar registros por fecha
  const sortedRegistros = [...registros].sort((a, b) =>
    new Date(a.fecha_hora) - new Date(b.fecha_hora)
  );

  return {
    timestamps: sortedRegistros.map(reg => {
      const date = new Date(reg.fecha_hora);
      if (periodo === '24h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      }
    }),
    corriente_chiller: sortedRegistros.map(reg => reg.corriente_chiller),
    corriente_compresor: sortedRegistros.map(reg => reg.corriente_compresor),
    temp_linea_chiller: sortedRegistros.map(reg => reg.temp_linea_chiller),
    temp_linea_aux: sortedRegistros.map(reg => reg.temp_linea_aux),
    flujo_chiller: sortedRegistros.map(reg => reg.flujo_chiller),
    flujo_linea_aux: sortedRegistros.map(reg => reg.flujo_linea_aux),
    estado_linea_principal: sortedRegistros.map(reg => reg.linea_principal),
    estado_linea_aux: sortedRegistros.map(reg => reg.linea_aux),
    rawData: sortedRegistros // Datos completos para exportación
  };
};