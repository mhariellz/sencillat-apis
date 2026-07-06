import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [resumenRest, setResumenRest] = useState(null);
  const [bitacoraEventos, setBitacoraEventos] = useState([]);
  const [loadingRest, setLoadingRest] = useState(true);
  
  const [descripcion, setDescripcion] = useState('Starbucks Coffee');
  const [monto, setMonto] = useState('45.00');
  const [banco, setBanco] = useState('BCP');

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await fetch('http://localhost:3001/cuentas/resumen');
      const data = await res.json();
      setResumenRest(data);
    } catch (err) {
      console.error("API REST desconectada");
    } finally {
      setLoadingRest(false);
    }

    try {
      const res = await fetch('http://localhost:3004/eventos/bitacora');
      const data = await res.json();
      setBitacoraEventos(data);
    } catch (err) {
      console.error("Broker de eventos fuera de línea");
    }
  };

  const manejarRegistroGasto = async (e) => {
    e.preventDefault();
    if (!descripcion || !monto) return;

    try {
      const respuesta = await fetch('http://localhost:3004/eventos/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: "TransaccionRegistrada",
          origen: "Frontend Móvil - SencillaT",
          datos: { descripcion, monto: parseFloat(monto), banco, timestamp: new Date().toISOString() }
        })
      });

      if (respuesta.ok) {
        setDescripcion('');
        setMonto('');
        cargarDatos();
      }
    } catch (err) {
      alert("Error al conectarse con el Broker de Eventos.");
    }
  };

  return (
    <div className="dashboard-container">
      
      <header className="main-header">
        <h1 className="main-title">🐙 SencillaT — Panel de Control Core v2.0</h1>
        <p className="main-subtitle">Sincronización táctica interactiva integrada con la interfaz de tu línea gráfica oficial.</p>
      </header>

      <div className="grid-layout">
        
        <div>
          {/* Tarjeta de Cuentas */}
          <div className="card">
            <h2 className="card-title-accounts">🏦 Bounded Context: Gestión de Cuentas (REST)</h2>
            {loadingRest ? (
              <p className="text-muted">Leyendo saldos consolidados Open Banking...</p>
            ) : resumenRest ? (
              <div>
                <div className="total-amount">
                  S/. {resumenRest.saldoTotal?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-muted">Balance total homologado en tiempo real desde el ecosistema multibanca.</p>
              </div>
            ) : (
              <p className="text-danger">⚠️ API REST fuera de línea (Verifica el puerto :3001)</p>
            )}
          </div>

          {/* Formulario de Simulación */}
          <div className="card">
            <h2 className="card-title-trigger">🚀 Disparador: Registrar Transacción en la App</h2>
            <form onSubmit={manejarRegistroGasto}>
              <div className="form-group">
                <label className="form-label">Establecimiento / Detalle de Gasto:</label>
                <input type="text" className="form-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
              </div>
              
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="form-label">Monto de Operación (S/.):</label>
                  <input type="number" step="0.01" className="form-input" value={monto} onChange={(e) => setMonto(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Entidad Bancaria:</label>
                  <select className="form-select" value={banco} onChange={(e) => setBanco(e.target.value)}>
                    <option value="BCP">Banco BCP</option>
                    <option value="BBVA">BBVA Continental</option>
                    <option value="Interbank">Interbank</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn-submit">Publicar Evento de Dominio</button>
            </form>
          </div>
        </div>

        {/* Panel del Broker */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title-broker">📡 Bus de Eventos: Trazabilidad Global Asíncrona (:3004)</h2>
          <div className="events-log-container">
            {bitacoraEventos.length === 0 ? (
              <div className="event-empty-state">
                <p style={{ fontSize: '3.5rem', margin: 0 }}>⚡</p>
                <p style={{ marginTop: '12px', fontWeight: '500' }}>Esperando disparadores del dominio financiero...</p>
              </div>
            ) : (
              [...bitacoraEventos].reverse().map((evt) => (
                <div key={evt.id} className="event-item">
                  <div className="event-item-header">
                    <strong>{evt.nombre}</strong>
                    <span className="event-badge-time">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="event-payload-box">
                    <strong>Contexto Emisor:</strong> {evt.origen} <br />
                    <strong>Payload:</strong> {JSON.stringify(evt.datos, null, 2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
