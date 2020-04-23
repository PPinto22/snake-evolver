import React from "react";
import Game from "../logic/Game";
import Snake from "../logic/Snake";
import { hex2rgba, traceDiamond } from "./util/canvas";

interface Props {
  game: Game;
  width: number; // canvas width (px)
  height: number; // canvas height (px)
}

export default class GameCanvas extends React.Component<Props, {}> {
  game: Game;
  unitWidth: number;
  unitHeight: number;
  canvas: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | undefined;

  constructor(props: Props) {
    super(props);
    this.game = this.props.game; // alias
    this.game // Event handlers
      .addCallback("onMove", this.display.bind(this))
      .addCallback("onEnd", this.display.bind(this));
    this.unitWidth = this.props.width / this.game.props.columns;
    this.unitHeight = this.props.height / this.game.props.rows;
    this.canvas = React.createRef<HTMLCanvasElement>();
  }

  display() {
    let ctx = this.ctx!;
    ctx.clearRect(0, 0, this.props.width, this.props.height);
    if (this.game.props.speed === Infinity) {
      this.displayFastForward();
    } else {
      this.displayGame();
    }
  }

  displayFastForward() {
    let ctx = this.ctx!;
    ctx.save();
    ctx.fillStyle = "#333333";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Fast Forwarding", this.props.width / 2, this.props.height / 2);
    ctx.font = "16px sans-serif";
    ctx.fillText(
      "(Snakes are training in the background)",
      this.props.width / 2,
      this.props.height / 2 + 40
    );
    ctx.restore();
  }

  displayGame() {
    this.displayGrid();
    this.game.snakes.filter((snake) => snake.alive).forEach(this.displaySnake.bind(this));
    this.game.snakes.filter((snake) => snake.alive).forEach(this.displayFruit.bind(this));
  }

  displayFruit(snake: Snake) {
    if (!snake.fruit) return;
    const [row, col] = snake.fruit;
    let ctx = this.ctx!;

    ctx.save();
    const opacity = this.game.board.get([row, col])!.fruits.size > 1 ? 0.4 : 1;
    ctx.fillStyle = hex2rgba(snake.color, opacity);
    traceDiamond(ctx, col * this.unitWidth, row * this.unitWidth, this.unitWidth, this.unitHeight);
    ctx.fill();
    ctx.restore();
  }

  displaySnake(snake: Snake) {
    let ctx = this.ctx!;
    ctx.save();
    snake.positions.forEach(([row, col], index, positions) => {
      if (index === positions.length - 1) {
        ctx.beginPath();
        ctx.ellipse(
          col * this.unitWidth + this.unitWidth / 2,
          row * this.unitHeight + this.unitHeight / 2,
          this.unitWidth / 2,
          this.unitHeight / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.rect(col * this.unitWidth, row * this.unitHeight, this.unitWidth, this.unitHeight);
        ctx.closePath();
      }
      const opacity = this.game.board.get([row, col])!.snakes.size > 1 ? 0.4 : 1;
      ctx.fillStyle = hex2rgba(snake.color, opacity);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  displayGrid() {
    let ctx = this.ctx!;
    ctx.save();
    ctx.beginPath();
    for (var c = 0; c <= this.game.props.columns; c++) {
      let x = Math.min(c * this.unitWidth + 0.5, this.props.width - 0.5);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.props.height);
    }
    for (var r = 0; r <= this.game.props.rows; r++) {
      let y = Math.min(r * this.unitHeight + 0.5, this.props.height - 0.5);
      ctx.moveTo(0, y);
      ctx.lineTo(this.props.width, y);
    }
    ctx.strokeStyle = "rgba(180, 180, 180, 0.4)";
    ctx.stroke();
    ctx.restore();
  }

  componentDidMount() {
    this.ctx = this.canvas.current!.getContext("2d")!;
    this.display();
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
