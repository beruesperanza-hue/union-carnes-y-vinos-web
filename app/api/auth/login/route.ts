import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { crearToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { username } });

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = crearToken(user.username);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
