import React, { Component } from "react";

import Axios from "axios";
import TestList from "../../WebAppComponents/TestListInfinite/TestList.jsx";

class CategoryWiseTests extends Component {

  constructor() {
    super();
    this.state = {
      data: {results:[]},
      next: '',
      busy:true
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
         const data = res.data;
         this.setState({
           data: {...this.state.data,
               results:[...this.state.data.results, ...data.results]
           },
           next:res.data.next});
     }).catch( err=> {
          if(err.response.status === 401){
            this.props.logout(() =>{this.props.history.push('/')})
          }
        });
   }
   
  fetchTests(page){
        if(page===`?page=1`){
            page=""
        }
        Axios.get( `/api/app/tests/practice/category/${this.props.match.params.id}/${page}`, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            const data = res.data
            console.log(res.data)
            this.setState({data:data, next:data.next,busy:false});
        }).catch( err=> {
            if(err.response.status === 401){
              this.props.logout(() =>{this.props.history.push('/')})
            }
          });
    }

  render() {
    return (
      <div className="content home-content">
        <center><h4 className="title-heading">Tests</h4></center>
        {this.state.busy &&
          <div className="wait">
            <div className="loader"></div>
          </div>
        }
        {
          !this.state.busy && this.state.data.results.length === 0 &&
          <div className="no-tests-placeholder">No Tests Available</div>
        }
        {!this.state.busy &&
        <TestList
          {...this.props}
          fetchMore={this.fetchMore.bind(this)}
          next={this.state.next}
          data={this.state.data}
        />}
      </div>
    );
  }
}

export default CategoryWiseTests;