// js/admin.js - Lógica del panel de administrador (integrante 4)

// ---------- Configuración ----------
const USAR_PRUEBA = true; // poner en false cuando el servidor esté funcionando
const API_URL = "";       // dirección del servidor

// "Servidor falso" para poder probar sin backend
let datosPrueba = [
  { id: 1, apellido: "Gonzalez", nombre: "Matias", documento: "12345678", email: "matiasagonzalez08@gmail.com", celular: "1234567890", empresa: "Tech", cargo: "Dev" },
  { id: 2, apellido: "Campana", nombre: "Valentina", documento: "23456789", email: "valentina.campana.martos@gmail.com", celular: "1198765432", empresa: "Redes SA", cargo: "Analista" },
  { id: 3, apellido: "Lucchini", nombre: "Giuliana", documento: "34567890", email: "giulilucchini8@gmail.com", celular: "341555123", empresa: "Soft", cargo: "QA" },
  { id: 3, apellido: "Morganti", nombre: "Lucia", documento: "34567890", email: "luciamorganti197@gmail.com", celular: "341555123", empresa: "Tech", cargo: "QA" }
];

const CAMPOS = ["apellido", "nombre", "documento", "email", "celular", "empresa", "cargo"];
const CAMPOS_BUSQUEDA = ["apellido", "nombre", "documento", "email"];

// ---------- Elementos (IDs acordados con el grupo) ----------
const tablaBody = document.getElementById("tabla-body");
const inputBusqueda = document.getElementById("input-busqueda");
const contador = document.getElementById("contador-inscriptos");
const btnRefrescar = document.getElementById("btn-refrescar");

let inscriptos = [];
let idEnEdicion = null; // id (como texto) de la fila que se está editando

// ---------- Comunicación con el servidor ----------
async function pedirInscriptos() {
  if (USAR_PRUEBA) return datosPrueba.map(i => ({ ...i }));
  const r = await fetch(API_URL + "/");
  if (!r.ok) throw new Error("Error " + r.status);
  return await r.json();
}

async function actualizarEnServidor(id, datos) {
  if (USAR_PRUEBA) {
    datosPrueba = datosPrueba.map(i => (String(i.id) === id ? { ...i, ...datos } : i));
    return;
  }
  const r = await fetch(API_URL + "/actualizar/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  if (!r.ok) throw new Error("Error " + r.status);
}

async function eliminarEnServidor(id) {
  if (USAR_PRUEBA) {
    datosPrueba = datosPrueba.filter(i => String(i.id) !== id);
    return;
  }
  const r = await fetch(API_URL + "/eliminar/" + id, { method: "DELETE" });
  if (!r.ok) throw new Error("Error " + r.status);
}

// ---------- Dibujar la tabla ----------
function normalizar(texto) {
  // minúsculas y sin tildes
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filaMensaje(texto, esAviso) {
  const tr = document.createElement("tr");
  if (esAviso) tr.className = "aviso";
  const td = document.createElement("td");
  td.colSpan = CAMPOS.length + 1;
  td.textContent = texto;
  tr.appendChild(td);
  return tr;
}

function crearBoton(texto, accion, id) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = texto;
  b.dataset.accion = accion;
  b.dataset.id = id;
  return b;
}

function filaNormal(inscripto) {
  const tr = document.createElement("tr");
  CAMPOS.forEach(campo => {
    const td = document.createElement("td");
    td.textContent = inscripto[campo] ?? "";
    tr.appendChild(td);
  });
  const tdAcciones = document.createElement("td");
  tdAcciones.append(
    crearBoton("Editar", "editar", inscripto.id),
    crearBoton("Borrar", "borrar", inscripto.id)
  );
  tr.appendChild(tdAcciones);
  return tr;
}

function filaEdicion(inscripto) {
  const tr = document.createElement("tr");
  CAMPOS.forEach(campo => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.value = inscripto[campo] ?? "";
    input.dataset.campo = campo;
    td.appendChild(input);
    tr.appendChild(td);
  });
  const tdAcciones = document.createElement("td");
  tdAcciones.append(
    crearBoton("Guardar", "guardar", inscripto.id),
    crearBoton("Cancelar", "cancelar", inscripto.id)
  );
  tr.appendChild(tdAcciones);
  return tr;
}

