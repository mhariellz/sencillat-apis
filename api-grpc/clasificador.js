function clasificar(descripcion) {
  const d = (descripcion || "").toLowerCase();
  const categoria = d.includes("starbucks") ? "Comida"
                  : d.includes("uber") ? "Transporte" : "Otros";
  return { categoria, confianza: categoria === "Otros" ? 0.5 : 0.92 };
}
module.exports = { clasificar };