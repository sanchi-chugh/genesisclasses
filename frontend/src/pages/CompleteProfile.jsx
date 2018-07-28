import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import axios from 'axios';

const styles = theme => ({
    textField: {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '10px',
      marginBottom: '10px',
      width: '100%',
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
    profilePic: null,
  }

  handleChange(event) {
    this.setState({
      file: URL.createObjectURL(event.target.files[0]),
      fullName: null,
      fatherName: null,
      profilePic: event.target.files[0],
    })
    console.log(event.target.files);
  }

  openFileDialog(event) {
    this.refs.profilepic.click()
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = {
      "full_name": this.state.fullName,
      "father_name": this.state.fatherName,
      "image": this.state.profilePic,
    }
    this.setState({ busy: true }, () => {
      axios.put('/api/complete-profile/2/', data, {
        headers: {
          "Authorization": `Token ${localStorage.token}`,
          "content-type": "multipart/form-data;",
        }
      })
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
    const name = target.id;
    this.setState({
      [name]: value
    });
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
            onChange={this.handleChange.bind(this)}
            ref="profilepic"
            id="image"
          />
          <TextField
            label={"Name"}
            className={classes.textField}
            margin="normal"
            id="fullName"
            onChange={this.handleInputChange.bind(this)}
          />
          <TextField
            label={"Father's Name"}
            className={classes.textField}
            margin="normal"
            id="fatherName"
            onChange={this.handleInputChange.bind(this)}
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