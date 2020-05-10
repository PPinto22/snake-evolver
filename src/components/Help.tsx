import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { Tooltip, IconButton } from "@material-ui/core";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Game from "../logic/Game";

interface Props {
  game: Game;
}

interface State {
  showModal: boolean;
}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  handleClose = () => {
    console.log("close");
    this.props.game.continue();
    this.setState({ showModal: false });
  };
  handleShow = () => {
    console.log("show");
    this.props.game.pause();
    this.setState({ showModal: true });
  };

  render() {
    return (
      <div className="help">
        <Tooltip title="What's this?" placement="right" arrow>
          <IconButton color="primary" aria-label="what's this" onClick={this.handleShow}>
            <FaQuestionCircle className="help-icon" />
          </IconButton>
        </Tooltip>

        <Modal show={this.state.showModal} onHide={this.handleClose} dialogClassName="help-modal">
          <Modal.Header closeButton>
            <Modal.Title>What&apos;s this?</Modal.Title>
          </Modal.Header>
          <Modal.Body className="help-modal-body">
            <p>
              This is a visualization of bots learning how to play the classic game of{" "}
              <span className="bold">Snake</span> via <span className="bold">Neuroevolution</span>.
              You&apos;ll notice that there are multiple snakes on screen. That&apos;s due to the
              nature of the neuroevolution algorithm, inspired by Darwin&apos;s theory of evolution.
              Although snakes play the game independently from each other, they are part of a
              competing population, following the concept of{" "}
              <span className="bold">survival of the fittest</span>. Each snake has its own way of
              playing the game, and the better they are at it, the more likely they and their
              offspring are to advance to the next <span className="bold">generation</span> (i.e.
              the next game). Similarly, snakes that do not perform well are gradually eliminated
              from the population. As generations progress, the score of the population tends to
              improve, allowing us to discover (hopefully) good strategies for playing the game,
              even if not optimal.
            </p>
            <p>
              Game instructions:
              <ul>
                <li>The goal is to get as many diamonds as possible, each awarding 1 point.</li>
                <li>
                  Snakes do not collide with each other and can only collect their own diamonds.
                </li>
                <li>
                  <span className="red">Red blocks</span> are obstacles. They can be toggled on or
                  off at any time with the switch on the right-hand side.
                </li>
              </ul>
            </p>
            <p>
              This project uses <a href="https://github.com/wagenaartje/neataptic">Neataptic</a>
              &apos;s implementation of the{" "}
              <a href="http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf">NEAT</a>{" "}
              algorithm.
            </p>
            <p>
              For more details, check <a href="https://github.com/PPinto22/snake-evolver">GitHub</a>
              .{" "}
              <span role="img" aria-label="snake emoji">
                🐍
              </span>
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleClose}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
