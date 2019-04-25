import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import TestList from "../../WebAppComponents/TestListInfinite/TestList.jsx";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";


class Results extends Component {

  constructor() {
    super();
    this.state = {
      data: {results:[]},
      busy:true,
      next:null,
    };
  }

  componentDidMount() {
    this.fetchTests(`?page=1`);
   }

  fetchMore(){
    Axios.get(this.state.next, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        let data = {}
        data.results = res.data.results.map(item => {
              item.attempted = true
              return item
            })
        this.setState({
          data: {...this.state.data,
              results:[...this.state.data.results, ...data.results],
          },
          next:res.data.next});
    });
  }
  
  fetchTests(page,index=0){
        if(page===`?page=1`){
            page=""
        }
        Axios.get( `/api/app/result/tests/list/?typeOfTest=upcoming`, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            let data = {}
            data.results = res.data.results.map(item => {
              item.attempted = true
              item.isStarted = true
              return item
            })
            console.log('tests list', res.data)
            this.setState({data:data, next:res.data.next,busy:false});
        });
    }
  
  testFunction(id){
    this.props.history.push(`/app/test/start/${id}`)
  }

  render() {
    return (
      <div className="content home-content">
        <h4 className="title-heading">Upcoming Tests Results</h4>
          {
            !this.state.busy && this.state.data.results.length === 0 &&
            <div className="no-tests-placeholder">No Tests Attempted</div>
          }
          {
            !this.state.busy &&
              <TestList
                {...this.props}
                fetchMore={this.fetchMore.bind(this)}
                next={this.state.next}
                data={this.state.data}
              />
          }
      </div>
    );
  }
}

export default Results;
