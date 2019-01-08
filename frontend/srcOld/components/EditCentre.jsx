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

class EditCentre extends Component {
  state = {
    location: '',
    updatingCentre: false,
    centreUpdated: false,
  };

  componentWillMount(){
    axios.get('/api/centres/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => {
      const location = res.data.find((item) => item.id == this.props.location.state.pk )
      this.setState({
        location : location.location,
      })
    })
    .catch((err) => console.log(err));
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCentreUpdate = (event) => {
    event.persist();
    this.setState({ addingCentre: true }, () => {
      const data = new FormData(event.target)
      axios.put(`/api/centres/edit/${this.props.location.state.pk}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ updatingCentre: false, centreUpdated:true }))
      .catch((err) => this.setState({ updatingCentre: false }, () => console.log(err)))
    });
  }

  render() {
    const { classes } = this.props;
    if (this.state.centreUpdated) {
      return (
        <div className={classes.container}>
          <center>
            Centre Updated Successfully !!
            <br/  >
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.props.history.goBack()}
              className={classes.button}
            >
              GO BACK
            </Button>
          </center>
        </div>
      );
    }
    return (
            <div className={classes.root}>
              <center>
                <ValidatorForm onSubmit={this.handleCentreUpdate}>
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
                    disabled={this.state.updatingCentre}
                  >
                  UPDATE CENTRE
                  </Button>
                </ValidatorForm>
              </center>
            </div>
    );
  }
}

export default withStyles(styles)(EditCentre);
