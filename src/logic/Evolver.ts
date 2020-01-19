import * as neatap from "neataptic";
import Game from "./Game";

type State = "running" | "stopped";
type EventName = "preGen" | "postGen";

export interface Parameters {
  popsize?: number; // This value is overwritten by game.props.snakes
  elitism?: number;
  mutationRate?: number;
  mutationAmount?: number;
  // This means the fitness function takes the whole population as input.
  fitnessPopulation: true;
}

interface Callbacks {
  preGen: (() => void)[]; // List of functions to execute before each generation
  postGen: (() => void)[]; // List of functions to execute after each generation
}

export default class Evolver {
  game: Game;
  params: Parameters;
  neat: any; // neataptic.Neat
  state: State;
  callbacks: Callbacks;

  constructor(game: Game, params?: Parameters) {
    if (game.props.snakes! < 2) throw new Error("Popsize must be at least 2");
    this.game = game;
    this.callbacks = {
      preGen: [],
      postGen: []
    };

    this.params = { ...Evolver.defaultParams(game.props.snakes), ...params };
    this.neat = new neatap.Neat(
      5, // NN inputs
      2, // NN outputs
      this.evaluatePopulation.bind(this), // Evaluation function
      this.params
    );
    this.state = "stopped";
  }

  addCallback(event: EventName, callback: (...args: any[]) => void) {
    this.callbacks[event]?.push(callback);
    return this;
  }

  setBrains() {
    this.game.setBrains(this.neat.population);
  }

  static defaultParams(popsize: number): Parameters {
    return {
      popsize: popsize,
      elitism: Math.round(0.2 * popsize),
      mutationRate: 0.4,
      mutationAmount: 3,
      fitnessPopulation: true
    };
  }

  async evaluatePopulation(population: any[]) {
    this.game.setBrains(this.neat.population); // Associate each neural network with the respective snake
    await this.game.run();
    for (let i = 0; i < this.params.popsize!; i++) {
      population[i].score = this.game.snakes[i].score;
    }
    this.game.reset();
  }

  async run() {
    this.state = "running";
    while (this.state === "running") {
      this.callbacks.preGen.forEach(f => f());
      await this.evolve();
      this.callbacks.postGen.forEach(f => f());
    }
  }

  async evolve() {
    await this.neat.evolve();
  }
}
