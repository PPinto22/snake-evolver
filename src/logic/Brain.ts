import Snake from "./Snake";
import Board from "./Board";
import { Vector, Position, Turn } from "./util/types";
import { max } from "./util/misc";
import {
  manhattanDistance,
  directions,
  positionDiff,
  rotateAxis,
  vectorAngle,
} from "./util/geometry";

export default abstract class Brain {
  snake: Snake;
  board: Board;
  network: any;

  // Constants
  static inputSize = NaN; // Number of inputs. NOTE: Must be overriden!
  static outputSize = 3; // Number of outputs. 0: forward; 1: left; 2: right

  constructor(snake: Snake, network: any, board: Board) {
    // Assert that the inputs and outputs of the network match Brain.inputSize and Brain.outputSize
    const thisClass = this.constructor as typeof Brain;
    if (network.input !== thisClass.inputSize || network.output !== thisClass.outputSize)
      throw Error(
        `The number of inputs or outputs defined in Brain do not match the neural network's.`
      );

    this.snake = snake;
    this.network = network;
    this.board = board;
  }

  // Calculates the inputs to feed into the neural network:
  abstract getInputs(): number[];

  // Activates the neural network and returns the change in direction
  // Possibilities: turn left, turn right, continue forward
  activate(): Turn {
    this.network.clear();
    const inputs = this.getInputs();
    const outputs: [number, number, number] = this.network.activate(inputs);
    const [index] = max(outputs)!;
    switch (index) {
      case 1:
        return "left";
      case 2:
        return "right";
      case 0:
      default:
        return "forward";
    }
  }

  // Position of the fruit relative to the snake's head and movement
  relativeFruitPosition(): Position | undefined {
    if (!this.snake.fruit) return undefined;

    const vector = positionDiff(this.snake.getHead(), this.snake.fruit); // vector head->fruit
    // fruit's position relative to the snake's head and movement
    const relativePosition: Position = rotateAxis(
      vector,
      vectorAngle(Board.getVector(this.snake.direction))
    );
    return relativePosition;
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
    const relativePosition = this.relativeFruitPosition()!;
    return vectorAngle(relativePosition) / Math.PI; // Angle of the fruit relative to the snake, squashed between -1 and 1.
  }
}

export class DistancesAndFruitAngleBrain extends Brain {
  static inputSize = 5;

  // 1. distance to nearest obstacle following the current direction
  // 2. distance to nearest obstacle to the left of the current direction
  // 3. distance to nearest obstacle to the right of the current direction
  // 4. manhattan distance to fruit
  // 5. fruit angle relative to the current direction
  getInputs(): number[] {
    return [
      this.distanceToObstacle(Board.getVector(this.snake.direction)),
      this.distanceToObstacle(Board.getVector(directions.leftOf(this.snake.direction))),
      this.distanceToObstacle(Board.getVector(directions.rightOf(this.snake.direction))),
      this.distanceToFruit(),
      this.fruitAngle(),
    ];
  }
}

export class CloseObstaclesAndFruitVectorBrain extends Brain {
  static inputSize = 5;
  maxDistance: number;

  constructor(...args: [Snake, any, Board]) {
    super(...args);
    this.maxDistance = Math.max(this.board.columns, this.board.rows);
  }

  // 1. proximity of obstacle forward
  // 2. proximity of obstacle to the left
  // 3. proximity of obstacle to the right
  // 4. proximity of fruit forward (+) or backward (-)
  // 5. proximity of fruit to the left (+) or right (-)
  getInputs(): number[] {
    const fruitPosition: Position = this.relativeFruitPosition() || [NaN, NaN];
    return [
      this.inverseDistanceToObstacle(Board.getVector(this.snake.direction)),
      this.inverseDistanceToObstacle(Board.getVector(directions.leftOf(this.snake.direction))),
      this.inverseDistanceToObstacle(Board.getVector(directions.rightOf(this.snake.direction))),
      this.signedProximity(fruitPosition[0]),
      this.signedProximity(fruitPosition[1]),
    ];
  }

  // Close obstacle -> ~1
  // Distant obstacle -> ~0
  private inverseDistanceToObstacle(direction: Vector): number {
    const dist = this.distanceToObstacle(direction);
    return 1 / dist ** 2;
  }

  // Step 1. Normalize distance to range [-1, 1], where -1/1 means max distance in either direction and ~0 means close
  // Step 2. Invert "distance" to "proximity", where -1/1 means very close in either direction and ~0 means max distance
  private signedProximity(absoluteDistance: number) {
    const normDist = absoluteDistance / this.maxDistance;
    return normDist >= 0 ? 1 - normDist : -1 - normDist;
  }
}

export const DefaultBrain = CloseObstaclesAndFruitVectorBrain;
