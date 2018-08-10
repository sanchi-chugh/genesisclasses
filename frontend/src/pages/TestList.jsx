import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    width: '100%',
    height: '100%',
    paddingTop: '30px',
    paddingBottom: '30px',
  },
  card: {
    width: '80%',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '30px',
    padding: '10px',
    cursor: 'pointer',
  },
  duration: {
    float: 'right',
  },
});

class TestList extends Component {
  state = { data: [] }

  componentWillMount() {
    axios.get('/api/tests/list/', {
      headers: {
        Authorization: `Token ${localStorage.token}`
      }
    })
    .then((res) => this.setState({ data: res.data }))
    .catch((err) => console.log(err));
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Typography variant="display2" align="center" gutterBottom>
          All Tests
        </Typography>
        {
          this.state.data.map((test) => {
            return (
              <Card
                key={test.id}
                className={classes.card}
                onClick={() => this.props.history.push(`/tests/edit/${test.id}/`)}
              >
                <CardContent style={{width: '100%'}}>
                  <Typography variant="title">
                    {test.title}
                  </Typography>
                  <Typography style={{color: '#424242'}}>
                    Practice
                  </Typography>
                  <br />
                  <Typography style={{ marginRight: '30px' }}>
                    {test.description.substring(0, 200)}
                    {test.description.length > 200 ? "..." : ''}
                  </Typography>
                  <br/>
                  <Typography clasName={classes.duration}>
                    03:00:00
                  </Typography>
                </CardContent>
              </Card>
            );
          })
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true})(TestList);