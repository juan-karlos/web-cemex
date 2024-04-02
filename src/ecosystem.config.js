module.exports = {
  apps: [
    {
      name: "web-cemex",
      script: "index.js", // Nombre del archivo de inicio de tu aplicación
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT : "3200",
        DB_HOST: "localhost",
        DB_USER:"root",
        DB_PASSWORD: "74108520",
        DB_NAME :"cemex",
        DB_PORT:"3306"
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};

