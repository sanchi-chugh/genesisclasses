import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Redirect } from 'react-router';

import {
    ValidatorForm,
    TextValidator
  } from 'react-material-ui-form-validator';

const styles = theme => ({
    textField: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '10px',
      marginBottom: '10px',
      width: '100%',
    },
    textFieldLeftHalf: {
      width: '47%',
    },
    textFieldRightHalf: {
      width: '47%',
      marginLeft: '6%',
    },
    container: {
      width: '90%',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 'calc(2%)',
      height: '600px',
      minWidth: '250px',
    },
    paper: {
      padding: '40px',
    },
    button: {
      width: '100%',
      marginTop: '40px',
      marginBottom: '30px',
    },
    profilePic: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      cursor: 'pointer',
      marginTop: '20px',
      boxShadow: '0px 0px 5px 1px rgba(42, 42, 42, 1)',
    },
    imageFile: {
      display: 'none',
    },
});

class CompleteProfile extends Component {
  state = {
    busy: false,
    file: '/static/img/profile.png',
    course_id: '',
    profilePic: null,
    centre_id: '',
    centreList: [],
    courseList: [],
    centreError: false,
    courseError: false,
    imageError: false,
  }
 
  componentWillMount() {
    axios.get('/api/centres/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ centreList: res.data }))
    .catch((err) => console.log(err));
    axios.get('/api/courses/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ courseList: res.data }))
    .catch((err) => console.log(err));
  }

  handleFileChange(event) {
    this.setState({
      file: URL.createObjectURL(event.target.files[0]),
      profilePic: event.target.files[0],
      imageError: false,
    })
  }

  openFileDialog(event) {
    this.refs.profilepic.click()
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.imageError || this.state.courseError || this.state.centreError)
      return
    let formdata = new FormData(event.target);
    console.log(this.props.user.user.id)
    formdata.append('user_id', this.props.user.user.id);
    formdata.append('super_admin', this.props.user.super_admin);
    const config = {
      headers: {
        "Authorization": `Token ${localStorage.token}`,
      }
    }
    this.setState({ busy: true }, () => {
      axios.put(`/api/complete-profile/${this.props.user.id}/`, formdata, config)
      .then((res) => {
        this.setState({ busy: false });
        this.props.getUser(() => this.props.history.push("/home/"));
      })
      .catch((err) => {
        this.setState({ busy: false });
      });
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === 'centre_id') {
      this.setState({
        [name]: value,
        centreError: false,
      });
    } else {
      this.setState({
        [name]: value,
        courseError: false,
      });
    }
  }

  validateSelects(event) {
    let centreError = this.state.centre === '';
    let courseError = this.state.course === '';
    let imageError = this.state.profilePic === null;
    if(courseError || centreError || imageError)
      this.setState({
        courseError,
        centreError,
        imageError
      });
    //this.refs.form.submit();
  }

  onChangeErrorHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value, });
  }

  render() {
    const { user } = this.props;
    if( user && (user.type !== 'student' || user.complete))
      return (<Redirect to="/home/" />)
    const { classes } = this.props;
    return (
      <div className={classes.container}>
      <LinearProgress
          style={
            this.state.busy ? 
              {visibility: 'visible'} :
              {visibility: 'hidden'}
            }
          color="primary"
        />
      <Paper className={classes.paper}>
        <Typography align="center">
          Complete your profile to continue
        </Typography>
        <ValidatorForm onSubmit={this.handleSubmit.bind(this)} ref="form">
          <center>
            <img
              src={this.state.file}
              className={classes.profilePic}
              alt="error"
              onClick={this.openFileDialog.bind(this)}
            />
            {
              this.state.imageError
              ? (
                  <FormHelperText
                    style={{ color: 'red', textAlign: 'center' }}
                  >
                    image is required
                  </FormHelperText>
                ) : ''
            }
          </center>
          <input
            type="file"
            className={classes.imageFile}
            onChange={this.handleFileChange.bind(this)}
            ref="profilepic"
            name="image"
          />
          <TextValidator
            label={"First Name"}
            className={classes.textFieldLeftHalf}
            margin="normal"
            name="first_name"
            value={this.state.first_name}
            onChange={this.onChangeErrorHandler}
            validators={['required']}
            errorMessages={['this field is required',]}
          />
          <TextValidator
            label={"Last Name"}
            className={classes.textFieldRightHalf}
            margin="normal"
            name="last_name"
            value={this.state.last_name}
            onChange={this.onChangeErrorHandler}
            validators={['required']}
            errorMessages={['this field is required',]}
          />
          <TextValidator
            label={"Father's Name"}
            className={classes.textField}
            margin="normal"
            name="father_name"
            value={this.state.father_name}
            onChange={this.onChangeErrorHandler}
            validators={['required']}
            errorMessages={['this field is required',]}
          />
          <FormControl className={classes.textField}>
            <InputLabel htmlFor="centre_id">Centre</InputLabel>
            <Select
              value={this.state.centre_id}
              label={"Centre"}
              disabled={this.state.centreList.length === 0}
              inputProps={{
                name: 'centre_id',
                onChange: this.handleInputChange.bind(this),
              }}
              error={this.state.centreError}
            >
              {
                this.state.centreList.map((centre) => 
                  <MenuItem
                    value={centre.id}
                    key={centre.id}
                  >
                    {centre.location}
                  </MenuItem>
                )
              }
            </Select>
            { 
              this.state.centreError
                ? (
                    <FormHelperText style={{color: 'red'}}>
                      this field is required
                    </FormHelperText>
                ) : ''
            }
          </FormControl>
          <FormControl className={classes.textField}>
            <InputLabel htmlFor="course_id">Course</InputLabel>
            <Select
              value={this.state.course_id}
              label={"Course"}
              disabled={this.state.courseList.length === 0}
              inputProps={{
                name: 'course_id',
                onChange: this.handleInputChange.bind(this),
              }}
              error={this.state.courseError}
            >
              {
                this.state.courseList.map((course) => 
                  <MenuItem
                    value={course.id}
                    key={course.id}
                  >
                    {course.title}
                  </MenuItem>
                )
              }
            </Select>
            { 
              this.state.courseError
                ? (
                    <FormHelperText style={{color: 'red'}}>
                      this field is required
                    </FormHelperText>
                ) : ''
            }
          </FormControl>
          <TextValidator
            label={"E-mail Address"}
            className={classes.textField}
            margin="normal"
            name="email"
            value={this.state.email}
            onChange={this.onChangeErrorHandler}
            validators={['required', 'isEmail']}
            errorMessages={['this field is required', 'email is invalid',]}
          />
          <TextValidator
            label={"Contact Number"}
            className={classes.textField}
            margin="normal"
            name="contact_number"
            value={this.state.contact_number}
            onChange={this.onChangeErrorHandler}
            validators={['required']}
            errorMessages={['this field is required',]}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={this.state.busy}
            onClick={this.validateSelects.bind(this)}
          >
            Submit
          </Button>
        </ValidatorForm>
      </Paper>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(CompleteProfile);