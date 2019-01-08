import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import cyan from '@material-ui/core/colors/cyan';
import red from '@material-ui/core/colors/red';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

const styles = theme => ({
  buttonDelete: {
    margin: theme.spacing.unit,
    color: theme.palette.getContrastText(red[700]),
    backgroundColor: red[700],
    '&:hover': {
      backgroundColor: red[900],
    },
  },
  buttonEdit: {
    margin: theme.spacing.unit,
    color: theme.palette.getContrastText(cyan[300]),
    backgroundColor: cyan[300],
    '&:hover': {
      backgroundColor: cyan[600],
    },
  },
  location:{
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});

class Centres extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React',
      data: [],
    };
  }

  textFilter(filter, row){
    let result = parseInt( row[filter.id].toUpperCase().indexOf(filter.value.toUpperCase()), 10);
    if (result < 0) {
      return false;
    }else{
      return true;
    }
  }

  componentDidMount() {
    axios.get("/api/centres/", {
      headers: {
        Authorization: `Token ${localStorage.token}`
      }
    }).then(res => {
      const data = res.data;
      this.setState({data});
    });
  }

  handleEdit = (pk) => {
    this.props.history.push({
             pathname:"/centres/edit/",
             state:{
                 pk:pk,
              }
            });
  }
  handleDelete = (pk) => {
    this.props.history.push({
             pathname:"/centres/delete/",
             state:{
                 pk:pk,
              }
            });
  }

  render() {
    const { classes } = this.props;
    const columns = [
      {
        Header: 'Centres',
        columns:[
          {
            Header: "Location",
            accessor: 'location',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)},
            className: 'location'
          },
          {
            Header: "Edit/Delete",
            accessor: 'id',
            filterable: false,
            Cell: row => (
                <div>
                  <Button onClick={this.handleEdit.bind(this,row.value)} variant="contained" size="small" color="primary" className={classes.buttonEdit}>
                    Edit
                    <EditIcon className={classes.rightIcon} />
                  </Button>
                  <Button onClick={this.handleDelete.bind(this,row.value)} variant="contained" size="small" color="secondary" className={classes.button}>
                    Delete
                    <DeleteIcon className={classes.rightIcon} />
                  </Button>
                </div>
              )
          },

        ]
      }
    ]
    
    return (
      <div style={{margin: '20px'}}>
        <ReactTable
          data={this.state.data}
          columns={columns}
          noDataText="No Data Available"
          filterable
          defaultPageSize={10}
          className="-striped -highlight"
        />
      </div>
    );
  }
}
 export default withStyles(styles, { withTheme : true })(Centres);
