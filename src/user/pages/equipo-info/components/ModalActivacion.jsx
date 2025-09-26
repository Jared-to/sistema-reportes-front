import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

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
  const [lineaSeleccionada, setLineaSeleccionada] = useState(equipo.linea_principal ? 'principal' : 'auxiliar');

  const handleChange = (event) => {
    setLineaSeleccionada(event.target.value);
  };

  const handleConfirmar = () => {
    // Aquí iría la lógica para cambiar el estado de la línea
    console.log(`Cambiando a línea ${lineaSeleccionada}`);
    onClose();
  };

  return (
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
        <Typography variant="h5" component="div" fontWeight="bold">
          Activación de Línea
        </Typography>
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

        {/* Advertencia */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)'
          }}
        >
          <Typography variant="body2" sx={{ color: '#ff9800', display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Advertencia: El cambio de línea puede afectar temporalmente el funcionamiento del equipo.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button
          onClick={onClose}
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
          startIcon={<SwapHorizIcon />}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #ff9800 30%, #ff5722 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #f57c00 30%, #e64a19 90%)',
            }
          }}
        >
          Cambiar Línea
        </Button>
      </DialogActions>
    </Dialog>
  );
};