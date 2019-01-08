import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import renderHTML from 'react-render-html';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import Checkbox from '@material-ui/core/Checkbox';

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

class EditOption extends Component {
  constructor(props) {
      super(props);
      this.state = {
          text: `<p>${props.option.text}</p>`,
          edit: false,
          saving: false,
          checked: props.option.correct,
          checkboxUpdating: false,
      }
  }

  handleChange = (text) => {
      this.setState({ text })
  }

  handleSave = (event) => {
      this.setState({ saving: true }, () => {
          axios.put(`/api/options/update/${this.props.option.id}/`, {
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

  handleOptionChange = (event) => {
    this.setState({ checkboxUpdating: true }, () => {
      axios.put(`/api/options/update/${this.props.option.id}/`, {
          correct: !this.state.checked,
          },
          {
            headers: {
              Authorization: `Token ${localStorage.token}`,
            }
          }
      )
      .then((res) => this.setState({ checked: !this.state.checked, checkboxUpdating: false }))
      .catch((err) => console.log(err));
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.row}>
        <div className={classes.cell}>
          <div className={classes.row}>
            <div className={classes.cell} style={{ paddingTop: 4 }}>
              <b><pre>{this.props.n}) </pre></b>
            </div>
            <div className={classes.cell} style={{ verticalAlign: 'bottom' }}>
              {
                !this.state.checkboxUpdating ? (
                  <Checkbox
                    checked={this.state.checked}
                    onChange={this.handleOptionChange}
                    color="primary"
                  />
                ) : (
                  <CircularProgress size={20} style={{ marginLeft: 12 }}/>
                )
              }
            </div>
          </div>
        </div>
        <div className={classes.cell} key={this.props.option.id}>
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
                  {renderHTML(this.state.text)}
                </Typography>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EditOption)