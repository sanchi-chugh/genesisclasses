import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

const styles = (theme) => ({

});

class AddQuestion extends Component {
  state = {
    adding: false,
  }

  addQuestion = () => {
    this.setState({ adding: true }, () => {
      axios.post('/api/questions/add/', {
        text: 'Q. -------------------------------------------',
        section: this.props.section,
      }, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        }
      })
      .then((res) => {
        this.props.reFetch(() =>
          this.setState({ adding: false }), () => {
            this.refs.add.scrollIntoView();
          });
      })
      .catch((err) => this.props.setState({ adding: false }, () => console.log(err)));
    })
  }

  render() {
    return (
      <div ref="add">
        <br />
        <br />
        {
          !this.state.adding ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.addQuestion()}
            >
              Add Question
            </Button>
          ) : (
            <CircularProgress size={23} />
          )
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AddQuestion);