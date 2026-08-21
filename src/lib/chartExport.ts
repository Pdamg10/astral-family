/**
 * Utility functions for exporting Astrology SVG Charts to SVG, PNG, and Print
 */

export function exportSvgToFile(svgElementId: string, fileName: string = 'carta-astral.svg') {
  if (typeof window === 'undefined') return;
  const svg = document.getElementById(svgElementId);
  if (!svg) return;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);

  // Add namespaces if not present
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  const preface = '<?xml version="1.0" standalone="no"?>\r\n';
  const svgBlob = new Blob([preface, source], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(svgUrl);
}

export function exportPngFromFile(
  svgElementId: string,
  fileName: string = 'carta-astral.png',
  backgroundColor: string = '#0f0a1a'
) {
  if (typeof window === 'undefined') return;
  const svg = document.getElementById(svgElementId) as SVGElement | null;
  if (!svg) return;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);

  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const URLObj = window.URL || window.webkitURL || window;
  const blobURL = URLObj.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x high resolution
    const width = 1000;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Fill background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);

    // Draw SVG image
    context.drawImage(image, 0, 0, width, height);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URLObj.revokeObjectURL(blobURL);
  };
  image.src = blobURL;
}

export function printChartReport() {
  if (typeof window === 'undefined') return;
  window.print();
}
