const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8855;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint: GET /proxy/miner?ip=192.168.1.x
// Calls the Bitaxe REST API from the server side (no CORS issue)
app.get('/proxy/miner', async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: 'Missing ip parameter' });

  // Basic IP validation - only allow LAN addresses
  const lanPattern = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)$/;
  if (!lanPattern.test(ip)) {
    return res.status(400).json({ error: 'Only LAN IP addresses are allowed' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`http://${ip}/api/system/info`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`Bitaxe returned HTTP ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout reaching Bitaxe at ' + ip });
    }
    res.status(502).json({ error: err.message });
  }
});

// Ping endpoint: measures RTT to pool host from the Umbrel server
app.get('/proxy/ping', async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: 'Missing host parameter' });

  // Sanitize host - alphanumeric, dots, dashes only
  if (!/^[a-zA-Z0-9.\-]+$/.test(host)) {
    return res.status(400).json({ error: 'Invalid host' });
  }

  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    await fetch(`http://${host}`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    res.json({ ms: Date.now() - t0, host });
  } catch (err) {
    // Even on error (connection refused etc) we still get the RTT
    res.json({ ms: Date.now() - t0, host, note: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bitaxe Monitor running on http://0.0.0.0:${PORT}`);
});
