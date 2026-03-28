export function renderDashboard() {
  return `
    <div class="view active">
      <div class="container">
        <div class="topbar">
          <div>
            <div class="page-title">Hola, <span class="empresa-nombre">—</span></div>
            <div class="page-subtitle">Resumen general de movimientos</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card verde">
            <div class="stat-label">Total entradas</div>
            <div class="stat-value" id="stat-entradas">$0</div>
          </div>
        </div>
      </div>
    </div>
  `;
}