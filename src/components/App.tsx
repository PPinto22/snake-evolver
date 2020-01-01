import React from "react";
import "./style/App.css";
import GameCanvas from "./GameCanvas";

export default class App extends React.Component {
  render() {
    return (
      <div id="app">
        <h1>Snake Evolver</h1>
        <GameCanvas width={1000} height={500} rows={25} columns={50} snakes={2} speed={30} />
      </div>
    );
  }
}
