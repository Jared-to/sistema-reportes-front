import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Container,
  Stack,
  alpha
} from "@mui/material";
import { useEffect, useState } from "react";
import InfoIcon from '@mui/icons-material/Info';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DevicesIcon from '@mui/icons-material/Devices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from "react-router-dom";
import { useSensoresStore } from "../../../hooks/useSensoresStore";

// Componente de tarjeta de equipo
const EquipmentCard = ({ equipment, onDetailsClick }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: equipment.status === 'error' ? '1px solid #f44336' :
          equipment.status === 'warning' ? '1px solid #ff9800' : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div" color="white" fontWeight="medium">
              {equipment.resonador_id}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
              {equipment.institucion}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: '#4ecdc4' }} />
              <Typography variant="body2" color="white">
                Chiller: {equipment.corriente_chiller}A
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MonitorHeartIcon sx={{ fontSize: 16, mr: 0.5, color: '#ff6b6b' }} />
              <Typography variant="body2" color="white">
                Temp: {equipment.temp_linea_chiller}°C
              </Typography>
            </Box>
          </Grid>
          <Grid size={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: '#4ecdc4' }} />
              <Typography variant="body2" color="white">
                Compresor: {equipment.corriente_compresor}A
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MonitorHeartIcon sx={{ fontSize: 16, mr: 0.5, color: '#ff6b6b' }} />
              <Typography variant="body2" color="white">
                Temp Aux {equipment.temp_linea_aux}°C
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Chip
            icon={<SecurityIcon sx={{ color: equipment.linea_principal === 1 ? 'inherit' : 'rgba(255, 255, 255, 0.5)' }} />}
            label={equipment.linea_principal === 1 ? "Principal ON" : "Principal OFF"}
            color={equipment.linea_principal === 1 ? "success" : "default"}
            size="small"
            variant={equipment.linea_principal === 1 ? "filled" : "outlined"}
          />
          <Chip
            icon={<SecurityIcon sx={{ color: equipment.linea_aux === 1 ? 'inherit' : 'rgba(255, 255, 255, 0.5)' }} />}
            label={equipment.linea_aux === 1 ? "Auxiliar ON" : "Auxiliar OFF"}
            color={equipment.linea_aux === 1 ? "success" : "warning"}
            size="small"
            variant={equipment.linea_aux === 1 ? "filled" : "outlined"}
          />
        </Box>
      </CardContent>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<InfoIcon />}
          onClick={() => onDetailsClick(equipment)}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #303f9f 30%, #1976d2 90%)',
            }
          }}
        >
          Ver detalles
        </Button>
      </Box>
    </Card>
  );
};

// Componente de tarjeta de característica
const FeatureCard = ({ icon, title, description }) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box sx={{
          p: 2,
          mb: 2,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60
        }}>
          {icon}
        </Box>
        <Typography variant="h6" color="white" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

export const PagHome = () => {
  const { getEquipos } = useSensoresStore();
  const [equipmentData, setEquipmentData] = useState([]);
  const navigate = useNavigate();

  const handleGetData = async () => {
    const data = await getEquipos();
    setEquipmentData(data);
  };

  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      color: 'white',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Sistema de Monitoreo de Resonadores
          </Typography>
          <Typography
            variant="h6"
            color="rgba(255, 255, 255, 0.8)"
            sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
          >
            Monitorea en tiempo real el estado de tus equipos de resonancia magnética con nuestra plataforma avanzada de supervisión y análisis de datos.
          </Typography>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'medium', mb: 4 }}>
            Características Principales
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FeatureCard
                icon={<MonitorHeartIcon sx={{ fontSize: 30, color: 'white' }} />}
                title="Monitoreo en Tiempo Real"
                description="Sigue el comportamiento de tus equipos con datos actualizados cada 15 minutos y recibe alertas instantáneas."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FeatureCard
                icon={<TrendingUpIcon sx={{ fontSize: 30, color: 'white' }} />}
                title="Análisis de Tendencia"
                description="Visualiza el historial completo de cada variable con gráficos interactivos y filtros por período."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FeatureCard
                icon={<SecurityIcon sx={{ fontSize: 30, color: 'white' }} />}
                title="Control de Estado"
                description="Supervisa el estado de las líneas principal y auxiliar con indicadores visuales claros y notificaciones."
              />
            </Grid>
          </Grid>
        </Box>

        {/* Equipment Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DevicesIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium' }}>
              Equipos Monitoreados
            </Typography>
          </Box>

          {equipmentData.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <Typography variant="h6" color="rgba(255, 255, 255, 0.7)" gutterBottom>
                No hay equipos disponibles
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                Los equipos aparecerán aquí una vez que se carguen los datos del sistema.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {equipmentData.map(equipment => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={equipment.id}>
                  <EquipmentCard
                    equipment={equipment}
                    onDetailsClick={() => navigate(`equipment/${equipment.institucion}/${equipment.resonador_id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

      </Container>
    </Box>
  );
};