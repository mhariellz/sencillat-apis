const grpc = require("@grpc/grpc-js");
const loader = require("@grpc/proto-loader");
const proto = grpc.loadPackageDefinition(loader.loadSync("clasificacion.proto")).sencillat;
const client = new proto.Clasificador("localhost:50051", grpc.credentials.createInsecure());

client.ClasificarTransaccion({ descripcion: "Starbucks", monto: 15 }, (err, res) => {
  if (err) return console.error(err);
  console.log("Respuesta:", res);
});
