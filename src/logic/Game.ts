import Node from "./Node";
import Snake from "./Snake";
import { Position } from "./types";

type GameState = "running" | "ended";

export interface GameProps {
  rows: number;
  columns: number;
  snakes: number;
  initialLength: number;
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

    // TODO: Initial snake positioning
    this.snakes = Array.from({ length: this.props.snakes }, (_, i) => {
      return new Snake(
        i,
        [
          [i * 2, i * 10 + 0],
          [i * 2, i * 10 + 1],
          [i * 2, i * 10 + 2]
        ],
        "right"
      );
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
