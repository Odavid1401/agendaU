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

## Funciones de esta versión
- Crear, editar, eliminar y completar tareas (título, tipo, materia, fecha, hora, prioridad, notas, compañeros).
- Recordatorio configurable (10 min hasta 1 semana antes) y repetición (diaria, semanal, quincenal, mensual).
- Vistas: Lista (vencidas / hoy / 7 días / después / hechas), Semana y Mes.
- Gráfico de carga de los próximos 7 días; filtros y búsqueda.
- Copia de seguridad: exportar e importar JSON.

## Límites conocidos (para las siguientes fases)
- Los datos viven en el navegador actualmente en una versión de json storage donde aún no se comunica con la API ; no hay cuentas ni sincronización con la app móvil.
- Los avisos funcionan mientras la pestaña está abierta.

## Fase 2 sugerida
hacer Backend (Node y Express con base de datos PostgresSQL), autenticación mediante el correo de la U, API REST y sincronización en tiempo real con la app móvil. Basta con reemplazar `js/storage.js` por llamadas a la API.
