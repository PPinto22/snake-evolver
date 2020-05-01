import Board from "./Board";
import Snake from "./Snake";
import { Direction, Position, Move } from "./util/types";
import { sleep, time } from "./util/misc";
import ScoreService, { DefaultScoreService } from "./ScoreService";
import Brain, { DefaultBrain } from "./Brain";

type State = "running" | "stopped" | "ended";
type EventName = "onMove" | "onEnd";

export interface GameProps {
  rows: number;
  columns: number;
  snakes: number;
  visibleSnakes: number;
  snakeLength: number;
  speed: number;
  scoreService: ScoreService;
  brainType: new (...args: any[]) => Brain;
  neuralNetworks?: any[];
}

interface Callbacks {
  onMove: (() => void)[]; // List of functions to execute after each move
  onEnd: (() => void)[]; // List of functions to execute when the game ends
}

export default class Game {
  props: GameProps;
  callbacks: Callbacks; // Functions to execute at certain events
  board: Board;
  snakes!: Snake[]; // Complete list of all snakes
  aliveSnakes!: Snake[]; // Sublist of snakes containing only those that are still in-game
  visibleSnakes!: Snake[]; // Sublist of snakes containing only those that are visible to the user
  state: State;
  iteration: number; // Current iteration. An iteration consists in moving every snake 1 unit
  sleepTime: number; // Number of milliseconds to sleep between moves (1000/speed)

  static defaultProps: GameProps = {
    rows: 25,
    columns: 50,
    snakes: 20,
    visibleSnakes: 20,
    snakeLength: 4,
    speed: 10,
    scoreService: new DefaultScoreService(),
    brainType: DefaultBrain,
  };

  constructor(props?: Partial<GameProps>) {
    this.props = { ...Game.defaultProps, ...props };
    this.callbacks = {
      onMove: [],
      onEnd: [],
    };

    this.board = new Board(this.props.rows, this.props.columns);
    this.initSnakes(); // initializes this.snakes, this.aliveSnakes and this.visibleSnakes

    this.iteration = 0;
    this.state = "stopped";

    this.setSpeed(this.props.speed, false);
    this.sleepTime = this.props.speed ? 1000 / this.props.speed : 0;
  }

  setVisibleSnakes(visibleSnakes: number) {
    this.props.visibleSnakes = visibleSnakes;
    this.updateVisibleSnakes();
  }

  updateVisibleSnakes() {
    this.visibleSnakes = this.snakes
      .slice(0, this.props.visibleSnakes)
      .filter((snake) => snake.alive);
  }

  setSpeed(fps: number = Infinity, updateState: boolean = true) {
    this.props.speed = fps;
    this.sleepTime = 1000 / fps;
    if (updateState) this.state = fps > 0 ? "running" : "stopped";
  }

  addCallback(event: EventName, callback: (...args: any[]) => void) {
    this.callbacks[event]?.push(callback);
    return this;
  }

  initSnakes() {
    this.snakes = Array.from({ length: this.props.snakes }, (_, i) => {
      return this.createSnake(i, i);
    });
    // Add snakes to the board
    this.snakes.forEach((snake) => this.board.addSnake(snake));
    // Generate fruits for each snake
    this.snakes.forEach((snake) => (snake.fruit = this.board.addFruit(snake)));
    // Add a neural network to each snake
    if (this.props.neuralNetworks) this.setBrains(this.props.neuralNetworks);

    this.updateVisibleSnakes();
    this.aliveSnakes = [...this.snakes];
  }

  // Set a neural network for each snake
  setBrains(neuralNetworks: any[]) {
    if (neuralNetworks.length !== this.props.snakes)
      throw new Error("The number of brains does not match the number of snakes");

    this.props.neuralNetworks = neuralNetworks;
    for (let i = 0; i < this.props.snakes; i++) {
      if (neuralNetworks[i])
        this.snakes[i].setBrain(neuralNetworks[i], this.board, this.props.brainType);
    }
  }

  async run() {
    const moveFunction = this.move.bind(this);
    this.state = "running" as State;
    while (this.state !== "ended") {
      while (this.state === "stopped") await sleep(400);

      const [, elapsedTime] = time(moveFunction);

      // Wait some time between iterations according to the game speed
      // If the game is running at max speed (fps=Infinity; sleepTime=0), sleep every 50 iterations (ad hoc)
      // so as not to completely block the main thread
      if ((this.visibleSnakes.length && this.sleepTime !== 0) || this.iteration % 50 === 0)
        await sleep(Math.max(this.sleepTime - elapsedTime, 0));
    }
  }

  reset() {
    this.state = "stopped";
    this.iteration = 0;
    this.board.clearObjects();
    this.initSnakes();
  }

  // Game iteration: advance each snake one unit
  move() {
    if (this.state !== "running") return;

    this.iteration++;
    this.aliveSnakes.forEach(this.moveSnake);
    this.callbacks.onMove.forEach((f) => f());

    if (!this.aliveSnakes.length) {
      this.state = "ended";
      this.callbacks.onEnd.forEach((f) => f());
    }
  }

  // Create a snake placed along the perimeter of the board (with an optional margin)
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

    const startDistance = Math.floor((index * perimeter) / this.props.visibleSnakes);
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

  private shouldKillSnake(snake: Snake, move: Move) {
    return (
      this.board.outOfBounds(move.position) || // Position out of bounds of the board
      this.board.get(move.position)!.hasObstacle(snake) || // Position is an obstacle
      snake.getHistoryCount(move.position) > 2 // Snake has been in the same position more than two times
    );
  }

  moveSnake = (snake: Snake) => {
    if (!snake.alive) return; // Snake is already dead (should never happen)
    // Activate the neural network and get the next position
    const position = snake.think().getNextPosition();
    const ateFruit = !!this.board.get(position)?.fruits.has(snake);
    const move = { position, ateFruit };
    // Snake kill conditions
    if (this.shouldKillSnake(snake, move)) {
      this.killSnake(snake);
      return;
    }

    if (ateFruit) {
      // Snake ate a fruit
      snake.extendTo(position); // Move and grow the snake
      const newFruit = this.board.addFruit(snake); // Generate a new fruit
      snake.eatFruit(newFruit); // Update counters and set the new fruit
      // Update the board
      this.board.addSnakePosition(snake, position);
      this.board.deleteFruit(snake, position);
    } else {
      // No fruit
      const oldTail = snake.moveTo(position); // Move the snake
      // Update the board
      this.board.addSnakePosition(snake, position);
      this.board.removeSnakePosition(snake, oldTail);
    }
    // Update snake score
    snake.score += this.props.scoreService.getMoveScore(this.board, snake, { position, ateFruit });
  };

  private killSnake(snake: Snake) {
    snake.alive = false;
    snake.positions.forEach((position) => {
      this.board.get(position)?.snakes.delete(snake);
    });
    this.board.get(snake.fruit)?.fruits.delete(snake);

    this.aliveSnakes = this.aliveSnakes.filter((aSnake) => aSnake !== snake);
    this.updateVisibleSnakes();
  }
}
