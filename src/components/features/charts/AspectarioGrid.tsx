'use client';
import React from 'react';

interface AspectData {
  body1: string;
  body2: string;
  type: string;
  orb: number;
}

const ASPECT_LETTERS: Record<string, string> = {
  conjunction: 'q', opposition: 'w', sextile: 'e',
  trine: 'r', square: 't', quincunx: 'y',
};

const BODY_LABELS: Record<string, string> = {
  Sun: 'Sol', Moon: 'Luna', Mercury: 'Mercurio', Venus: 'Venus',
  Mars: 'Marte', Jupiter: 'Jupiter', Saturn: 'Saturno',
  Uranus: 'Urano', Neptune: 'Neptuno', Pluto: 'Pluton',
  Ascendant: 'Asc', MC: 'MC', NorthNode: 'NN',
};

const BODY_SYMBOLS: Record<string, string> = {
  Sun: 'Q', Moon: 'W', Mercury: 'E', Venus: 'R', Mars: 'T',
  Jupiter: 'Y', Saturn: 'U', Uranus: 'I', Neptune: 'O', Pluto: '...',
  Ascendant: 'Z', MC: 'X',
};

export default function AspectarioGrid({ aspects, bodies, primaryColor }: { aspects: AspectData[]; bodies: string[]; primaryColor: string }) {
  // Build matrix
  const matrix: Record<string, Record<string, string>> = {};
  for (const row of bodies) {
    matrix[row] = {};
    for (const col of bodies) {
      if (row === col) {
        matrix[row][col] = BODY_SYMBOLS[row] || row.charAt(0);
      }
    }
  }

  for (const asp of aspects) {
    const b1 = BODY_LABELS[asp.body1] || asp.body1;
    const b2 = BODY_LABELS[asp.body2] || asp.body2;
    if (matrix[b1] && matrix[b1][b2] !== undefined && matrix[b1][b2] !== BODY_SYMBOLS[b1]) {
      matrix[b1][b2] = ASPECT_LETTERS[asp.type] || asp.type.charAt(0);
    }
    if (matrix[b2] && matrix[b2][b1] !== undefined && matrix[b2][b1] !== BODY_SYMBOLS[b2]) {
      matrix[b2][b1] = ASPECT_LETTERS[asp.type] || asp.type.charAt(0);
    }
  }

  return (
    <div className='min-w-[400px]'>
      <table className='w-full text-[10px] border-collapse'>
        <thead>
          <tr>
            <th className='text-white/40 text-left p-1.5 w-16 font-normal'>Planetas</th>
            {bodies.map(b => (
              <th key={b} className='text-white/50 p-1.5 font-normal'>{b === 'Asc' ? '↑' : b === 'MC' ? '☼' : ''}{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodies.map(row => (
            <tr key={row} className='border-t border-white/5'>
              <td className='text-white/60 p-1.5 font-medium' style={{color: primaryColor}}>
                {row === 'Asc' ? '↑' : row === 'MC' ? '☼' : ''}{row}
              </td>
              {bodies.map(col => (
                <td key={col} className='p-1.5 text-center'>
                  {matrix[row]?.[col] && matrix[row][col] !== BODY_SYMBOLS[row] ? (
                    <span style={{
                      color: matrix[row][col] === 't' || matrix[row][col] === 'w' ? '#ef4444' :
                             matrix[row][col] === 'r' || matrix[row][col] === 'e' ? '#22c55e' :
                             primaryColor
                    }}>{matrix[row][col]}</span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}