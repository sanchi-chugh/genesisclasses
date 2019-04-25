import React, { Component } from "react";
import { 
  Row, 
  Col, 
  Button, 
  Glyphicon, 
} from "react-bootstrap";
import { Radio } from 'antd';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export class Card extends Component {
  render() {
    return (
      <div className={"card" + (this.props.plain ? " card-plain" : "")}>
        <div className={"header" + (this.props.hCenter ? " text-center" : "")}>
          <div>
            <Row>
              <Col md={this.props.downloadButton ? 8 : this.props.editButton || this.props.activeButton  ? 10 : 11}>
                <h4 className="title" style={{display: 'inline-block'}}>{this.props.title}</h4>
              </Col>
              {this.props.downloadButton ? <Col md={3}>
                <Button bsSize="small" bsStyle="info" style={{width:"100%"}}onClick={this.props.handleDownloadButton}>
                  <Glyphicon glyph="download" /> Download Students Data
                </Button>
              </Col> :''}
              {this.props.addButton ? <Col md={1}>
                <Button bsSize="small" bsStyle="success" onClick={this.props.handleShowAddModal}>
                  <Glyphicon glyph="plus-sign" /> ADD
                </Button>
              </Col> :''}
              {this.props.editButton ? <Col md={2}>
                <Button bsSize="small" bsStyle="info" onClick={this.props.handleShowEditModal}>
                  <Glyphicon glyph="edit" /> {this.props.editButtonLabel}
                </Button>
              </Col> :''}
              {this.props.activeButton ? <Col md={2}>
                <RadioGroup onChange={this.props.onChange} defaultValue={this.props.active}>
                  <RadioButton value={false}><Glyphicon glyph={'remove'} style={{padding:'5px',color: !this.props.active  ? 'red' : 'grey'}}/></RadioButton>
                  <RadioButton value={true}><Glyphicon glyph={'ok'} style={{padding:'5px',color:this.props.active  ? 'green' : 'grey'}}/></RadioButton>
                </RadioGroup>
              </Col> :''}
            </Row>
          </div>
          <p className="category">{this.props.category}</p>
        </div>
        <div
          className={
            "content" +
            (this.props.ctAllIcons ? " all-icons" : "") +
            (this.props.ctTableFullWidth ? " table-full-width" : "") +
            (this.props.ctTableResponsive ? " table-responsive" : "") +
            (this.props.ctTableUpgrade ? " table-upgrade" : "")
          }
        >
          {this.props.content}

          <div className="footer">
            {this.props.legend}
            {this.props.stats != null ? <hr /> : ""}
            <div className="stats">
              <i className={this.props.statsIcon} /> {this.props.stats}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Card;
