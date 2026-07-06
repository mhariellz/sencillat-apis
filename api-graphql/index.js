const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

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

const resolvers = {
  Query: {
    resumenPeriodo: (_, { mes }) => ({
      mes,
      totalGastado: 1250.00,
      distribucion: [
        { nombre: 'Alimentación', porcentaje: 45.0, monto: 562.50 },
        { nombre: 'Servicios', porcentaje: 30.0, monto: 375.00 },
        { nombre: 'Entretenimiento', porcentaje: 15.0, monto: 187.50 },
        { nombre: 'Otros', porcentaje: 10.0, monto: 125.00 }
      ]
    })
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`🚀 API GraphQL lista en: ${url}`);
});
