import React, { Component } from "react";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';

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
        <div style={{display:'block', textAlign:'center'}}>
            <InfiniteScroll
                pageStart={0}
                loadMore={this.fetchMore.bind(this)}
                hasMore={this.state.next === null ? false : true}
                loader={<div key={0}><LinearProgress
                color="primary"
                /></div>}
                useWindow={true}
                threshold={10}>
                {this.state.data.results.map(item=>{
                    return(
                        <div className="test inline" key={item.id}>
                            <Card
                                image={item.image !== null && item.image !== '' ? item.image :'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                                title={'Take Test'}
                                content={item} disabled={!item.isStarted}
                                handleClick={this.testFunction.bind(this)}
                            />
                        </div>
                    );
                })}
            </InfiniteScroll>
        </div>}
      </div>
    );
  }
}

export default CategoryWiseTests;