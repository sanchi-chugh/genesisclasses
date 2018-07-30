import React, { Component } from 'react';
import { render } from 'react-dom';

// react table
import ReactTable from 'react-table';
import "react-table/react-table.css";

import axios from 'axios';
//import Hello from './Hello';
//import './style.css';

class Courses extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React',
      data: []
    };
  }

  textFilter(filter, row){
    let result =parseInt( row[filter.id].toUpperCase().indexOf(filter.value.toUpperCase()), 10);
    if(result < 0){
      return false;
    }else{
      return true;
    }
  }

componentDidMount() {
 axios.get("http://127.0.0.1:8000/api/course/").then(res => {
  const data = res.data;
  this.setState({data});
 })
}

  render() {
     for(let unit of this.state.data)
     {
      console.log(unit.title);
      var locationArray = []
      for(let location of unit.centres)
      {
        console.log(location.location);
        locationArray.push(location.location);
      }
      unit.centres = [];
      unit.centres = locationArray.join(", ");
     }
    const columns = [
          {
            Header: 'Courses',
            columns:[
              {
                accessor: 'title',
                filterMethod: (filter,row) => {return this.textFilter(filter,row)}
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
        defaultPageSize={5}
        className="-striped -highlight" />
      </div>
    );
  }
}
 export default Courses;
