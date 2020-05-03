import Snake from "./Snake";
import { Position } from "./util/types";

export default class Node {
  position: Position;
  isWall: boolean;
  snakes: Set<Snake>;
  fruits: Set<Snake>;

  constructor(position: Position, isWall = false) {
    this.position = position;
    this.isWall = isWall;
    this.snakes = new Set<Snake>();
    this.fruits = new Set<Snake>();
  }

  hasObstacle(snake: Snake): boolean {
    return this.isWall || this.snakes.has(snake);
  }

  isEmpty(): boolean {
    return !this.isWall && this.snakes.size === 0 && this.fruits.size === 0;
  }

  clearObjects() {
    this.snakes.clear();
    this.fruits.clear();
    this.isWall = false;
  }
}
