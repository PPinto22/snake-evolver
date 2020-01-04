import Node from "./Node";
import { Position } from "./types";
import Snake from "./Snake";
import { choice } from "./util";

export default class Board {
  private grid: Node[][];
  rows: number;
  columns: number;
  freeSpaces: Set<Node>;

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.grid = Array.from({ length: rows }, (_, row) => {
      return Array.from({ length: columns }, (_, col) => {
        return new Node([row, col]);
      });
    });
    // Add all non-wall nodes as free space
    this.freeSpaces = new Set<Node>();
    this.grid.map(row => row.map(node => !node.isWall && this.freeSpaces.add(node)));
  }

  get([row, col]: Position): Node {
    return this.grid[row][col];
  }

  addSnake(snake: Snake) {
    snake.positions.forEach(([row, col]) => {
      this.grid[row][col].snakes.add(snake);
    });
    if (snake.fruit) this.addFruit(snake, snake.fruit);
  }

  deleteSnake(snake: Snake) {
    snake.positions.forEach(([row, col]) => {
      this.grid[row][col].snakes.delete(snake);
    });
    if (snake.fruit) this.deleteFruit(snake, snake.fruit);
  }

  addSnakePosition(snake: Snake, [row, col]: Position) {
    this.grid[row][col].snakes.add(snake);
  }

  removeSnakePosition(snake: Snake, [row, col]: Position) {
    this.grid[row][col].snakes.delete(snake);
  }

  addFruit(snake: Snake, position = this.getRandomFreeSpace(snake)): Position | null {
    if (!position) return null; // No available positions
    const [row, col] = position;
    this.grid[row][col].fruits.add(snake);
    return position;
  }

  deleteFruit(snake: Snake, [row, col]: Position) {
    this.grid[row][col].fruits.delete(snake);
  }

  getRandomFreeSpace(snake?: Snake): Position | null {
    let snakeFreeSpaces = new Set(this.freeSpaces);
    if (snake) {
      snake.positions.forEach(([row, col]) => {
        const node = this.grid[row][col];
        snakeFreeSpaces.delete(node);
      });
    }
    return choice(Array.from(snakeFreeSpaces).map(node => node.position));
  }

  setWall([row, col]: Position) {
    const node = this.grid[row][col];
    node.isWall = true;
    this.freeSpaces.delete(node);
  }

  unsetWall([row, col]: Position) {
    const node = this.grid[row][col];
    node.isWall = false;
    this.freeSpaces.add(node);
  }

  toggleWall(p: Position): boolean {
    const node = this.grid[p[0]][p[1]];
    node.isWall ? this.unsetWall(p) : this.setWall(p);
    return node.isWall;
  }

  outOfBounds([row, col]: Position): boolean {
    return row < 0 || col < 0 || row >= this.rows || col >= this.columns;
  }
}
