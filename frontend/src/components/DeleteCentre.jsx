import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
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

class DeleteCentre extends Component {
  state = {
    deletingCentre: false,
    transferData : false,
    centreList: [],
    centre:''
  };

  componentWillMount(){
    axios.get('/api/centres/', {
      headers: {
        "Authorization": `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ centreList: res.data }))
    .catch((err) => console.log(err));
    console.log(this.props.location.state.pk);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked , centre:''});
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCentreDelete = (event) => {
    event.persist();
    this.setState({ deletingCentre: true }, () => {
      if(this.state.transferData){
        console.log('true transfer');
        const data = {data:{ "centre" : this.state.centre }};
        axios.delete(`/api/centres/delete/${this.props.location.state.pk}/`, data , {
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingCentre: false})
            this.props.history.goBack();
          })
          .catch((err) => this.setState({ deletingCentre: false }, () => console.log(err)))
      }else{
        console.log('true transfer');
        axios.delete(`/api/centres/delete/${this.props.location.state.pk}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingCentre: false})
            this.props.history.goBack();
          })
          .catch((err) => this.setState({ deletingCentre: false }, () => console.log(err)))
      }
    });
  }

  render() {
    const { classes } = this.props;
    return (
            <div className={classes.root}>
              <center><br/>
                <Grid container>
                  <Grid item xs={9}>
                      <Typography variant="heading" align='center'>
                        Do you want to transfer data of staff users and students to some other center ?
                      </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Switch
                        checked={this.state.transferData}
                        onChange={this.handleChange('transferData')}
                        value="transferData"
                        color="primary"
                      />
                  </Grid>
                </Grid>
                <ValidatorForm onSubmit={this.handleCentreDelete}>
                  { this.state.transferData &&
                    <SelectValidator
                      name="centre"
                      value={this.state.centre}
                      label={"Centre"}
                      className={classes.textField2}
                      style={{marginTop: '8px', marginBottom: '8px'}}
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
                  }
                  <Typography component="h2" variant="display1" gutterBottom>
                    Are you sure you want to delete this centre ?
                  </Typography>
                  <br/>
                  { this.state.deletingCentre && <CircularProgress size={20} style={{ margin: 10 }} /> }
                  { !this.state.deletingCentre &&
                    <Button
                      type='submit'
                      variant="contained"
                      color="primary"
                      className={classes.buttonDelete}
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
                </ValidatorForm>
              </center>
            </div>
    );
  }
}

export default withStyles(styles, { withTheme : true })(DeleteCentre);
