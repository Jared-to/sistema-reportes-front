import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import * as echarts from "echarts";
import { useSensoresStore } from "../../../hooks/useSensoresStore";
import { processEquipmentData } from "../../helpers/ProcessEquipmentData";
import { ArrowBack } from "@mui/icons-material";


// Componente de gráfica reutilizable
const ChartComponent = ({
  title,
  data,
  xAxisData,
  yAxisName,
  seriesNames,
  colors = ['#ff6b6b', '#4ecdc4', '#ffe66d']
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

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
      color: colors[index]
    }));

    const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#777',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        data: seriesNames,
        bottom: 10,
        textStyle: {
          color: '#fff'
        },
        itemGap: 20
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
        },
        axisLabel: {
          color: '#fff',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#fff',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff'
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
    <Paper sx={{ height: '400px', bgcolor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </Paper>
  );
};

export const PagCurvaInfo = () => {
  const { institucion, resonador } = useParams();
  const { getEquipo, getRegistros } = useSensoresStore();

  const navigate=useNavigate()
  const [periodo, setPeriodo] = useState('24h');
  const [selectedComparison1, setSelectedComparison1] = useState('comparativa_temperaturas');
  const [selectedComparison2, setSelectedComparison2] = useState('comparativa_estados');
  const [equipoData, setEquipoData] = useState({});
  const [registrosData, setRegistrosData] = useState([]);
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos del equipo y registros
  const handleGetData = async () => {
    setLoading(true);
    try {
      const equipo = await getEquipo(institucion, resonador);
      setEquipoData(equipo || {});

      const registros = await getRegistros(institucion, resonador, periodo);
      setRegistrosData(registros || []);

      const processed = processEquipmentData(registros, periodo);
      setProcessedData(processed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, [institucion, resonador, periodo]);

  // Configuración de comparativas disponibles
  const comparisonConfig = {
    comparativa_temperaturas: {
      label: 'Comparativa de Temperaturas',
      data: (processedData) => [
        processedData.temp_linea_chiller,
        processedData.temp_linea_aux
      ],
      seriesNames: ['Temp. Chiller', 'Temp. Línea Aux'],
      yAxisName: 'Temperatura (°C)',
      colors: ['#ff6b6b', '#6a0572']
    },
    comparativa_flujos: {
      label: 'Comparativa de Flujos',
      data: (processedData) => [
        processedData.flujo_chiller,
        processedData.flujo_linea_aux
      ],
      seriesNames: ['Flujo Chiller', 'Flujo Línea Aux'],
      yAxisName: 'Flujo (L/min)',
      colors: ['#4ecdc4', '#1a936f']
    },
    comparativa_corrientes: {
      label: 'Comparativa de Corrientes',
      data: (processedData) => [
        processedData.corriente_chiller,
        processedData.corriente_compresor
      ],
      seriesNames: ['Corriente Chiller', 'Corriente Compresor'],
      yAxisName: 'Corriente (A)',
      colors: ['#ffe66d', '#3d5a80']
    },
    comparativa_estados: {
      label: 'Comparativa Estado Línea Principal vs Auxiliar',
      data: (processedData) => [
        processedData.estado_linea_principal,
        processedData.estado_linea_aux
      ],
      seriesNames: ['Línea Principal', 'Línea Auxiliar'],
      yAxisName: 'Estado (0/1)',
      colors: ['#9c27b0', '#f50057']
    },
    diferencia_temperaturas: {
      label: 'Diferencia de Temperaturas',
      data: (processedData) => [
        processedData.temp_linea_chiller.map((temp, index) =>
          temp - processedData.temp_linea_aux[index]
        )
      ],
      seriesNames: ['Diferencia (Chiller - Aux)'],
      yAxisName: 'Diferencia (°C)',
      colors: ['#ffa726']
    },
    eficiencia_energetica: {
      label: 'Eficiencia Energética',
      data: (processedData) => [
        processedData.corriente_chiller.map((corriente, index) =>
          corriente + (processedData.corriente_compresor[index] || 0)
        )
      ],
      seriesNames: ['Consumo Total'],
      yAxisName: 'Corriente Total (A)',
      colors: ['#26c6da']
    }
  };

  // Obtener datos para la gráfica 1
  const getChart1Data = () => {
    if (!processedData) return { data: [], yAxisName: '', seriesNames: [], colors: [] };

    const config = comparisonConfig[selectedComparison1];
    return {
      data: config.data(processedData),
      yAxisName: config.yAxisName,
      seriesNames: config.seriesNames,
      colors: config.colors
    };
  };

  // Obtener datos para la gráfica 2
  const getChart2Data = () => {
    if (!processedData) return { data: [], yAxisName: '', seriesNames: [], colors: [] };

    const config = comparisonConfig[selectedComparison2];
    return {
      data: config.data(processedData),
      yAxisName: config.yAxisName,
      seriesNames: config.seriesNames,
      colors: config.colors
    };
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
        <Typography variant="h4" gutterBottom>
          Curvas Comparativas: {resonador}
        </Typography>
        <Typography color="error">
          No hay datos disponibles para este equipo en el período seleccionado.
        </Typography>
      </Box>
    );
  }

  const chart1Data = getChart1Data();
  const chart2Data = getChart2Data();


  return (
    <Box sx={{ color: 'white', p: 3 }}>

      <Box display={'flex'} justifyContent={'center'}>
        <Box textAlign={'center'}>
          <Typography variant="h4">
            MAGNETCARE SYSTEM
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            CURVAS DETALLADAS
          </Typography>
          <Typography variant="h6" color="gray">
            {equipoData?.institucion} - {equipoData?.resonador_id}
          </Typography>
        </Box>
      </Box>
      {/*  selectores de período */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="periodo-select-label" sx={{ color: 'white' }}>Rango de Tiempo</InputLabel>
          <Select
            labelId="periodo-select-label"
            value={periodo}
            label="Rango de Tiempo"
            onChange={(e) => setPeriodo(e.target.value)}
            sx={{
              color: 'white',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
            }}
          >
            <MenuItem value="24h">24 horas</MenuItem>
            <MenuItem value="semana">1 semana</MenuItem>
            <MenuItem value="mes">1 mes</MenuItem>
            <MenuItem value="semestre">6 meses</MenuItem>
            <MenuItem value="año">1 año</MenuItem>
          </Select>
        </FormControl>
        <Button
          onClick={() => navigate(-1)}
          variant="contained"
          startIcon={<ArrowBack/>}
          sx={{
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
          }}
        >
          Volver
        </Button>
      </Box>

      {/* Grid de gráficas comparativas */}
      <Grid container spacing={2}>
        {/* Gráfica 1 - Comparativa Principal */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="comparison1-select-label" sx={{ color: 'white' }}>
                Comparativa 1
              </InputLabel>
              <Select
                labelId="comparison1-select-label"
                value={selectedComparison1}
                label="Comparativa 1"
                onChange={(e) => setSelectedComparison1(e.target.value)}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                }}
              >
                {Object.entries(comparisonConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ChartComponent
            title={comparisonConfig[selectedComparison1].label.toUpperCase()}
            data={chart1Data.data}
            xAxisData={processedData.timestamps}
            yAxisName={chart1Data.yAxisName}
            seriesNames={chart1Data.seriesNames}
            colors={chart1Data.colors}
          />
        </Grid>

        {/* Gráfica 2 - Comparativa Secundaria */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="comparison2-select-label" sx={{ color: 'white' }}>
                Comparativa 2
              </InputLabel>
              <Select
                labelId="comparison2-select-label"
                value={selectedComparison2}
                label="Comparativa 2"
                onChange={(e) => setSelectedComparison2(e.target.value)}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                }}
              >
                {Object.entries(comparisonConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ChartComponent
            title={comparisonConfig[selectedComparison2].label.toUpperCase()}
            data={chart2Data.data}
            xAxisData={processedData.timestamps}
            yAxisName={chart2Data.yAxisName}
            seriesNames={chart2Data.seriesNames}
            colors={chart2Data.colors}
          />
        </Grid>
      </Grid>

    </Box>
  );
};