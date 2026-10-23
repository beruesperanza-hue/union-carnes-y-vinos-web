// Horarios vigentes desde oct-2026 (turnos = horas de última mesa, cierre menos 1:30):
//   lunes, jueves, viernes: cenas 19:30–23:00   · sábado: 14:00–16:00 y 19:30–23:30
//   martes, miércoles, domingo: cerrado
// Los turnos se cargan en la tabla Schedule. `aplicarHorarios` corre UNA sola vez
// por base de datos (Settings.horariosVersion) para no pisar cambios hechos después
// desde Configuración. Los turnos semanales que ya no existen se eliminan (Configuración
// no muestra los inactivos). Las reservas ya tomadas no se tocan.
const CENAS_23 = ['19:30', '20:00', '20:30', '21:00', '21:30'];

const TURNOS = {
  lunes: CENAS_23,
  jueves: CENAS_23,
  viernes: CENAS_23,
  sábado: ['14:00', '14:30', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
};

const VERSION = 1;

async function aplicarHorarios(prisma) {
  let settings = await prisma.settings.findFirst();
  if (!settings) return console.log('ℹ️ Horarios: sin Settings, se aplicarán con el seed.');
  if ((settings.horariosVersion || 0) >= VERSION) return;

  const existentes = await prisma.schedule.findMany();
  const plantilla = (hora) =>
    existentes.find((s) => s.dia === 'viernes' && s.hora === hora) ||
    existentes.find((s) => s.hora === hora && s.activo) ||
    null;

  const nuevos = new Set();
  for (const [dia, horas] of Object.entries(TURNOS)) {
    for (const hora of horas) {
      nuevos.add(`${dia}|${hora}`);
      const base = plantilla(hora);
      await prisma.schedule.upsert({
        where: { dia_hora: { dia, hora } },
        update: { activo: true },
        create: {
          dia,
          hora,
          capacidad: base ? base.capacidad : 30,
          capacidadVereda: base ? base.capacidadVereda : 0,
          activo: true,
        },
      });
    }
  }

  const sobrantes = existentes.filter((s) => !nuevos.has(`${s.dia}|${s.hora}`));
  const borrados = sobrantes.length
    ? (await prisma.schedule.deleteMany({ where: { id: { in: sobrantes.map((s) => s.id) } } })).count
    : 0;

  await prisma.settings.update({ where: { id: settings.id }, data: { horariosVersion: VERSION } });
  console.log(`✅ Horarios 2026-10 aplicados (${nuevos.size} turnos activos, ${borrados} eliminados)`);
}

module.exports = { TURNOS, aplicarHorarios };
