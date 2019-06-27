import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap"
import appLogo from "../../assets/img/app_logo.png";
import Logout from '../../components/Logout/Logout';

class HeaderLinks extends Component {

  constructor(props){
    super(props);
    this.state = {
      show:false
    }
  }

  logout(){
    this.props.logout(() =>{this.props.history.push('/')})
  }

  render() {
    return (
      <div className="nav-links">
        <ul className="left">
          {this.props.flag && <li href="#">
            <div>
              <img src={appLogo}  style={{
              width: '170px',
              marginTop: '-14px'
            }}/>
            </div>
                    </li>}
          {/*
            !this.props.flag && <li href="#">
                      <a ><Glyphicon glyph="menu-hamburger" style={{color:'white', fontSize: '18px'}} onClick={this.props.toggle}/></a>
                    </li>
          */}
          {!this.props.flag && <li href="#">
                      <a ><Glyphicon glyph="chevron-left" style={{color:'white', fontSize: '18px'}} onClick={()=>{
                        console.log(this.props)
                        if(this.props.location.pathname !== '/home')
                          this.props.history.goBack()
                      }}/></a>
                    </li>}
          {/*
            <li>
            <a ><Glyphicon glyph="search" style={{color:'white', fontSize: '18px'}}/></a>
          </li>
          */}
        </ul>
        <ul className="right">
          {/*
            <li>
            <a ><Glyphicon glyph="cog" style={{color:'white', fontSize: '18px'}}/></a>
          </li>
          */}
          <li>
            <a ><Glyphicon glyph="log-out" style={{color:this.props.flag ? '#01458E' : 'white', fontSize: '18px'}} onClick={()=>this.setState({show:true})}/></a>
          </li>
        </ul>
        <Logout
         onHide={()=>this.setState({show:false})}
         show={this.state.show}
         logout={this.logout.bind(this)}
         />
      </div>
    );
  }
}

export default HeaderLinks;
