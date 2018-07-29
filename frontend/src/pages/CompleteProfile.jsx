import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

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
      marginTop: 'calc(5%)',
      height: '600px',
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
      margin: '20px',
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
    course: '',
    profilePic: null,
    centre: '',
    centreList: [],
    courseList: [],
    errors: {
      first_name: null,
      last_name: null,
      father_name: null,
      centre: null,
      course: null,
      email: null,
      contact_number: null,
    }
  }
 
  componentWillMount() {
    axios.get('/api/centres/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ centreList: res.data }))
    .catch((err) => console.log(err));
  }

  handleFileChange(event) {
    this.setState({
      file: URL.createObjectURL(event.target.files[0]),
      profilePic: event.target.files[0],
    })
  }

  openFileDialog(event) {
    this.refs.profilepic.click()
  }

  handleSubmit(event) {
    event.preventDefault();
    let formdata = new FormData(event.target);
    formdata.append('user', this.props.user.user);
    formdata.append('super_admin', this.props.user.super_admin);
    const config = {
      headers: {
        "Authorization": `Token ${localStorage.token}`,
      }
    }
    this.setState({ busy: true }, () => {
      axios.put(`/api/complete-profile/${this.props.user.id}/`, formdata, config)
      .then((res) => {
        console.log(res);
        this.setState({ busy: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ busy: false });
      });
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === 'centre') {
      this.setState({
        [name]: value,
        courseList: (
          this.state.centreList.find(centre => {
            return centre.id === target.value
          }).course_set), 
      });
    } else {
      this.setState({
        [name]: value
      });
    }
  }

  render() {
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
        <form onSubmit={this.handleSubmit.bind(this)}>
          <center>
            <img
              src={this.state.file}
              className={classes.profilePic}
              alt="error"
              onClick={this.openFileDialog.bind(this)}
            />
          </center>
          <input
            type="file"
            className={classes.imageFile}
            onChange={this.handleFileChange.bind(this)}
            ref="profilepic"
            name="image"
          />
          <TextField
            label={"First Name"}
            className={classes.textFieldLeftHalf}
            margin="normal"
            name="first_name"
          />
          <TextField
            label={"Last Name"}
            className={classes.textFieldRightHalf}
            margin="normal"
            name="last_name"
          />
          <TextField
            label={"Father's Name"}
            className={classes.textField}
            margin="normal"
            name="father_name"
          />
          <FormControl className={classes.textField}>
            <InputLabel htmlFor="centre">Centre</InputLabel>
            <Select
              value={this.state.centre}
              label={"Centre"}
              disabled={this.state.centreList.length === 0}
              inputProps={{
                name: 'centre',
                onChange: this.handleInputChange.bind(this),
              }}
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
          </FormControl>
          <FormControl className={classes.textField}>
            <InputLabel htmlFor="course">Course</InputLabel>
            <Select
              value={this.state.course}
              label={"Course"}
              disabled={this.state.courseList.length === 0}
              inputProps={{
                name: 'course',
                onChange: this.handleInputChange.bind(this),
              }}
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
          </FormControl>
          <TextField
            label={"E-mail Address"}
            className={classes.textField}
            margin="normal"
            name="email"
          />
          <TextField
            label={"Contact Number"}
            className={classes.textField}
            margin="normal"
            name="contact_number"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={this.state.busy}
          >
            Submit
          </Button>
        </form>
      </Paper>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(CompleteProfile);