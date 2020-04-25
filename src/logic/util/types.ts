export type Direction = "up" | "down" | "right" | "left";
export type Position = [number, number];
export type PositionStr = string;
export type Vector = [number, number];
export type Move = {
  position: Position; // Where the snake went
  ateFruit: boolean; // Whether the snake ate a fruit
}

export function positionToStr([x, y]: Position) : PositionStr {
  return `(${x}, ${y})`;
}