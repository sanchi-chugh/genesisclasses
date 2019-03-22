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
     console.log('yippieee',this.state)
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
        });
    }

  testFunction(){
        alert('Clicked')
   }

  render() {
    return (
      <div className="content home-content">
        <center><h4 className="title-heading">Tests</h4></center>
        {!this.state.busy &&
        <TestList 
          fetchMore={this.fetchMore.bind(this)}
          next={this.state.next}
          data={this.state.data}
          testFunction={this.testFunction.bind(this)}
        />}
      </div>
    );
  }
}

export default CategoryWiseTests;