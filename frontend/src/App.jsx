import React, { useState, useEffect } from 'react';
import './App.css'; // <--- ¡Aquí vinculamos el CSS limpio!

function App() {
  // Lógica (JavaScript)
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
        alert(`¡Gasto registrado! Evento enviado al Broker.`);
        setDescripcion('');
        setMonto('');
        cargarDatos();
      }
    } catch (err) {
      alert("Error al conectarse con el Broker de Eventos.");
    }
  };

  // Estructura (HTML / JSX) con Clases CSS limpias
  return (
    <div className="dashboard-container">
      
      <header className="main-header">
        <h1 className="main-title">🔲 SencillaT — Panel de Control Arquitectura DDD v2.0</h1>
        <p className="main-subtitle">Monitoreo interactivo de flujos tácticos y Bounded Contexts cruzando fronteras.</p>
      </header>

      <div className="grid-layout">
        
        <div>
          {/* Tarjeta de Cuentas */}
          <div className="card">
            <h2 className="card-title-accounts">🟢 Contexto: Gestión de Cuentas Bancarias (REST)</h2>
            {loadingRest ? (
              <p>Cargando saldos consolidados...</p>
            ) : resumenRest ? (
              <div>
                <div className="total-amount">
                  S/. {resumenRest.saldoTotal?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-muted">Saldos unificados multibanca via Open Banking.</p>
              </div>
            ) : (
              <p className="text-danger">⚠️ API REST fuera de línea en el puerto 3001.</p>
            )}
          </div>

          {/* Formulario de Control */}
          <div className="card">
            <h2 className="card-title-trigger">⚡ Disparador: Simular Registro de Transacción</h2>
            <form onSubmit={manejarRegistroGasto}>
              <div className="form-group">
                <label className="form-label">Comercio / Descripción:</label>
                <input type="text" className="form-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
              </div>
              
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="form-label">Monto (S/.):</label>
                  <input type="number" step="0.01" className="form-input" value={monto} onChange={(e) => setMonto(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Banco de Origen:</label>
                  <select className="form-select" value={banco} onChange={(e) => setBanco(e.target.value)}>
                    <option value="BCP">Banco BCP</option>
                    <option value="BBVA">BBVA Continental</option>
                    <option value="Interbank">Interbank</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn-submit">Disparar Evento en Cadena</button>
            </form>
          </div>
        </div>

        {/* Panel del Broker */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title-broker">📡 Broker Global: Bitácora Asíncrona de Eventos (:3004)</h2>
          <div className="events-log-container">
            {bitacoraEventos.length === 0 ? (
              <div className="event-empty-state">
                <p style={{ fontSize: '3rem', margin: 0 }}>📦</p>
                <p>Ningún evento de dominio ha cruzado las fronteras del sistema aún.</p>
              </div>
            ) : (
              [...bitacoraEventos].reverse().map((evt) => (
                <div key={evt.id} className="event-item">
                  <div className="event-item-header">
                    <strong style={{ color: '#59359a' }}>{evt.nombre}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#495057' }}>
                    <strong>Origen:</strong> {evt.origen} <br />
                    <strong>Datos Payload:</strong> {JSON.stringify(evt.datos)}
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
