import { Position, Direction } from "./types";

export function choice<T>(s: Array<T>): T | undefined {
  if (s.length === 0) return;

  const random_i = Math.floor(Math.random() * s.length);
  return s[random_i];
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns a pair [index, value] of the max element in an array
export function max(arr: number[]): [number, number] | undefined {
  if (arr.length === 0) return;
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return [maxIndex, max];
}

export function manhattanDistance([p1x, p1y]: Position, [p2x, p2y]: Position): number {
  return Math.abs(p1x - p2x) + Math.abs(p1y - p2y);
}

// Direction utilities
const directions: Direction[] = ["up", "right", "down", "left"];
export function leftOf(direction: Direction): Direction {
  return directions[(directions.findIndex(d => d === direction) + 3) % 4];
}
export function rightOf(direction: Direction): Direction {
  return directions[(directions.findIndex(d => d === direction) + 1) % 4];
}
export function oppositeOf(direction: Direction): Direction {
  return directions[(directions.findIndex(d => d === direction) + 2) % 4];
}
