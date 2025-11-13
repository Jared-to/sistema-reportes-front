import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';

import { useSensoresStore } from "../../../hooks/useSensoresStore";
import { ModalActivacion } from "./components/ModalActivacion";
import { exportToCSV } from "./utils/ExportCSV";
import { ChartComponent } from "./components/ChartComponent";
import { processEquipmentData } from "../../helpers/ProcessEquipmentData";
import { prepareExportData } from "./utils/PrepareExportData";



export const PagEquipoInfo = () => {
  const navigate = useNavigate();
  const { institucion, resonador } = useParams();
  const { getEquipo, getRegistros } = useSensoresStore();
  const [periodo, setPeriodo] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('temp_linea_chiller');
  const [selectedTempMetric, setSelectedTempMetric] = useState('temp_linea_chiller');
  const [equipoData, setEquipoData] = useState({});
  const [registrosData, setRegistrosData] = useState([]);
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalActivacion, setModalActivacion] = useState(false);

  // Obtener el último registro para mostrar los valores actuales
  const getUltimoRegistro = () => {
    if (!registrosData || registrosData.length === 0) return null;

    // Ordenar por fecha_hora descendente y tomar el primero
    const registrosOrdenados = [...registrosData].sort((a, b) =>
      new Date(b.fecha_hora) - new Date(a.fecha_hora)
    );

    return registrosOrdenados[0];
  };

  const ultimoRegistro = getUltimoRegistro();
  // Obtener datos del equipo y registros
  const handleGetData = async () => {
    setLoading(true);
    try {
      const equipo = await getEquipo(institucion, resonador);
      setEquipoData(equipo || {});

      const registros = await getRegistros(institucion, resonador, periodo);
      setRegistrosData(registros || []);

      // Procesar datos para las gráficas
      const processed = processEquipmentData(registros, periodo);
      setProcessedData(processed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar datos en tiempo real (sin loading)
  const handleUpdateData = useCallback(async () => {
    if (loading) return;
    try {
      const equipo = await getEquipo(institucion, resonador);
      setEquipoData(equipo || {});

      const registros = await getRegistros(institucion, resonador, periodo);
      setRegistrosData(registros || []);

      const processed = processEquipmentData(registros, periodo);
      setProcessedData(processed);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  }, [institucion, resonador, periodo,]);


  const handleOpenModal = () => setModalActivacion(true);
  const handleCloseModal = () => setModalActivacion(false);

  useEffect(() => {
    handleGetData();
  }, [institucion, resonador, periodo]);

  // Efecto para actualizaciones automáticas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      handleUpdateData();
    }, 30000);

    return () => clearInterval(interval);
  }, [institucion, resonador, periodo]);



  // Función para obtener los datos de la métrica seleccionada
  const getSelectedMetricData = () => {
    if (!processedData) return { data: [], yAxisName: '', seriesNames: [], colors: [], exportData: [] };

    // En la función getSelectedMetricData, cambia esto:
    const metricConfig = {
      temp_linea_chiller: {
        data: [processedData.temp_linea_chiller],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Chiller'],
        colors: ['#ff6b6b'],
        exportData: prepareExportData(processedData, 'temperatura_chiller', ['Temperatura Chiller (°C)'])
      },
      temp_linea_aux: {
        data: [processedData.temp_linea_aux],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Línea Aux'],
        colors: ['#6a0572'],
        exportData: prepareExportData(processedData, 'temperatura_aux', ['Temperatura Auxiliar (°C)'])
      },
      flujo_chiller: {
        data: [processedData.flujo_chiller],
        yAxisName: 'Flujo (L/min)',
        seriesNames: ['Flujo Chiller'],
        colors: ['#4ecdc4'],
        exportData: prepareExportData(processedData, 'flujo_chiller', ['Flujo Chiller (L/min)'])
      },
      // CORREGIDO: Cambiar de "flujo_auxiliar" a "flujo_linea_aux"
      flujo_linea_aux: {
        data: [processedData.flujo_linea_aux],
        yAxisName: 'Flujo (L/min)',
        seriesNames: ['Flujo Auxiliar'],
        colors: ['#4ecdc4'],
        exportData: prepareExportData(processedData, 'flujo_aux', ['Flujo Auxiliar (L/min)'])
      },
      corriente_chiller: {
        data: [processedData.corriente_chiller],
        yAxisName: 'Corriente (A)',
        seriesNames: ['Corriente Chiller'],
        colors: ['#ffe66d'],
        exportData: prepareExportData(processedData, 'corriente_chiller', ['Corriente Chiller (A)'])
      },
      corriente_compresor: {
        data: [processedData.corriente_compresor],
        yAxisName: 'Corriente (A)',
        seriesNames: ['Corriente Compresor'],
        colors: ['#3d5a80'],
        exportData: prepareExportData(processedData, 'corriente_compresor', ['Corriente Compresor (A)'])
      },
      estado_linea_principal: {
        data: [processedData.estado_linea_principal],
        yAxisName: 'Estado (0/1)',
        seriesNames: ['Línea Principal'],
        colors: ['#9c27b0'],
        exportData: prepareExportData(processedData, 'estado_principal', ['Estado Línea Principal'])
      },
      estado_linea_aux: {
        data: [processedData.estado_linea_aux],
        yAxisName: 'Estado (0/1)',
        seriesNames: ['Línea Auxiliar'],
        colors: ['#f50057'],
        exportData: prepareExportData(processedData, 'estado_auxiliar', ['Estado Línea Auxiliar'])
      }
    };

    return metricConfig[selectedMetric] || metricConfig.temp_linea_chiller;
  };

  // Función para obtener los datos de la métrica de temperatura seleccionada
  const getSelectedTempMetricData = () => {
    if (!processedData) return { data: [], yAxisName: '', seriesNames: [], colors: [], exportData: [] };

    const tempMetricConfig = {
      temp_linea_chiller: {
        data: [processedData.temp_linea_chiller],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Chiller'],
        colors: ['#ff6b6b'],
        exportData: prepareExportData(processedData, 'temperatura_chiller', ['Temperatura Chiller (°C)'])
      },
      temp_linea_aux: {
        data: [processedData.temp_linea_aux],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Línea Aux'],
        colors: ['#6a0572'],
        exportData: prepareExportData(processedData, 'temperatura_aux', ['Temperatura Auxiliar (°C)'])
      },
      comparativa_temperaturas: {
        data: [processedData.temp_linea_chiller, processedData.temp_linea_aux],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Chiller', 'Temp. Línea Aux'],
        colors: ['#ff6b6b', '#6a0572'],
        exportData: prepareExportData(processedData, 'comparativa_temperaturas', ['Temperatura Chiller', 'Temperatura Auxiliar'])
      },
      diferencia_temperaturas: {
        data: [processedData.temp_linea_chiller.map((temp, index) =>
          temp - processedData.temp_linea_aux[index]
        )],
        yAxisName: 'Diferencia (°C)',
        seriesNames: ['Diferencia (Chiller - Aux)'],
        colors: ['#4ecdc4'],
        exportData: prepareExportData(processedData, 'comparativa_temperaturas', ['Diferencia Temperaturas'])
      }
    };

    return tempMetricConfig[selectedTempMetric] || tempMetricConfig.temp_linea_chiller;
  };

  // Exportar todos los datos
  const handleExportAllData = () => {
    if (!processedData || !processedData.rawData || processedData.rawData.length === 0) return;

    const allData = processedData.rawData.map(registro => ({
      'Fecha y Hora': new Date(registro.fecha_hora).toLocaleString(),
      'Temperatura Chiller (°C)': registro.temp_linea_chiller,
      'Temperatura Auxiliar (°C)': registro.temp_linea_aux,
      'Flujo Chiller (L/min)': registro.flujo_chiller,
      'Flujo Auxiliar (L/min)': registro.flujo_linea_aux,
      'Corriente Chiller (A)': registro.corriente_chiller,
      'Corriente Compresor (A)': registro.corriente_compresor,
      'Estado Línea Principal': registro.linea_principal,
      'Estado Línea Auxiliar': registro.linea_aux,
      'Diferencia Temperaturas (°C)': registro.temp_linea_chiller - registro.temp_linea_aux
    }));

    exportToCSV(allData, `Datos_Completos_${resonador}`);
  };

  if (loading) {
    return (
      <Box sx={{ color: 'white', textAlign: 'center', py: 4 }}>
        <Typography>Cargando datos del equipo...</Typography>
      </Box>
    );
  }

  if (!processedData || registrosData.length === 0) {
    return (
      <Box sx={{ color: 'white' }}>
        <Box display={'flex'} justifyContent={'right'} mb={3}>
          <Button
            onClick={() => navigate(-1)}
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
            }}
          >
            Volver
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          Monitor del Equipo: {resonador}
        </Typography>
        <Typography color="error">
          No hay datos disponibles para este equipo en el período seleccionado.
        </Typography>
      </Box>
    );
  }

  const selectedMetricData = getSelectedMetricData();
  const selectedTempMetricData = getSelectedTempMetricData();


  return (
    <Box sx={{ color: 'white' }}>
      <Box display={'flex'} justifyContent={'right'} flexDirection={{ xs: 'column', md: 'row' }} mb={3} gap={2}>
        <Button
          onClick={() => navigate(-1)}
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
          }}
        >
          Volver
        </Button>
        <Button
          onClick={handleOpenModal}
          variant="contained"
          sx={{
            borderRadius: 2,
            backgroundColor: '#0d6efd',
            color: 'white',
          }}
        >
          Activacion Remota
        </Button>
        <Button
          onClick={() => navigate('curvas')}
          variant="outlined"
          sx={{
            borderRadius: 2,
            color: '#0d6efd',
          }}
        >
          Curvas
        </Button>
        <Button
          onClick={handleExportAllData}
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            borderRadius: 2,
            borderColor: '#4ecdc4',
            color: '#4ecdc4',
            '&:hover': {
              borderColor: '#4ecdc4',
              backgroundColor: 'rgba(78, 205, 196, 0.1)',
            }
          }}
        >
          Exportar Todos los Datos
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Monitor del Equipo: {resonador}
        </Typography>

        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="periodo-select-label" sx={{ color: 'white' }}>Período</InputLabel>
          <Select
            labelId="periodo-select-label"
            value={periodo}
            label="Período"
            onChange={(e) => setPeriodo(e.target.value)}
            sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
          >
            <MenuItem value="24h">24 horas</MenuItem>
            <MenuItem value="semana">1 semana</MenuItem>
            <MenuItem value="mes">1 mes</MenuItem>
            <MenuItem value="semestre">6 meses</MenuItem>
            <MenuItem value="año">1 año</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tarjetas de Estado */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography fontWeight={600}>
              Estado Elementos
            </Typography>
            <Box p={1} border={'1px solid rgba(255, 255, 255, 0.1)'} borderRadius={2} display="flex" flexDirection="column" >
              <Typography>
                Estado Chiller
              </Typography>
              <Chip
                label={ultimoRegistro.linea_principal === 1 ? "ON" : "OFF"}
                color={ultimoRegistro.linea_principal === 1 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
              <Typography>
                Estado Compresor
              </Typography>
              <Chip
                label={ultimoRegistro.corriente_compresor > 0 ? "ON" : "OFF"}
                color={ultimoRegistro.corriente_compresor > 0 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography fontWeight={600}>
              Linea Principal
            </Typography>
            <Box p={1} border={'1px solid rgba(255, 255, 255, 0.1)'} borderRadius={2} display="flex" flexDirection="column" >
              <Typography>
                Flujo Chiller - Compresor
              </Typography>
              <Typography fontWeight={800}>
                {ultimoRegistro.flujo_chiller} L/min
              </Typography>
              <Typography>
                Temp. Linea Chiller
              </Typography>
              <Typography fontWeight={800}>
                {ultimoRegistro.temp_linea_chiller} °C
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography fontWeight={600}>
              Linea Auxiliar
            </Typography>
            <Box p={1} border={'1px solid rgba(255, 255, 255, 0.1)'} borderRadius={2} display="flex" flexDirection="column" >
              <Typography>
                Flujo Linea Auxiliar
              </Typography>
              <Typography fontWeight={800}>
                {ultimoRegistro.flujo_linea_aux} L/min
              </Typography>
              <Typography>
                Temp. Linea Auxiliar
              </Typography>
              <Typography fontWeight={800}>
                {ultimoRegistro.temp_linea_aux} °C
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography fontWeight={600}>
              Consumo corriente
            </Typography>
            <Box p={1} border={'1px solid rgba(255, 255, 255, 0.1)'} borderRadius={2} display="flex" flexDirection="column" >
              <Typography>
                Consumo Corriente Chiller
              </Typography>
              <Typography fontWeight={800}>
                {ultimoRegistro.corriente_chiller} A
              </Typography>
              <Typography>
                Consumo Corriente Compresor
              </Typography>
              <Typography fontWeight={800}>
                {ultimoRegistro.corriente_compresor} A
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography fontWeight={600}>
              Estado Linea
            </Typography>
            <Box p={1} border={'1px solid rgba(255, 255, 255, 0.1)'} borderRadius={2} display="flex" flexDirection="column" >
              <Typography>
                Linea Principal
              </Typography>
              <Chip
                label={ultimoRegistro.linea_principal === 1 ? "ON" : "OFF"}
                color={ultimoRegistro.linea_principal === 1 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
              <Typography>
                Linea Auxiliar
              </Typography>
              <Chip
                label={ultimoRegistro.linea_aux === 1 ? "ON" : "OFF"}
                color={ultimoRegistro.linea_aux === 1 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>


      {/* Grid de Gráficas Individuales */}
      <Grid container spacing={3}>
        {/* CORREGIDO: Nombres de archivo específicos para cada gráfica */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA TEMPERATURA 1 (CHILLER - COMPRESOR)"
            data={[processedData.temp_linea_chiller]}
            xAxisData={processedData.timestamps}
            yAxisName="Temperatura (°C)"
            seriesNames={['Temp. Chiller']}
            colors={['#ff6b6b']}
            exportData={prepareExportData(processedData, 'temperatura_chiller', ['Temperatura Chiller (°C)'])}
            exportFilename={`Temperatura_Chiller_${resonador}`}
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA TEMPERATURA 2 (AUXILIAR - COMPRESOR)"
            data={[processedData.temp_linea_aux]}
            xAxisData={processedData.timestamps}
            yAxisName="Temperatura (°C)"
            seriesNames={['Temp. Línea Aux']}
            colors={['#6a0572']}
            exportData={prepareExportData(processedData, 'temperatura_aux', ['Temperatura Auxiliar (°C)'])}
            exportFilename={`Temperatura_Auxiliar_${resonador}`}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FLUJO 1 (CHILLER - COMPRESOR)"
            data={[processedData.flujo_chiller]}
            xAxisData={processedData.timestamps}
            yAxisName="Flujo (L/min)"
            seriesNames={['Flujo Chiller']}
            colors={['#4ecdc4']}
            exportData={prepareExportData(processedData, 'flujo_chiller', ['Flujo Chiller (L/min)'])}
            exportFilename={`Flujo_Chiller_${resonador}`}
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FLUJO 2 (AUXILIAR - COMPRESOR)"
            data={[processedData.flujo_linea_aux]}
            xAxisData={processedData.timestamps}
            yAxisName="Flujo (L/min)"
            seriesNames={['Flujo Línea Aux']}
            colors={['#1a936f']}
            exportData={prepareExportData(processedData, 'flujo_aux', ['Flujo Auxiliar (L/min)'])}
            exportFilename={`Flujo_Auxiliar_${resonador}`}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA SENSOR CORRIENTE CHILLER"
            data={[processedData.corriente_chiller]}
            xAxisData={processedData.timestamps}
            yAxisName="Corriente (A)"
            seriesNames={['Corriente Chiller']}
            colors={['#ffe66d']}
            exportData={prepareExportData(processedData, 'corriente_chiller', ['Corriente Chiller (A)'])}
            exportFilename={`Corriente_Chiller_${resonador}`}
          />
        </Grid>


        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA SENSOR CORRIENTE COMPRESOR"
            data={[processedData.corriente_compresor]}
            xAxisData={processedData.timestamps}
            yAxisName="Corriente (A)"
            seriesNames={['Corriente Compresor']}
            colors={['#3d5a80']}
            exportData={prepareExportData(processedData, 'corriente_compresor', ['Corriente Compresor (A)'])}
            exportFilename={`Corriente_Compresor_${resonador}`}
          />
        </Grid>

        {/* Gráficas sin exportación (opcional) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FUNCIONALIDAD ESTADO LINEA PRINCIPAL"
            data={[processedData.estado_linea_principal]}
            xAxisData={processedData.timestamps}
            yAxisName="Estado (0/1)"
            seriesNames={['Línea Principal']}
            colors={['#9c27b0']}
            exportData={prepareExportData(processedData, 'estado_principal', ['Estado Línea Principal'])}
            exportFilename={`Estado_Principal_${resonador}`}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FUNCIONALIDAD ESTADO LINEA AUXILIAR"
            data={[processedData.estado_linea_aux]}
            xAxisData={processedData.timestamps}
            yAxisName="Estado (0/1)"
            seriesNames={['Línea Auxiliar']}
            colors={['#f50057']}
            exportData={prepareExportData(processedData, 'estado_auxiliar', ['Estado Línea Auxiliar'])}
            exportFilename={`Estado_Auxiliar_${resonador}`}
          />
        </Grid>
      </Grid>

      {/* Gráficas con selectores */}
      <Box mb={3}>
        <Paper sx={{ p: 2, bgcolor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="white">
              Gráfica de Métricas
            </Typography>
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel id="metric-select-label" sx={{ color: 'white' }}>Seleccionar Métrica</InputLabel>
              <Select
                labelId="metric-select-label"
                value={selectedMetric}
                label="Seleccionar Métrica"
                onChange={(e) => setSelectedMetric(e.target.value)}
                sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
              >
                <MenuItem value="temp_linea_chiller">Temperatura Agua Chiller a Compresor</MenuItem>
                <MenuItem value="temp_linea_aux">Temperatura Agua Auxiliar a Compresor</MenuItem>
                <MenuItem value="flujo_chiller">Flujo Agua Chiller a Compresor</MenuItem>
                <MenuItem value="flujo_linea_aux"> Flujo Agua Auxiliar a Compreso</MenuItem>
                <MenuItem value="corriente_chiller">Corriente Consumida Chiller</MenuItem>
                <MenuItem value="corriente_compresor">Corriente Consumida Compresor</MenuItem>
                <MenuItem value="estado_linea_principal">Estado Línea Principal</MenuItem>
                <MenuItem value="estado_linea_aux">Estado Línea Auxiliar</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ChartComponent
            title={`CURVA DE ${selectedMetricData.seriesNames[0].toUpperCase()}`}
            data={selectedMetricData.data}
            xAxisData={processedData.timestamps}
            yAxisName={selectedMetricData.yAxisName}
            seriesNames={selectedMetricData.seriesNames}
            colors={selectedMetricData.colors}
            exportData={selectedMetricData.exportData}
            exportFilename={`${selectedMetric}_${resonador}`}
          />
        </Paper>
      </Box>

      <Box mb={3}>
        <Paper sx={{ p: 2, bgcolor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="white">
              Gráfica de Métricas
            </Typography>
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel id="temp-metric-select-label" sx={{ color: 'white' }}>Seleccionar Métrica</InputLabel>
              <Select
                labelId="temp-metric-select-label"
                value={selectedTempMetric}
                label="Seleccionar Temperatura"
                onChange={(e) => setSelectedTempMetric(e.target.value)}
                sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
              >
                <MenuItem value="temp_linea_chiller">Temperatura Agua Chiller a Compresor</MenuItem>
                <MenuItem value="temp_linea_aux">Temperatura Agua Auxiliar a Compresor</MenuItem>
                <MenuItem value="comparativa_temperaturas">Comparativa de Temperaturas</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ChartComponent
            title={`CURVA DE ${selectedTempMetricData.seriesNames.join(' Y ').toUpperCase()}`}
            data={selectedTempMetricData.data}
            xAxisData={processedData.timestamps}
            yAxisName={selectedTempMetricData.yAxisName}
            seriesNames={selectedTempMetricData.seriesNames}
            colors={selectedTempMetricData.colors}
            exportData={selectedTempMetricData.exportData}
            exportFilename={`${selectedTempMetric}_${resonador}`}
          />
        </Paper>
      </Box>


      <ModalActivacion
        open={modalActivacion}
        onClose={handleCloseModal}
        equipo={equipoData}
      />
    </Box>
  );
};