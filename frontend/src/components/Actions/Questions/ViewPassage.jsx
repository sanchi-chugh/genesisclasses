import React, { Component } from "react";
import { Grid, 
    Row, 
    Col, 
    ButtonToolbar, 
    ButtonGroup, 
    Button, 
    Glyphicon, 
} from "react-bootstrap";

import { Card } from "../../../components/Card/Card.jsx";
import axios from "axios";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import renderHTML from 'react-render-html';

class ViewPassage extends Component {

    constructor() {
        super();
        this.state = {
          data: {
              details:{
                  paragraph:''
              }
          },
        };
    }

    componentDidMount() {
        this.fetchParagraph();
    }
    
    fetchParagraph(){
        axios.get(`/api/tests/sections/questions/passages/${this.props.match.params.id}/`, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            const data = res.data;
            this.setState({data:data});
        });
    }

    handleViewButton(obj){
        this.props.history.push({pathname:`/tests/sections/questions/detail/${obj.id}`})
    }

    renderQuestion(cell, row, enumObject, rowIndex) {
        return (
            <div style={{width:380,wordWrap:'break-word',wordBreak:'normal',whiteSpace:'normal'}}>{renderHTML(row.questionText)}</div>
        )
      }
    
      renderMarks(cell, row, enumObject, rowIndex) {
          return (
              <Col md={12}>
                <Row md={12}>+ {row.marksPositive}</Row>
                <Row md={12}>- {row.marksNegative}</Row>
              </Col>
          )
      }
    
      renderColumn(cell, row, enumObject, rowIndex) {
        return (
          <div>
            <Grid>
              <Row>
                  <ButtonToolbar>
                      <ButtonGroup>
                          <Button bsSize="small" style={{width:'160px'}} bsStyle="primary" onClick={this.handleViewButton.bind(this,row)}>
                          <Glyphicon glyph="list-alt" /> VIEW QUESTION
                          </Button>
                      </ButtonGroup>
                  </ButtonToolbar>
              </Row>
              <Row>
                <ButtonToolbar>
                  <ButtonGroup>
                    <Button bsSize="small" style={{width:'80px'}} bsStyle="info" onClick={this.handleViewButton.bind(this,row)}>
                      <Glyphicon glyph="edit" /> EDIT
                    </Button>
                    <Button bsSize="small" style={{width:'80px'}} bsStyle="danger" onClick={this.handleViewButton.bind(this,row)} >
                      <Glyphicon glyph="trash" /> DELETE
                    </Button>
                  </ButtonGroup>
                </ButtonToolbar>
              </Row>
              {
                  row.questionType === 'passage' ?
                <Row>
                    <ButtonToolbar>
                        <ButtonGroup>
                            <Button bsSize="small" style={{width:'160px'}} bsStyle="primary" onClick={this.handleViewPassageButton.bind(this,row)}>
                            <Glyphicon glyph="list-alt" /> VIEW PASSAGE
                            </Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                </Row> : null
              }
            </Grid>
          </div>
        )
      }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Passage Information"
                content={
                    <Grid fluid>
                        {renderHTML(this.state.data.details.paragraph)}
                        <hr/>
                        <BootstrapTable
                            condensed pagination
                            data={this.state.data.details.questions}
                            search>
                                <TableHeaderColumn width={60} dataField='quesNumber' isKey hiddenOnInsert>QNO.</TableHeaderColumn>
                                <TableHeaderColumn width={400} dataField='questionText' dataFormat={this.renderQuestion.bind(this)}>Question</TableHeaderColumn>
                                {/* <TableHeaderColumn width={120} dataField='questionType'>Question Type</TableHeaderColumn> */}
                                <TableHeaderColumn width={120} dataField='marksPositive' dataFormat={this.renderMarks.bind(this)}>Marks</TableHeaderColumn>
                                <TableHeaderColumn width={120} dataField='valid'>Valid</TableHeaderColumn>
                                <TableHeaderColumn width={180} dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                        </BootstrapTable>
                    </Grid>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default ViewPassage;
