import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
})

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

  handleAddCentre = (event) => {
    event.preventDefault();
    this.setState({ busy: !this.state.busy, })
  }

  render() {
    // const { classes } = this.props;
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
