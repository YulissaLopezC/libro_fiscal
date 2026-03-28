export function renderSidebar() {
  return `
    <div class="logo-area">
      <div class="logo-text">LibroFiscal</div>
    </div>

    <nav>
      <button onclick="APP.mostrar('dashboard')">Dashboard</button>
      <button onclick="APP.mostrar('movimientos')">Movimientos</button>
    </nav>
  `;
}