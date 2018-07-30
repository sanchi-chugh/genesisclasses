import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';

class Centres extends Component {
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
    }else{
      return true;
    }
  }

  componentDidMount() {
    axios.get("/api/centres/").then(res => {
      const data = res.data;
      this.setState({data});
    });
  }

  render() {
    const columns = [
      {
        Header: 'Centres',
        columns:[
          {
            accessor: 'location',
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
          className="-striped -highlight"
        />
      </div>
    );
  }
}
 export default Centres;
