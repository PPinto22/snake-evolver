import { Direction, Position } from "./types";
import Board from "./Board";
import Brain from "./Brain";

export default class Snake {
  // Details
  id: number;  // An ID used to generate a color
  color: string; // A color in hex (e.g. #56eec7)
  // Logic
  positions: Position[]; // Pieces of the snake, ordered from tail to head
  direction: Direction; // Direction the snake is moving
  fruit?: Position; // Position of the fruit
  // Scores and state
  score: number;  // Points (fitness)
  fruits: number; // Nr. of fruits eaten
  timeoutCounter: number; // Number of moves without eating a fruit
  alive: boolean; 
  // Neural network
  brain?: Brain; 

  constructor(
    id: number,
    positions: Position[],
    direction: Direction,
    fruit?: Position
  ) {
    this.id = id;
    this.color = this.generateColor();
    this.positions = positions;
    this.direction = direction;
    this.fruit = fruit;
    this.fruits = 0;
    this.score = 0;
    this.timeoutCounter = 0;
    this.alive = true;
  }

  setBrain(network: any, board: Board) {
    this.brain = new Brain(this, network, board);
  }

  think(): this {
    this.brain?.activate();
    return this;
  }

  getHead(): Position {
    if (this.positions.length === 0) {
      throw new Error("Empty snake");
    }
    return this.positions[this.positions.length - 1];
  }

  getNextPosition(): Position {
    const [hx, hy] = this.getHead();
    const [vx, vy] = Board.getVector(this.direction);
    return [hx + vx, hy + vy];
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
