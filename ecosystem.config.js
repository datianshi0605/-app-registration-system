module.exports = {
  apps: [{
    name: 'app-registration',
    script: 'server.js',
    watch: false,
    max_memory_restart: '300M',
    restart_delay: 3000,
    max_restarts: 50,
    autorestart: true,
    env: {
      NODE_ENV: 'production',
      PORT: 9999
    }
  }]
};
