/**
 * Utility functions for exporting Astrology SVG Charts to SVG, PNG, and Print
 */

function serializeSvgElement(svgElementId: string, includeXlink: boolean = false): string | null {
  if (typeof window === 'undefined') return null;
  const svg = document.getElementById(svgElementId);
  if (!svg) return null;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);

  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (includeXlink && !source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  return source;
}

function triggerDownload(url: string, fileName: string, extension: string) {
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function exportSvgToFile(svgElementId: string, fileName: string = 'carta-astral.svg') {
  const source = serializeSvgElement(svgElementId, true);
  if (!source) return;

  const preface = '<?xml version="1.0" standalone="no"?>\r\n';
  const svgBlob = new Blob([preface, source], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  triggerDownload(svgUrl, fileName, '.svg');
  URL.revokeObjectURL(svgUrl);
}

export function exportPngFromFile(
  svgElementId: string,
  fileName: string = 'carta-astral.png',
  backgroundColor: string = '#0f0a1a'
) {
  const source = serializeSvgElement(svgElementId, false);
  if (!source) return;

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const size = 1200;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(blobURL);
      return;
    }

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);

    const pngUrl = canvas.toDataURL('image/png');
    triggerDownload(pngUrl, fileName, '.png');
    URL.revokeObjectURL(blobURL);
  };
  image.onerror = () => {
    URL.revokeObjectURL(blobURL);
  };
  image.src = blobURL;
}

export function printChartReport() {
  if (typeof window === 'undefined') return;
  window.print();
}
