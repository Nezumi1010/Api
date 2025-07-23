const API_BASE_URL = "http://localhost:3000/api";
let modoDesarrollo = false;

console.log("CONFIGURACIÓN DE LA API");
console.log({
  "URL Base": API_BASE_URL,
  "Endpoints disponibles": {
    Productos: {
      "GET Todos": "/productos",
      "GET Por ID": "/productos/:id",
      "POST Crear": "/productos",
      "PUT Actualizar": "/productos/:id",
      "DELETE Eliminar": "/productos/:id",
    },
  },
});

async function verificarEstadoAPI() {
  const statusElement = document.getElementById("api-status");
  const statusIcon = document.getElementById("api-status-icon");
  const statusText = document.getElementById("api-status-text");

  if (!statusElement) return;

  try {
    statusIcon.className = "spinner-grow spinner-grow-sm";
    statusText.textContent = "Conectando API...";

    const startTime = performance.now();
    const response = await fetch(`${API_BASE_URL}`);
    const duration = performance.now() - startTime;

    if (response.ok) {
      statusElement.classList.add("api-status-connected");
      statusIcon.className = "bi bi-check-circle-fill";
      statusText.textContent = `API Conectada (${duration.toFixed(0)}ms)`;

      if (!modoDesarrollo) {
        setTimeout(() => {
          statusElement.style.opacity = "0.5";
        }, 3000);
      }
    } else {
      throw new Error("API no disponible");
    }
  } catch (error) {
    statusElement.classList.add("api-status-disconnected");
    statusIcon.className = "bi bi-x-circle-fill";
    statusText.textContent = "API Desconectada";
    console.error("Error verificando estado API:", error);
  }
}

function configurarDebugPanel() {
  const toggleBtn = document.getElementById("toggle-debug");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", function () {
    const content = document.getElementById("debug-content");
    const icon = this.querySelector("i");

    if (content.style.display === "none") {
      content.style.display = "block";
      icon.className = "bi bi-chevron-up";
      modoDesarrollo = true;
    } else {
      content.style.display = "none";
      icon.className = "bi bi-chevron-down";
      modoDesarrollo = false;
    }
  });
}

function logApiRequest(method, endpoint, data = null, meta = {}) {
  const requestsDiv = document.getElementById("api-requests");
  if (!requestsDiv) return;

  const timestamp = new Date().toLocaleTimeString();
  const requestElement = document.createElement("div");

  requestElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <span class="badge bg-${getMethodColor(
                  method
                )} me-2">${method}</span>
                <span class="text-light">${endpoint}</span>
            </div>
            <small class="text-muted">${timestamp}</small>
        </div>
        ${
          data
            ? `<small class="d-block text-info mt-1">${JSON.stringify(
                data
              )}</small>`
            : ""
        }
        ${
          meta.status
            ? `<small class="d-block mt-1">
            <span class="badge bg-${
              meta.status >= 400 ? "danger" : "success"
            } me-2">
                Status: ${meta.status}
            </span>
            <span class="text-muted">${
              meta.duration ? meta.duration.toFixed(0) + "ms" : ""
            }</span>
        </small>`
            : ""
        }
    `;
