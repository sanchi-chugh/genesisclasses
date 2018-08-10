import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import {
    ValidatorForm,
    TextValidator
  } from 'react-material-ui-form-validator';

const styles = (theme) => ({
});

class AddSection extends Component {
  state = {
    busy: false,
    title: '',
  }
  handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    data.append('test', this.props.test)
    this.setState({ busy: true }, () => {
      axios.post("/api/sections/add/", data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        }
      })
      .then(() => this.props.reFetch(() => this.setState({ busy: false })))
      .catch((err) => console.log(err));
    });
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    return (
      <div>
        <br />
        <ValidatorForm onSubmit={this.handleSubmit}>
          <center>
            <TextValidator
              label={"Section Title"}
              margin="normal"
              name="title"
              style={{marginRight:"10px"}}
              value={this.state.title}
              onChange={this.handleInputChange}
              validators={['required']}
              errorMessages={['this field is required']}
            />
            { this.state.busy && <CircularProgress size={20} style={{ margin: 10 }} /> }
            { !this.state.busy && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Add
                </Button>
              )
            }
          </center>
        </ValidatorForm>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AddSection);