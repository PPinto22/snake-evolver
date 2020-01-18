import Snake from "./Snake";
import Board from "./Board";
import { Vector } from "./types";
import { manhattanDistance, leftOf, rightOf, max } from "./utils";

export default class Brain {
  snake: Snake;
  board: Board;
  network: any;

  constructor(snake: Snake, network: any, board: Board) {
    this.snake = snake;
    this.network = network;
    this.board = board;
  }

  // Activates the neural network and changes the snake's direction 
  // Possibilities: turn left, turn right, continue forward
  activate(): void {
    this.network.clear();
    const inputs = this.getInputs();
    console.debug(inputs);
    const outputs: [number, number] = this.network.activate(inputs);
    console.debug(outputs);
    const [index, value] = max(outputs)!;
    if(value >= 0.5){ // Only make a turn if the output's activation is significant
      this.snake.direction = index === 0 ? leftOf(this.snake.direction) : rightOf(this.snake.direction);
    }
  }

  // Calculates the inputs to feed into the neural network:
  // distance to nearest obstacle following the current direction
  // distance to nearest obstacle to the left of the current direction
  // distance to nearest obstacle to the right of the current direction
  // manhattan distance to fruit
  // fruit angle relative to the current direction
  getInputs(): number[] {
    return [
      this.distanceToObstacle(Board.getVector(this.snake.direction)),
      this.distanceToObstacle(Board.getVector(leftOf(this.snake.direction))),
      this.distanceToObstacle(Board.getVector(rightOf(this.snake.direction))),
      this.distanceToFruit(),
      this.fruitAngle()
    ];
  }

  // Input: direction vector
  distanceToObstacle([vx, vy]: Vector): number {
    const [hx, hy] = this.snake.getHead();
    let distance = 0;
    do {
      distance++;
      var [px, py] = [hx + distance * vx, hy + distance * vy];
    } while (
      !this.board.outOfBounds([px, py]) &&
      !this.board.get([px, py])!.hasObstacle(this.snake)
    );
    return manhattanDistance([hx, hy], [px, py]);
  }

  distanceToFruit(): number {
    if (!this.snake.fruit) return NaN;
    return manhattanDistance(this.snake.getHead(), this.snake.fruit);
  }

  // Returns the angle (between -1 and 1) of the fruit relative to the snake's movement.
  // Positive angle: fruit is to the left of the snake
  // Negative angle: fruit is to the right of the snake
  fruitAngle(): number {
    if (!this.snake.fruit) return NaN;
    const [hx, hy] = this.snake.getHead();
    const [fx, fy] = this.snake.fruit;
    const [dx, dy] = [fx - hx, fy - hy]; // vector head->fruit
    const [mx, my] = Board.getVector(this.snake.direction); // unit vector of the snake's direction
    const alpha = Math.atan2(my, mx); // angle of the snake's movement (relative to the board's [1, 0] vector), in radians
    const [px, py] = [
      dx * Math.cos(alpha) + dy * Math.sin(alpha),
      -dx * Math.sin(alpha) + dy * Math.cos(alpha)
    ]; // fruit's position relative to the snake's axis of movement. https://en.wikipedia.org/wiki/Rotation_of_axes#cite_note-7
    return Math.atan2(py, px) / Math.PI; // Angle of the fruit relative to the snake, squashed between -1 and 1.
  }
}
