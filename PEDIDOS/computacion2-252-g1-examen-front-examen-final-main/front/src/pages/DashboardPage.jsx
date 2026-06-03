import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Divider, Alert, Paper } from '@mui/material';
import { getDomicilios, createDomicilio } from '../api/domiciliosApi';
import PedidoCard from '../components/PedidoCard';

const ESTADOS = ['EN_CAMINO', 'EN_REPARTO', 'ENTREGADO'];

const DashboardPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [nombreDomiciliario, setNombreDomiciliario] = useState('');
  const [estado, setEstado] = useState('EN_CAMINO');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // El JWT no incluye userId → lo extraemos del primer pedido que devuelve el GET
  const userIdRef = useRef(null);

  // Carga los pedidos del usuario autenticado → GET /domicilios (token via interceptor)
  // Se llama al montar y después de cada crear/actualizar/eliminar
  const fetchPedidos = async () => {
    const data = await getDomicilios();
    setPedidos(data);
    if (data.length > 0 && !userIdRef.current) userIdRef.current = data[0].userId;
  };

  useEffect(() => { fetchPedidos(); }, []);

  // (20%) CREAR PEDIDO → POST /domicilios con { nombreDomiciliario, estado, userId }
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDomicilio({ nombreDomiciliario, estado, userId: userIdRef.current });
      setNombreDomiciliario('');
      setEstado('EN_CAMINO');
      fetchPedidos(); // refresca la lista después de crear
    } catch {
      setError('Error al crear el pedido.');
    }
  };

  // Cierra sesión: borra el token y redirige al login
  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Tablero de Pedidos</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>Cerrar Sesión</Button>
      </Box>

      {/* (20%) Formulario para crear nuevo pedido */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Nuevo Pedido</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField label="Nombre del domiciliario" value={nombreDomiciliario} onChange={(e) => setNombreDomiciliario(e.target.value)} required size="small" sx={{ flex: 1, minWidth: 200 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained">Crear</Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* Lista de pedidos — cada card puede actualizar estado y eliminar */}
      <Typography variant="h6" sx={{ mb: 2 }}>Pedidos activos ({pedidos.length})</Typography>
      {pedidos.length === 0
        ? <Typography color="text.secondary">No hay pedidos aún.</Typography>
        : pedidos.map((pedido) => <PedidoCard key={pedido.id} pedido={pedido} onRefresh={fetchPedidos} />)
      }
    </Box>
  );
};

export default DashboardPage;
