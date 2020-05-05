import { Direction, Position, positionToStr, PositionStr, Turn } from "./util/types";
import Board from "./Board";
import Brain from "./Brain";
import { directions } from "./util/geometry";
import { generateColor } from "./util/misc";

export default class Snake {
  // Details
  id: number; // An ID used to generate a color
  color: string; // A color in hex (e.g. #56eec7)
  // Logic
  positions: Position[]; // Pieces of the snake, ordered from tail to head
  direction: Direction; // Direction the snake is moving
  fruit?: Position; // Position of the fruit
  // Scores and state
  score: number; // Points (fitness)
  fruits: number; // Nr. of fruits eaten
  alive: boolean;
  // Past positions of the head and respective count. Resets when a fruit is eaten. Useful to prevent infinite loops.
  // E.g. "(5, 10)" -> 1, meaning the snake has been at position (5, 10) 1 time.
  history: Map<PositionStr, number>;
  // Neural network
  brain?: Brain;

  constructor(id: number, positions: Position[], direction: Direction, fruit?: Position) {
    this.id = id;
    this.color = generateColor();
    this.positions = positions;
    this.direction = direction;
    this.fruit = fruit;
    this.fruits = 0;
    this.score = 0;
    this.history = new Map();
    this.alive = true;
  }

  setBrain(network: any, board: Board, brainConstructor: new (...args: any[]) => Brain) {
    this.brain = new brainConstructor(this, network, board);
  }

  think(): Turn {
    const turn = this.brain?.activate();
    switch (turn) {
      case "left":
        this.direction = directions.leftOf(this.direction);
        break;
      case "right":
        this.direction = directions.rightOf(this.direction);
        break;
      case "forward":
      default:
        // do nothing
    }
    return turn || "forward";
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
    this.addHistory([row, col]);
  }

  addHistory(position: Position) {
    const positionStr = positionToStr(position);
    const previousCount = this.history.get(positionStr) || 0;
    this.history.set(positionStr, previousCount + 1);
  }

  getHistoryCount(position: Position): number {
    return this.history.get(positionToStr(position)) || 0;
  }

  eatFruit(newFruit?: Position) {
    this.fruit = newFruit;
    this.fruits += 1;
    this.history.clear();
  }
}
