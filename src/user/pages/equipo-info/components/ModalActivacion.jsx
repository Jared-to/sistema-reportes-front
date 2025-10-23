import React, { useState, useEffect, useRef } from 'react';
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
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

// Importar MQTT (necesitarás instalar: npm install mqtt)
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
  const [lineaSeleccionada, setLineaSeleccionada] = useState(
    equipo.linea_principal ? 'principal' : 'auxiliar'
  );
  const [estadoConexion, setEstadoConexion] = useState('desconectado'); // 'desconectado', 'conectando', 'conectado', 'error'
  const [modoActual, setModoActual] = useState('');
  const [cambiandoLinea, setCambiandoLinea] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  const clientRef = useRef(null);
  const topicIdRef = useRef('reso_remotoprueba');
  const lastCmdMsRef = useRef(0);

  // Configuración de topics MQTT
  const getTopics = () => {
    const id = topicIdRef.current;
    return {
      desired: `remoteled/${id}/desired`,
      reported: `remoteled/${id}/reported`,
      status: `remoteled/${id}/status`
    };
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

    try {
      const client = mqtt.connect('wss://test.mosquitto.org:8081/mqtt', {
        clientId: 'react_' + Math.random().toString(16).slice(2, 10),
        reconnectPeriod: 2000,
        connectTimeout: 5000,
        keepalive: 30
      });

      client.on('connect', () => {
        console.log('✅ Conectado al broker MQTT');
        setEstadoConexion('conectado');
        const topics = getTopics();
        client.subscribe([topics.reported, topics.status], (err) => {
          if (err) {
            console.error('Error suscribiendo a topics:', err);
            setError('Error al suscribirse a los topics');
          }
        });
      });

      client.on('close', () => {
        console.log('❌ Conexión MQTT cerrada');
        setEstadoConexion('desconectado');
        setModoActual('');
      });

      client.on('error', (err) => {
        console.error('❌ Error MQTT:', err);
        setEstadoConexion('error');
        setError(`Error de conexión: ${err.message}`);
      });

      client.on('message', (topic, payload) => {
        const mensaje = String(payload).trim().toUpperCase();
        console.log(`📨 Mensaje recibido [${topic}]:`, mensaje);

        const topics = getTopics();
        
        if (topic === topics.reported) {
          setModoActual(mensaje);
          // Sincronizar la selección con el modo reportado
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
      console.error('Error inicializando MQTT:', error);
      setEstadoConexion('error');
      setError('Error al inicializar la conexión MQTT');
    }
  };

  // Desconectar MQTT
  const desconectarMQTT = () => {
    if (clientRef.current) {
      try {
        clientRef.current.end();
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
          console.error('Error publicando comando:', err);
          setError('Error al enviar el comando al dispositivo');
        } else {
          console.log(`✅ Comando enviado: ${comando}`);
          setMensajeExito(`Línea cambiada a ${linea === 'principal' ? 'Principal' : 'Auxiliar'}`);
          
          // Esperar un momento antes de cerrar el modal
          setTimeout(() => {
            onClose();
            setMensajeExito('');
          }, 1500);
        }
      });
    } catch (error) {
      setCambiandoLinea(false);
      setError('Error al enviar el comando');
      console.error('Error en publicación:', error);
    }

    return true;
  };

  // Efectos para manejar la conexión MQTT
  useEffect(() => {
    if (open) {
      // Conectar cuando se abre el modal
      conectarMQTT();
    } else {
      // Desconectar cuando se cierra el modal
      desconectarMQTT();
      setError('');
      setMensajeExito('');
    }

    // Cleanup al desmontar
    return () => {
      desconectarMQTT();
    };
  }, [open]);

  const handleChange = (event) => {
    setLineaSeleccionada(event.target.value);
  };

  const handleConfirmar = () => {
    if (lineaSeleccionada === (equipo.linea_principal ? 'principal' : 'auxiliar')) {
      setError('La línea seleccionada ya está activa');
      return;
    }

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

  const getEstadoConexionColor = () => {
    switch (estadoConexion) {
      case 'conectado': return 'success';
      case 'conectando': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getEstadoConexionIcono = () => {
    switch (estadoConexion) {
      case 'conectado': return <WifiIcon />;
      case 'conectando': return <CircularProgress size={16} />;
      default: return <WifiOffIcon />;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Activación de Línea
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {getEstadoConexionIcono()}
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1,
                  color: estadoConexion === 'conectado' ? '#4caf50' : 
                         estadoConexion === 'conectando' ? '#ff9800' : '#f44336'
                }}
              >
                {getEstadoConexionTexto()}
              </Typography>
              {modoActual && (
                <Chip 
                  label={modoActual} 
                  size="small" 
                  color={modoActual === 'PRINCIPAL' ? 'success' : 'warning'}
                  sx={{ ml: 2 }}
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
                color: 'white'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Información del equipo */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Institución
            </Typography>
            <Typography variant="h6" gutterBottom>
              {equipo.institucion}
            </Typography>
            
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Equipo
            </Typography>
            <Typography variant="h6" gutterBottom>
              {equipo.resonador_id}
            </Typography>
          </Box>

          <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Selección de línea */}
          <FormControl component="fieldset" fullWidth>
            <Typography variant="h6" gutterBottom>
              Seleccionar línea activa
            </Typography>
            
            <RadioGroup
              value={lineaSeleccionada}
              onChange={handleChange}
              sx={{ mt: 2 }}
            >
              {/* Opción Línea Principal */}
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: lineaSeleccionada === 'principal' ? '#4caf50' : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: lineaSeleccionada === 'principal' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: lineaSeleccionada === 'principal' ? '#4caf50' : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <FormControlLabel
                  value="principal"
                  control={
                    <Radio 
                      disabled={estadoConexion !== 'conectado' || cambiandoLinea}
                      sx={{ 
                        color: lineaSeleccionada === 'principal' ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-checked': {
                          color: '#4caf50',
                        }
                      }} 
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                      <Typography variant="body1">
                        Línea Principal
                      </Typography>
                      {lineaSeleccionada === 'principal' && (
                        <Chip 
                          label="ACTIVA" 
                          color="success" 
                          size="small" 
                          sx={{ ml: 2 }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1, ml: 4 }}>
                  Sistema de enfriamiento principal con mayor capacidad
                </Typography>
              </Box>

              {/* Opción Línea Auxiliar */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: lineaSeleccionada === 'auxiliar' ? '#ff9800' : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: lineaSeleccionada === 'auxiliar' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: lineaSeleccionada === 'auxiliar' ? '#ff9800' : 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <FormControlLabel
                  value="auxiliar"
                  control={
                    <Radio 
                      disabled={estadoConexion !== 'conectado' || cambiandoLinea}
                      sx={{ 
                        color: lineaSeleccionada === 'auxiliar' ? '#ff9800' : 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-checked': {
                          color: '#ff9800',
                        }
                      }} 
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon sx={{ color: '#ff9800', mr: 1 }} />
                      <Typography variant="body1">
                        Línea Auxiliar
                      </Typography>
                      {lineaSeleccionada === 'auxiliar' && (
                        <Chip 
                          label="ACTIVA" 
                          color="warning" 
                          size="small" 
                          sx={{ ml: 2 }}
                        />
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1, ml: 4 }}>
                  Sistema de respaldo para mantenimiento o emergencias
                </Typography>
              </Box>
            </RadioGroup>
          </FormControl>

        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
            disabled={estadoConexion !== 'conectado' || cambiandoLinea || 
                     lineaSeleccionada === (equipo.linea_principal ? 'principal' : 'auxiliar')}
            startIcon={cambiandoLinea ? <CircularProgress size={16} /> : <SwapHorizIcon />}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #f57c00 30%, #e64a19 90%)',
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

      {/* Snackbar para mensajes de éxito */}
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