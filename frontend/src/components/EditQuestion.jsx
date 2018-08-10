import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import renderHTML from 'react-render-html';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
  button: {
    margin: '5px',
    float: 'right',
  },
  row: {
    display: 'table-row',
  },
  cell: {
    display: 'table-cell',
    verticalAlign: 'top'
  },
  progress: {
    float: 'right',
    margin: '5px',
  },
});

class EditQuestion extends Component {
  constructor(props) {
      super(props);
      this.state = {
          text: `<p>${props.question.text}</p>`,
          edit: false,
          saving: false,
      }
  }

  handleChange = (text) => {
      this.setState({ text })
  }

  handleSave = (event) => {
      this.setState({ saving: true }, () => {
          axios.put(`/api/questions/update/${this.props.question.id}/`, {
                  text: this.state.text,
              },
              {
                  headers: {
                      Authorization: `Token ${localStorage.token}`,
                  }
              }
          )
          .then((res) => this.setState({ saving: false, edit: false }))
          .catch((err) => this.setState({ saving: false }));
      });
  }

  render() {
    const { classes } = this.props;
    return (
      <div key={this.props.question.id}>
        {
          this.state.edit ? (
            <div>
              <ReactQuill
                value={this.state.text}
                onChange={this.handleChange}
                ref="editor"
                modules={{
                  formula: true,
                  toolbar: {
                      container:  [
                        ['bold', 'italic', 'underline', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['formula','link', 'image'],
                        ['clean']
                      ],
                  }
                }}
              />
              {
                this.state.saving ?
                <CircularProgress size={20} className={classes.progress} />
                : (
                  <Button
                    variant="contained"
                    className={classes.button}
                    onClick={this.handleSave}
                    disabled={this.state.saving}
                    color="primary"
                  >
                    Save
                  </Button>
                )
              }
            </div>
          ) : (
            <div
              onClick={() => this.setState({ edit: true }, () =>
                        this.refs.editor.focus()
              )}
            >
              <Typography>
                <b>{renderHTML(this.state.text)}</b>
              </Typography>
            </div>
          )
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EditQuestion)