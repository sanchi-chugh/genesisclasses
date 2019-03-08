import React, { Component } from "react";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import DescriptionCard from "../../WebAppComponents/DescriptionCard/DescriptionCard.jsx";
import TestList from "../../WebAppComponents/TestListInfinite/TestList.jsx";


class ChapterWise extends Component {

  constructor() {
    super();
    this.state = {
      data: {results:[]},
      untis:[],
      busy:true,
      next:''
    };
  }

  componentDidMount() {
    this.fetchUnits();
    this.fetchTests(`?page=1`);
   }
 
  fetchUnits(){
    Axios.get(`/api/app/units/${this.props.match.params.id}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      const data = res.data.map(item => {
        item.sno = res.data.indexOf(item) + 1;
        return item;
      })
      this.setState({units:data});
    });
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
        <DescriptionCard 
           image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
           title={'Chemistry'}
           handleClick={this.testFunction.bind(this)}
        />
        <center><h4 className="title-heading">Choose Test</h4></center>
        <TestList 
            fetchMore={this.fetchMore.bind(this)}
            next={this.state.next}
            data={this.state.data}
            testFunction={this.testFunction.bind(this)}
        />
      </div>
    );
  }
}

export default ChapterWise;
