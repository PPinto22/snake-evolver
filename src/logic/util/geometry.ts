import { Position, Direction, Vector } from "./types";

export function manhattanDistance([p1x, p1y]: Position, [p2x, p2y]: Position): number {
  return Math.abs(p1x - p2x) + Math.abs(p1y - p2y);
}

// Returns vector 'origin'->'dest'
export function positionDiff(origin: Position, dest: Position): Vector {
  return dest.map((value, axis) => value - origin[axis]) as Vector;
}

export function movePosition(origin: Position, vector: Vector): Position {
  return origin.map((value, axis) => value + vector[axis]) as Position;
}

// Counter clockwise angle created by the input vector relative to [1, 0], in radians ([-pi, pi]). E.g:
// vectorAngle([0, 1]) = pi/2
// vectorAngle([0, -1]) = -pi/2
export function vectorAngle([vx, vy]: Vector | Position): number {
  return Math.atan2(vy, vx);
}

// Get new coordinates of a vector or position on a new reference system
// rotated counter clockwise by the given angle in radians. E.g.:
// rotateAxis([2, 3], pi/2) = [3, -2]
export function rotateAxis([x, y]: Vector | Position, angle: number): Vector | Position {
  return [x * Math.cos(angle) + y * Math.sin(angle), -x * Math.sin(angle) + y * Math.cos(angle)];
}

// Direction utilities
const directionsList: Direction[] = ["up", "right", "down", "left"];

export const directions = {
  leftOf: (direction: Direction): Direction => {
    return directionsList[(directionsList.findIndex(d => d === direction) + 3) % 4];
  },

  rightOf: (direction: Direction): Direction => {
    return directionsList[(directionsList.findIndex(d => d === direction) + 1) % 4];
  },

  oppositeOf: (direction: Direction): Direction => {
    return directionsList[(directionsList.findIndex(d => d === direction) + 2) % 4];
  }
};
