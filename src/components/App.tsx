import React from "react";
import GameCanvas from "./GameCanvas";
import EvolutionPlot from "./EvolutionPlot";
import Help from "./Help"
import Game from "../logic/Game";
import Evolver from "../logic/Evolver";
import StatCards from "./StatCards";
import Controls from "./Controls";
import { CloseObstaclesAndFruitVectorBrain } from "../logic/Brain";
import { FruitsScoreService } from "../logic/ScoreService";

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
      snakes: Controls.defaults.snakes,
    };
    this.game = new Game({
      rows: 20,
      columns: 40,
      snakes: 100,
      visibleSnakes: Controls.defaults.snakes,
      speed: Controls.defaults.speed,
      snakeLength: 4,
      scoreService: new FruitsScoreService(),
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

  wallsHandler = (walls: boolean) => {
    if (walls) this.game.addRandomWalls();
    else this.game.removeWalls();
  };

  render() {
    return (
      <div id="app">
        <Help game={this.game}/>
        <div id="stats">
          <StatCards evolver={this.evolver} />
          <EvolutionPlot evolver={this.evolver} />
        </div>
        <div id="game-container">
          <Controls
            onSpeedChange={this.speedChangeHandler}
            onFastForwardToggle={this.fastForwardHandler}
            onSnakeSelect={this.snakeSelectHandler}
            onWallsToggle={this.wallsHandler}
          />
          <GameCanvas width={1000} height={500} game={this.game} snakes={this.state.snakes} />
        </div>
      </div>
    );
  }
}
