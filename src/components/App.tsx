import React from "react";
import GameCanvas from "./GameCanvas";
import Game from "../logic/Game";
import Evolver from "../logic/Evolver";
import { AlignedDirectionScoreService } from "../logic/ScoreService";
import EvolutionPlot from "./EvolutionPlot";
import Controls from "./Controls";
import { CloseObstaclesAndFruitVectorBrain } from "../logic/Brain";

import "./App.css";

interface State {
  snakes: number;
}

export default class App extends React.Component<{}, State> {
  game: Game;
  evolver: Evolver;

  constructor(props: {}) {
    super(props);
    this.state = {
      snakes: 20,
    };
    this.game = new Game({
      rows: 25,
      columns: 50,
      snakes: 20,
      visibleSnakes: this.state.snakes,
      speed: 10,
      snakeLength: 4,
      scoreService: new AlignedDirectionScoreService(),
      brainType: CloseObstaclesAndFruitVectorBrain,
    });
    this.evolver = new Evolver(this.game);
  }

  componentDidMount() {
    this.evolver.run();
  }

  speedChangeHandler = (speed: number) => {
    this.game.setSpeed(speed);
  };

  fastForwardHandler = (fastForward: boolean, speed: number | undefined) => {
    const newSpeed = fastForward ? Infinity : speed;
    this.game.setSpeed(newSpeed);
  };

  snakeSelectHandler = (snakes: number) => {
    this.game.setVisibleSnakes(snakes);
    this.setState({ snakes: snakes });
  };

  render() {
    return (
      <div id="app">
        <h1>Snake Evolver</h1>
        <div id="main">
          <EvolutionPlot evolver={this.evolver} />
          <div className="game-container">
            <Controls
              defaultSpeed={this.game.props.speed}
              defaultSnakes={this.state.snakes}
              onSpeedChange={this.speedChangeHandler}
              onFastForwardToggle={this.fastForwardHandler}
              onSnakeSelect={this.snakeSelectHandler}
            />
            <GameCanvas width={1000} height={500} game={this.game} snakes={this.state.snakes} />
          </div>
        </div>
      </div>
    );
  }
}
