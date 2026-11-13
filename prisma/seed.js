const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Settings
    await prisma.settings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        nombreRestaurante: 'Unión Carnes y Vinos',
        emailRestaurante: 'barunionruzafa@gmail.com',
        telefonoRestaurante: '+34 619 24 04 02',
        direccionRestaurante: 'Carrer de Puerto Rico, 38, Valencia',
        capacidadPorTurno: 30,
        diasAvanzados: 60,
      },
    });

    // Horarios: se puede reservar hasta las 22:00 (lunes/jueves) y 22:30 (viernes/sábado);
    // sábado también almuerzo 14:00–14:30; domingo cerrado. Los turnos son las horas
    // reservables. Ver prisma/horarios-2026-10.js (producción).
    // Capacidad de vereda arranca en 0 — hay que cargarla real en Configuración.
    const turnos = require('./horarios-2026-10').TURNOS;

    for (const [dia, horas] of Object.entries(turnos)) {
      for (const hora of horas) {
        await prisma.schedule.upsert({
          where: { dia_hora: { dia, hora } },
          update: {},
          create: { dia, hora, capacidad: 30, capacidadVereda: 0, activo: true },
        });
      }
    }

    // Admin por defecto — CAMBIAR la contraseña después del primer login.
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('union2019', 10);
      await prisma.adminUser.create({
        data: {
          username: 'admin',
          password: passwordHash,
          email: 'barunionruzafa@gmail.com',
          active: true,
        },
      });
      console.log('✅ Admin creado: usuario "admin", contraseña "union2019" (cambiarla)');
    }

    console.log('✅ Seed completado');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
