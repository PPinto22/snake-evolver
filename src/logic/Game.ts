import Board from "./Board";
import Snake from "./Snake";
import { Direction, Position } from "./types";
import { sleep } from "./utils";

type State = "running" | "stopped"  | "ended";
type EventName = "onMove" | "onEnd";

export interface GameProps {
  rows: number;
  columns: number;
  snakes: number;
  snakeLength: number;
  speed?: number;
}

interface Callbacks {
  onMove: (() => void)[]; // List of functions to execute after each move
  onEnd: (() => void)[]; // List of functions to execute when the game ends
}

export default class Game {
  props: GameProps;
  callbacks: Callbacks;
  board: Board;
  snakes!: Snake[];
  state: State;
  timeOut: number;
  iteration: number; // Current iteration (i.e. move)
  sleepTime: number; // Number of milliseconds to sleep between moves (1000/speed)

  public static readonly POINTS_PER_FRUIT = 20;
  public static readonly POINTS_PER_MOVE = 1;

  constructor(props: GameProps, neuralNetworks?: any[]) {
    this.props = props;
    this.callbacks = {
      onMove: [],
      onEnd: []
    };

    // TODO: Walls
    this.board = new Board(this.props.rows, this.props.columns);
    this.initSnakes(neuralNetworks); // initializes this.snakes

    this.iteration = 0;
    this.state = "stopped";

    this.timeOut = 2 * (this.props.rows + this.props.columns);
    this.sleepTime = this.props.speed ? 1000 / this.props.speed : 0;
  }

  addCallback(event: EventName, callback: (...args: any[]) => void) {
    this.callbacks[event]?.push(callback);
    return this;
  }

  initSnakes(neuralNetworks?: any[]) {
    this.snakes = Array.from({ length: this.props.snakes }, (_, i) => {
      return this.createSnake(i, i);
    });
    // Add snakes to the board
    this.snakes.forEach(snake => this.board.addSnake(snake));
    // Generate fruits for each snake
    this.snakes.forEach(snake => (snake.fruit = this.board.addFruit(snake)));
    // Add a neural network to each snake
    if (neuralNetworks) this.setBrains(neuralNetworks);
  }

  // Set a neural network for each snake
  setBrains(neuralNetworks: any[]) {
    if (neuralNetworks.length !== this.props.snakes)
      throw new Error("The number of brains does not match the number of snakes");

    for (let i = 0; i < this.props.snakes; i++) {
      if (neuralNetworks[i]) this.snakes[i].setBrain(neuralNetworks[i], this.board);
    }
  }

  async run() {
    this.state = "running";
    while (this.state === "running") {
      this.move();
      await sleep(this.sleepTime);
    }
  }

  reset() {
    this.state = "stopped";
    this.iteration = 0;
    this.board.clearObjects();
    this.initSnakes(this.snakes.map(snake => snake.brain?.network));
  }

  // Game iteration: advance each snake one unit
  move() {
    if (this.state !== "running") return;

    this.iteration++;
    this.snakes.forEach(this.moveSnake.bind(this));
    this.callbacks.onMove.forEach(f => f());

    if (this.snakes.every(snake => !snake.alive)) {
      this.state = "ended";
      this.callbacks.onEnd.forEach(f => f());
    }
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
    if (!snake.alive) return; // Snake is already dead (should never happen)
    // Activate the neural network and get the next position
    const position = snake.think().getNextPosition();
    const hasFruit = !!this.board.get(position)?.fruits.has(snake);
    // Snake kill conditions
    if (
      this.board.outOfBounds(position) || // Position out of bounds of the board
      this.board.get(position)!.hasObstacle(snake) || // Position is an obstacle
      (!hasFruit && snake.timeoutCounter >= this.timeOut) // Hit the limit of moves without eating a fruit
    ) {
      snake.alive = false;
      return;
    }

    if (hasFruit) {
      // Snake ate a fruit
      snake.extendTo(position); // Move and grow the snake
      snake.fruit = this.board.addFruit(snake); // Generate a new fruit
      // Update score/counters
      snake.score += Game.POINTS_PER_FRUIT + Game.POINTS_PER_MOVE;
      snake.fruits += 1;
      snake.timeoutCounter = 0;
      // Update the board
      this.board.addSnakePosition(snake, position);
      this.board.deleteFruit(snake, position);
    } else {
      // No fruit
      const oldTail = snake.moveTo(position); // Move the snake
      // Update score/counters
      snake.score += Game.POINTS_PER_MOVE;
      snake.timeoutCounter += 1;
      // Update the board
      this.board.addSnakePosition(snake, position);
      this.board.removeSnakePosition(snake, oldTail);
    }
  }
}
