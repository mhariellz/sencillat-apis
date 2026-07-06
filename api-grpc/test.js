// test.js
const { clasificar } = require("./clasificador");

console.log("=== Pruebas de clasificación ===");
console.log("");

const pruebas = [
  { descripcion: "Starbucks café", esperado: "Comida" },
  { descripcion: "Viaje en Uber", esperado: "Transporte" },
  { descripcion: "Compra en tienda", esperado: "Otros" },
  { descripcion: "Starbucks y Uber", esperado: "Comida" },
  { descripcion: "uber a casa", esperado: "Transporte" },
  { descripcion: "", esperado: "Otros" }
];

pruebas.forEach(({ descripcion, esperado }) => {
  const resultado = clasificar(descripcion);
  const pasa = resultado.categoria === esperado;
  console.log(`📝 "${descripcion}"`);
  console.log(`   → ${resultado.categoria} (confianza: ${resultado.confianza})`);
  console.log(`   ${pasa ? '✅' : '❌'} ${pasa ? 'PASA' : 'FALLA'} (esperado: ${esperado})`);
  console.log("");
});