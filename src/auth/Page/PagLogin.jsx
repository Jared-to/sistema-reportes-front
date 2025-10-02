import { useState } from "react";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { Lock, Person, Visibility, VisibilityOff, Science, Login } from "@mui/icons-material";

import { useForm } from "../../hooks/useForm";
import { useAuthStore } from "../../hooks/useAuthStore";
import fondo1 from '../../assets/fondoResonacia3.jpg'
const PagLogin = () => {
  // Estados
  const { startLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { load, errorMessage } = useSelector(state => state.auth);
  const { formState, onInputChange } = useForm({
    username: '',
    password: ''
  });

  // Funciones
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSaveform = (e) => {
    e.preventDefault();

    for (const key in formState) {
      if (formState[key] === '') {
        setErrors(prev => ({
          ...prev,
          [key]: true
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [key]: false
        }));
      }
    }

    for (const key in formState) {
      if (formState[key] === '') {
        return;
      }
    }

    startLogin(formState);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundImage: `url(${fondo1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Roboto', sans-serif",
        p: 2
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          p: 4,
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(100, 116, 139, 0.2)'
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Science 
            sx={{ 
              fontSize: 42, 
              color: 'white',
              mb: 1,
              background: 'linear-gradient(135deg, #818CF8, #60A5FA)',
              borderRadius: '50%',
              p: 1,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }} 
          />
          <Typography
            variant="h4"
            fontWeight={700}
            mb={1}
            sx={{ 
              color: "#E0E7FF",
              fontFamily: "'Playfair Display', serif",
              background: 'linear-gradient(135deg, #818CF8, #60A5FA)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            MagnetCare System
          </Typography>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSaveform} display={"flex"} flexDirection={"column"} gap={2.5}>
          <TextField
            error={errors['username']}
            helperText={errors['username'] && 'Campo Obligatorio'}
            value={formState['username']}
            onChange={onInputChange}
            name="username"
            label="Usuario"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "rgba(30, 41, 59, 0.5)",
                color: '#E2E8F0',
                "& fieldset": {
                  borderColor: "#475569",
                },
                "&:hover fieldset": {
                  borderColor: "#64748B",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#818CF8",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#94A3B8",
              },
              "& .MuiFormHelperText-root": {
                color: "#F87171",
                fontSize: '0.75rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: "#64748B" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            error={errors['password']}
            helperText={errors['password'] && 'Campo Obligatorio'}
            value={formState['password']}
            onChange={onInputChange}
            name="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "rgba(30, 41, 59, 0.5)",
                color: '#E2E8F0',
                "& fieldset": {
                  borderColor: "#475569",
                },
                "&:hover fieldset": {
                  borderColor: "#64748B",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#818CF8",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#94A3B8",
              },
              "& .MuiFormHelperText-root": {
                color: "#F87171",
                fontSize: '0.75rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "#64748B" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end" sx={{ color: "#64748B" }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {errorMessage && (
            <Alert severity="error" sx={{ 
              borderRadius: '12px', 
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              color: '#FECACA',
              border: '1px solid rgba(248, 113, 113, 0.3)'
            }}>
              {errorMessage}
            </Alert>
          )}
          
          <Button
            variant="contained"
            fullWidth
            type="submit"
            startIcon={!load && <Login />}
            sx={{
              py: 1.5,
              mt: 1,
              bgcolor: "#6366F1",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              color: '#FFFFFF',
              ":hover": {
                bgcolor: "#818CF8",
                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)"
              },
            }}
          >
            {load ? <CircularProgress size="24px" sx={{ color: "white" }} /> : 'Acceder al Sistema'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Proyecto Resonancia · Todos los derechos reservados
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PagLogin;