import React, { Component } from "react";
import { Grid, Row, Col, ButtonToolbar, ButtonGroup, Button, Glyphicon } from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn, InsertModalFooter, InsertModalHeader, DeleteButton} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

class Centres extends Component {

    constructor() {
        super();
        this.state = {
          data: [],
        };
      }

  componentDidMount() {
    axios.get("/api/centres/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          const data = res.data.map(item => {
          item.sno = res.data.indexOf(item) + 1;
          return item;
        })
        this.setState({data});
    });
  }

  handleDelete = () => {
  } 

  handleSave() {
  }

  handleEdit(){
  }

  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Col>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" onClick={this.handleEdit.bind(this)}>
                  <Glyphicon glyph="edit" /> EDIT
                </Button>
                <Button bsSize="small" onClick={this.handleDelete.bind(this)}>
                  <Glyphicon glyph="trash" /> DELETE
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Grid>
      </div>
    )
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="Centres"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data}
                      search>
                        <TableHeaderColumn dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='location'>Centre</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                  </div>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Centres;
