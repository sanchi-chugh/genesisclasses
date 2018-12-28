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

class AddCourses extends Component {
  state = {
    title: '',
    addingCourses: false,
    courseAdded: false,
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCoursesSubmit = (event) => {
    event.persist();
    this.setState({ addingCourses: true }, () => {
      const data = new FormData(event.target)
      axios.post('/api/courses/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingCourses: false, courseAdded:true }))
      .catch((err) => this.setState({ addingCourses: false }, () => console.log(err)))
    });
  }

  render() {
    const { classes } = this.props;
    if (this.state.courseAdded) {
      return (
        <div className={classes.container}>
          <center>
            Course Added successfully !!
            <br/>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ courseAdded: false, title:''})}
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
                <ValidatorForm onSubmit={this.handleCoursesSubmit}>
                  <TextValidator
                    label={"Course"}
                    margin="normal"
                    name="title"
                    className={classes.textField2}
                    value={this.state.title}
                    onChange={this.handleInputChange}
                    validators={['required']}
                    errorMessages={['this field is required']}
                  />
                  <br />
                  {
                    this.state.addingCourses &&
                    <LinearProgress className={classes.textField2} />
                  }
                  <br/><br/>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.textField2}
                    disabled={this.state.addingCourses}
                  >
                  ADD COURSE
                  </Button>
                </ValidatorForm>
              </center>
            </div>
    );
  }
}

export default withStyles(styles)(AddCourses);
