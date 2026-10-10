import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { exigirAdminApi } from '@/lib/admin-guard';

export async function GET() {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const horarios = await prisma.schedule.findMany({
      orderBy: [{ dia: 'asc' }, { hora: 'asc' }],
    });
    return NextResponse.json({ horarios });
  } catch (error) {
    console.error('Error getting horarios:', error);
    return NextResponse.json({ error: 'Error al obtener horarios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sinSesion = await exigirAdminApi();
  if (sinSesion) return sinSesion;

  try {
    const { dia, hora, capacidad, capacidadVereda } = await request.json();

    if (!dia || !hora) {
      return NextResponse.json({ error: 'Día y hora requeridos' }, { status: 400 });
    }

    const horario = await prisma.schedule.upsert({
      where: { dia_hora: { dia, hora } },
      update: { activo: true },
      create: {
        dia,
        hora,
        capacidad: capacidad ?? 30,
        capacidadVereda: capacidadVereda ?? 0,
        activo: true,
      },
    });

    return NextResponse.json({ horario });
  } catch (error) {
    console.error('Error creating horario:', error);
    return NextResponse.json({ error: 'Error al crear horario' }, { status: 500 });
  }
}
