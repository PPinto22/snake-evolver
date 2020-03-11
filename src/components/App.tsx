import React from "react";
import GameCanvas from "./GameCanvas";
import Game from "../logic/Game";
import Evolver from "../logic/Evolver";
import { AlignedDirectionScoreService } from "../logic/ScoreService";
import EvolutionPlot from "./EvolutionPlot";
import SpeedControl from "./SpeedControl";
import { CloseObstaclesAndFruitVectorBrain } from "../logic/Brain";

import "./App.css";

export default class App extends React.Component {
  game: Game;
  evolver: Evolver;

  constructor(props: {}) {
    super(props);
    this.game = new Game({
      rows: 25,
      columns: 50,
      snakes: 15,
      speed: 10,
      snakeLength: 4,
      scoreService: new AlignedDirectionScoreService(),
      brainType: CloseObstaclesAndFruitVectorBrain
    });
    this.evolver = new Evolver(this.game);
  }

  componentDidMount() {
    this.evolver.run();
  }

  speedChangeHandler = (speed: number) => {
    this.game.setSpeed(speed);
  }

  fastForwardHandler = (fastForward: boolean, speed: number | undefined) => {
    const newSpeed = fastForward ? Infinity : speed;
    this.game.setSpeed(newSpeed);
  }

  render() {
    return (
      <div id="app">
        <h1>Snake Evolver</h1>
        <EvolutionPlot evolver={this.evolver} />
        <div className="game-container">
          <SpeedControl
            defaultSpeed={this.game.props.speed}
            onSpeedChange={this.speedChangeHandler}
            onFastForwardToggle={this.fastForwardHandler}
          />
          <GameCanvas width={1000} height={500} game={this.game} />
        </div>
      </div>
    );
  }
}
