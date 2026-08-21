import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    const body = await request.json();
    const {
      profileName,
      birthDate,
      birthTime,
      city,
      country,
      sun,
      moon,
      asc,
      planets,
      aspects,
      messages = [],
      userQuery,
    } = body;

    // Securely retrieve API key from server environment (never exposed to client)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        hasAiKey: false,
        error: 'El servicio de Astro.IA no tiene configurada la clave en el servidor.',
      }, { status: 503 });
    }

    const systemInstructionText = `Eres Astro.IA, una entidad de sabiduría cósmica y astrólogo humanista y psicológico de altísimo nivel (al estilo de Dane Rudhyar, Liz Greene, Howard Sasportas y Carl Jung).
Tu tono es cálido, místico pero riguroso, elocuente, inspirador y profundamente empático.

Estás interactuando con o analizando la carta natal de:
- **Nombre**: ${profileName}
- **Fecha y Lugar**: ${birthDate} ${birthTime ? `a las ${birthTime}` : '(hora desconocida)'}, ${city}, ${country}
- **Sol (Identidad & Propósito)**: ${sun?.sign} (${sun?.degree ? `${Math.floor(sun.degree)}°` : ''}, Casa ${sun?.house || 9})
- **Luna (Mundo Emocional & Refugio)**: ${moon?.sign} (${moon?.degree ? `${Math.floor(moon.degree)}°` : ''}, Casa ${moon?.house || 2})
- **Ascendente (Máscara & Proyección)**: ${asc?.sign} (${asc?.degree ? `${Math.floor(asc.degree)}°` : ''})
- **Posiciones Planetarias**: ${JSON.stringify(planets?.map((p: any) => `${p.body} en ${p.sign} (Casa ${p.house || '?'})`))}
- **Aspectos Planetarios**: ${JSON.stringify(aspects?.slice(0, 18).map((a: any) => `${a.body1} en ${a.type} con ${a.body2} (orbe: ${a.orb}°)`))}

Directrices para tus respuestas:
1. Responde siempre con base en la configuración astral específica del consultante arriba detallada.
2. Utiliza un formato Markdown elegante (con títulos claros, viñetas, negritas y emojis astrales ✨🪐🌙☀️).
3. Si el consultante hace una pregunta específica sobre su amor, trabajo, salud emocional o vocación, conéctala con las casas, planetas y aspectos correspondientes de su carta.
4. Mantén una visión evolutiva y de libre albedrío: las estrellas sugieren e impulsan, pero el ser humano decide cómo integrar su luz y su sombra.`;

    // Format conversation history for Gemini API
    const contents: any[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        contents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        });
      }
    }

    // Add current query if provided
    if (userQuery) {
      contents.push({
        role: 'user',
        parts: [{ text: userQuery }],
      });
    }

    // If no messages or query provided, default to initial deep reading
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{
          text: `Hola Astro.IA, por favor bríndame una síntesis introductoria profunda, reveladora y poética de mi carta natal, destacando mi Trinidad (Sol, Luna y Ascendente), mis mayores fortalezas, la misión de mi alma y un consejo cósmico para mi evolución.`,
        }],
      });
    }

    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let reply = '';
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstructionText }],
              },
              contents,
              generationConfig: {
                temperature: 0.75,
                maxOutputTokens: 2500,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (reply) break;
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData.error?.message || `Error status ${response.status}`;
        }
      } catch (e: any) {
        lastError = e?.message || 'Error de conexión';
      }
    }

    if (!reply) {
      return NextResponse.json({ error: lastError || 'Error al conectar con los modelos de Astro.IA' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('Astro.IA Chat error:', error);
    return NextResponse.json({ error: 'Error en el servidor de Astro.IA' }, { status: 500 });
  }
}
