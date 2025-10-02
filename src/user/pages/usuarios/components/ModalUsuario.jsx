import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import toast from 'react-hot-toast';

import { useForm } from '../../../../hooks/useForm';


const styleTextField = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    color: '#e6f1ff',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(100, 255, 218, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#64ffda',
      boxShadow: '0 0 0 2px rgba(100, 255, 218, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#8892b0',
    fontFamily: 'Nunito',
    fontWeight: 600,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#64ffda',
  },
}

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' },
];

export const ModalUsuario = ({ open, onClose, createUser, handleGetData, data = undefined, updateUser }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { formState, onInputChange, resetForm, setFormState } = useForm({
    username: '',
    nombre: '',
    password: '',
    telefono: '',
    rol: 'user',
  })

  //?Funciones
  //controlar vista del password
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    if (data) {
      toast.promise(
        updateUser(formState, data.id),
        {
          loading: "Cargando Petición",
          success: () => {
            onClose();
            resetForm();
            handleGetData();
            return "Usuario editado con éxito!";
          },
          error: (err) => `Error: ${err.message}`,
        }
      );
    } else {

      toast.promise(
        createUser(formState),
        {
          loading: "Cargando Petición",
          success: () => {
            onClose();
            resetForm();
            handleGetData();
            return "Usuario creado con éxito!";
          },
          error: (err) => `Error: ${err.message}`,
        }
      );
    }
  };

  useEffect(() => {
    if (data) {

      setFormState(prev => ({
        ...prev,
        username: data.username || '',
        nombre: data.fullName || '',
        rol: data?.roles[0] || 'user',
      }))
    } else {
      resetForm()
    }
  }, [data])


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(100, 255, 218, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header del Modal */}
      <Box sx={{
        background: 'linear-gradient(90deg, rgba(100, 255, 218, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%)',
        borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
        p: 3,
        position: 'relative',
      }}>
        <DialogTitle sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: '#64ffda',
        }}>
          <PersonIcon sx={{
            fontSize: 32,
            filter: 'drop-shadow(0 0 8px rgba(100, 255, 218, 0.4))'
          }} />
          <Typography
            fontSize={'1.5rem'}
            fontFamily="Nunito"
            fontWeight={800}
            sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            Nuevo Usuario
          </Typography>
        </DialogTitle>

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#64ffda',
            background: 'rgba(100, 255, 218, 0.1)',
            '&:hover': {
              background: 'rgba(100, 255, 218, 0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Username */}
            <TextField
              label="Username"
              name='username'
              value={formState.username}
              onChange={onInputChange}
              placeholder='Username'
              size='small'
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: '#64ffda' }} />
                  </InputAdornment>
                ),
              }}
              sx={styleTextField}
            />

            {/* Nombre Completo */}
            <TextField
              label="Nombre Completo"
              name='nombre'
              placeholder='Nombre Completo'
              value={formState.nombre}
              onChange={onInputChange}
              size='small'
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#64ffda' }} />
                  </InputAdornment>
                ),
              }}
              sx={styleTextField}
            />

            {/* Contraseña */}
            <TextField
              label="Contraseña"
              placeholder='Contraseña'
              type={showPassword ? "text" : "password"}
              name='password'
              value={formState.password}
              onChange={onInputChange}
              size='small'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#64ffda' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff sx={{ color: 'white' }} /> : <Visibility sx={{ color: 'white' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={styleTextField}
            />

            {/* Rol */}
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: '#8892b0',
                  fontFamily: 'Nunito',
                  fontWeight: 600,
                  '&.Mui-focused': {
                    color: '#64ffda',
                  },
                }}
              >
                Rol
              </InputLabel>
              <Select
                value={formState.rol}
                onChange={onInputChange}
                label="Rol"
                name='rol'
                sx={{ color: 'white' }}
                size='small'
                required
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: '#1a1a2e',
                      border: '1px solid rgba(100, 255, 218, 0.2)',
                      borderRadius: 2,
                      mt: 1,
                    },
                  },
                }}
              >
                {roles.map((rol) => (
                  <MenuItem
                    key={rol.value}
                    value={rol.value}
                    sx={{
                      color: '#e6f1ff',
                      fontFamily: 'Nunito',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(100, 255, 218, 0.1)',
                      },
                      '&.Mui-selected': {
                        background: 'rgba(100, 255, 218, 0.2)',
                        '&:hover': {
                          background: 'rgba(100, 255, 218, 0.3)',
                        },
                      },
                    }}
                  >
                    {rol.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            type='submit'
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: 'Nunito',
              fontWeight: 700,
              px: 4,
              py: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#8892b0',
              '&:hover': {
                borderColor: '#ff6b6b',
                color: '#ff6b6b',
                background: 'rgba(255, 107, 107, 0.1)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: 'Nunito',
              fontWeight: 700,
              px: 4,
              py: 1,
              background: 'linear-gradient(45deg, #00b4d8 0%, #00b4d8 100%)',
              boxShadow: '0 4px 20px rgba(100, 255, 218, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00b4d8 0%, #0099bb 100%)',
                boxShadow: '0 6px 25px rgba(100, 255, 218, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {'Crear'} Usuario
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};