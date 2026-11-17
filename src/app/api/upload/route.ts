import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const VALID_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 });
    }

    if (!VALID_MIMES.has(file.type)) {
      return NextResponse.json({ error: 'Formato de imagen no soportado. Usa JPEG, PNG o WebP' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'La imagen excede el tamaño máximo permitido de 5 MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory with sanitized filename
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const baseName = path.basename(file.name).replace(/\.\./g, '_').replace(/[^a-zA-Z0-9.-]/g, '_');
    const safeName = `${Date.now()}_${baseName}`;
    const filePath = path.join(uploadsDir, safeName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${safeName}`,
      message: 'Imagen subida exitosamente',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al procesar la subida de imagen' }, { status: 500 });
  }
}
