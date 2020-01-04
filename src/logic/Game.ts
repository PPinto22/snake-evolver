import Board from "./Board";
import Snake from "./Snake";
import { Direction, Position } from "./types";

type GameState = "running" | "ended";

export interface GameProps {
  rows: number;
  columns: number;
  snakes: number;
  snakeLength: number;
}

export default class Game {
  props: GameProps;
  board: Board;
  snakes: Snake[];
  state: GameState;
  iteration: number;

  constructor(props: GameProps) {
    this.props = props;

    // TODO: Walls
    this.board = new Board(this.props.rows, this.props.columns);
    this.snakes = Array.from({ length: this.props.snakes }, (_, i) => {
      return this.createSnake(i, i);
    });
    // Add snakes to the board
    this.snakes.forEach(snake => this.board.addSnake(snake));
    // Generate fruits for each snake
    this.snakes.forEach(snake => (snake.fruit = this.board.addFruit(snake)));

    this.iteration = 0;
    this.state = "running";
  }

  // Game iteration: advance each snake one unit
  next() {
    if (this.state === "ended") return;

    this.snakes.forEach(this.moveSnake.bind(this));
    if (this.snakes.every(snake => !snake.alive)) {
      this.state = "ended";
    }

    this.iteration++;
  }

  // Create a snake placed along the perimeter of the board (with an optional $margin)
  private createSnake(index: number, id: number, margin = 2): Snake {
    const [width, height] = [this.props.columns - 2 * margin, this.props.rows - 2 * margin];
    const perimeter = width * 2 + height * 2 - 4;
    const vertices = [0, width - 1, width + height - 2, width + height + width - 3, perimeter];

    function distanceToPosition(distance: number): [Position, Direction] {
      distance = distance % perimeter;
      const side = vertices.findIndex((vertex, i) => {
        const nextVertex = vertices[i + 1];
        return nextVertex && vertex <= distance && distance < nextVertex;
      });
      // Define the position relative to the inner rectangle (ignore margins)
      let position: Position, direction: Direction;
      switch (side) {
        case 0:
          position = [0, distance];
          direction = "right";
          break;
        case 1:
          position = [distance - width + 1, width - 1];
          direction = "down";
          break;
        case 2:
          position = [height - 1, perimeter - height - distance + 1];
          direction = "left";
          break;
        case 3:
          position = [perimeter - distance, 0];
          direction = "up";
          break;
        default:
          throw new Error("Invalid distance.");
      }
      return [[position[0] + margin, position[1] + margin], direction];
    }

    const startDistance = Math.floor((index * perimeter) / this.props.snakes);
    let direction: Direction = "right";
    let positions = [];
    for (let i = 0; i < this.props.snakeLength; i++) {
      const squareDistance = startDistance + i;
      const [squarePosition, squareDirection] = distanceToPosition(squareDistance);
      positions.push(squarePosition);
      direction = squareDirection;
    }
    return new Snake(id, positions, direction);
  }
  private moveSnake(snake: Snake) {
    const position = snake.getNextPosition();
    if (this.board.outOfBounds(position) || this.board.get(position).hasObstacle(snake)) {
      snake.alive = false;
      return;
    }
    const gotFruit = this.board.get(position).fruits.has(snake);
    if (gotFruit) {
      snake.extendTo(position); // Grow the snake
      snake.score++; // Increase its score
      this.board.addSnakePosition(snake, position); // Add the new position on the board
      snake.fruit = this.board.addFruit(snake); // Generate a new fruit
    } else {
      const oldTail = snake.moveTo(position); // Move the snake
      this.board.addSnakePosition(snake, position); // Update the board: add the new head
      this.board.removeSnakePosition(snake, oldTail); // Update the board: delete the old tail
    }
  }
}
