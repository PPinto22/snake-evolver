import React, { Component } from "react";
import { Slider } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

interface Props {
  onSpeedChange?: (speed: number) => void;
  onFastForwardToggle?: (fastForward: boolean, speed: number | undefined) => void;
  onSnakeSelect?: (value: number) => void;
  onWallsToggle?: (walls: boolean) => void;
}

interface State {
  fastForward: boolean;
}

export default class Controls extends Component<Props, State> {
  static defaults = {
    speed: 10,
    snakes: 10,
  };
  speed: number;

  constructor(props: Props) {
    super(props);
    this.state = { fastForward: false };
    this.speed = Controls.defaults.speed;
  }

  toggleFastForward = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fastForward = event.target.checked;
    this.props.onFastForwardToggle?.(fastForward, this.speed);
    this.setState({ fastForward: fastForward });
  };

  sliderHandler = (_event: React.ChangeEvent<{}>, value: number | number[]) => {
    const speed = value as number;
    this.speed = speed;
    this.props.onSpeedChange?.(speed);
  };

  handleSnakeSelect = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    this.props.onSnakeSelect?.(event.target.value as number);
  };

  toggleWalls = (event: React.ChangeEvent<HTMLInputElement>) => {
    const walls = event.target.checked;
    this.props.onWallsToggle?.(walls);
  };

  render() {
    const speedSlider = (
      <Slider
        className="speed-slider"
        valueLabelFormat={(value) => {
          return `${value}x`;
        }}
        valueLabelDisplay="auto"
        defaultValue={Controls.defaults.speed}
        min={0}
        max={100}
        onChange={this.sliderHandler}
        disabled={this.state.fastForward}
      />
    );
    const fastForwardSwitch = (
      <Switch
        className="ff-switch"
        checked={this.state.fastForward}
        onChange={this.toggleFastForward}
      />
    );
    const snakeVisibilitySelect = (
      <Select
        className="snake-select"
        onChange={this.handleSnakeSelect}
        defaultValue={Controls.defaults.snakes}
        disabled={this.state.fastForward}
      >
        <MenuItem value={1}>Top 1</MenuItem>
        <MenuItem value={3}>Top 3</MenuItem>
        <MenuItem value={5}>Top 5</MenuItem>
        <MenuItem value={10}>Top 10</MenuItem>
        <MenuItem value={20}>Top 20</MenuItem>
      </Select>
    );
    const wallSwitch = (
      <Switch className="wall-switch" defaultChecked onChange={this.toggleWalls} />
    );
    return (
      <FormGroup row className="controls">
        <div className="left">
          <FormControlLabel label="Fast Forward"
            control={fastForwardSwitch}
            labelPlacement="start"
          />
          <FormControlLabel label="Speed" control={speedSlider} labelPlacement="start" />
          <FormControlLabel label="Show" control={snakeVisibilitySelect} labelPlacement="start" />
        </div>
        <div className="right">
          <FormControlLabel label="Obstacles" control={wallSwitch} labelPlacement="end" />
        </div>
      </FormGroup>
    );
  }
}
