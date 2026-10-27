# Agendau · Versión web (v1)

App para organizar tareas, entregas, exámenes y compromisos universitarios, con recordatorios de acuerdo  a pripridad que le brindes

## Estructura
```
agendau/
├── index.html        # Estructura de la página y formulario
├── css/styles.css    # Estilos (responsive)
├── js/storage.js     # Capa de datos (localStorage, exportar/importar JSON)
├── js/app.js         # Lógica: tareas, vistas, recordatorios
└── README.md
```

## Cómo ejecutarla en Visual Studio Code
1. Abre la carpeta `agendau` en VS Code (Archivo > Abrir carpeta).
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` > **Open with Live Server**.
4. En la app pulsa "Activar notificaciones" para recibir avisos del navegador.

## Funciones de esta versión
- Crear, editar, eliminar y completar tareas (título, tipo, materia, fecha, hora, prioridad, notas, compañeros).
- Recordatorio configurable (10 min hasta 1 semana antes) y repetición (diaria, semanal, quincenal, mensual).
- Vistas: Lista (vencidas / hoy / 7 días / después / hechas), Semana y Mes.
- Gráfico de carga de los próximos 7 días; filtros y búsqueda.
- Copia de seguridad: exportar e importar JSON.

## Límites conocidos (para las siguientes fases)
- Los datos viven en el navegador; no hay cuentas ni sincronización con la app móvil.
- Los avisos funcionan mientras la pestaña está abierta.

## Fase 2 sugerida
Backend (Node + Express + base de datos), autenticación, API REST y sincronización en tiempo real con la app móvil. Basta con reemplazar `js/storage.js` por llamadas a la API.
