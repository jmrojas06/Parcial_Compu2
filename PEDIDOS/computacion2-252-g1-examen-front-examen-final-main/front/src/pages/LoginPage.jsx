// (20%) LOGIN: consume POST /auth/login → guarda el token → redirige al dashboard
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { login } from '../api/authApi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.accessToken); // guarda el JWT para las peticiones posteriores
      navigate('/'); // redirige al tablero de pedidos
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Paper component="form" onSubmit={handleLogin} elevation={3} sx={{ width: 400, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold">Tablero de Pedidos</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained" size="large">Ingresar</Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
