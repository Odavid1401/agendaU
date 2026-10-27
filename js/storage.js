// Capa de datos. Hoy usa localStorage; en la fase 2 se reemplaza por llamadas
// a la API (mismos métodos) para sincronizar con la app móvil.
const Store = (() => {
  const KEY = 'agendau.v1';
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  };
  const save = (tasks) => localStorage.setItem(KEY, JSON.stringify(tasks));
  const exportJSON = (tasks) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' }));
    a.download = 'agendau-copia.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJSON = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data)) throw new Error('Formato inválido');
        res(data);
      } catch (e) { rej(e); }
    };
    r.onerror = rej;
    r.readAsText(file);
  });
  return { load, save, exportJSON, importJSON };
})();
