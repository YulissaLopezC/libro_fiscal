// Estado global compartido entre todos los módulos
export const state = {
  empresaId:          null,
  empresas:           [],
  cuentas:            {},
  metodos:            [],
  movimientos:        [],
  proveedores:        [],
  unsubMovimientos:   null,

  // Actualiza empresa activa y sus datos
  setEmpresa(id, emp) {
    this.empresaId = id;
    this.cuentas   = emp.cuentas || {};
    this.metodos   = emp.metodos || [];
  },

  // Empresa activa completa
  getEmpresa() {
    return this.empresas.find(e => e.id === this.empresaId) || null;
  }
};