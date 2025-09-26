import { Typography, Box } from '@mui/material';

export const Unauthorized = () => {
  return (
    <Box p={4}>
      <Typography fontFamily={'Nunito'} variant="h4" color="error">Acceso denegado</Typography>
      <Typography fontFamily={'Nunito'}>No tienes permiso para acceder a esta página.</Typography>
    </Box>
  )
}
