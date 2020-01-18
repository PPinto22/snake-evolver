import React from "react";
import Game from "../logic/Game";
import "./style/GameCanvas.css";
import Snake from "../logic/Snake";

interface GameCanvasProps {
  game: Game;
  width: number;
  height: number;
}

export default class GameCanvas extends React.Component<GameCanvasProps, {}> {
  game: Game;
  unit_width: number;
  unit_height: number;
  canvas: React.RefObject<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | undefined;

  constructor(props: GameCanvasProps) {
    super(props);
    this.game = this.props.game; // alias
    this.game.callbacks = {
      // TODO: ... events?
      onMove: this.display.bind(this),
      onEnd: this.display.bind(this)
    };
    this.unit_width = this.props.width / this.game.props.columns;
    this.unit_height = this.props.height / this.game.props.rows;
    this.canvas = React.createRef<HTMLCanvasElement>();
  }

  display() {
    let ctx = this.ctx!;
    ctx.clearRect(0, 0, this.props.width, this.props.height);
    switch(this.game.state){
      case "running":
      case "stopped":
        this.displayGame();
        break;
      case "ended":
        this.displayGameOver();
    }
  }

  displayGameOver() {
    let ctx = this.ctx!;
    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", this.props.width / 2, this.props.height / 2);
    ctx.restore();
  }

  // TODO: Draw each position on the board instead of each snake
  // That way, it will be easier to handle drawing multiple objects on the same position
  displayGame() {
    this.displayGrid();
    this.game.snakes.filter(snake => snake.alive).forEach(this.displaySnake.bind(this));
    this.game.snakes.filter(snake => snake.alive).forEach(this.displayFruit.bind(this));
  }

  displayFruit(snake: Snake) {
    if(!snake.fruit) return; // No fruit to display; skip.
    const [row, col] = snake.fruit;
    let ctx = this.ctx!;
    ctx.save();

    ctx.fillStyle = snake.color;
    ctx.fillRect(
      col * this.unit_width,
      row * this.unit_height,
      this.unit_width,
      this.unit_height
    );

    ctx.restore();
  }

  displaySnake(snake: Snake) {
    let ctx = this.ctx!;
    ctx.save();
    snake.positions.forEach(([row, col]) => {
      ctx.fillStyle = snake.color;
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
    for (var c = 0; c <= this.game.props.columns; c++) {
      let x = Math.min(c * this.unit_width + 0.5, this.props.width - 0.5);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.props.height);
    }
    for (var r = 0; r <= this.game.props.rows; r++) {
      let y = Math.min(r * this.unit_height + 0.5, this.props.height - 0.5);
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
