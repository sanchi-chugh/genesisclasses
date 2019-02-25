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

class ViewQuestion extends Component {

    constructor() {
        super();
        this.state = {
          data: null
        };
    }

    componentDidMount() {
        this.fetchQuestionDetails();
    }
    
    fetchQuestionDetails(){
        axios.get(`/api/tests/sections/questions/detail/${this.props.match.params.id}/`, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            const options = res.data.details.options.map(item => {
                item.sno = res.data.details.options.indexOf(item) + 1;
                return item;
            })
            res.data.details.options = options
            const data = res.data
            console.log(data)
            this.setState({data:data});
        });
    }

    handleViewButton(){

    }

    renderOption(cell, row, enumObject, rowIndex) {
        return (
            <div style={{width:380,wordWrap:'break-word',wordBreak:'normal',whiteSpace:'normal'}}>{renderHTML(row.optionText)}</div>
        )
      }

    renderColumn(cell, row, enumObject, rowIndex) {
        return (
            <div>
                <Grid>
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
                </Grid>
            </div>
        )
    }

    render() {
       if (this.state.data === null) 
       return (
           null
       )
       return (
        <div className="content">
            <Grid fluid>
            <Row>
                <Col md={12}>
                <Card
                    title="Question Information"
                    content={
                        <Grid fluid>
                        { 
                            this.state.data.details.questionType === 'passage' ? renderHTML(this.state.data.details.passage.paragraph)  : null   
                        }
                        <hr/>
                        {
                            renderHTML(this.state.data.details.questionText)
                        }
                        <hr/>
                        <BootstrapTable
                            condensed pagination
                            data={this.state.data.details.options}
                            search>
                                <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                                <TableHeaderColumn width={400} dataField='optionText' dataFormat={this.renderOption.bind(this)}>Option</TableHeaderColumn>
                                <TableHeaderColumn dataField='correct'>Correct</TableHeaderColumn>
                                <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
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

export default ViewQuestion;
