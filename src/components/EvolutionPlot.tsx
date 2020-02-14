import React from "react";
import Evolver from "../logic/Evolver";
import Plotly, { Data, Layout } from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

interface Props {
  evolver: Evolver;
  maxGens: number;
}

interface State {
  generations: number[];
  max: number[];
  avg: number[];
}

export default class EvolutionPlot extends React.Component<Props, State> {
  evolver: Evolver;

  constructor(props: Props) {
    super(props);
    this.evolver = props.evolver;
    this.state = {
      generations: [],
      max: [],
      avg: []
    };
  }

  static defaultProps = {
    maxGens: 10
  };

  private postGen = () => {
    const scores = this.evolver.game.snakes.map(snake => snake.score);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const max = Math.max(...scores);
    this.setState({
      generations: [...this.state.generations, this.evolver.generation],
      max: [...this.state.max, max],
      avg: [...this.state.avg, avg]
    });
  }

  componentDidMount() {
    this.evolver.addCallback("postGen", this.postGen);
  }

  componentWillUnmount() {
    this.evolver.removeCallback("postGen", this.postGen);
  }

  render() {
    let data: Data[] = [
      {
        type: "scatter",
        x: this.state.generations,
        y: this.state.max,
        marker: {
          color: "rgb(16, 32, 77)"
        }
      }
    ];
    let layout: Partial<Layout> = {
      xaxis: { title: "Generation" },
      yaxis: { title: "Score" }
    };

    return (
      <Plot className="evolution-plot" data={data} layout={layout} />
    );
  }
}
