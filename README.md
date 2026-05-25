# Bitaxe Monitor — Umbrel Community App

Real-time dashboard for your [Bitaxe](https://github.com/skot/bitaxe) open-source Bitcoin miner, packaged as an Umbrel community app.

## Features

- **Live hashrate** with rolling sparkline history
- **Chip temperature** with color-coded bar (green → orange → red)
- **Pool latency** measured server-side from Umbrel to the pool (no CORS issues)
- **Efficiency** in J/TH + watt draw
- **Share breakdown** — accepted, rejected, stale, acceptance rate
- **System info** — pool URL, uptime, best difficulty, frequency, hostname, firmware

Polls the Bitaxe `/api/system/info` REST endpoint every 10s (configurable).

## Install

1. In Umbrel, open the App Store → click the **⋯** menu (top right) → **Community App Stores**
2. Paste your fork URL: `https://github.com/YOUR_USERNAME/bitaxe-monitor-umbrel.git`
3. Click **Add**, find **Bitaxe Monitor**, and click **Install**
4. Open the app, enter your Bitaxe's LAN IP (e.g. `192.168.1.42`), click **Connect**

## How it works

```
Miner Browser (Umbrel UI)
      │
      │  HTTP :8855
      ▼
 Node.js server (on Umbrel)
  /proxy/miner?ip=...  ──────────► Bitaxe REST API (LAN)
  /proxy/ping?host=... ──────────► parasite.wtf (WAN latency)
  /                    ──────────► index.html dashboard
```

The Node proxy runs inside Docker on Umbrel and calls the Bitaxe API from the server side, avoiding any browser CORS restrictions.

## File structure

```
bitaxe-monitor-umbrel/
├── umbrel-app-store.yml          # App store manifest
└── bitaxe-monitor/
    ├── umbrel-app.yml            # App metadata (name, port, description)
    ├── docker-compose.yml        # Docker service definition
    └── app/
        ├── server.js             # Express proxy server
        ├── package.json
        └── public/
            └── index.html        # Dashboard frontend
```

## Requirements

- Umbrel (any recent version)
- Bitaxe running standard [AxeOS](https://github.com/skot/ESP-Miner) firmware
- Bitaxe must be on the same LAN as your Umbrel node

## Port

Default: **8855** (same as DPMP, change in `docker-compose.yml` if needed)

## License

MIT
