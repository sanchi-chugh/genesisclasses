import React, { Component } from "react";

import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";
import DescriptionCard from "../../WebAppComponents/DescriptionCard/DescriptionCard.jsx";


class UnitWiseTests extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
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
      this.setState({data:data});
    });
  }

  testFunction(){
    alert('Clicked')
  }

  handleSubject(id){
    this.props.history.push(`/home/subjects/${id}`)
  }

  render() {
    console.log(this.state)
    return (
      <div className="content home-content">
        <DescriptionCard 
           image={'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
           title={'sada'}
        />
        <center><h4 className="title-heading">Choose Subject</h4></center>
        <div style={{display:'block', textAlign:'center'}}>
          {this.state.data.map(item=>{
            return(
              <div className="inline">
                  <Card
                    image={item.image !== null && item.image !== '' ? item.image :'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
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
