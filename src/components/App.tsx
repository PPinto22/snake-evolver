import React from "react";
import "./style/App.css";
import GameCanvas from "./GameCanvas";
import Game from "../logic/Game";
import Evolver from "../logic/Evolver";
import { AlignedDirectionScoreService } from "../logic/ScoreService";
import EvolutionPlot from "./EvolutionPlot";
import Slider from "./SpeedSlider";
import { CloseObstaclesAndFruitVectorBrain } from "../logic/Brain";

export default class App extends React.Component {
  game: Game;
  evolver: Evolver;

  constructor(props: {}) {
    super(props);
    this.game = new Game({
      rows: 25,
      columns: 50,
      snakes: 15,
      speed: 200,
      snakeLength: 4,
      scoreService: new AlignedDirectionScoreService(),
      brainType: CloseObstaclesAndFruitVectorBrain
    });
    this.evolver = new Evolver(this.game);
  }

  componentDidMount() {
    this.evolver.run();
  }

  render() {
    return (
      <div id="app">
        <h1>Snake Evolver</h1>
        <EvolutionPlot evolver={this.evolver} />
        <div className="game-container">
          <Slider
            defaultValue={this.game.props.speed}
            onChange={(event, value) => this.game.setSpeed(value)}
          />
          <GameCanvas width={1000} height={500} game={this.game} />
        </div>
      </div>
    );
  }
}
