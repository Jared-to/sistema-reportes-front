
// Función para preparar datos de exportación para cada gráfica
export const prepareExportData = (processedData, dataType, seriesNames) => {
  if (!processedData || !processedData.rawData || processedData.rawData.length === 0) {
    return [];
  }

  return processedData.rawData.map((registro, index) => {
    const exportItem = {
      'Fecha y Hora': new Date(registro.fecha_hora).toLocaleString(),
      'Timestamp': processedData.timestamps[index],
    };

    // Agregar las series específicas según el tipo de gráfica
    if (dataType === 'temperatura_chiller') {
      exportItem[seriesNames[0]] = registro.temp_linea_chiller;
    } else if (dataType === 'temperatura_aux') {
      exportItem[seriesNames[0]] = registro.temp_linea_aux;
    } else if (dataType === 'flujo_chiller') {
      exportItem[seriesNames[0]] = registro.flujo_chiller;
    } else if (dataType === 'flujo_aux') {
      exportItem[seriesNames[0]] = registro.flujo_linea_aux;
    } else if (dataType === 'corriente_chiller') {
      exportItem[seriesNames[0]] = registro.corriente_chiller;
    } else if (dataType === 'corriente_compresor') {
      exportItem[seriesNames[0]] = registro.corriente_compresor;
    } else if (dataType === 'estado_principal') {
      exportItem[seriesNames[0]] = registro.linea_principal;
    } else if (dataType === 'estado_auxiliar') {
      exportItem[seriesNames[0]] = registro.linea_aux;
    } else if (dataType === 'comparativa_temperaturas') {
      exportItem['Temperatura Chiller'] = registro.temp_linea_chiller;
      exportItem['Temperatura Auxiliar'] = registro.temp_linea_aux;
      exportItem['Diferencia'] = registro.temp_linea_chiller - registro.temp_linea_aux;
    }

    return exportItem;
  });
};