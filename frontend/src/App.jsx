import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Estados de lectura (READ)
  const [resumenRest, setResumenRest] = useState(null);
  const [bitacoraEventos, setBitacoraEventos] = useState([]);
  const [loadingRest, setLoadingRest] = useState(true);
  
  // Estados de creación y edición (CREATE / UPDATE)
  const [descripcion, setDescripcion] = useState('Starbucks Coffee');
  const [monto, setMonto] = useState('45.00');
  const [banco, setBanco] = useState('BCP');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. [READ] Función para leer el estado actual del sistema
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

  // 2. [CREATE / UPDATE] Función para guardar o modificar una transacción
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
      // Enviamos un POST al Broker para registrar la mutación de estado
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
        alert(editandoId ? "¡Transacción actualizada con éxito!" : "¡Transacción registrada con éxito!");
        // Limpiar el formulario
        setDescripcion('');
        setMonto('');
        setEditandoId(null);
        cargarDatos();
      }
    } catch (err) {
      alert("Error de conexión con el backend.");
    }
  };

  // Cargar datos en el formulario para iniciar la edición (Pre-UPDATE)
  const iniciarEdicion = (evento) => {
    setEditandoId(evento.datos.id);
    setDescripcion(evento.datos.descripcion);
    setMonto(evento.datos.monto);
    setBanco(evento.datos.banco || 'BCP');
  };

  // 3. [DELETE] Función para eliminar una transacción de la bitácora
  const manejarEliminarGasto = async (idEliminar) => {
    if (!window.confirm("¿Estás seguro de eliminar esta transacción? Se notificará al Bounded Context.")) return;

    try {
      // Disparamos el evento de eliminación hacia el Broker de mensajería
      const respuesta = await fetch('http://localhost:3004/eventos/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: "TransaccionElimitada",
          origen: "Frontend Móvil - SencillaT",
          datos: { id: idEliminar, timestamp: new Date().toISOString() }
        })
      });

      if (respuesta.ok) {
        alert("Evento 'TransaccionElimitada' enviado. Registro purgado.");
        cargarDatos();
      }
    } catch (err) {
      alert("Error al procesar la baja.");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="main-header">
        <h1 className="main-title">🐙 SencillaT — Panel de Control Core v2.0</h1>
        <p className="main-subtitle">Mapeo e interactividad en vivo de funciones CRUD sobre eventos de dominio financieros.</p>
      </header>

      <div className="grid-layout">
        <div>
          {/* Tarjeta de Cuentas (READ) */}
          <div className="card">
            <h2 className="card-title-accounts">🏦 [READ] Balance Consolidado Multibanca</h2>
            {loadingRest ? (
              <p className="text-muted">Leyendo saldos Open Banking...</p>
            ) : resumenRest ? (
              <div>
                <div className="total-amount">
                  S/. {resumenRest.saldoTotal?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-muted">Datos de lectura limpia transmitidos via HTTP GET.</p>
              </div>
            ) : (
              <p className="text-danger">⚠️ API REST fuera de línea (Puerto :3001)</p>
            )}
          </div>

          {/* Formulario de Control (CREATE / UPDATE) */}
          <div className="card">
            <h2 className="card-title-trigger">
              {editandoId ? "📝 [UPDATE] Modificar Transacción Seleccionada" : "🚀 [CREATE] Registrar Nueva Transacción"}
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
                {editandoId ? "Actualizar Registro (Post/Put)" : "Publicar Evento (Post)"}
              </button>
              {editandoId && (
                <button type="button" className="btn-submit" style={{ background: '#64748b', marginTop: '8px' }} onClick={() => { setEditandoId(null); setDescripcion(''); setMonto(''); }}>
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Panel del Bus de Eventos con Acciones CRUD (UPDATE / DELETE) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title-broker">📡 [READ/DELETE] Trazabilidad Asíncrona de la Bitácora</h2>
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
                    <strong>ID Interno:</strong> {evt.datos.id || 'N/A'} <br />
                    <strong>Payload:</strong> {JSON.stringify(evt.datos, null, 2)}
                  </div>
                  
                  {/* Botones de Control de Estado CRUD para la sustentación */}
                  {evt.nombre === "TransaccionRegistrada" && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => iniciarEdicion(evt)} style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#eab308', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ✏️ Editar (U)
                      </button>
                      <button onClick={() => manejarEliminarGasto(evt.datos.id)} style={{ padding: '4px 10px', fontSize: '0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🗑️ Eliminar (D)
                      </button>
                    </div>
                  )}
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
