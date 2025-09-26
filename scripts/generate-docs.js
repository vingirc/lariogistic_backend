const fs = require('fs');
const swaggerSpec = require('../src/config/swagger');
const { execSync } = require('child_process');

try {
  // Crear directorio docs si no existe
  if (!fs.existsSync('docs')) {
    fs.mkdirSync('docs');
    console.log(`[${new Date().toISOString()}] Created docs directory`);
  }

  // 1. Generar archivo JSON
  fs.writeFileSync('docs/openapi.json', JSON.stringify(swaggerSpec, null, 2));
  console.log(`[${new Date().toISOString()}] OpenAPI JSON generated`);

  // 2. Generar HTML con Redocly (versión simplificada)
  try {
    const redocCommand = 'npx @redocly/cli build-docs docs/openapi.json -o docs/api-docs.html --disableGoogleFont';
    execSync(redocCommand, { stdio: 'inherit' });
    console.log(`[${new Date().toISOString()}] HTML docs generated`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] HTML generation failed:`, error.message);
    throw error;
  }

  // 3. Generar Markdown con Widdershins
  try {
    execSync('npx widdershins docs/openapi.json -o docs/api-docs.md --lang', { 
      stdio: 'ignore'
    });
    console.log(`[${new Date().toISOString()}] Markdown docs generated`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Markdown generation failed:`, error.message);
  }

  // 4. Generar índice HTML
  const indexHtml = `<!DOCTYPE html>
  <html>
  <head>
    <title>API Documentation</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; background: #f9f9f9; }
      .container { max-width: 800px; margin: auto; }
      a { color: #3366ff; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>API Documentation</h1>
      <ul>
        <li><a href="api-docs.html">HTML Documentation</a></li>
        <li><a href="api-docs.md">Markdown Version</a></li>
        <li><a href="openapi.json">OpenAPI Spec</a></li>
        <li><a href="/api-docs/">Swagger UI</a></li>
      </ul>
    </div>
  </body>
  </html>`;

  fs.writeFileSync('docs/index.html', indexHtml);
  console.log(`[${new Date().toISOString()}] Index page created`);

} catch (err) {
  console.error(`[${new Date().toISOString()}] Fatal error:`, err);
  process.exit(1);
}