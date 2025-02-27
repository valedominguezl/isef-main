// src/entry-server.jsx
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

export default function EntryServer({ url, context = {} }) {
  return (
    <HelmetProvider>
      <StaticRouter location={url} context={context}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );
}
