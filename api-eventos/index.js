const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json(), cors());

const bitacoraEventos = [];

// Endpoint para publicar eventos de cualquier contexto
app.post('/eventos/publicar', (expressReq, expressRes) => {
  const { nombre, origen, datos } = expressReq.body;
  const nuevoEvento = {
    id: `evt-${Math.random().toString(36).substr(2, 9)}`,
    nombre,
    origen,
    datos,
    timestamp: new Date().toISOString()
  };
  bitacoraEventos.push(nuevoEvento);
  console.log(` [Pub/Sub] Evento propagado: ${nombre} desde ${origen}`);
  expressRes.status(201).json({ despachado: true, evento: nuevoEvento });
});

// Endpoint para que el Panel de Control lea los eventos consumidos
app.get('/eventos/bitacora', (expressReq, expressRes) => {
  expressRes.json(bitacoraEventos);
});

app.listen(3004, () => console.log('📡 Broker de Eventos activo en :3004'));
