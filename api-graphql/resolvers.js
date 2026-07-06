// resolvers.js
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

module.exports = { resolvers };