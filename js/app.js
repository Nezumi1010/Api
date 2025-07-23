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