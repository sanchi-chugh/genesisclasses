import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import "../App.css"

import {
    ValidatorForm,
    TextValidator,
    SelectValidator,
  } from 'react-material-ui-form-validator';

const styles = {
  root: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    padding: 30,
  },
  button: {
    margin: 20,
  },
  textField2: {
    width: '90%',
    maxWidth: '400px',
  }
};

class AddCentres extends Component {
  state = {
    location: '',
    addingCentre: false,
    centreAdded: false,
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCentreSubmit = (event) => {
    event.persist();
    this.setState({ addingCentre: true }, () => {
      const data = new FormData(event.target)
      axios.post('/api/centres/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingCentre: false, centreAdded:true }))
      .catch((err) => this.setState({ addingCentre: false }, () => console.log(err)))
    });
  }

  render() {
    const { classes } = this.props;
    if (this.state.centreAdded) {
      return (
        <div className={classes.container}>
          <center>
            Centre Added successfully !!
            <br/>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ centreAdded: false, location:''})}
              className={classes.button}
            >
              ADD ANOTHER
            </Button>
          </center>
        </div>
      );
    }
    return (
            <div className={classes.root}>
              <center>
                <ValidatorForm onSubmit={this.handleCentreSubmit}>
                  <TextValidator
                    label={"Location"}
                    margin="normal"
                    name="location"
                    className={classes.textField2}
                    value={this.state.location}
                    onChange={this.handleInputChange}
                    validators={['required']}
                    errorMessages={['this field is required']}
                  />
                  <br />
                  {
                    this.state.addingCentre &&
                    <LinearProgress className={classes.textField2} />
                  }
                  <br/><br/>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.textField2}
                    disabled={this.state.addingCentre}
                  >
                  ADD CENTRE
                  </Button>
                </ValidatorForm>
              </center>
            </div>
    );
  }
}

export default withStyles(styles)(AddCentres);
