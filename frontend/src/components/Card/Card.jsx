import React, { Component } from "react";
import { Grid, 
  Row, 
  Col, 
  Button, 
  Glyphicon, 
} from "react-bootstrap";

export class Card extends Component {
  render() {
    return (
      <div className={"card" + (this.props.plain ? " card-plain" : "")}>
        <div className={"header" + (this.props.hCenter ? " text-center" : "")}>
          <div>
            <Row>
              <Col md={11}>
                <h4 className="title">{this.props.title}</h4>
              </Col>
              {this.props.addButton ? <Col md={1}>
                <Button bsSize="small" bsStyle="success" onClick={this.props.handleShowAddModal}>
                  <Glyphicon glyph="plus-sign" /> ADD
                </Button>
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
