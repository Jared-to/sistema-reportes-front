import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormControl,
  Divider,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormLabel,
  Grid,
  useTheme,
  Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import SettingsIcon from '@mui/icons-material/Settings';
import TerminalIcon from '@mui/icons-material/Terminal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Importar MQTT
import mqtt from 'mqtt';

export const ModalActivacion = ({
  open,
  onClose,
  equipo = {
    resonador_id: "MRI-001",
    institucion: "Clinica Central",
    linea_principal: 1,
    linea_aux: 0
  }
}) => {
  const theme = useTheme();
  const [lineaSeleccionada, setLineaSeleccionada] = useState(
    equipo.linea_principal ? 'principal' : 'auxiliar'
  );
  const [estadoConexion, setEstadoConexion] = useState('desconectado');
  const [modoActual, setModoActual] = useState('');
  const [cambiandoLinea, setCambiandoLinea] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');
  const [topicId, setTopicId] = useState('reso_remotoprueba');
  const [brokerSeleccionado, setBrokerSeleccionado] = useState('emqx');
  const [customUrl, setCustomUrl] = useState('');
  const [probandoBrokers, setProbandoBrokers] = useState(false);
  const [resultadosPrueba, setResultadosPrueba] = useState([]);
  const [logs, setLogs] = useState([]);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [mostrarLogs, setMostrarLogs] = useState(false);

  const clientRef = useRef(null);
  const lastCmdMsRef = useRef(0);

  // Configuración de brokers
  const brokers = {
    emqx: {
      label: 'EMQX',
      url: 'wss://broker.emqx.io:8084/mqtt',
      espConfig: { host: 'broker.emqx.io', port: 1883 }
    },
    hivemq: {
      label: 'HiveMQ',
      url: 'wss://broker.hivemq.com:8884/mqtt',
      espConfig: { host: 'broker.hivemq.com', port: 1883 }
    },
    eclipse: {
      label: 'Eclipse',
      url: 'wss://mqtt.eclipseprojects.io:443/mqtt',
      espConfig: { host: 'mqtt.eclipseprojects.io', port: 1883 }
    },
    mosq: {
      label: 'Mosquitto (test)',
      url: 'wss://test.mosquitto.org:8081/mqtt',
      espConfig: { host: 'test.mosquitto.org', port: 1883 }
    }
  };

  // Configuración de topics MQTT
  const getTopics = () => {
    return {
      desired: `remoteled/${topicId}/desired`,
      reported: `remoteled/${topicId}/reported`,
      status: `remoteled/${topicId}/status`
    };
  };

  // Función para agregar logs
  const agregarLog = (mensaje) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${mensaje}`]);
  };

  // Obtener URL del broker seleccionado
  const getBrokerUrl = () => {
    if (brokerSeleccionado === 'custom') {
      return customUrl;
    }
    return brokers[brokerSeleccionado]?.url || brokers.emqx.url;
  };

  // Obtener configuración ESP32
  const getEspConfig = () => {
    if (brokerSeleccionado === 'custom') {
      try {
        const url = new URL(customUrl);
        return { host: url.hostname, port: 1883 };
      } catch {
        return { host: 'broker.emqx.io', port: 1883 };
      }
    }
    return brokers[brokerSeleccionado]?.espConfig || { host: 'broker.emqx.io', port: 1883 };
  };

  // Probar conexión a un broker
  const probarBroker = async (url, label) => {
    return new Promise((resolve) => {
      let settled = false;

      const testClient = mqtt.connect(url, {
        clientId: 'probe_' + Math.random().toString(16).slice(2, 10),
        reconnectPeriod: 0,
        connectTimeout: 4000,
        keepalive: 20
      });

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        try { testClient.end(true); } catch (e) { }
        resolve({ label, url, ok: false, reason: 'timeout' });
      }, 4500);

      testClient.on('connect', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        try { testClient.end(true); } catch (e) { }
        resolve({ label, url, ok: true });
      });

      testClient.on('error', (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        try { testClient.end(true); } catch (e) { }
        resolve({
          label,
          url,
          ok: false,
          reason: err?.message || 'error'
        });
      });

      testClient.on('close', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve({ label, url, ok: false, reason: 'closed' });
      });
    });
  };

  // Probar broker actual
  const probarBrokerActual = async () => {
    const url = getBrokerUrl();
    if (!url || !/^wss?:\/\//i.test(url)) {
      setError('URL inválida. Debe empezar con ws:// o wss://');
      return;
    }

    setProbandoBrokers(true);
    agregarLog(`Probando broker: ${url}`);

    const label = brokerSeleccionado === 'custom' ? 'Custom' : brokers[brokerSeleccionado]?.label;
    const resultado = await probarBroker(url, label);

    setResultadosPrueba([resultado]);
    setProbandoBrokers(false);
    agregarLog(`Resultado: ${resultado.ok ? '✅ CONECTADO' : '❌ FALLÓ'}`);
  };

  // Probar todos los brokers
  const probarTodosLosBrokers = async () => {
    setProbandoBrokers(true);
    setResultadosPrueba([]);
    agregarLog('Iniciando prueba de todos los brokers...');

    const brokersParaProbar = Object.entries(brokers).map(([key, config]) => ({
      key,
      label: config.label,
      url: config.url
    }));

    if (brokerSeleccionado === 'custom' && customUrl) {
      brokersParaProbar.push({
        key: 'custom',
        label: 'Custom',
        url: customUrl
      });
    }

    const resultados = [];
    for (const broker of brokersParaProbar) {
      agregarLog(`Probando: ${broker.label}`);
      const resultado = await probarBroker(broker.url, broker.label);
      resultados.push(resultado);
    }

    setResultadosPrueba(resultados);
    setProbandoBrokers(false);
    agregarLog('Prueba de brokers completada');
  };

  // Conectar al broker MQTT
  const conectarMQTT = () => {
    if (clientRef.current) {
      try {
        clientRef.current.end();
      } catch (e) {
        console.error('Error cerrando conexión anterior:', e);
      }
      clientRef.current = null;
    }

    setEstadoConexion('conectando');
    setError('');
    agregarLog('Iniciando conexión MQTT...');

    const url = getBrokerUrl();
    if (!url || !/^wss?:\/\//i.test(url)) {
      setError('URL inválida. Debe empezar con ws:// o wss://');
      setEstadoConexion('error');
      return;
    }

    agregarLog(`Conectando a: ${url}`);

    try {
      const client = mqtt.connect(url, {
        clientId: 'react_' + Math.random().toString(16).slice(2, 10),
        reconnectPeriod: 2000,
        connectTimeout: 5000,
        keepalive: 30
      });

      client.on('connect', () => {
        agregarLog('✅ Conectado al broker MQTT');
        setEstadoConexion('conectado');
        const topics = getTopics();

        client.subscribe([topics.reported, topics.status], (err) => {
          if (err) {
            agregarLog(`❌ Error suscribiendo: ${err.message}`);
            setError('Error al suscribirse a los topics');
          } else {
            agregarLog(`✅ Suscrito a: ${topics.reported}, ${topics.status}`);
          }
        });
      });

      client.on('close', () => {
        agregarLog('❌ Conexión MQTT cerrada');
        setEstadoConexion('desconectado');
        setModoActual('');
      });

      client.on('error', (err) => {
        agregarLog(`❌ Error MQTT: ${err.message}`);
        setEstadoConexion('error');
        setError(`Error de conexión: ${err.message}`);
      });

      client.on('message', (topic, payload) => {
        const mensaje = String(payload).trim().toUpperCase();
        agregarLog(`📨 RX [${topic}]: ${mensaje}`);

        const topics = getTopics();

        if (topic === topics.reported) {
          setModoActual(mensaje);
          if (mensaje === 'PRINCIPAL') {
            setLineaSeleccionada('principal');
          } else if (mensaje === 'AUXILIAR') {
            setLineaSeleccionada('auxiliar');
          }
        } else if (topic === topics.status) {
          if (mensaje === 'ONLINE') {
            setEstadoConexion('conectado');
          } else {
            setEstadoConexion('desconectado');
          }
        }
      });

      clientRef.current = client;
    } catch (error) {
      agregarLog(`❌ Error inicializando MQTT: ${error.message}`);
      setEstadoConexion('error');
      setError('Error al inicializar la conexión MQTT');
    }
  };

  // Desconectar MQTT
  const desconectarMQTT = () => {
    if (clientRef.current) {
      try {
        clientRef.current.end();
        agregarLog('🔌 Desconectado del broker');
      } catch (e) {
        console.error('Error desconectando:', e);
      }
      clientRef.current = null;
    }
    setEstadoConexion('desconectado');
    setModoActual('');
  };

  // Enviar comando de cambio de línea
  const enviarComando = (linea) => {
    if (!clientRef.current || estadoConexion !== 'conectado') {
      setError('No hay conexión activa con el dispositivo');
      return false;
    }

    const ahora = Date.now();
    if (ahora - lastCmdMsRef.current < 350) {
      setError('Espere un momento antes de enviar otro comando');
      return false;
    }

    lastCmdMsRef.current = ahora;
    setCambiandoLinea(true);
    setError('');

    const comando = linea === 'principal' ? 'PRINCIPAL' : 'AUXILIAR';
    const topics = getTopics();

    try {
      clientRef.current.publish(topics.desired, comando, { retain: true }, (err) => {
        setCambiandoLinea(false);

        if (err) {
          agregarLog(`❌ Error enviando comando: ${err.message}`);
          setError('Error al enviar el comando al dispositivo');
        } else {
          agregarLog(`✅ TX [${topics.desired}]: ${comando} (retain)`);
          setMensajeExito(`Línea cambiada a ${linea === 'principal' ? 'Principal' : 'Auxiliar'}`);

          setTimeout(() => {
            setMensajeExito('');
          }, 1500);
        }
      });
    } catch (error) {
      setCambiandoLinea(false);
      setError('Error al enviar el comando');
      agregarLog(`❌ Error en publicación: ${error.message}`);
    }

    return true;
  };

  // Efectos para manejar la conexión MQTT
  useEffect(() => {
    if (open) {
      conectarMQTT();
    } else {
      desconectarMQTT();
      setError('');
      setMensajeExito('');
      setLogs([]);
    }

    return () => {
      desconectarMQTT();
    };
  }, [open]);

  const handleChange = (event) => {
    setLineaSeleccionada(event.target.value);
  };

  const handleConfirmar = () => {
    enviarComando(lineaSeleccionada);
  };

  const getEstadoConexionTexto = () => {
    switch (estadoConexion) {
      case 'conectado': return 'Conectado al dispositivo';
      case 'conectando': return 'Conectando...';
      case 'error': return 'Error de conexión';
      default: return 'Desconectado';
    }
  };

  const getEstadoConexionIcono = () => {
    switch (estadoConexion) {
      case 'conectado': return <WifiIcon color="success" />;
      case 'conectando': return <CircularProgress size={16} />;
      default: return <WifiOffIcon color="error" />;
    }
  };

  const espConfig = getEspConfig();

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            minHeight: '600px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          m: 0,
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
        }}>
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold" color="white">
              🚀 Control Remoto de Líneas
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
              {getEstadoConexionIcono()}
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: estadoConexion === 'conectado' ? '#10b981' :
                    estadoConexion === 'conectando' ? '#f59e0b' :
                      '#ef4444'
                }}
              >
                {getEstadoConexionTexto()}
              </Typography>
              {modoActual && (
                <Chip
                  label={modoActual}
                  size="small"
                  color={modoActual === 'PRINCIPAL' ? 'success' : 'warning'}
                  sx={{
                    backgroundColor: modoActual === 'PRINCIPAL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: 'white',
                    border: `1px solid ${modoActual === 'PRINCIPAL' ? '#10b981' : '#f59e0b'}`
                  }}
                />
              )}
            </Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, backgroundColor: '#0f172a' }}>
          {error && (
            <Alert severity="error" sx={{
              mb: 2,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {error}
            </Alert>
          )}

          {/* Botones para mostrar/ocultar configuraciones avanzadas */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2,mt:2, flexWrap: 'wrap' }}>
            <Button
              onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
              startIcon={mostrarConfiguracion ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              endIcon={<SettingsIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#8b5cf6',
                color: '#8b5cf6',
                '&:hover': {
                  borderColor: '#a78bfa',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
            >
              Configuración MQTT
            </Button>
            <Button
              onClick={() => setMostrarLogs(!mostrarLogs)}
              startIcon={mostrarLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              endIcon={<TerminalIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#06b6d4',
                color: '#06b6d4',
                '&:hover': {
                  borderColor: '#22d3ee',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)'
                }
              }}
            >
              Logs de Comunicación
            </Button>
            <Button
              onClick={conectarMQTT}
              disabled={estadoConexion === 'conectando'}
              startIcon={<WifiIcon />}
              variant="contained"
              size="small"
              sx={{
                ml: 'auto',
                background: estadoConexion === 'conectado' ?
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                '&:hover': {
                  background: estadoConexion === 'conectado' ?
                    'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                    'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                }
              }}
            >
              {estadoConexion === 'conectado' ? 'Reconectar' : 'Conectar'}
            </Button>
          </Box>

          {/* Configuración MQTT (Oculta por defecto) */}
          <Collapse in={mostrarConfiguracion}>
            <Card sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SettingsIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                  <Typography variant="h6" color="white">
                    Configuración MQTT
                  </Typography>
                </Box>

                <TextField
                  label="Topic ID"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                  helperText="Identificador único del dispositivo"
                  FormHelperTextProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.5)' }
                  }}
                />

                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 1, color: 'white', fontWeight: 500 }}>
                    Broker MQTT
                  </FormLabel>
                  <RadioGroup
                    value={brokerSeleccionado}
                    onChange={(e) => setBrokerSeleccionado(e.target.value)}
                  >
                    {Object.entries(brokers).map(([key, config]) => (
                      <FormControlLabel
                        key={key}
                        value={key}
                        control={<Radio sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                        label={
                          <Box>
                            <Typography variant="body2" color="white">
                              {config.label}
                            </Typography>
                            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                              {config.url}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: brokerSeleccionado === key ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                          border: brokerSeleccionado === key ? '1px solid #3b82f6' : '1px solid transparent'
                        }}
                      />
                    ))}
                    <FormControlLabel
                      value="custom"
                      control={<Radio sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                      label="Custom"
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: brokerSeleccionado === 'custom' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        border: brokerSeleccionado === 'custom' ? '1px solid #3b82f6' : '1px solid transparent'
                      }}
                    />
                  </RadioGroup>
                </FormControl>

                {brokerSeleccionado === 'custom' && (
                  <TextField
                    label="URL Custom"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="wss://host:puerto/mqtt"
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1
                      }
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                    helperText="URL completa del broker MQTT"
                    FormHelperTextProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.5)' }
                    }}
                  />
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Button
                    onClick={probarBrokerActual}
                    disabled={probandoBrokers}
                    startIcon={probandoBrokers ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#8b5cf6',
                      color: '#8b5cf6',
                      '&:hover': {
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                      }
                    }}
                  >
                    Probar Broker
                  </Button>
                  <Button
                    onClick={probarTodosLosBrokers}
                    disabled={probandoBrokers}
                    startIcon={probandoBrokers ? <CircularProgress size={16} /> : <AllInclusiveIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#06b6d4',
                      color: '#06b6d4',
                      '&:hover': {
                        borderColor: '#22d3ee',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)'
                      }
                    }}
                  >
                    Probar Todos
                  </Button>
                </Box>

                {/* Configuración ESP32 */}
                <Box sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 1,
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Typography variant="subtitle2" color="#f59e0b" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TerminalIcon sx={{ mr: 1, fontSize: 18 }} />
                    Configuración ESP32:
                  </Typography>
                  <Box sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#e2e8f0',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    p: 1,
                    borderRadius: 0.5,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div>{`#define MQTT_HOST "${espConfig.host}"`}</div>
                    <div>{`#define MQTT_PORT ${espConfig.port}`}</div>
                    <div>{`#define TOPIC_ID "${topicId}"`}</div>
                  </Box>
                </Box>

                {/* Resultados de prueba */}
                {resultadosPrueba.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom color="white">
                      📊 Resultados de Prueba
                    </Typography>
                    <TableContainer component={Paper} sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Broker</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Detalle</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {resultadosPrueba.map((resultado, index) => (
                            <TableRow key={index} sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                            }}>
                              <TableCell>
                                <Typography variant="body2" color="white">
                                  {resultado.label}
                                </Typography>
                                <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                                  {resultado.url}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={resultado.ok ? 'CONECTADO' : 'ERROR'}
                                  color={resultado.ok ? 'success' : 'error'}
                                  size="small"
                                  sx={{
                                    backgroundColor: resultado.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: 'white',
                                    border: `1px solid ${resultado.ok ? '#10b981' : '#ef4444'}`
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                                  {resultado.reason || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Collapse>

          {/* Control de líneas (Siempre visible) */}
          <Card sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="white" sx={{ display: 'flex', alignItems: 'center' }}>
                <SwapHorizIcon sx={{ mr: 1, color: '#f59e0b' }} />
                Control de Líneas
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={lineaSeleccionada}
                  onChange={handleChange}
                >
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: lineaSeleccionada === 'principal' ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                      backgroundColor: lineaSeleccionada === 'principal' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: lineaSeleccionada === 'principal' ? '#10b981' : 'rgba(255, 255, 255, 0.4)',
                      }
                    }}
                  >
                    <FormControlLabel
                      value="principal"
                      control={
                        <Radio
                          disabled={estadoConexion !== 'conectado' || cambiandoLinea}
                          sx={{
                            color: lineaSeleccionada === 'principal' ? '#10b981' : 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-checked': { color: '#10b981' }
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ color: '#10b981', mr: 1 }} />
                          <Typography color="white" fontWeight="500">Línea Principal</Typography>
                          {lineaSeleccionada === 'principal' && (
                            <Chip
                              label="ACTUAL"
                              size="small"
                              sx={{
                                ml: 2,
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                border: '1px solid #10b981'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ ml: 4, mt: 0.5 }}>
                      Sistema de enfriamiento principal con mayor capacidad
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: lineaSeleccionada === 'auxiliar' ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                      backgroundColor: lineaSeleccionada === 'auxiliar' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: lineaSeleccionada === 'auxiliar' ? '#f59e0b' : 'rgba(255, 255, 255, 0.4)',
                      }
                    }}
                  >
                    <FormControlLabel
                      value="auxiliar"
                      control={
                        <Radio
                          disabled={estadoConexion !== 'conectado' || cambiandoLinea}
                          sx={{
                            color: lineaSeleccionada === 'auxiliar' ? '#f59e0b' : 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-checked': { color: '#f59e0b' }
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WarningIcon sx={{ color: '#f59e0b', mr: 1 }} />
                          <Typography color="white" fontWeight="500">Línea Auxiliar</Typography>
                          {lineaSeleccionada === 'auxiliar' && (
                            <Chip
                              label="ACTUAL"
                              size="small"
                              sx={{
                                ml: 2,
                                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                border: '1px solid #f59e0b'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ ml: 4, mt: 0.5 }}>
                      Sistema de respaldo para mantenimiento o emergencias
                    </Typography>
                  </Box>
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>

          {/* Logs (Ocultos por defecto) */}
          <Collapse in={mostrarLogs}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="white" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TerminalIcon sx={{ mr: 1 }} />
                    Logs de Comunicación
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const logText = logs.join('\n');
                      const blob = new Blob([logText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `mqtt-logs-${new Date().toISOString().split('T')[0]}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    disabled={logs.length === 0}
                    sx={{
                      color: '#06b6d4',
                      borderColor: '#06b6d4',
                      '&:hover': {
                        borderColor: '#22d3ee',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)'
                      }
                    }}
                    variant="outlined"
                  >
                    Exportar
                  </Button>
                </Box>
                <Box
                  sx={{
                    height: 200,
                    overflow: 'auto',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#e2e8f0'
                  }}
                >
                  {logs.length === 0 ? (
                    <Typography color="rgba(255, 255, 255, 0.5)" fontStyle="italic">
                      No hay logs disponibles. Conecta al broker para ver la actividad.
                    </Typography>
                  ) : (
                    logs.map((log, index) => (
                      <Box
                        key={index}
                        sx={{
                          py: 0.5,
                          borderBottom: index < logs.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        {log}
                      </Box>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </Collapse>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <Button
            onClick={onClose}
            disabled={cambiandoLinea}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            variant="contained"
            disabled={estadoConexion !== 'conectado' || cambiandoLinea}
            startIcon={cambiandoLinea ? <CircularProgress size={16} /> : <SwapHorizIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              minWidth: 140,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              },
              '&.Mui-disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {cambiandoLinea ? 'Cambiando...' : 'Cambiar Línea'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!mensajeExito}
        autoHideDuration={3000}
        onClose={() => setMensajeExito('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {mensajeExito}
        </Alert>
      </Snackbar>
    </>
  );
};