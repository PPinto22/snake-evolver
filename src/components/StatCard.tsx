import React from "react";
import Card from "@material-ui/core/Card";
import { Typography, CardContent } from "@material-ui/core";

interface Props {
  title: string;
  content: string | number;
}

export default class StatCard extends React.Component<Props> {
  render() {
    return (
      <Card className="stat-card">
        <CardContent>
          <Typography
            className="stat-card-title"
            color="textSecondary"
            variant="button"
            gutterBottom
          >
            {this.props.title}
          </Typography>
          <Typography variant="h5">
            {this.props.content}
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
