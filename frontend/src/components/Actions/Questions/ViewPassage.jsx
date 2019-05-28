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
import { ContentState, EditorState, convertToRaw, convertFromHTML} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import renderHTML from 'react-render-html';
import EditPassage from "./EditPassage.jsx";
import DeleteQuestion from "./DeleteQuestions";

class ViewPassage extends Component {

    constructor() {
        super();
        this.state = {
          show2:false, //edit passage,
          show:false,// delete question
          updatingPassage:false,
          passageUpdated:false,
          errors:[],
          id:null,
          questionDeleted:false,
          deletingQuestion:false,
          data: {
              details:{
                  paragraph:''
              }
          },
          formData:{
            passage: EditorState.createEmpty()
          },
        };
    }

    componentWillMount() {
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

    handleHideDeleteModal() {
      this.setState({ show: false, deletingQuestion:false, questionDeleted:false, id:null});
    }

    handleDelete = () => {
      this.setState({ deletingQuestion: true }, () => {
        axios.delete(`/api/tests/sections/questions/delete/${this.state.id}/`,{
          headers: {
            Authorization: `Token ${localStorage.token}`
          },
        })
        .then((res) => {
          this.setState({ deletingQuestion: false,questionDeleted:true},()=>{
            this.props.handleClick('tr','Deleted Successfully', 'warning');
            this.fetchParagraph();
            this.handleHideDeleteModal();
            }
          )
        })
        .catch((err) => this.setState({ deletingQuestion: false }, () => console.log(err)))
      });
    }

    handleEditButton(){
        this.setState({show2:true, formData:{
            ...this.formData,
            passage: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(this.state.data.details.paragraph)))
        }})
    }

    handleHideEditPassageModal(){
      this.setState({ 
          show2: false, 
          updatingPassage:false, 
          passageUpdated:false, 
          formData:{
              ...this.state.formData,
              passage:EditorState.createEmpty()
          }
      });
    }

    handleEditPassage(e){
        e.preventDefault();
        this.setState({ updatingPassage: true }, () => {
        var formData = new FormData();
        formData.append('paragraph', draftToHtml(convertToRaw(this.state.formData.passage.getCurrentContent())) )
        axios.put(`/api/tests/sections/questions/passages/edit/${this.props.match.params.id}/`, formData, {
                headers: {
                Authorization: `Token ${localStorage.token}`
                },
            })
            .then((res) => {this.setState({ updatingPassage: false, passageUpdated:true },this.props.handleClick('tr','Updated Successfully')); this.handleHideEditPassageModal(); this.fetchParagraph();})
            .catch((err) => this.setState({ updatingPassage: false, errors: err.response.data }, () => console.log(err)))
        });
    }

    handleShowDeleteModal(obj){
      this.setState({ id: obj.id},()=>{
        this.setState({show:true})
      })
    }

    onEditorStateChangePassage = (editorState) => {
      this.setState({
          formData:{
            ...this.state.formData,
            passage: editorState
          },
      });
    }

    handleFormDataChange(e) {
      this.setState({ formData: {
          ...this.state.formData,
          [e.target.name] : e.target.value
        }
      });
    }

    handleEditButton(obj){
      this.props.history.push({pathname:`/tests/sections/questions/detail/edit/${obj.id}`})
    }
    
    handleViewButton(obj){
        this.props.history.push({pathname:`/tests/sections/questions/detail/${obj.id}`})
    }

    handleAddButton(obj){
      this.props.history.push({pathname:`/tests/sections/questions/add/${this.state.data.details.section.id}`, data:this.state.data.details})
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
                    <Button bsSize="small" style={{width:'80px'}} bsStyle="info" onClick={this.handleEditButton.bind(this,row)}>
                      <Glyphicon glyph="edit" /> EDIT
                    </Button>
                    <Button bsSize="small" style={{width:'80px'}} bsStyle="danger" onClick={this.handleShowDeleteModal.bind(this,row)} >
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
    const { errors } = this.state;
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Passage Information"
                editButton={true}
                handleShowEditModal={this.handleEditButton.bind(this)}
                editButtonLabel={'EDIT PASSAGE'}
                content={
                    <Grid fluid>
                        {renderHTML(this.state.data.details.paragraph)}
                        <hr/>
                        <Card 
                          title='Questions'
                          ctTableFullWidth
                          ctTableResponsive
                          plain
                          addButton={true}
                          handleShowAddModal={this.handleAddButton.bind(this)}
                          content={
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
                          }
                        />
                        <EditPassage
                            show = {this.state.show2}
                            onHide = {this.handleHideEditPassageModal.bind(this)}
                            passageUpdated = {this.state.passageUpdated}
                            updatingPassage = {this.state.updatingPassage}
                            handleEdit = {this.handleEditPassage.bind(this)}
                            handleFormDataChange = {this.handleFormDataChange.bind(this)}
                            onEditorStateChange = {this.onEditorStateChangePassage}
                            formData = {this.state.formData}
                            errors={errors}
                        />
                        <DeleteQuestion
                          show={this.state.show}
                          onHide={this.handleHideDeleteModal.bind(this)}
                          questionDeleted={this.state.questionDeleted}
                          deletingQuestion={this.state.deletingQuestion}
                          handleDelete={this.handleDelete.bind(this)}
                        /> 
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
