import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';
import EditableLabel from 'react-inline-editing';
import CircularProgress from '@material-ui/core/CircularProgress';
import EditQuestion from '../components/EditQuestion';
import EditOption from '../components/EditOption';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';
import AddSection from '../components/AddSection';
import AddQuestion from '../components/AddQuestion';

const styles = (theme) => ({
  updating: {
    color: 'gray',
    display: 'inline',
    fontSize: '20px',
  },
  text: {
    color: 'black',
    fontSize: '20px',
    width: '100%',
    cursor: 'pointer'
  },
  label: {
    display: 'inline-block',
    fontSize: '20px',
  },
  row: {
    display: 'table-row',
  },
  cell: {
    display: 'table-cell',
  },
  progress: {
    marginLeft: '5px',
  },
  container: {
    width: '100%',
    height: '100%',
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});

class EditTest extends Component {
  state = {
      data: null,
      title: '',
      course: '',
      updatingTitle: false,
      value: 0,
  }

  componentWillMount() {
    this.fetchData();
  }

  fetchData = (callBack) => {
    axios.get(`/api/tests/${this.props.match.params.id}/`, {
      headers: {
        Authorization: `Token ${localStorage.token}`,
      },
    })
    .then((res) => {
      this.setState({
        data: res.data,
        title: res.data.title,
      });
      if (callBack)
        callBack();
      console.log(res.data);
    })
    .catch((err) => {
      // TODO redirect to 404
      this.props.history.push("/home/");
      console.log(err);
    });
  }

  _handleFocusOut = (text) => {
    this.setState({ title: text, updatingTitle: true }, () => {
      axios.put(`/api/tests/update/${this.props.match.params.id}/`, {
        title: text,
      },
      {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        }
      })
      .then((res) => this.setState({ updatingTitle: false }))
      .catch((err) => console.log(err));
    });
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme } = this.props;
    if (!this.state.data)
      return ("getting data...");
    return (
      <div className={classes.container}>
        <br />
        <Typography variant="title" align="center">
          Edit Test
        </Typography>
        <br />
        <div className={classes.row}>
          <pre> Title </pre>
          <div className={classes.cell}>
            <EditableLabel
              divClassName={classes.label}
              text={this.state.title}
              labelClassName={this.state.updatingTitle? classes.updating : classes.text}
              inputClassName={classes.text}
              inputMaxLength={100}
              labelFontWeight='bold'
              inputFontWeight='bold'
              onFocusOut={this._handleFocusOut}
            />
          </div>
          <div className={classes.cell}>
            {
              this.state.updatingTitle
                ? <CircularProgress size={14} className={classes.progress} />
                : ''
            }
          </div>
        </div>
        <br/>
        <AppBar position="sticky" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
            scrollable
            scrollButtons="on"
          >
            {
              this.state.data &&
              this.state.data.sections.map((section) => (
                  <Tab key={section.id} style={{flexShrink: 0, overflowX: 'hidden',}} label={
                    <Badge
                      className={classes.padding}
                      color="primary"
                      badgeContent={section.questions.length}
                    >
                      {section.title}
                    </Badge>
                  } key={section.id} />
                )
              )
            }
            <Tab label={"ADD SECTION"}/>
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          {
            this.state.data &&
            this.state.data.sections.map((section) => {
              return (
              <div style={{ margin: 10 }} key={`section${section.id}`}>
                {
                  section.questions.map((question) => {
                    return (
                      <div key={question.id}>
                        <br />
                        <EditQuestion question={question} />
                        {
                          question.options.map((option, index) => {
                            return (
                              <EditOption key={option.id} n={index+1} option={option} />
                            )
                          })
                        }
                      </div>
                    );
                  })
                }
                <AddQuestion section={section.id} reFetch={this.fetchData} />
              </div>
            )
          })
        }
        <AddSection test={this.state.data.id} reFetch={this.fetchData} />
        </SwipeableViews>
      </div>
        // 
      // </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(EditTest);
