import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const camposPermitidos = ['capacidad', 'capacidadVereda', 'activo', 'cerradoManual', 'cerradoVereda'];
    const update: Record<string, unknown> = {};
    for (const campo of camposPermitidos) {
      if (data[campo] !== undefined) update[campo] = data[campo];
    }

    const horario = await prisma.schedule.update({ where: { id }, data: update });
    return NextResponse.json({ horario });
  } catch (error) {
    console.error('Error updating horario:', error);
    return NextResponse.json({ error: 'Error al actualizar horario' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting horario:', error);
    return NextResponse.json({ error: 'Error al eliminar horario' }, { status: 500 });
  }
}
