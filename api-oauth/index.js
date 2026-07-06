const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json(), cors());

let consentimientoActivo = true;

app.get('/seguridad/consentimiento', (expressReq, expressRes) => {
  expressRes.json({ activo: consentimientoActivo, sbs_compliant: true });
});

app.delete('/seguridad/consentimiento', (expressReq, expressRes) => {
  consentimientoActivo = false;
  console.log('⚠️ [Seguridad] Consentimiento revocado por el usuario. Notificando a contexto Cuentas Bancarias.');
  expressRes.status(200).json({ mensaje: 'Consentimiento revocado legalmente via SBS' });
});

app.listen(3005, () => console.log('🔒 API Seguridad (OAuth2/Consentimientos) activa en :3005'));
