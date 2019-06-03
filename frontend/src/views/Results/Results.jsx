import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import TestList from "../../WebAppComponents/TestListInfinite/TestList.jsx";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import Kard from "../../components/Card/Card.jsx";


class Results extends Component {

  constructor() {
    super();
    this.state = {
      data: {results:[]},
      busy:true,
      next:null,
      type: 'upcoming'
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
        Axios.get( `/api/app/result/tests/list/?typeOfTest=${this.state.type}`, {
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
        <div className="tabs">
          <div className="line"></div>
          <div 
            className={"tab-badge " + (this.state.type === 'upcoming' ? 'active' : '')} 
            onClick={()=>this.setState({type:'upcoming'},()=>{
              this.fetchTests(`?page=1`);
            })}>
            Upcoming
          </div>
          <div 
            className={"tab-badge " + (this.state.type === 'practice' ? 'active' : '')} 
            onClick={()=>this.setState({type:'practice'},()=>{
              this.fetchTests(`?page=1`);
            })}>
            Practice
          </div>
        </div>
        <Grid fluid>
          <Row>
            <Col md={6}>
              <Grid fluid>
                  <Row>
                    <Col md={12}>
                      <Kard
                        title="Leaderboard"
                        content={
                          <Grid fluid>
                           
                          </Grid>
                        }
                      />
                    </Col>
                  </Row>
                </Grid>
            </Col>
            <Col md={6}>
              <Grid fluid>
                {
                  !this.state.busy &&
                    <TestList
                      {...this.props}
                      fetchMore={this.fetchMore.bind(this)}
                      next={this.state.next}
                      data={this.state.data}
                      flag={true}
                    />
                }
                {
                  !this.state.busy && this.state.data.results.length === 0 &&
                  <div className="no-tests-placeholder">No Tests Attempted</div>
                }
              </Grid>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Results;
