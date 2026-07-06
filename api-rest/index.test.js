const request = require("supertest");
const app = require("./index");

test("GET /cuentas/resumen devuelve saldo total", async () => {
  const res = await request(app).get("/cuentas/resumen");
  expect(res.status).toBe(200);
  expect(res.body.saldoTotal).toBe(3450);
});

test("POST duplicado devuelve 409", async () => {
  const body = { tipo: "gasto", monto: 80, cuentaId: "bcp-1234", fecha: "2026-07-05" };
  await request(app).post("/transacciones").send(body);
  const res = await request(app).post("/transacciones").send(body);
  expect(res.status).toBe(409);
});