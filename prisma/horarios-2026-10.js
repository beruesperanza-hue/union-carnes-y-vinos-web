// Horarios vigentes desde oct-2026. Los turnos son las horas en que se puede reservar:
//   lunes y jueves: cenas hasta las 22:00 · viernes: hasta las 22:30
//   sábado: 14:00–14:30 y cenas hasta las 22:30
//   martes, miércoles, domingo: cerrado
// Los turnos se cargan en la tabla Schedule. `aplicarHorarios` corre UNA sola vez
// por base de datos (Settings.horariosVersion) para no pisar cambios hechos después
// desde Configuración. Los turnos semanales que ya no existen se eliminan (Configuración
// no muestra los inactivos). Las reservas ya tomadas no se tocan.
const CENAS_22 = ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
const CENAS_2230 = [...CENAS_22, '22:30'];

const TURNOS = {
  lunes: CENAS_22,
  jueves: CENAS_22,
  viernes: CENAS_2230,
  sábado: ['14:00', '14:30', ...CENAS_2230],
};

// 1 = cambio de horarios de oct-2026 (agrega y elimina turnos).
// 2 = se amplían las últimas reservas (22:00 / 22:30): solo agrega, no borra nada.
const VERSION = 2;

async function aplicarHorarios(prisma) {
  let settings = await prisma.settings.findFirst();
  if (!settings) return console.log('ℹ️ Horarios: sin Settings, se aplicarán con el seed.');
  const versionActual = settings.horariosVersion || 0;
  if (versionActual >= VERSION) return;
  // Desde la versión 1 en adelante la base ya se limpió: no se vuelve a borrar nada.
  const limpiar = versionActual < 1;

  const existentes = await prisma.schedule.findMany();
  // Capacidad de un turno nuevo: la del mismo horario en viernes, o la del último turno
  // anterior de ese mismo día (así 22:30 hereda lo de 22:00).
  const plantilla = (dia, hora) =>
    existentes.find((s) => s.dia === 'viernes' && s.hora === hora) ||
    existentes.find((s) => s.dia === dia && s.hora === hora) ||
    existentes
      .filter((s) => s.dia === dia && s.hora < hora)
      .sort((a, b) => (a.hora < b.hora ? 1 : -1))[0] ||
    existentes.find((s) => s.hora === hora && s.activo) ||
    null;

  const nuevos = new Set();
  for (const [dia, horas] of Object.entries(TURNOS)) {
    for (const hora of horas) {
      nuevos.add(`${dia}|${hora}`);
      const base = plantilla(dia, hora);
      await prisma.schedule.upsert({
        where: { dia_hora: { dia, hora } },
        // Un turno que ya existe no se toca (puede tener capacidad o cierres editados a mano).
        update: limpiar ? { activo: true } : {},
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

  const sobrantes = limpiar ? existentes.filter((s) => !nuevos.has(`${s.dia}|${s.hora}`)) : [];
  const borrados = sobrantes.length
    ? (await prisma.schedule.deleteMany({ where: { id: { in: sobrantes.map((s) => s.id) } } })).count
    : 0;

  await prisma.settings.update({ where: { id: settings.id }, data: { horariosVersion: VERSION } });
  console.log(`✅ Horarios (v${VERSION}) aplicados (${nuevos.size} turnos activos, ${borrados} eliminados)`);
}

module.exports = { TURNOS, aplicarHorarios };
