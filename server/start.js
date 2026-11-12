import app from './index.js';

const port = Number(process.env.PORT || 3001);
const host = '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`[server] Portfolio and CMS server running on http://${host}:${port}`);
});

function gracefulShutdown(signal) {
  console.log(`[server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[server] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[server] Forcefully exiting after shutdown timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
