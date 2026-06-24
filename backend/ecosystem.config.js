export default {
  apps: [
    {
      name:      'sg-api',
      script:    'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch:     false,
      node_args: '--experimental-vm-modules',
      env_production: {
        NODE_ENV:  'production',
      },
      error_file:      'logs/pm2-error.log',
      out_file:        'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '512M',
      // Zero-downtime deploy: pm2 reload sg-api
    },
  ],
};
