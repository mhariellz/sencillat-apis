const grpc = require("@grpc/grpc-js");
const loader = require("@grpc/proto-loader");
const def = loader.loadSync("clasificacion.proto");
const proto = grpc.loadPackageDefinition(def).sencillat;

const server = new grpc.Server();
server.addService(proto.Clasificador.service, {
  ClasificarTransaccion: (call, cb) => {
    const d = (call.request.descripcion || "").toLowerCase();
    const cat = d.includes("starbucks") ? "Comida"
              : d.includes("uber") ? "Transporte" : "Otros";
    cb(null, { categoria: cat, confianza: cat === "Otros" ? 0.5 : 0.92 });
  },
});
server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("gRPC en :50051");
});
