import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';  // Usado para manejar rutas en SSR
import App from './src/main.jsx';  
import path from 'path';
import express from 'express';

const app = express();

// Servir archivos estáticos como el CSS generado
app.use(express.static(path.resolve(__dirname, 'dist')));

// Ruta para manejar todas las solicitudes de la app
app.get('*', (req, res) => {
  // Renderiza la app en el servidor
  const appMarkup = ReactDOMServer.renderToString(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>
  );

  // Generar HTML dinámico
  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Descripción de tu app">
        <title>ISEF San Luís | Profesorado de educación física</title>
        
        <!-- Preconnect y DNS Prefetch -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;500;600&family=Merriweather:ital,wght@0,300;0,700;1,300;1,700&display=swap" rel="stylesheet">
        
        <!-- Favicon e íconos -->
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png">

        <!-- CSS generado -->
        <link rel="stylesheet" href="/assets/styles.css">
      </head>
      <body>
        <!-- ID root donde React se hidratará -->
        <div id="root">${appMarkup}</div>
        
        <!-- Script principal -->
        <script type="module" src="/assets/main.js"></script>
      </body>
    </html>
  `;

  // Enviar la respuesta al navegador
  res.send(html);
});

// Cambiar a tu puerto de producción
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://isefsanluis.net:${port}`);
});
