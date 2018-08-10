import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import AccDocument from './Document';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { CSVDownload } from 'react-csv';
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

class AddUsers extends Component {
  state = {
    value: 0,
    addingStudents: false,
    addingStaff: false,
    studentsAdded: false,
    addingStaffMember: false,
    pdf: false,
    csv: false,
    courseList: [],
    course: '',
    centre: '',
    centreList: [],
  };

  componentWillMount() {
    axios.get('/api/courses/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ courseList: res.data }))
    .catch((err) => console.log(err));
    axios.get('/api/centres/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ centreList: res.data }))
    .catch((err) => console.log(err));
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleStudentSubmit = (event) => {
    event.preventDefault();
    event.persist();
    this.setState({ addingStudents: true }, () => {
      const data = new FormData(event.target)
      axios.post('/api/students/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ data: res.data, addingStudents: false, studentsAdded: true }))
      .catch((err) => this.setState({ addingStudents: false }, () => console.log(err)))
    });
  }

  handleStaffSubmit = (event) => {
    event.preventDefault();
    event.persist();
    this.setState({ addingStaff: true }, () => {
      const data = new FormData(event.target)
      axios.post('/api/staff/add/', data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => this.setState({ addingStaff: false }))
      .catch((err) => this.setState({ addingStaff: false }, () => console.log(err)))
    });
  }

  runOff = () => {
    this.setState({ csv: false })
  }

  render() {
    const { classes } = this.props;

    if (this.state.pdf) {
      return (
        <div className="myaccdoc">
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ pdf: false })}
            className={classes.button}
          >
            Back
          </Button>
          <AccDocument data={this.state.data}/>
        </div>
      );
    }

    if (this.state.csv) {
      this.runOff();
      return <CSVDownload data={[['username', 'password'], ...this.state.data.users]} />
    }

    if (this.state.studentsAdded) {
      return (
        <div className={classes.container}>
          <center>
            {this.state.data.users.length} student accounts generated successfully.
            <br/>
            <br/>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ pdf: true })}
              className={classes.button}
            >
              Download PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ csv: true })}
              className={classes.button}
            >
              Download CSV
            </Button>
          </center>
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Students" />
          <Tab label="Staff Member" />
        </Tabs>
        {
          this.state.value === 0 && (
            <div className={classes.container}>
              <ValidatorForm onSubmit={this.handleStudentSubmit}>
                <center>
                <TextValidator
                  label={"No. of Students"}
                  margin="normal"
                  name="no_of_students"
                  style={{marginRight:"10px"}}
                  value={this.state.no_of_students}
                  onChange={this.handleInputChange}
                  validators={['required', 'minNumber:1', 'maxNumber:255']}
                  errorMessages={['this field is required', 'invalid no. of students', 'no. of students is too large']}
                />
                { this.state.addingStudents && <CircularProgress size={20} style={{ margin: 10 }} /> }
                { !this.state.addingStudents && (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Create
                    </Button>
                  )
                }
                </center>
              </ValidatorForm>
            </div>
          )
        }
        {
          this.state.value === 1 && (
            <div className={classes.root}>
              <center>
                <ValidatorForm onSubmit={this.handleStaffSubmit}>
                  <TextValidator
                    label={"Name"}
                    margin="normal"
                    name="name"
                    className={classes.textField2}
                    value={this.state.name}
                    onChange={this.handleInputChange}
                    validators={['required']}
                    errorMessages={['this field is required']}
                  />
                  <br />
                  <TextValidator
                    label={"Email"}
                    margin="email"
                    name="email"
                    className={classes.textField2}
                    value={this.state.email}
                    onChange={this.handleInputChange}
                    validators={['required', 'isEmail']}
                    errorMessages={['this field is required', 'email is invalid']}
                  />
                  <br/>
                  <SelectValidator
                    name="centre"
                    value={this.state.centre}
                    label={"Centre"}
                    className={classes.textField2}
                    style={{marginTop: '8px', marginBottom: 'px'}}
                    disabled={this.state.centreList.length === 0}
                    validators={['required']}
                    errorMessages={['this field is required',]}
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
                  </SelectValidator>
                  <br/>
                  <SelectValidator
                    name="course"
                    className={classes.textField2}
                    value={this.state.course}
                    label={"Course"}
                    disabled={this.state.courseList.length === 0}
                    validators={['required']}
                    style={{marginTop: '8px', marginBottom: 'px'}}
                    errorMessages={['this field is required',]}
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
                  </SelectValidator>
                  <br /><br />
                  {
                    this.state.addingStaff &&
                    <LinearProgress className={classes.textField2} />
                  }
                  <br/><br/>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.textField2}
                    disabled={this.state.addingStaff}
                  >
                  ADD
                  </Button>
                </ValidatorForm>
              </center>
            </div>
          )
        }
      </div>
    );
  }
}

export default withStyles(styles)(AddUsers);