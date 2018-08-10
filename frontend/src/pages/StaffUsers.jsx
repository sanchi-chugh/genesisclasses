import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';

const styles = (theme) => ({

});

class StaffUsers extends Component {
  state = {
    data: []
  }

  componentWillMount() {
    axios.get("/api/users/staff/", {
      headers: {
        Authorization: `Token ${localStorage.token}`,
      },
    })
    .then((res) => {
      const { data } = res;
      this.setState({ data });
    })
    .catch((err) => console.log(err));
  }

  textFilter(filter, row){
    let result = parseInt( row[filter.id].toUpperCase().indexOf(filter.value.toUpperCase()), 10);
    if (result < 0) {
      return false;
    }else{
      return true;
    }
  }

  render() {
    const columns = [
      {
        Header: 'Username',
        columns:[
          {
            accessor: 'user.username',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Name',
        columns:[
          {
            accessor: 'name',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Email',
        columns:[
          {
            accessor: 'user.email',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Centre',
        columns:[
          {
            accessor: 'centre.location',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Course',
        columns:[
          {
            accessor: 'course.title',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      }
    ]
    return (
      <div style={{margin: '20px'}}>
        <br />
        Staff Users
        <br />
        <br />
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

export default withStyles(styles, { withTheme: true })(StaffUsers);