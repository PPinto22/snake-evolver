import Snake from "./Snake";

export default class Node {
  isWall: boolean;
  snakes: Set<Snake>;
  fruits: Set<Snake>;

  constructor(isWall = false) {
    this.isWall = isWall;
    this.snakes = new Set<Snake>();
    this.fruits = new Set<Snake>();
  }

  hasObstacle(snake: Snake): boolean {
    return this.isWall || this.snakes.has(snake);
  }

  clearObjects() {
    this.snakes.clear();
    this.fruits.clear();
  }
}
