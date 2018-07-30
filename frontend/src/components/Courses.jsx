import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';

class Courses extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React',
      data: []
    };
  }

  textFilter(filter, row){
    let result = parseInt( row[filter.id].toUpperCase().indexOf(filter.value.toUpperCase()), 10);
    if (result < 0) {
      return false;
    } else {
      return true;
    }
  }

  componentDidMount() {
    axios.get("/api/courses/", {
      headers: {
        Authorization: `Token ${localStorage.token}`
      }
    })
    .then(res => {
      const data = res.data;
      for (let unit of data) {
        var locationArray = []
        for(let location of unit.centres) {
          locationArray.push(location.location);
        }
        unit.centres = [];
        unit.centres = locationArray.join(", ");
      }
      this.setState({ data });
    });
  }

  render() {
    const columns = [
      {
        Header: 'Courses',
        columns:[
          {
            accessor: 'title',
            filterMethod: (filter,row) => 
              {return this.textFilter(filter,row)}
          }
        ]
      },
      {
        Header: 'Centres',
        columns:[
          {
            accessor: 'centres',
            filterMethod: (filter,row) => {return this.textFilter(filter,row)}
          }
        ]
      }
    ]
    return (
      <div>
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

export default Courses;
