import Board from "./Board";
import Snake from "./Snake";
import { Move } from "./util/types";
import { positionDiff } from "./util/geometry";
import { multiply } from "./util/misc";

export default interface ScoreService {
  // Evaluate how good the snake's last move was
  getMoveScore(board: Board, snake: Snake, move: Move): number;
}

// If fruit eaten: SCORE_PER_FRUIT points;
// Otherwise: award or penalize points if the snake is moving towards the fruit or opposite from it
export class AlignedDirectionScoreService implements ScoreService {
  SCORES = {
    FRUIT: 100,
    MOVE_TOWARDS_FRUIT: 1,
    MOVE_AGAINST_FRUIT: -1,
  };

  getMoveScore(board: Board, snake: Snake, move: Move): number {
    if (move.died) return 0;
    if (move.fruit) return this.SCORES.FRUIT;

    return this.getAlignedDirectionScore(snake, move);
  }

  private getAlignedDirectionScore(snake: Snake, move: Move) {
    if (!snake.fruit) return 0;
    const fruitVector = positionDiff(move.to, snake.fruit!);
    const movementVector = Board.getVector(snake.direction);
    const rightWay = multiply(fruitVector, movementVector)!.every((value) => value >= 0);
    return rightWay ? this.SCORES.MOVE_TOWARDS_FRUIT : this.SCORES.MOVE_AGAINST_FRUIT;
  }
}

export const DefaultScoreService = AlignedDirectionScoreService;
