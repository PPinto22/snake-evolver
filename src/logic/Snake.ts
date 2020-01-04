import { Direction, Position } from "./types";

export default class Snake {
  id: number;
  positions: Position[];
  direction: Direction;
  fruit: Position | null;
  score: number;
  alive: boolean;
  color: string;

  constructor(
    id: number,
    positions: Position[],
    direction: Direction,
    fruit: Position | null = null
  ) {
    this.id = id;
    this.positions = positions;
    this.direction = direction;
    this.fruit = fruit;
    this.score = 0;
    this.alive = true;
    this.color = this.generateColor();
  }

  getHead(): Position {
    if (this.positions.length === 0) {
      throw new Error("Empty snake");
    }
    return this.positions[this.positions.length - 1];
  }

  getNextPosition(): Position {
    const head = this.getHead();
    const delta = [
      this.direction === "down" ? 1 : this.direction === "up" ? -1 : 0,
      this.direction === "right" ? 1 : this.direction === "left" ? -1 : 0
    ];
    return [head[0] + delta[0], head[1] + delta[1]];
  }

  moveTo(position: Position): Position {
    this.extendTo(position);
    return this.positions.shift()!;
  }

  extendTo([row, col]: Position) {
    const [head_row, head_col] = this.getHead();
    const distance = Math.abs(head_row - row) + Math.abs(head_col - col);
    if (distance > 1) {
      throw new Error("Cannot move further than one unit");
    }
    this.positions.push([row, col]);
  }

  generateColor(): string {
    // "random" number generator based on a seed
    // https://stackoverflow.com/a/19303725
    const random = (seed: number) => {
      var x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // generates a "random" color for this object (e.g., #56eec7)
    // https://dev.to/akhil_001/generating-random-color-with-single-line-of-js-code-fhj
    const randomColor = "#" + Math.floor(random(this.id + 1) * 16777215).toString(16);
    return randomColor;
  }
}
