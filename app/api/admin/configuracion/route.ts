import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { exigirAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          nombreRestaurante: 'Unión Carnes y Vinos',
          emailRestaurante: 'barunionruzafa@gmail.com',
          telefonoRestaurante: '+34 619 24 04 02',
          direccionRestaurante: 'Carrer de Puerto Rico, 38, Valencia',
          capacidadPorTurno: 30,
          diasAvanzados: 60,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const data = await request.json();

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({ data });
    } else {
      settings = await prisma.settings.update({ where: { id: settings.id }, data });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
