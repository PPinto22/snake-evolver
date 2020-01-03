import React from "react";
import Game, { GameProps } from "../logic/Game";
import "./style/GameCanvas.css";
import Snake from "../logic/Snake";

interface GameCanvasProps extends GameProps {
  width: number;
  height: number;
  speed: number; // frames per second. TODO: Make this state?
}

export default class GameCanvas extends React.Component<GameCanvasProps, {}> {
  game: Game;
  unit_width: number;
  unit_height: number;
  canvas: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | undefined;
  intervalID: number | undefined;

  static defaultProps = {
    speed: 2,
    snakeLength: 4
  };

  constructor(props: GameCanvasProps) {
    super(props);
    this.game = new Game(this.props);
    this.unit_width = this.props.width / this.props.columns;
    this.unit_height = this.props.height / this.props.rows;
    this.canvas = React.createRef<HTMLCanvasElement>();
  }

  display() {
    let ctx = this.ctx!;
    ctx.clearRect(0, 0, this.props.width, this.props.height);
    this.game.state === "running" ? this.displayGame() : this.displayGameOver();
  }

  displayGameOver() {
    let ctx = this.ctx!;
    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "bold 36px Open Sans";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", this.props.width / 2, this.props.height / 2);
    ctx.restore();
  }

  displayGame() {
    this.displayGrid();
    this.game.snakes.filter(snake => snake.alive).forEach(this.displaySnake.bind(this));
  }

  displaySnake(snake: Snake) {
    let ctx = this.ctx!;
    ctx.save();
    snake.positions.forEach(([row, col]) => {
      ctx.fillStyle = snake.color;
      ctx.strokeStyle = snake.color;
      ctx.fillRect(
        col * this.unit_width,
        row * this.unit_height,
        this.unit_width,
        this.unit_height
      );
    });
    ctx.restore();
  }

  displayGrid() {
    let ctx = this.ctx!;
    ctx.save();
    ctx.beginPath();
    for (var c = 0; c <= this.props.columns; c++) {
      let x = Math.min(c * this.unit_width + 0.5, this.props.width - 0.5);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.props.height);
    }
    for (var r = 0; r <= this.props.rows; r++) {
      let y = Math.min(r * this.unit_height + 0.5, this.props.height - 0.5);
      ctx.moveTo(0, y);
      ctx.lineTo(this.props.width, y);
    }
    ctx.strokeStyle = "rgba(180, 180, 180, 0.4)";
    ctx.stroke();
    ctx.restore();
  }

  start() {
    this.display();
    this.intervalID = window.setInterval(() => {
      this.game.next();
      this.display();
      if (this.game.state === "ended") window.clearInterval(this.intervalID);
    }, (1 / this.props.speed) * 1000);
  }

  componentDidMount() {
    this.ctx = this.canvas.current!.getContext("2d")!;
    this.start();
  }

  componentWillUnmount() {
    window.clearInterval(this.intervalID);
  }

  render() {
    return (
      <canvas
        className="game"
        ref={this.canvas}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}
