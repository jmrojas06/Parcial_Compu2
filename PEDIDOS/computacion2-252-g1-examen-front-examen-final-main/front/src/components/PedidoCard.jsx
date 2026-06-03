import { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Select, MenuItem, Button, FormControl, InputLabel, Chip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateDomicilio, deleteDomicilio } from '../api/domiciliosApi';

const ESTADOS = ['EN_CAMINO', 'EN_REPARTO', 'ENTREGADO'];
const estadoColor = { EN_CAMINO: 'warning', EN_REPARTO: 'info', ENTREGADO: 'success' };

// (20%) COMPONENTE: representa visualmente un pedido individual
// Props: pedido = objeto con { id, nombreDomiciliario, estado, userId, username }
//        onRefresh = función del Dashboard para recargar la lista tras cambios
const PedidoCard = ({ pedido, onRefresh }) => {
  const [estado, setEstado] = useState(pedido.estado);
  const [loading, setLoading] = useState(false);

  // (20%) ACTUALIZAR ESTADO → PUT /domicilios/:id
  // Hay que enviar el objeto completo: nombreDomiciliario + nuevo estado + userId
  const handleEstadoChange = async (nuevoEstado) => {
    setEstado(nuevoEstado); // actualiza la UI antes de esperar al backend (optimista)
    setLoading(true);
    try {
      await updateDomicilio(pedido.id, { nombreDomiciliario: pedido.nombreDomiciliario, estado: nuevoEstado, userId: pedido.userId });
      onRefresh(); // sincroniza con el backend recargando la lista
    } catch { setEstado(pedido.estado); } // revierte si falla
    finally { setLoading(false); }
  };

  // (20%) ELIMINAR PEDIDO → DELETE /domicilios/:id
  // Después de eliminar llama onRefresh para quitarlo de la vista
  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar el pedido de ${pedido.nombreDomiciliario}?`)) return;
    await deleteDomicilio(pedido.id);
    onRefresh();
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Muestra toda la información del pedido + chip de color por estado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">{pedido.nombreDomiciliario}</Typography>
          <Chip label={estado} color={estadoColor[estado]} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">ID: {pedido.id} | Usuario: {pedido.username}</Typography>

        {/* Select con los 3 estados posibles: EN_CAMINO, EN_REPARTO, ENTREGADO */}
        <FormControl fullWidth sx={{ mt: 2 }} size="small">
          <InputLabel>Estado</InputLabel>
          <Select value={estado} label="Estado" onChange={(e) => handleEstadoChange(e.target.value)} disabled={loading}>
            {ESTADOS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </Select>
        </FormControl>
      </CardContent>

      {/* Botón de eliminación visible y claro */}
      <CardActions>
        <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} size="small">Eliminar</Button>
      </CardActions>
    </Card>
  );
};

export default PedidoCard;
