import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [resumenRest, setResumenRest] = useState(null);
  const [bitacoraEventos, setBitacoraEventos] = useState([]);
  const [loadingRest, setLoadingRest] = useState(true);
  
  const [descripcion, setDescripcion] = useState('Starbucks Coffee');
  const [monto, setMonto] = useState('45.00');
  const [banco, setBanco] = useState('BCP');
  const [editandoId, setEditandoId] = useState(null);

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

  const manejarGuardarGasto = async (e) => {
    e.preventDefault();
    if (!descripcion || !monto) return;

    const nombreEvento = editandoId ? "TransaccionModificada" : "TransaccionRegistrada";
    const payload = {
      id: editandoId || `tx-${Math.random().toString(36).substr(2, 5)}`,
      descripcion,
      monto: parseFloat(monto),
      banco,
      timestamp: new Date().toISOString()
    };

    try {
      const respuesta = await fetch('http://localhost:3004/eventos/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreEvento,
          origen: "Frontend Móvil - SencillaT",
          datos: payload
        })
      });

      if (respuesta.ok) {
        setDescripcion('');
        setMonto('');
        setEditandoId(null);
        cargarDatos();
      }
    } catch (err) {
      alert("Error de conexión con el backend.");
    }
  };

  const iniciarEdicion = (datosTransaccion) => {
    setEditandoId(datosTransaccion.id);
    setDescripcion(datosTransaccion.descripcion);
    setMonto(datosTransaccion.monto);
    setBanco(datosTransaccion.banco || 'BCP');
  };

  const manejarEliminarGasto = async (idEliminar) => {
    if (!window.confirm("¿Estás seguro de eliminar esta transacción?")) return;

    try {
      const respuesta = await fetch('http://localhost:3004/eventos/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: "TransaccionEliminada",
          origen: "Frontend Móvil - SencillaT",
          datos: { id: idEliminar, timestamp: new Date().toISOString() }
        })
      });

      if (respuesta.ok) {
        cargarDatos();
      }
    } catch (err) {
      alert("Error al procesar la baja.");
    }
  };

  const obtenerIconoComercio = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('starbucks') || d.includes('caf') || d.includes('coffe')) return '☕';
    if (d.includes('kfc') || d.includes('mcdonald') || d.includes('bembos') || d.includes('comida') || d.includes('restaurante')) return '🍔';
    if (d.includes('uber') || d.includes('taxi') || d.includes('pasaje')) return '🚗';
    if (d.includes('luz') || d.includes('agua') || d.includes('internet') || d.includes('servicio')) return '⚡';
    return '💸';
  };

  return (
    <div className="dashboard-container">
      <header className="main-header">
        <h1 className="main-title">🐙 SencillaT — Panel de Operaciones Core</h1>
        <p className="main-subtitle">Gestión interactiva multibanca en tiempo real bajo lineamientos de diseño UI/UX.</p>
      </header>

      <div className="grid-layout">
        <div>
          <div className="card">
            <h2 className="card-title-accounts">🏦 Balance Consolidado Multibanca</h2>
            {loadingRest ? (
              <p className="text-muted">Leyendo saldos Open Banking...</p>
            ) : resumenRest ? (
              <div>
                <div className="total-amount">
                  S/. {resumenRest.saldoTotal?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-muted">Consulta consolidada de cuentas vinculadas activas de forma segura.</p>
              </div>
            ) : (
              <p className="text-danger">⚠️ API REST fuera de línea (Puerto :3001)</p>
            )}
          </div>

          <div className="card">
            <h2 className="card-title-trigger">
              {editandoId ? "📝 Modificar Transacción" : "🚀 Registrar Nueva Transacción"}
            </h2>
            <form onSubmit={manejarGuardarGasto}>
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
              
              <button type="submit" className="btn-submit">
                {editandoId ? "Confirmar Cambios en Cuenta" : "Agregar Movimiento"}
              </button>
              {editandoId && (
                <button type="button" className="btn-submit" style={{ background: '#64748b', marginTop: '8px' }} onClick={() => { setEditandoId(null); setDescripcion(''); setMonto(''); }}>
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title-broker">📋 Movimientos Recientes del Ecosistema Financiero</h2>
          <div className="events-log-container">
            {bitacoraEventos.filter(e => e.nombre !== "TransaccionEliminada").length === 0 ? (
              <div className="event-empty-state">
                <p style={{ fontSize: '3.5rem', margin: 0 }}>📊</p>
                <p style={{ marginTop: '12px', fontWeight: '500' }}>No se registran transacciones el día de hoy.</p>
              </div>
            ) : (
              [...bitacoraEventos]
                .reverse()
                .filter(evt => evt.nombre !== "TransaccionEliminada")
                .map((evt) => {
                  const tx = evt.datos;
                  return (
                    <div key={evt.id} className="user-tx-card">
                      <div className="tx-icon-wrapper">
                        {obtenerIconoComercio(tx.descripcion || '')}
                      </div>
                      
                      <div className="tx-info-block">
                        <div className="tx-header-row">
                          <span className="tx-description">{tx.descripcion}</span>
                          <span className="tx-amount-negative">
                            - S/. {tx.monto?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="tx-footer-row">
                          <span className={`tx-badge-banco bank-${tx.banco?.toLowerCase()}`}>
                            {tx.banco}
                          </span>
                          <span className="tx-time">
                            {new Date(tx.timestamp || evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>

                      <div className="tx-actions-overlay">
                        <button type="button" className="action-icon-btn edit-btn" onClick={() => iniciarEdicion(tx)} title="Editar">✏️</button>
                        <button type="button" className="action-icon-btn delete-btn" onClick={() => manejarEliminarGasto(tx.id)} title="Eliminar">🗑️</button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
