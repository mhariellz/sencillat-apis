const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors(), express.json());

let transacciones = [
  { id: "tx-001", tipo: "gasto", monto: 80, categoria: "Comida", cuentaId: "bcp-1234", fecha: "2026-07-05" }
];
const cuentas = [
  { id: "bcp-1234", banco: "BCP", tipo: "Ahorros", saldo: 2000 },
  { id: "ibk-5678", banco: "Interbank", tipo: "Corriente", saldo: 1450 }
];

app.get("/cuentas", (req, res) => res.json(cuentas));
app.get("/cuentas/resumen", (req, res) => res.json({
  saldoTotal: cuentas.reduce((s, c) => s + c.saldo, 0),
  variacionMensual: 8.5, cuentas
}));

app.get("/transacciones", (req, res) => {
  const { categoria, cuentaId } = req.query;
  let r = transacciones;
  if (categoria) r = r.filter(t => t.categoria === categoria);
  if (cuentaId) r = r.filter(t => t.cuentaId === cuentaId);
  res.json(r);
});

app.post("/transacciones", (req, res) => {
  const { tipo, monto, cuentaId } = req.body;
  if (!tipo || !monto || !cuentaId) return res.status(400).json({ error: "Campos obligatorios: tipo, monto, cuentaId" });
  const hash = `${cuentaId}-${req.body.fecha}-${monto}`;
  if (transacciones.some(t => `${t.cuentaId}-${t.fecha}-${t.monto}` === hash))
    return res.status(409).json({ error: "Transacción duplicada (idempotencia)" });
  const nueva = { id: `tx-${Date.now()}`, categoria: "Otros", ...req.body };
  transacciones.push(nueva);
  res.status(201).json(nueva);
});

app.patch("/transacciones/:id/categoria", (req, res) => {
  const t = transacciones.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "No existe" });
  t.categoria = req.body.categoria;
  res.json(t);
});

const PORT = process.env.PORT || 3001;
if (require.main === module) app.listen(PORT, () => console.log(`REST en :${PORT}`));
module.exports = app;
