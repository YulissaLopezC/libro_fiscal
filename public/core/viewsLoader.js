// Carga los fragmentos HTML de views/ e los inyecta en el #app-views
const VIEWS = [
  'dashboard',
  'digitacion',
  'movimientos',
  'resumen',
  'catalogo'
];

export async function cargarVistas() {
  const contenedor = document.getElementById('app-views');
  if (!contenedor) return;

  if (contenedor.children.length > 0) return;

  const promesas = VIEWS.map(async nombre => {
    try {
      const res  = await fetch(`views/${nombre}.html`);
      const html = await res.text();
      const div  = document.createElement('div');
      div.id        = `view-${nombre}`;
      div.className = nombre === 'dashboard' ? 'view active' : 'view';
      div.innerHTML = html;
      contenedor.appendChild(div);
    } catch (e) {
      console.error(`Error cargando vista: ${nombre}`, e);
    }
  });

  await Promise.all(promesas);
}