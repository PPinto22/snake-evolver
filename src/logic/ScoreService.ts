import Board from "./Board";
import Snake from "./Snake";
import { Position } from "./util/types";
import { positionDiff } from "./util/geometry";
import { multiply } from "./util/misc";

interface Move {
  position: Position; // Where the snake went
  ateFruit: boolean; // Whether the snake ate a fruit
}

export default interface ScoreService {
  // Evaluate how good the snake's last move was
  getMoveScore(board: Board, snake: Snake, move: Move): number;
}

// If fruit eaten: SCORE_PER_FRUIT points;
// Otherwise: award or penalize points if the snake is moving towards the fruit or opposite from it
export class AlignedDirectionScoreService implements ScoreService {
  SCORES = {
    FRUIT: 50,
    MOVE_TOWARDS_FRUIT: 1,
    MOVE_AGAINST_FRUIT: -1
  };

  getMoveScore(board: Board, snake: Snake, { position, ateFruit }: Move): number {
    if (ateFruit) return this.SCORES.FRUIT;
    if (!snake.fruit) return 0;

    const fruitVector = positionDiff(position, snake.fruit);
    const movementVector = Board.getVector(snake.direction);
    const rightWay = multiply(fruitVector, movementVector)!.every(value => value >= 0);

    return rightWay ? this.SCORES.MOVE_TOWARDS_FRUIT : this.SCORES.MOVE_AGAINST_FRUIT;
  }
}

export const DefaultScoreService = AlignedDirectionScoreService;
