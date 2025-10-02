import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton, InputAdornment,
} from '@mui/material';
import toast from 'react-hot-toast';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useUserStore } from '../../../hooks/useUserStore';
import { ModalUsuario } from './components/ModalUsuario';

const getColorEstado = (estado) => {

  return estado ? 'success' : 'error';
};


const getColorRol = (rol) => {
  const colores = {
    'Administrador': 'primary',
    'Editor': 'secondary',
    'Usuario': 'default'
  };
  return colores[rol] || 'default';
};
export const PagUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalUser, setModalUser] = useState({ on: false, data: undefined })
  const { getUsers, createUser, updateUser, deleteUser,isStatus } = useUserStore();


  //?Funciones

  const handleGetData = async () => {
    const data = await getUsers();

    setUsuarios(data)

  }

  // Filtrar usuarios basado en el término de búsqueda
  const usuariosFiltrados = useMemo(() => {
    if (!terminoBusqueda) return usuarios;

    const termino = terminoBusqueda.toLowerCase();
    return usuarios.filter(usuario =>
      usuario.fullName.toLowerCase().includes(termino) ||
      usuario.username.toLowerCase().includes(termino)

    );
  }, [usuarios, terminoBusqueda]);

  const handleEliminarUsuario = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      toast.promise(
        deleteUser(id),
        {
          loading: "Cargando Petición",
          success: () => {
            handleGetData();
            return "Usuario eliminado con éxito!";
          },
          error: (err) => `Error: ${err.message}`,
        }
      );
    }
  };

  //Modal usuario
  const handleOpenModalUser = (data) => {
    setModalUser({ on: true, data })
  }

  const handleCloseModalUser = () => setModalUser({ on: false, data: undefined })
  //cambiar estado
  const handleStatus = async (id) => {
    await isStatus(id);
    await handleGetData()
  }


  useEffect(() => {
    handleGetData()

  }, [])


  return (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    }}>
      {/* Header con título y botón */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        background: 'rgba(255, 255, 255, 0.05)',
        p: 3,
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonIcon sx={{
            fontSize: 44,
            color: '#64ffda',
            filter: 'drop-shadow(0 0 8px rgba(100, 255, 218, 0.3))'
          }} />
          <Box>
            <Typography
              variant="h3"
              component="h1"
              fontFamily="Nunito"
              fontWeight={800}
              color="#e6f1ff"
              sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              Gestión de Usuarios
            </Typography>
            <Typography
              variant="h6"
              color="#8892b0"
              fontFamily="Nunito"
              fontWeight={500}
            >
              Administra los usuarios del sistema
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={() => handleOpenModalUser()}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontFamily: 'Nunito',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
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
          Nuevo Usuario
        </Button>
      </Box>

      {/* Barra de búsqueda */}
      <Paper sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar usuarios por nombre, email, teléfono o rol..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64ffda' }} />
              </InputAdornment>
            ),
          }}
          sx={{
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
            '& .MuiInputBase-input::placeholder': {
              color: '#8892b0',
              opacity: 1,
            },
          }}
        />
      </Paper>

      {/* Tabla de usuarios */}
      <TableContainer component={Paper} sx={{
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{
              background: 'linear-gradient(90deg, rgba(100, 255, 218, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%)',
            }}>
              <TableCell sx={{
                fontFamily: 'Nunito',
                fontWeight: 800,
                color: '#64ffda',
                fontSize: '1rem',
                borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
              }}>
                Nombre
              </TableCell>
              <TableCell sx={{
                fontFamily: 'Nunito',
                fontWeight: 800,
                color: '#64ffda',
                fontSize: '1rem',
                borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
              }}>
                Username
              </TableCell>
              <TableCell sx={{
                fontFamily: 'Nunito',
                fontWeight: 800,
                color: '#64ffda',
                fontSize: '1rem',
                borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
              }}>
                Rol
              </TableCell>
              <TableCell sx={{
                fontFamily: 'Nunito',
                fontWeight: 800,
                color: '#64ffda',
                fontSize: '1rem',
                borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
              }}>
                Estado
              </TableCell>
              <TableCell sx={{
                fontFamily: 'Nunito',
                fontWeight: 800,
                color: '#64ffda',
                fontSize: '1rem',
                borderBottom: '1px solid rgba(100, 255, 218, 0.2)',
                width: 120,
                textAlign: 'center',
              }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosFiltrados.map((usuario, index) => (
              <TableRow
                key={usuario.id}
                sx={{
                  background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    background: 'rgba(100, 255, 218, 0.08)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography fontFamily="Nunito" fontWeight={700} color="#e6f1ff" fontSize="1rem">
                    {usuario.fullName}
                  </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Box>
                    <Typography fontFamily="Nunito" fontSize="0.95rem" color="#ccd6f6">
                      {usuario.username}
                    </Typography>
                    <Typography fontFamily="Nunito" fontSize="0.85rem" color="#8892b0">
                      {usuario.telefono}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Chip
                    label={usuario.roles[0]}
                    color={getColorRol(usuario.roles[0])}
                    size="small"
                    sx={{
                      fontFamily: 'Nunito',
                      fontWeight: 700,
                      color: '#e6f1ff',
                      background: 'linear-gradient(45deg, rgba(100, 255, 218, 0.2), rgba(0, 180, 216, 0.2))',
                      border: '1px solid rgba(100, 255, 218, 0.3)',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Chip
                  onClick={()=>handleStatus(usuario.id)}
                    label={usuario.isActive ? 'Activo' : 'Inactivo'}
                    color={getColorEstado(usuario.isActive)}
                    variant="outlined"
                    size="small"
                    sx={{
                      fontFamily: 'Nunito',
                      fontWeight: 700,
                      borderWidth: '2px',
                      borderColor: usuario.isActive ? '#4caf50' : '#f44336',
                      color: usuario.isActive ? '#4caf50' : '#f44336',
                      background: 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                </TableCell>
                <TableCell sx={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModalUser(usuario)}
                      sx={{
                        color: '#64ffda',
                        background: 'rgba(100, 255, 218, 0.1)',
                        '&:hover': {
                          background: 'rgba(100, 255, 218, 0.2)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEliminarUsuario(usuario.id)}
                      sx={{
                        color: '#ff6b6b',
                        background: 'rgba(255, 107, 107, 0.1)',
                        '&:hover': {
                          background: 'rgba(255, 107, 107, 0.2)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mensaje cuando no hay resultados */}
      {usuariosFiltrados.length === 0 && (
        <Paper sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Typography fontFamily="Nunito" color="#8892b0" fontSize="1.1rem">
            {terminoBusqueda ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
          </Typography>
        </Paper>
      )}
      <ModalUsuario
        open={modalUser.on}
        onClose={handleCloseModalUser}
        createUser={createUser}
        handleGetData={handleGetData}
        data={modalUser.data}
        updateUser={updateUser}
      />
    </Box>
  );
};
