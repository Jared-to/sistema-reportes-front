import  { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { useSelector } from 'react-redux';

export const WelcomeModal = () => {
  const [open, setOpen] = useState(false);
  const [horaConexion, setHoraConexion] = useState('');

  // Obtener saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días!";
    if (hour < 18) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  };

  // Formatear fecha y hora
  const formatDateTime = () => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const hora = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { fecha, hora };
  };

  useEffect(() => {
    // Verificar si ya se mostró el modal en esta sesión
    const modalShown = sessionStorage.getItem('welcomeModalShown');
    
    if (!modalShown) {
      // Es la primera vez en esta sesión
      const { fecha, hora } = formatDateTime();
      setHoraConexion(`${fecha} a las ${hora}`);
      setOpen(true);
      
      // Marcar como mostrado en sessionStorage
      sessionStorage.setItem('welcomeModalShown', 'true');
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const { user } = useSelector(state => state.auth); // Asumiendo que tienes Redux configurado

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(33, 203, 243, 0.1) 0%, transparent 70%)',
          zIndex: 0
        }}
      />

      <DialogTitle sx={{ 
        m: 0, 
        p: 4, 
        pb: 2,
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <WavingHandIcon 
            sx={{ 
              fontSize: 40, 
              color: '#ffd700',
              mr: 2,
              animation: 'wave 2s infinite'
            }} 
          />
          <Typography 
            variant="h4" 
            component="div" 
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #ffd700 30%, #ffed4e 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {getGreeting()}
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          color="rgba(255, 255, 255, 0.9)"
          sx={{ textAlign: 'center' }}
        >
          Bienvenido al Sistema de Monitoreo
        </Typography>
      </DialogTitle>

      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 2,
          '&:hover': {
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 4, pt: 0, position: 'relative', zIndex: 1 }}>
        {/* Información del usuario */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3,
          p: 2,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <EmojiPeopleIcon 
            sx={{ 
              fontSize: 48, 
              color: '#4ecdc4',
              mb: 1
            }} 
          />
          <Typography variant="h6" color="white" gutterBottom>
            {user?.name || 'Usuario'}
          </Typography>
        </Box>

        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Información de conexión */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            color="white" 
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <AccessTimeIcon sx={{ mr: 1, color: '#ff6b6b' }} />
            Hora de Conexión
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            mt: 2
          }}>
            <Chip
              icon={<CalendarTodayIcon />}
              label={horaConexion}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                fontSize: '0.9rem',
                py: 2
              }}
            />
            
            <Typography 
              variant="body2" 
              color="rgba(255, 255, 255, 0.7)"
              sx={{ textAlign: 'center', fontStyle: 'italic' }}
            >
              Sesión iniciada correctamente
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 0, 
        position: 'relative', 
        zIndex: 1,
        justifyContent: 'center'
      }}>
        <Button
          onClick={handleClose}
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976d2 30%, #0288d1 90%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Comenzar a Monitorear
        </Button>
      </DialogActions>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </Dialog>
  );
};