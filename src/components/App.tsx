import React from "react";
import "./style/App.css";
import GameCanvas from "./GameCanvas";
import Game from "../logic/Game";
import Evolver from "../logic/Evolver";
import EvolutionPlot from "./EvolutionPlot";
import Slider from "./SpeedSlider";

export default class App extends React.Component {
  game: Game;
  evolver: Evolver;

  constructor(props: {}) {
    super(props);
    this.game = new Game({
      rows: 25,
      columns: 50,
      snakes: 20,
      speed: 10,
      snakeLength: 4
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
        <Slider defaultValue={this.game.props.speed} onChange={(event, value) => this.game.setSpeed(value)} />
        <GameCanvas width={1000} height={500} game={this.game} />
      </div>
    );
  }
}
