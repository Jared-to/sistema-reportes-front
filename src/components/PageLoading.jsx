
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const styles = {
  container: {
    height: '100vh',
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    color: 'green',
  },
};

export default function PageLoading() {
  return (
    <Box sx={styles.container}>
      <CircularProgress size="100px" sx={styles.circularProgress} />
    </Box>
  );
}
