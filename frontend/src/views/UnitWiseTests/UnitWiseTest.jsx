import React, { Component } from "react";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import DescriptionCard from "../../WebAppComponents/DescriptionCard/DescriptionCard.jsx";
import placeholder from "../../assets/img/placeholder.jpg";
import unitIcon from "../../assets/img/assets_in.jpg"

const description = "Unit Wise Test Series for NEET 2020. In this Test Series, there will be total 29 Tests. In these 29 tests there will be 14 unit tests based on 2 to 3 units of NEET (ug) ..."

class UnitWiseTests extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      busy:true
    };
  }

  componentDidMount() {
    this.fetchSubjects();
   }
 
  fetchSubjects(){
    Axios.get("/api/app/subjects/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
      const data = res.data.map(item => {
        item.sno = res.data.indexOf(item) + 1;
        return item;
      })
      this.setState({data:data, busy:false});
    }).catch( err=> {
      if(err.response.status === 401){
        this.props.logout(() =>{this.props.history.push('/')})
      }
    });
  }

  handleSubject(id){
    this.props.history.push(`/home/subjects/${id}`)
  }

  render() {
    console.log(this.state)
    return (
      <div className="content home-content">
        <DescriptionCard 
           image={ unitIcon }
           description={description}
           title={'Unit Wise Tests'}
        />
        <center><h4 className="title-heading">Choose Subject</h4></center>
        <div style={{display:'block', textAlign:'center'}}>
          {this.state.busy &&
            <div className="wait">
              <div className="loader"></div>
            </div>
          }
          {!this.state.busy && this.state.data.length === 0 && <p className="no-tests-placeholder">No Subjects available</p>}
          {this.state.data.map(item=>{
            return(
              <div className="inline">
                  <Card
                    image={item.image !== null && item.image !== '' ? item.image : placeholder }
                    title={item.title}
                    handleClick={this.handleSubject.bind(this,item.id)}
                    color={'type' + ((item.sno) % 4)}
                  />
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

export default UnitWiseTests;
