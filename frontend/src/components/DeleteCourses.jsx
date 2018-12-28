import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import Typography from '@material-ui/core/Typography';
import "../App.css"

import {
    ValidatorForm,
    TextValidator,
    SelectValidator,
  } from 'react-material-ui-form-validator';

const styles = theme => ({
  root: {
    width: '100%',
    alignItems: 'center',
    padding:'20px'
  },
  container: {
    padding: 30,
  },
  buttonDelete: {
    margin: theme.spacing.unit,
    color: theme.palette.getContrastText(red[700]),
    backgroundColor: red[700],
    '&:hover': {
      backgroundColor: red[900],
    },
  },
  button: {
    margin: 20,
  },
  textField2: {
    width: '90%',
    maxWidth: '400px',
  },
});

class DeleteCourse extends Component {
  state = {
    deletingCourse: false,
  };

  handleCourseDelete = (event) => {
    event.persist();
    this.setState({ deletingCourse: true }, () => {
      axios.delete(`/api/courses/delete/${this.props.location.state.pk}/`,{
          headers: {
            Authorization: `Token ${localStorage.token}`
          },
        })
        .then((res) => {
          this.setState({ deletingCourse: false})
          this.props.history.goBack();
        })
        .catch((err) => this.setState({ deletingCourse: false }, () => console.log(err)))
    });
  }

  render() {
    const { classes } = this.props;
    return (
            <div className={classes.root}>
              <center><br/>
                  <Typography component="h2" variant="display1" gutterBottom>
                    Are you sure you want to delete this course ?
                  </Typography>
                  <br/>
                  { this.state.deletingCourse && <CircularProgress size={20} style={{ margin: 10 }} /> }
                  { !this.state.deletingCourse &&
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.buttonDelete}
                      onClick={this.handleCourseDelete.bind(this)}
                    >
                      DELETE
                    </Button>
                  }
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.props.history.goBack}
                    className={classes.button}
                  >
                    GO BACK
                  </Button>
              </center>
            </div>
    );
  }
}

export default withStyles(styles, { withTheme : true })(DeleteCourse);
