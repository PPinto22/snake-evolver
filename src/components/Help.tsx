import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { Tooltip, IconButton } from "@material-ui/core";

export default class App extends React.Component {
  render() {
    return (
      <div className="help">
        <Tooltip title="What's this?" placement="right" arrow>
          <IconButton color="primary" aria-label="what's this">
            <FaQuestionCircle className="help-icon" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }
}
