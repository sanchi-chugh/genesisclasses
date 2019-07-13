import React, { Component } from "react";
import { Grid, Row, Col } from "react-bootstrap";
import TestList from "../../WebAppComponents/TestListInfinite/TestList.jsx";
import RankList from "../../WebAppComponents/RankListInfinite/RankList.jsx";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import Kard from "../../components/Card/Card.jsx";


class Results extends Component {

  constructor() {
    super();
    this.state = {
      data: {results:[]},
      rank: {results:[]},
      next2:null,
      busy2:true,
      busy:true,
      next:null,
      type: 'upcoming',
      active:''
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
    }).catch( err=> {
      if(err.response.status === 401){
        this.props.logout(() =>{this.props.history.push('/')})
      }
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
            this.setState({data:data, next:res.data.next,busy:false, active:res.data.count > 0 ? res.data.results[0].id : ''},()=>{
              this.fetchRankList(`?page=1`);
            });
        }).catch( err=> {
            if(err.response.status === 401){
              this.props.logout(() =>{this.props.history.push('/')})
            }
          });
    }

  fetchRankListMore(){
    Axios.get(this.state.next2, {
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
          rank: {...this.state.rank,
              results:[...this.state.data.results, ...data.results],
          },
          next2:res.data.next});
    }).catch( err=> {
      if(err.response.status === 401){
        this.props.logout(() =>{this.props.history.push('/')})
      }
    });
  }
  
  fetchRankList(page,index=0){
        if(page===`?page=1`){
            page=""
        }
        if(this.state.active === ''){
          this.setState({busy2:false, rank:{results:[]}});
        }else{
          Axios.get( `/api/app/result/tests/${this.state.active}/rankList/`, {
              headers: {
              Authorization: `Token ${localStorage.token}`
              }
          }).then(res => {
              let rank = res.data;
              console.log('tests list', res.data)
              this.setState({rank:rank, next:res.data.next,busy2:false});
          }).catch( err=> {
              if(err.response.status === 401){
                this.props.logout(() =>{this.props.history.push('/')})
              }
            });
        }
    }
  
  testFunction(id){
    this.props.history.push(`/app/test/start/${id}`)
  }

  handleClick(id){
    this.setState({busy2:true, active:id},()=>{
      this.fetchRankList(`?page=1`);
    });
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
                {
                  !this.state.busy &&
                    <TestList
                      {...this.props}
                      fetchMore={this.fetchMore.bind(this)}
                      next={this.state.next}
                      data={this.state.data}
                      flag={true}
                      handleClick={(id)=>this.handleClick(id)}
                      active={this.state.active}
                    />
                }
                {
                  !this.state.busy && this.state.data.results.length === 0 &&
                  <div className="no-tests-placeholder">No Tests Attempted</div>
                }
              </Grid>
            </Col>
            <Col md={6}>
              <Grid fluid>
                  <Row>
                    <Col md={12}>
                      <Kard
                        title="Leaderboard"
                        content={
                          <Grid fluid>
                           {
                              !this.state.busy2 && this.state.rank.results.length >0 &&
                                <RankList
                                  {...this.props}
                                  fetchMore={this.fetchRankListMore.bind(this)}
                                  next={this.state.next2}
                                  data={this.state.rank}
                                />
                            }
                            {
                              !this.state.busy2 && this.state.rank.results.length === 0 &&
                              <div className="no-tests-placeholder">No Data Available</div>
                            }
                          </Grid>
                        }
                      />
                    </Col>
                  </Row>
                </Grid>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Results;