function mostrar() {
  const texto = normalizar(inputBusqueda.value.trim());
  const visibles = inscriptos.filter(i =>
    CAMPOS_BUSQUEDA.some(campo => normalizar(i[campo] ?? "").includes(texto))
  );

  tablaBody.innerHTML = "";
  if (visibles.length === 0) {
    tablaBody.appendChild(
      filaMensaje(texto ? "Ningún inscripto coincide con la búsqueda." : "Todavía no hay inscriptos.")
    );
  }
  visibles.forEach(i => {
    tablaBody.appendChild(String(i.id) === idEnEdicion ? filaEdicion(i) : filaNormal(i));
  });

  // Sin filtro: total. Con filtro: "mostrados de total".
  contador.textContent = texto ? visibles.length + " de " + inscriptos.length : inscriptos.length;
}

function avisar(texto) {
  const anterior = tablaBody.querySelector(".aviso");
  if (anterior) anterior.remove();
  tablaBody.prepend(filaMensaje(texto, true));
}

// ---------- Acciones ----------
async function cargarInscriptos() {
  try {
    inscriptos = await pedirInscriptos();
    idEnEdicion = null;
    mostrar();
  } catch (error) {
    avisar("No se pudo cargar la lista. Revisá la conexión con el servidor e intentá de nuevo.");
  }
}

async function guardarEdicion(boton) {
  const inputs = boton.closest("tr").querySelectorAll("input");
  const datos = {};
  let hayVacios = false;

  inputs.forEach(input => {
    datos[input.dataset.campo] = input.value.trim();
    const vacio = input.value.trim() === "";
    input.style.borderColor = vacio ? "red" : "";
    if (vacio) hayVacios = true;
  });

  if (hayVacios) {
    avisar("Completá todos los campos antes de guardar.");
    return;
  }

  try {
    await actualizarEnServidor(boton.dataset.id, datos);
    await cargarInscriptos();
  } catch (error) {
    avisar("No se pudieron guardar los cambios. Intentá de nuevo.");
  }
}

async function borrar(id) {
  if (!confirm("¿Seguro que querés borrar este inscripto?")) return;
  try {
    await eliminarEnServidor(id);
    await cargarInscriptos();
  } catch (error) {
    avisar("No se pudo borrar el inscripto. Intentá de nuevo.");
  }
}

// ---------- Eventos ----------
tablaBody.addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;

  switch (boton.dataset.accion) {
    case "editar":
      idEnEdicion = boton.dataset.id;
      mostrar();
      break;
    case "cancelar":
      idEnEdicion = null;
      mostrar();
      break;
    case "guardar":
      guardarEdicion(boton);
      break;
    case "borrar":
      borrar(boton.dataset.id);
      break;
  }
});

inputBusqueda.addEventListener("input", mostrar);
if (btnRefrescar) btnRefrescar.addEventListener("click", cargarInscriptos);

cargarInscriptos();

// --- Agregado mínimo para Login y Tema ---
document.getElementById("btn-ojito").addEventListener("click", () => {
  const pass = document.getElementById("input-password");
  pass.type = pass.type === "password" ? "text" : "password";
});

document.getElementById("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("input-usuario").value;
  const pass = document.getElementById("input-password").value;
  
  if (user === "veinticinco" && pass === "cinco_555") {
    document.getElementById("contenedor-login").classList.add("oculto");
    document.getElementById("panel-admin").classList.remove("oculto");
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});

document.getElementById("btn-tema").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

document.getElementById("btn-tema-login").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});