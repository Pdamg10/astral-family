import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato de imagen no soportado. Usa JPEG, PNG o WebP' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Imagen subida exitosamente',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al procesar la subida de imagen' }, { status: 500 });
  }
}
