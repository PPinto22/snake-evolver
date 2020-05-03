export type Direction = "up" | "down" | "right" | "left";
export type Turn = "forward" | "left" | "right";
export type Position = [number, number];
export type PositionStr = string;
export type Vector = [number, number];
export type Move = {
  from: Position,
  to: Position,
  turn: Turn,
  died: boolean,
  fruit: boolean,
}

export function positionToStr([x, y]: Position) : PositionStr {
  return `(${x}, ${y})`;
}