import { useEffect, useRef, useState } from "react";
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
  Button
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import * as echarts from "echarts";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSensoresStore } from "../../../hooks/useSensoresStore";
import { ModalActivacion } from "./components/ModalActivacion";

// Componente de gráfica reutilizable
const ChartComponent = ({ title, data, xAxisData, yAxisName, seriesNames, colors }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const chartInstance = echarts.init(chartRef.current, 'dark');

    const seriesData = seriesNames.map((name, index) => ({
      name,
      type: 'line',
      data: data[index],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2
      },
      color: colors ? colors[index] : undefined
    }));

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: seriesNames,
        bottom: 10,
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      series: seriesData
    };

    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, [data, xAxisData, title, yAxisName, seriesNames, colors]);

  return (
    <Paper sx={{ height: '400px', bgcolor: 'transparent' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </Paper>
  );
};

// Función para procesar los datos de la API
const processEquipmentData = (registros, periodo) => {
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
      estado_linea_aux: []
    };
  }

  // Ordenar registros por fecha
  const sortedRegistros = [...registros].sort((a, b) =>
    new Date(a.fecha_hora) - new Date(b.fecha_hora)
  );

  return {
    timestamps: sortedRegistros.map(reg => {
      const date = new Date(reg.fecha_hora);
      // Formatear según el período seleccionado
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
    estado_linea_aux: sortedRegistros.map(reg => reg.linea_aux)
  };
};

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
  const [modalActivacion, setModalActivacion] = useState(false)

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
  const handleOpenModal = () => setModalActivacion(true);
  const handleCloseModal = () => setModalActivacion(false);

  useEffect(() => {
    handleGetData();
  }, [institucion, resonador, periodo]);

  // Función para obtener los datos de la métrica seleccionada
  const getSelectedMetricData = () => {
    if (!processedData) return { data: [], yAxisName: '', seriesNames: [], colors: [] };

    const metricConfig = {
      temp_linea_chiller: {
        data: [processedData.temp_linea_chiller],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Chiller'],
        colors: ['#ff6b6b']
      },
      temp_linea_aux: {
        data: [processedData.temp_linea_aux],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Línea Aux'],
        colors: ['#6a0572']
      },
      flujo_chiller: {
        data: [processedData.flujo_chiller],
        yAxisName: 'Flujo (L/min)',
        seriesNames: ['Flujo Chiller'],
        colors: ['#4ecdc4']
      },
      corriente_chiller: {
        data: [processedData.corriente_chiller],
        yAxisName: 'Corriente (A)',
        seriesNames: ['Corriente Chiller'],
        colors: ['#ffe66d']
      },
      corriente_compresor: {
        data: [processedData.corriente_compresor],
        yAxisName: 'Corriente (A)',
        seriesNames: ['Corriente Compresor'],
        colors: ['#3d5a80']
      },
      estado_linea_principal: {
        data: [processedData.estado_linea_principal],
        yAxisName: 'Estado (0/1)',
        seriesNames: ['Línea Principal'],
        colors: ['#9c27b0']
      },
      estado_linea_aux: {
        data: [processedData.estado_linea_aux],
        yAxisName: 'Estado (0/1)',
        seriesNames: ['Línea Auxiliar'],
        colors: ['#f50057']
      }
    };

    return metricConfig[selectedMetric] || metricConfig.temp_linea_chiller;
  };

  // Función para obtener los datos de la métrica de temperatura seleccionada
  const getSelectedTempMetricData = () => {
    if (!processedData) return { data: [], yAxisName: '', seriesNames: [], colors: [] };

    const tempMetricConfig = {
      temp_linea_chiller: {
        data: [processedData.temp_linea_chiller],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Chiller'],
        colors: ['#ff6b6b']
      },
      temp_linea_aux: {
        data: [processedData.temp_linea_aux],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Línea Aux'],
        colors: ['#6a0572']
      },
      comparativa_temperaturas: {
        data: [processedData.temp_linea_chiller, processedData.temp_linea_aux],
        yAxisName: 'Temperatura (°C)',
        seriesNames: ['Temp. Chiller', 'Temp. Línea Aux'],
        colors: ['#ff6b6b', '#6a0572']
      },
      diferencia_temperaturas: {
        data: [processedData.temp_linea_chiller.map((temp, index) =>
          temp - processedData.temp_linea_aux[index]
        )],
        yAxisName: 'Diferencia (°C)',
        seriesNames: ['Diferencia (Chiller - Aux)'],
        colors: ['#4ecdc4']
      }
    };

    return tempMetricConfig[selectedTempMetric] || tempMetricConfig.temp_linea_chiller;
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
      <Box display={'flex'} justifyContent={'right'} mb={3} gap={2}>
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
                label={equipoData.linea_principal === 1 ? "ON" : "OFF"}
                color={equipoData.linea_principal === 1 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
              <Typography>
                Estado Compresor
              </Typography>
              <Chip
                label={equipoData.linea_principal === 1 ? "ON" : "OFF"}
                color={equipoData.linea_principal === 1 ? "success" : "warning"}
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
                {equipoData.flujo_chiller} L/min
              </Typography>
              <Typography>
                Temp. Linea Chiller
              </Typography>
              <Typography fontWeight={800}>
                {equipoData.temp_linea_chiller} °C
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
                {equipoData.flujo_linea_aux} L/min
              </Typography>
              <Typography>
                Temp. Linea Auxiliar
              </Typography>
              <Typography fontWeight={800}>
                {equipoData.temp_linea_aux} °C
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
                {equipoData.corriente_chiller} A
              </Typography>
              <Typography>
                Consumo Corriente Compresor
              </Typography>
              <Typography fontWeight={800}>
                {equipoData.corriente_compresor} A
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
                label={equipoData.linea_principal === 1 ? "ON" : "OFF"}
                color={equipoData.linea_principal === 1 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
              <Typography>
                Linea Auxiliar
              </Typography>
              <Chip
                label={equipoData.linea_aux === 1 ? "ON" : "OFF"}
                color={equipoData.linea_aux === 1 ? "success" : "warning"}
                size="small"
                sx={{ my: 0.5 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* Nueva gráfica con selector de métricas generales */}
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
          />
        </Paper>
      </Box>

      {/* Nueva gráfica con selector de temperaturas */}
      <Box mb={3}>
        <Paper sx={{ p: 2, bgcolor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="white">
              Gráfica de Temperaturas
            </Typography>
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel id="temp-metric-select-label" sx={{ color: 'white' }}>Seleccionar Temperatura</InputLabel>
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
                <MenuItem value="diferencia_temperaturas">Diferencia de Temperaturas</MenuItem>
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
          />
        </Paper>
      </Box>



      <Grid container spacing={3}>
        {/* CURVA TEMPERATURA 1 (CHILLER - COMPRESOR) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA TEMPERATURA 1 (CHILLER - COMPRESOR)"
            data={[processedData.temp_linea_chiller]}
            xAxisData={processedData.timestamps}
            yAxisName="Temperatura (°C)"
            seriesNames={['Temp. Chiller']}
            colors={['#ff6b6b']}
          />
        </Grid>

        {/* CURVA FLUJO 1 (CHILLER - COMPRESOR) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FLUJO 1 (CHILLER - COMPRESOR)"
            data={[processedData.flujo_chiller]}
            xAxisData={processedData.timestamps}
            yAxisName="Flujo (L/min)"
            seriesNames={['Flujo Chiller']}
            colors={['#4ecdc4']}
          />
        </Grid>

        {/* CURVA SENSOR CORRIENTE CHILLER */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA SENSOR CORRIENTE CHILLER"
            data={[processedData.corriente_chiller]}
            xAxisData={processedData.timestamps}
            yAxisName="Corriente (A)"
            seriesNames={['Corriente Chiller']}
            colors={['#ffe66d']}
          />
        </Grid>

        {/* CURVA TEMPERATURA 2 (AUXILIAR - COMPRESOR) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA TEMPERATURA 2 (AUXILIAR - COMPRESOR)"
            data={[processedData.temp_linea_aux]}
            xAxisData={processedData.timestamps}
            yAxisName="Temperatura (°C)"
            seriesNames={['Temp. Línea Aux']}
            colors={['#6a0572']}
          />
        </Grid>

        {/* CURVA FLUJO 2 (AUXILIAR - COMPRESOR) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title={"CURVA FLUJO 2 (AUXILIAR - COMPRESOR)"}
            data={[processedData.flujo_linea_aux]}
            xAxisData={processedData.timestamps}
            yAxisName={"Flujo (L/min)"}
            seriesNames={['Flujo Línea Aux']}
            colors={['#1a936f']}
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
          />
        </Grid>

        {/* CURVA FUNCIONALIDAD ESTADO LINEA PRINCIPAL */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FUNCIONALIDAD ESTADO LINEA PRINCIPAL"
            data={[processedData.estado_linea_principal]}
            xAxisData={processedData.timestamps}
            yAxisName="Estado (0/1)"
            seriesNames={['Línea Principal']}
            colors={['#9c27b0']}
          />
        </Grid>

        {/* CURVA FUNCIONALIDAD ESTADO LINEA AUXILIAR */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartComponent
            title="CURVA FUNCIONALIDAD ESTADO LINEA AUXILIAR"
            data={[processedData.estado_linea_aux]}
            xAxisData={processedData.timestamps}
            yAxisName="Estado (0/1)"
            seriesNames={['Línea Auxiliar']}
            colors={['#f50057']}
          />
        </Grid>
      </Grid>
      <ModalActivacion
        open={modalActivacion}
        onClose={handleCloseModal}
        equipo={equipoData}
      />
    </Box>
  );
};