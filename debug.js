const http = require('http');

// Helper to fetch JSON from Chrome CDP HTTP endpoint
function fetchCDPTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log("Conectando a Chrome Debugging Port...");
  let targets;
  try {
    targets = await fetchCDPTargets();
  } catch (e) {
    console.error("Error al conectar. ¿Está Chrome ejecutándose con --remote-debugging-port=9222?", e.message);
    process.exit(1);
  }

  const target = targets.find(t => t.type === 'page');
  if (!target) {
    console.error("No se encontró ninguna página activa en Chrome.");
    process.exit(1);
  }

  const wsUrl = target.webSocketDebuggerUrl;
  console.log("Conectando al WebSocket de depuración:", wsUrl);

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket conectado. Habilitando logs...");
    ws.send(JSON.stringify({ id: 1, method: "Console.enable" }));
    ws.send(JSON.stringify({ id: 2, method: "Runtime.enable" }));
    
    // Navegar a la url local
    console.log("Navegando a http://localhost:8080 ...");
    ws.send(JSON.stringify({
      id: 3,
      method: "Page.navigate",
      params: { url: "http://localhost:8080" }
    }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    // Capturar logs de la consola
    if (msg.method === "Console.messageAdded") {
      const { level, text, url, line } = msg.params.message;
      console.log(`[BROWSER CONSOLE - ${level.toUpperCase()}]: ${text} (${url || 'unknown'}:${line || 0})`);
    }
    
    // Capturar excepciones sin capturar (crashes de JS)
    if (msg.method === "Runtime.exceptionThrown") {
      const { exceptionDetails } = msg.params;
      const text = exceptionDetails.exception ? exceptionDetails.exception.description : exceptionDetails.text;
      console.error(`[BROWSER JS EXCEPTION]: ${text} at line ${exceptionDetails.lineNumber}:${exceptionDetails.columnNumber}`);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  // Ejecutar durante 8 segundos para capturar todos los errores al iniciar la página
  setTimeout(() => {
    console.log("Finalizando depuración...");
    ws.close();
    process.exit(0);
  }, 8000);
}

main();
