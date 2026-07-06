
const grpc = require("@grpc/grpc-js");
const loader = require("@grpc/proto-loader");
const { clasificar } = require("./clasificador"); 
const def = loader.loadSync("clasificacion.proto");
const proto = grpc.loadPackageDefinition(def).sencillat;

const server = new grpc.Server();
server.addService(proto.Clasificador.service, {
  ClasificarTransaccion: (call, cb) => {
    const resultado = clasificar(call.request.descripcion); 
    cb(null, resultado);
  },
});

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("gRPC en :50051");
});