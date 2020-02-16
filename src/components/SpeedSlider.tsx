import React, { Component } from 'react'
import { Slider, Typography } from '@material-ui/core';

interface Props {
    defaultValue?: number
    onChange?: (event: React.ChangeEvent<{}>, value: number) => void;
}

export default class SpeedSlider extends Component<Props> {
    render() {
        return (
            <div>
                <Typography>
                    Speed
                </Typography>
                <Slider style={{width: "600px"}}
                    valueLabelFormat={(value) => { return `${value}x`; }}
                    valueLabelDisplay="auto"
                    defaultValue={this.props.defaultValue}
                    min={0}
                    max={200}
                    onChange={(event, value) => this.props.onChange?.(event, value as number)}
                />
            </div>)
    }
}
