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
    updatingCourse: false,
    courseUpdated: false,
  };

  componentWillMount(){
    axios.get('/api/courses/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => {
      const title = res.data.find((item) => item.id == this.props.location.state.pk )
      this.setState({
        title : title.title,
      })
    })
    .catch((err) => console.log(err));
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCourseUpdate = (event) => {
    event.persist();
    this.setState({ addingCourse: true }, () => {
      const data = new FormData(event.target)
      axios.put(`/api/courses/edit/${this.props.location.state.pk}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ updatingCourse: false, courseUpdated:true }))
      .catch((err) => this.setState({ updatingCourse: false }, () => console.log(err)))
    });
  }

  render() {
    const { classes } = this.props;
    if (this.state.courseUpdated) {
      return (
        <div className={classes.container}>
          <center>
            Course Updated Successfully !!
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
                <ValidatorForm onSubmit={this.handleCourseUpdate}>
                  <TextValidator
                    label={"Title"}
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
                    this.state.addingCourse &&
                    <LinearProgress className={classes.textField2} />
                  }
                  <br/><br/>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.textField2}
                    disabled={this.state.updatingCourse}
                  >
                  UPDATE CENTRE
                  </Button>
                </ValidatorForm>
              </center>
            </div>
    );
  }
}

export default withStyles(styles)(AddCourses);
