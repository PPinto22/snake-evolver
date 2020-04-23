// Convert a hex color to rgba
export function hex2rgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Trace a diamond shape
export function traceDiamond(
  context: CanvasRenderingContext2D,
  // x, y: Top left corner of the shape
  x: number,
  y: number,
  width: number,
  height: number,
) {
  context.beginPath();
  // left
  context.moveTo(x, y + height / 2);
  // top
  context.lineTo(x + width / 2, y);
  // right
  context.lineTo(x + width, y + height / 2);
  // bottom
  context.lineTo(x + width / 2, y + height);
  context.closePath();
}
