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
import { ContentState, EditorState, convertToRaw, convertFromHTML} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import axios from "axios";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import renderHTML from 'react-render-html';
import AddOption from "./Options/AddOptions.jsx";
import EditPassage from "./EditPassage.jsx";

class ViewQuestion extends Component {

    constructor() {
        super();
        this.state = {
          data: null,
          show3:false,//add modal,
          show2:false,//edit passage modal
          updatingPassage:false,
          passageUpdated:false,
          addingOption:false,
          optionAdded:false,
          formData:{
              optionText: EditorState.createEmpty(),
              correct : false,
              passage : EditorState.createEmpty()
              
          }
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
            if(res.data.details.questionType !== 'integer'){
                const options = res.data.details.options.map(item => {
                    item.sno = res.data.details.options.indexOf(item) + 1;
                    return item;
                })
                res.data.details.options = options
            }
            const data = res.data
            console.log(data)
            this.setState({data:data});
        });
    }

    handleAddButton(){
        this.setState({show3:true})
    }

    handleEditButton(){
        this.setState({show2:true})
        this.setState({show2:true, formData:{
            ...this.formData,
            passage: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(this.state.data.details.passage.paragraph)))
        }})
    }

    handleEditPassage(e){
        e.preventDefault();
        this.setState({ updatingPassage: true }, () => {
        var formData = new FormData();
        formData.append('paragraph', draftToHtml(convertToRaw(this.state.formData.passage.getCurrentContent())) )
        axios.put(`/api/tests/sections/questions/passages/edit/${this.state.data.details.passage.id}/`, formData, {
                headers: {
                Authorization: `Token ${localStorage.token}`
                },
            })
            .then((res) => {this.setState({ updatingPassage: false, passageUpdated:true },this.props.handleClick('tr','Updated Successfully')); this.handleHideEditPassageModal(); this.fetchQuestionDetails();})
            .catch((err) => this.setState({ updatingPassage: false }, () => console.log(err)))
        });
    }

    handleAdd(e){
        e.preventDefault();
        this.setState({ addingOption: true }, () => {
            var formData = new FormData();
                formData.append('optionText', draftToHtml(convertToRaw(this.state.formData.optionText.getCurrentContent())))
                formData.append('correct',this.state.formData.correct)
                formData.append('question',this.props.match.params.id)
                axios.post(`/api/tests/sections/questions/options/add/`, formData, {
                    headers: {
                    Authorization: `Token ${localStorage.token}`,
                    },
                })
                .then((res) => {this.setState({ addingOption: false, optionAdded:true },this.props.handleClick('tr','Added Successfully'));this.handleHideAddModal(); this.fetchQuestionDetails();})
                .catch((err) => this.setState({ addingOption: false }, () => console.log(err)))
          });
    }

    handleViewButton(){

    }
    
    handleHideAddModal() {
        this.setState({ show3: false, addingSection:false, sectionAdded:false});
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

    onEditorStateChange = (editorState) => {
        this.setState({
          formData:{
            ...this.state.formData,
            optionText: editorState
          },
        });
      };

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
                    editButton={true}
                    handleShowEditModal={this.handleEditButton.bind(this)}
                    editButtonLabel={'EDIT PASSAGE'}
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
                            {
                                this.state.data.details.questionType !== 'integer' ?
                                <Card 
                                    title="Options"
                                    ctTableFullWidth
                                    ctTableResponsive
                                    plain
                                    addButton={true}
                                    handleShowAddModal={this.handleAddButton.bind(this)}
                                    content={
                                        <div>
                                            <BootstrapTable
                                                condensed pagination
                                                data={this.state.data.details.options}
                                                search>
                                                    <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                                                    <TableHeaderColumn width={400} dataField='optionText' dataFormat={this.renderOption.bind(this)}>Option</TableHeaderColumn>
                                                    <TableHeaderColumn dataField='correct'>Correct</TableHeaderColumn>
                                                    <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                                            </BootstrapTable>
                                            <AddOption 
                                                show = {this.state.show3}
                                                onHide = {this.handleHideAddModal.bind(this)}
                                                optionAdded = {this.state.optionAdded}
                                                addingOption = {this.state.addingOption}
                                                handleAdd = {this.handleAdd.bind(this)}
                                                handleFormDataChange = {this.handleFormDataChange.bind(this)}
                                                onEditorStateChange = {this.onEditorStateChange}
                                                formData = {this.state.formData}
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
                                            />
                                        </div>
                                    }/> : null
                            }
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
