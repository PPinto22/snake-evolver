import Node from "./Node";
import Snake from "./Snake";
import { Position, Direction } from "./types";

type GameState = "running" | "ended";

export interface GameProps {
  rows: number;
  columns: number;
  snakes: number;
  snakeLength: number;
}

export default class Game {
  props: GameProps;
  board: Node[][];
  snakes: Snake[];
  state: GameState;
  iteration: number;

  constructor(props: GameProps) {
    this.props = props;

    // TODO: Walls
    this.board = Array.from({ length: this.props.rows }, () => {
      return Array.from({ length: this.props.columns }, () => {
        return new Node();
      });
    });

    this.snakes = Array.from({ length: this.props.snakes }, (_, i) => {
      return this.createSnake(i, i);
    });

    this.iteration = 0;
    this.updateBoard();
    this.state = "running";
  }

  next() {
    if (this.state === "ended") return;

    this.snakes.forEach(this.moveSnake.bind(this));
    if (this.snakes.every(snake => !snake.alive)) {
      this.state = "ended";
    }

    this.iteration++;
    this.updateBoard();
  }

  // Place snakes along the perimeter of a rectangle with
  // width and height equal to the canvas' minus $margin on each side.
  private createSnake(index: number, id: number, margin = 2) {
    const [width, height] = [this.props.columns - 2 * margin, this.props.rows - 2 * margin];
    const perimeter = width * 2 + height * 2 - 4;
    const vertices = [0, width - 1, width + height - 2, width + height + width - 3, perimeter];
    function distanceToPosition(distance: number): [Position, Direction] {
      distance = distance % perimeter;
      const side = vertices.findIndex((vertex, i) => {
        const nextVertex = vertices[i + 1];
        return nextVertex && vertex <= distance && distance < nextVertex;
      });
      // Position relative to the inner rectangle (ignore margins)
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
    const [row, col] = snake.getNextPosition();
    if (this.isOutOfBounds([row, col]) || this.board[row][col].hasObstacle(snake)) {
      snake.alive = false;
      return;
    }
    const newNode = this.board[row][col];
    const hasFruit = newNode.fruits.has(snake);
    if (hasFruit) {
      snake.extendTo([row, col]);
      snake.score++;
      // TODO: New fruit
    } else {
      snake.moveTo([row, col]);
    }
  }

  private updateBoard() {
    // Clear all snakes and fruits
    this.board.forEach(row => {
      row.forEach(node => {
        node.clearObjects();
      });
    });

    // Rebuild
    this.snakes.forEach(snake => {
      snake.positions.forEach(([row, col]) => {
        this.board[row][col].snakes.add(snake);
      });
      const [fruitRow, fruitCol] = snake.fruit;
      // Assert that the fruit's position is defined and add it to the board
      fruitRow && this.board[fruitRow][fruitCol].fruits.add(snake);
    });
  }

  isOutOfBounds([row, col]: Position) {
    return row < 0 || col < 0 || row >= this.props.rows || col >= this.props.columns;
  }
}
