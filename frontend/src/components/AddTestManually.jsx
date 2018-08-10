import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

const styles = {
  container: {
    width: 'calc(100%)',
    maxWidth: '420px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  textField: {
    width: '80%',
    marginLeft: '10%',
    marginRight: '10%',
  },
  root: {
    paddingTop: '30px',
    width: '100%'
  },
  progress: {
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  button: {
    width: '80%',
    marginLeft: '10%',
    marginRight: '10%',
    marginBottom: '50px',
  }
};

class AddTestManually extends React.Component {
  state = {
    courseList: [],
    course: '',
    description: '',
    title: '',
    courseError: false,
    busy: false,
  }

  componentWillMount() {
    axios.get('/api/courses/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ courseList: res.data }))
    .catch((err) => console.log(err));
  }

  handleSubmit = (event) => {
    event.preventDefault();
    event.persist();
    this.setState({ busy: true, }, () => {
      let formdata = new FormData(event.target);
      axios.post('/api/tests/add/manual/', formdata, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => {
        this.props.history.push(`/tests/edit/${res.data.id}/`);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }

  handleCourseChange(event) {
    this.setState({ course: event.target.value });
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name] : event.target.value });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Paper className={classes.container}>
          <LinearProgress className={classes.progress}
            style={!this.state.busy ? { visibility: 'hidden' } : {}}
          />
          <br />
          <Typography variant="title" align="center">
            Add Test Manually
          </Typography>
          <ValidatorForm autoComplete="off" onSubmit={this.handleSubmit}>
            <TextValidator
              label="Title"
              name="title"
              value={this.state.title}
              className={classes.textField}
              margin="normal"
              onChange={this.handleInputChange}
              validators={['required']}
              errorMessages={['this field is required',]}
            />
            <br />
            <SelectValidator
              name="course"
              className={classes.textField}
              value={this.state.course}
              label={"Course"}
              style={{marginTop: '8px', marginBottom: '8px'}}
              disabled={this.state.courseList.length === 0}
              validators={['required']}
              errorMessages={['this field is required',]}
              inputProps={{
                name: 'course',
                onChange: this.handleCourseChange.bind(this),
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
            <br />
            <TextValidator
              label="Description"
              name="description"
              multiline
              rows={5}
              value={this.state.description}
              className={classes.textField}
              margin="normal"
              onChange={this.handleInputChange}
              validators={['required']}
              errorMessages={['this field is required',]}
            />
            <br />
            <br />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={this.state.busy}
            >
              Generate
            </Button>
          </ValidatorForm>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(AddTestManually);