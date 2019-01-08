import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';
import Button from '@material-ui/core/Button';
import { CSVLink } from 'react-csv';

const styles = (theme) => ({

});

class StudentUsers extends Component {
  state = {
    data: []
  }

  componentWillMount() {
    axios.get("/api/users/students/", {
      headers: {
        Authorization: `Token ${localStorage.token}`,
      },
    })
    .then((res) => {
      const { data } = res;
      data.map((obj) => {
        if (!obj.first_name)
          obj.first_name="-";
        if (!obj.last_name)
          obj.last_name="-";
        if (!obj.father_name)
          obj.father_name="-";
        if (!obj.email)
          obj.email="-";
        if (!obj.contact_number)
          obj.contact_number="-";
        if (!obj.course)
          obj.course="-";
        else
          obj.course=obj.course.title
        if (!obj.centre)
          obj.centre="-";
        else
          obj.centre=obj.centre.location
        obj.user=obj.user.username
        delete obj.complete;
        delete obj.super_admin;
        delete obj.image;
      })
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
            accessor: 'user',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Name',
        columns:[
          {
            accessor: 'first_name',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          },
          {
            accessor: 'last_name',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: "Father's Name",
        columns:[
          {
            accessor: 'father_name',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Email',
        columns:[
          {
            accessor: 'email',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Phone',
        columns:[
          {
            accessor: 'contact_number',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Course',
        columns:[
          {
            accessor: 'course',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Centre',
        columns:[
          {
            accessor: 'centre',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      },
    ]
    return (
      <div style={{margin: '20px'}}>
        <br />
        Student Users
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
        <br />
        <CSVLink style={{position:'absolute', top: -100}} data={this.state.data} ref="download">Download data</CSVLink>
        <br /><br />
        <Button
          variant="contained"
          onClick={() => this.refs.download.link.click()}
          disabled={this.state.data.length === 0}
          color="primary"
        >
          Download Data
        </Button>
      </div>
    );
  }

}

export default withStyles(styles, { withTheme: true })(StudentUsers);