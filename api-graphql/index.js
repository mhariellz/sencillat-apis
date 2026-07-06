// index.js
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { resolvers } = require('./resolvers'); // 👈 Importa los resolvers

const typeDefs = `#graphql
  type CategoriaConsumo {
    nombre: String!
    porcentaje: Float!
    monto: Float!
  }
  type ResumenPresupuesto {
    mes: String!
    totalGastado: Float!
    distribucion: [CategoriaConsumo!]!
  }
  type Query {
    resumenPeriodo(mes: String!): ResumenPresupuesto
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 }
}).then(({ url }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
});