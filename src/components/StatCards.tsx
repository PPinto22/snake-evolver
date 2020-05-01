import React from "react";
import Evolver from "../logic/Evolver";
import StatCard from "./StatCard";
import Game from "../logic/Game";

interface Props {
  evolver: Evolver;
}

interface State {
  generation: number;
  highScore: number;
}

export default class StatCards extends React.Component<Props, State> {
  evolver: Evolver;
  game: Game;

  constructor(props: Props) {
    super(props);
    this.state = {
      generation: 0,
      highScore: 0,
    };
    // aliases
    this.evolver = this.props.evolver;
    this.game = this.evolver.game;
    // add callbacks
    this.evolver.addCallback("preGen", this.preGenHandler);
    this.evolver.addCallback("postGen", this.postGenHandler);
  }

  preGenHandler = () => {
    this.setState({
      generation: this.evolver.generation,
    });
  };

  postGenHandler = () => {
    const generationHighScore = Math.max(...this.game.snakes.map((snake) => snake.fruits));
    if (generationHighScore > this.state.highScore) {
      this.setState({
        highScore: generationHighScore,
      });
    }
  };

  render() {
    return (
      <div className="stat-cards">
        <StatCard title={"Generation"} content={this.state.generation}></StatCard>
        <StatCard title={"High Score"} content={this.state.highScore}></StatCard>
      </div>
    );
  }
}
