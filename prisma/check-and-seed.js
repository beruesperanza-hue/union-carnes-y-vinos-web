const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const { aplicarHorarios } = require('./horarios-2026-10');

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    console.log('🔄 Sincronizando schema con BD...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Schema sincronizado');

    const adminCount = await prisma.adminUser.count();

    if (adminCount === 0) {
      console.log('🌱 BD vacía, ejecutando seed...');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
      console.log('✅ Seed completado');
    } else {
      console.log('✅ BD ya está poblada');
    }

    // Cambio de horarios oct-2026: se aplica una sola vez (ver horarios-2026-10.js).
    await aplicarHorarios(prisma);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();
