const { clasificar } = require("./clasificador");

test("PU-03: comercio conocido se clasifica con confianza >= 0.7", () => {
  const r = clasificar("Starbucks Miraflores");
  expect(r.categoria).toBe("Comida");
  expect(r.confianza).toBeGreaterThanOrEqual(0.7);
});

test("PU-04: descripcion desconocida cae a Otros con confianza < 0.7", () => {
  const r = clasificar("xyz123");
  expect(r.categoria).toBe("Otros");
  expect(r.confianza).toBeLessThan(0.7);
});
