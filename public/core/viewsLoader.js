export async function cargarVista(nombre, contenedorId) {
  const res = await fetch(`./views/${nombre}.html`);
  const html = await res.text();
  document.getElementById(contenedorId).innerHTML = html;
}