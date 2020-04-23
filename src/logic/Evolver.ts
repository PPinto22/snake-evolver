import * as neatap from "neataptic";
import Game from "./Game";
import Brain from "./Brain";

type State = "running" | "stopped";
type EventName = "preGen" | "postGen";

export interface Parameters {
  popsize: number; // This value is overwritten by game.props.snakes
  elitism: number;
  mutationRate: number;
  mutationAmount: number;
  // This means the fitness function takes the whole population as input.
  fitnessPopulation: true;
  network?: any; // Network structure
}

interface Callbacks {
  preGen: (() => void)[]; // List of functions to execute before each generation
  postGen: (() => void)[]; // List of functions to execute after each generation
}

export default class Evolver {
  game: Game;
  params: Parameters;
  brainType: typeof Brain;
  neat: any; // neataptic.Neat
  generation: number;
  state: State;
  callbacks: Callbacks;

  constructor(game: Game, params?: Partial<Parameters>) {
    if (game.props.snakes! < 2) throw new Error("Popsize must be at least 2");
    this.game = game;
    this.brainType = (this.game.props.brainType as unknown) as typeof Brain;
    this.callbacks = {
      preGen: [],
      postGen: []
    };

    this.params = { ...this.defaultParams(), ...params };
    this.neat = new neatap.Neat(
      this.brainType.inputSize, // NN inputs
      this.brainType.outputSize, // NN outputs
      this.evaluatePopulation.bind(this), // Evaluation function
      this.params
    );
    this.generation = 0;
    this.state = "stopped";
  }

  defaultParams(): Parameters {
    return {
      popsize: this.game.props.snakes,
      elitism: Math.round(0.15 * this.game.props.snakes),
      mutationRate: 0.5,
      mutationAmount: 2,
      fitnessPopulation: true,
      // network: this.createNetwork()
    };
  }

  // Constructs an initial network
  createNetwork(): any {
    return new neatap.architect.Perceptron(
      this.brainType.inputSize, // inputs
      5, // Neurons in hidden layer 1
      this.brainType.outputSize // outputs
    )
  }

  addCallback(event: EventName, callback: (...args: any[]) => void) {
    this.callbacks[event].push(callback);
    return this;
  }

  removeCallback(event: EventName, callback: (...args: any[]) => void) {
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    return this;
  }

  setBrains() {
    this.game.setBrains(this.neat.population);
  }

  async evaluatePopulation(population: any[]) {
    this.game.setBrains(this.neat.population); // Associate each neural network with the respective snake
    await this.game.run();
    for (let i = 0; i < this.params.popsize!; i++) {
      population[i].score = this.game.snakes[i].score;
    }
  }

  async run() {
    this.state = "running";
    while (this.state === "running") {
      this.generation += 1;
      this.callbacks.preGen.forEach(f => f());
      await this.neat.evolve();
      this.callbacks.postGen.forEach(f => f());
      this.game.reset();
    }
  }
}
