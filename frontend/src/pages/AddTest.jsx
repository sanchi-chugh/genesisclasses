import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { Redirect } from 'react-router-dom';
const styles = {
  card: {
    maxWidth: 345,
    margin: 15,
    cursor: 'pointer',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
  },
};

const AddTest = (props) => {
  const { classes, user } = props;
  if (user.type === 'student')
    return (<Redirect to={"/404/"} />);

  return (
    <div style={{marginTop: '20px'}}>
      <Typography variant="display1" gutterBottom align="center">
        Add new Test
      </Typography>
      <div className={classes.container}>
        <Card className={classes.card} onClick={() => props.history.push('/tests/add/from-qbank/')}>
          <CardMedia
            className={classes.media}
            image="/static/img/placeholder.svg"
          />
          <CardContent>
            <Typography gutterBottom variant="headline" component="h2">
              Generate from Question Bank
            </Typography>
            <Typography component="p">
              Generate a test with questions selected according to your own preferences.
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card} onClick={() => props.history.push('/tests/add/from-doc/')}>
          <CardMedia
            className={classes.media}
            image="/static/img/placeholder.svg"
          />
          <CardContent>
            <Typography gutterBottom variant="headline" component="h2">
              Generate from DOC
            </Typography>
            <Typography component="p">
              Upload a .doc file which will be automatically converted into an online test which you can then customize even further.
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card} onClick={() => props.history.push('/tests/add/manual/')}>
          <CardMedia
            className={classes.media}
            image="/static/img/placeholder.svg"
          />
          <CardContent>
            <Typography gutterBottom variant="headline" component="h2">
              Add Questions Manually
            </Typography>
            <Typography component="p">
              Enter each and every question manually to generate a test.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withStyles(styles, { withTheme: true })(AddTest);
