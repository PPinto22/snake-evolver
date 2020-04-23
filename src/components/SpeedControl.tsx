import React, { Component } from "react";
import { Slider } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

interface Props {
  defaultSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  onFastForwardToggle?: (fastForward: boolean, speed: number | undefined) => void;
}

interface State {
  fastForward: boolean;
}

export default class SpeedControl extends Component<Props, State> {
  speed: number;

  constructor(props: Props) {
    super(props);
    this.state = { fastForward: false };
    this.speed = props.defaultSpeed || 0;
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

  render() {
    const speedSlider = (
      <Slider
        className="speed-slider"
        valueLabelFormat={value => {
          return `${value}x`;
        }}
        valueLabelDisplay="auto"
        defaultValue={this.props.defaultSpeed}
        min={0}
        max={200}
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
    return (
      <FormGroup row className="speed-control">
        <FormControlLabel label="Speed" control={speedSlider} labelPlacement="start" />
        <FormControlLabel label="Fast Forward" control={fastForwardSwitch} labelPlacement="start" />
      </FormGroup>
    );
  }
}
