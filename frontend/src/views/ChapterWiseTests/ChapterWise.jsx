import React, { Component } from "react";
import { Row, Col, Grid } from "react-bootstrap";
import Axios from "axios";
import DescriptionCard from "../../WebAppComponents/DescriptionCard/DescriptionCard.jsx";
import TestList from "../../WebAppComponents/TestListInfinite/TestList.jsx";
import placeholder from "../../assets/img/placeholder.jpg";

class ChapterWise extends Component {

  constructor() {
    super();
    this.state = {
      data: {results:[]},
      units:[],
      busy:true,
      next:'',
      details:{},
      count:null
    };
  }

  componentWillMount() {
    this.fetchSubjectDetails();
    this.fetchUnits();
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
      this.setState({
          units:data,
          unitSelected:data.length !== 0 ? data[0].id : null
        },()=>{
            if(this.state.unitSelected!==null){
                this.fetchTests(`?page=1`);
            }
        });
    });
  }

  fetchSubjectDetails(){
    Axios.get(`/api/app/subjects/${this.props.match.params.id}/detail/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      const data = res.data.detail;
      console.log(data)
      this.setState({
          details:data,
        });
    });
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
              results:[...this.state.data.results, ...data.results],
          },
          next:res.data.next});
    });
  }
  
  fetchTests(page,index=0){
        if(page===`?page=1`){
            page=""
        }
        Axios.get( this.state.units[index].tests, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            const data = res.data
            console.log('tests list', res.data)
            this.setState({data:data, next:data.next,count:data.count,busy:false});
        });
    }

  handleUnitSelect(id){
      this.setState({
          unitSelected:id
        },()=>{
            this.fetchTests('?page=1',this.state.units.findIndex(obj => obj.id === id));
        })
  }

  render() {
    return (
      <div className="content home-content">
        <DescriptionCard 
           image={this.state.details.image !== null ? this.state.details.image : placeholder }
           title={this.state.details.title}
           description={this.state.details.description}
        //    handleClick={this.testFunction.bind(this)}
        />
        {this.state.units.length === 0 &&
          <p className="no-tests-placeholder">No Units available</p>}
        {!this.state.busy && 
        <Grid fluid>
            <Row>
                <Col md={3}>
                    <div className="side-chap">
                        <div className="chap-wrapper">
                            {this.state.units.map(item=>{
                                return(
                                    <div>
                                        <div className={"chap-list-item" + (this.state.unitSelected === item.id ? ' active' : '')} key={item.id} onClick={this.handleUnitSelect.bind(this,item.id)}>
                                          <p>{item.title}</p>
                                        </div>
                                        <div className={"chap-list-item-hidden item-hidden" + (this.state.unitSelected === item.id ? ' active-hidden' : '')} key={item.id}>
                                          <p>{this.state.count} Tests</p>
                                        </div> 
                                    </div>
                                );   
                            })}
                        </div>
                    </div>
                </Col>
                <Col md={9} style={{backgroundColor:'white',paddingTop:'25px',fontWeight:'500',color:'black',borderRadius:'4px', minHeight:'200px'}}>
                    <h4 className="title-heading">Tests For {this.state.units[this.state.units.findIndex(obj => obj.id === this.state.unitSelected)].title}</h4>
                    {this.state.count === 0 && 
                      <p className="no-tests-placeholder">No tests available</p>
                    }
                    <TestList
                        {...this.props}
                        fetchMore={this.fetchMore.bind(this)}
                        next={this.state.next}
                        data={this.state.data}
                    />
                </Col>
            </Row>
        </Grid>
        }
      </div>
    );
  }
}

export default ChapterWise;
