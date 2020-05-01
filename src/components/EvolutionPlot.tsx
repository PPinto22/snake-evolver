import React from "react";
import Evolver from "../logic/Evolver";
import Plotly, { Data, Layout, Config } from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

interface Props {
  evolver: Evolver;
}

interface State {
  generations: number[];
  max: number[];
  // avg: number[];
}

export default class EvolutionPlot extends React.Component<Props, State> {
  evolver: Evolver;

  constructor(props: Props) {
    super(props);
    this.evolver = props.evolver;
    this.state = {
      generations: [],
      max: [],
      // avg: []
    };
  }

  private postGen = () => {
    const scores = this.evolver.game.snakes.map(snake => snake.fruits);
    // const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const max = Math.max(...scores);
    this.setState({
      generations: [...this.state.generations, this.evolver.generation],
      max: [...this.state.max, max],
      // avg: [...this.state.avg, avg]
    });
  };

  componentDidMount() {
    this.evolver.addCallback("postGen", this.postGen);
  }

  componentWillUnmount() {
    this.evolver.removeCallback("postGen", this.postGen);
  }

  render() {
    const data: Data[] = [
      {
        type: "scatter",
        x: this.state.generations,
        y: this.state.max
      }
    ];
    const layout: Partial<Layout> = {
      xaxis: { title: "Generation", fixedrange: true, rangemode: "nonnegative" },
      yaxis: { title: "Score", fixedrange: true, rangemode: "nonnegative" },
      margin: {
        l: 40,
        r: 20,
        b: 40,
        t: 20,
        pad: 4
      }
    };
    const config: Partial<Config> = {
      displayModeBar: false
    };

    return <Plot className="evolution-plot" data={data} layout={layout} config={config} />;
  }
}
