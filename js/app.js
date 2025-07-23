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

  requestsDiv.prepend(requestElement);

  if (requestsDiv.children.length > 20) {
    requestsDiv.removeChild(requestsDiv.lastChild);
  }
}

function getMethodColor(method) {
  const colors = {
    GET: "primary",
    POST: "success",
    PUT: "warning",
    DELETE: "danger",
    PATCH: "info",
  };
  return colors[method] || "secondary";
}

async function cargarProductos() {
  const tabla = document
    .getElementById("tablaProductos")
    ?.getElementsByTagName("tbody")[0];
  if (!tabla) return;

  tabla.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">
                <div class="d-flex justify-content-center align-items-center">
                    <div class="spinner-border text-primary me-3"></div>
                    <span>Cargando productos desde la API...</span>
                </div>
            </td>
        </tr>
    `;

  try {
    const endpoint = "/productos";
    const url = `${API_BASE_URL}${endpoint}`;
    const hora = new Date().toLocaleTimeString();

    console.log(`GET ${endpoint}`);
    console.log(`Hora: ${hora}`);
    console.log(`Endpoint: ${url}`);

    const startTime = performance.now();
    const response = await fetch(url);
    const duration = performance.now() - startTime;

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const productos = await response.json();

    console.log(`Respuesta GET ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Duración: ${duration.toFixed(2)}ms`);
    console.log(`Datos recibidos:`, productos);

    logApiRequest("GET", endpoint, null, {
      status: response.status,
      duration: duration,
    });

    tabla.innerHTML = "";

    if (productos.length === 0) {
      tabla.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3 text-muted">
                        No hay productos registrados
                    </td>
                </tr>
            `;
      return;
    }

    productos.forEach((producto, index) => {
      const fila = tabla.insertRow();
      fila.style.animationDelay = `${index * 0.1}s`;
      fila.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${
                  producto.descripcion || '<span class="text-muted">N/A</span>'
                }</td>
                <td>$${
                  producto.precio ? producto.precio.toFixed(2) : "0.00"
                }</td>
                <td>
                    <button class="btn btn-sm btn-warning editar-producto me-2" data-id="${
                      producto.id
                    }">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger eliminar-producto" data-id="${
                      producto.id
                    }">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
    });

    document.querySelectorAll(".editar-producto").forEach((btn) => {
      btn.addEventListener("click", () =>
        cargarProductoParaEditar(btn.dataset.id)
      );
    });

    document.querySelectorAll(".eliminar-producto").forEach((btn) => {
      btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-3 text-danger">
                    <i class="bi bi-exclamation-triangle-fill"></i> Error cargando productos
                </td>
            </tr>
        `;
    mostrarAlerta("Error al cargar productos: " + error.message, "danger");
  }
}

async function agregarProducto() {
  const btn = document.getElementById("btnGuardarProducto");
  const originalText = btn.innerHTML;

  const producto = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    precio: parseFloat(document.getElementById("precio").value),
  };

  if (!producto.nombre || isNaN(producto.precio)) {
    mostrarAlerta(
      "Por favor complete todos los campos correctamente",
      "warning"
    );
    return;
  }

  try {
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Guardando...';
    btn.disabled = true;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const endpoint = "/productos";
    const url = `${API_BASE_URL}${endpoint}`;
    const hora = new Date().toLocaleTimeString();

    console.log(`POST ${endpoint}`);
    console.log(`Hora: ${hora}`);
    console.log(`Endpoint: ${url}`);
    console.log(`Datos enviados:`, producto);

    const startTime = performance.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });
    const duration = performance.now() - startTime;

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const nuevoProducto = await response.json();

    console.log(`Respuesta POST ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Duración: ${duration.toFixed(2)}ms`);
    console.log(`Datos recibidos:`, nuevoProducto);

    logApiRequest("POST", endpoint, producto, {
      status: response.status,
      duration: duration,
      response: nuevoProducto,
    });

    btn.innerHTML = '<i class="bi bi-check-circle"></i> ¡Guardado!';
    await new Promise((resolve) => setTimeout(resolve, 1000));

    document.getElementById("formAgregarProducto").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("agregarProductoModal")
    );
    modal.hide();
    await cargarProductos();

    mostrarAlerta("Producto agregado correctamente", "success");
  } catch (error) {
    console.error("Error al agregar producto:", error);
    btn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error';
    await new Promise((resolve) => setTimeout(resolve, 1500));
    mostrarAlerta("Error al agregar producto: " + error.message, "danger");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

async function cargarProductoParaEditar(id) {
  try {
    const endpoint = `/productos/${id}`;
    const url = `${API_BASE_URL}${endpoint}`;
    const hora = new Date().toLocaleTimeString();

    console.log(`GET ${endpoint}`);
    console.log(`Hora: ${hora}`);
    console.log(`Endpoint: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const producto = await response.json();

    console.log(`Respuesta GET ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Datos recibidos:`, producto);

    document.getElementById("editId").value = producto.id;
    document.getElementById("editNombre").value = producto.nombre;
    document.getElementById("editDescripcion").value =
      producto.descripcion || "";
    document.getElementById("editPrecio").value = producto.precio || "";

    const modal = new bootstrap.Modal(
      document.getElementById("editarProductoModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error al cargar producto:", error);
    mostrarAlerta(
      "Error al cargar producto para editar: " + error.message,
      "danger"
    );
  }
}

async function actualizarProducto() {
  const btn = document.getElementById("btnActualizarProducto");
  const originalText = btn.innerHTML;

  try {
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Actualizando...';
    btn.disabled = true;

    const id = document.getElementById("editId").value;
    const producto = {
      nombre: document.getElementById("editNombre").value,
      descripcion: document.getElementById("editDescripcion").value,
      precio: parseFloat(document.getElementById("editPrecio").value),
    };

    if (!producto.nombre || isNaN(producto.precio)) {
      throw new Error("Complete todos los campos correctamente");
    }

    const endpoint = `/productos/${id}`;
    const url = `${API_BASE_URL}${endpoint}`;
    const hora = new Date().toLocaleTimeString();

    console.log(`PUT ${endpoint}`);
    console.log(`Hora: ${hora}`);
    console.log(`Endpoint: ${url}`);
    console.log(`Datos enviados:`, producto);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar");
    }
