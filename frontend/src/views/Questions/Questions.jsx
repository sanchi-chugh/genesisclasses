import React, { Component } from "react";
import { Grid, 
         Row, 
         Col, 
         ButtonToolbar, 
         ButtonGroup, 
         Button, 
         Glyphicon, 
         Badge
} from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import renderHTML from 'react-render-html';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
// import DeleteQuestion from "../../components/Actions/Questions/DeleteQuestions";
// import DeleteQuestion from "../../components/Actions/Questions/DeleteQuestions";
// import AddQuestions from "../../components/Actions/Questions/AddQuestions";
// import EditQuestion from "../../components/Actions/Questions/EditQuestions";

class Questions extends Component {

    constructor() {
        super();
        this.handleFormDataChange = this.handleFormDataChange.bind(this);
        this.state = {
          data: {results:[]},
          show: false,//edit modal
          show2:false,//delete modal
          show3:false,//add modal
          formData:{
            title:'',
            description:'',
            image:'',
            file:null,
            subject: ''
          },
          questionChoice:[],
          value: '',
          id:null,
          updatingQuestion:false,
          questionUpdated:false,
          questionDeleted:false,
          deletingQuestion:false,
          transferData:false,
          transferTo:'Select Question',
          question:null,
          questions:[],
          questionAdded:false,
          addingQuestion:false,
          clear:false,
          page:1,
          subjects:[],
          subject: 'Select Subject',
          next:'',
          dropdown:false
        };
      }
  
  componentWillMount() {
   this.fetchQuestions(`?page=1`);
   this.fetchSubjectsChoice();  
  }
  
  fetchMore(){
    axios.get(this.state.next, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data.results;
        this.setState({
          ...this.state,
          subjects: [...this.state.subjects,...data],
          next:res.data.next});
    });
  }

  fetchSubjectsChoice(){
    axios.get("/api/subjectChoice/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data.results;
        this.setState({subjects:data,
                       next:res.data.next});
    });
  }
  
  fetchQuestions(page,index=0){
    if(page===`?page=1`){
        page=""
    }
    axios.get( `/api/tests/sections/questions/${this.props.match.params.id}/${page}`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          const results = res.data.results.map(item => {
          item.sno = res.data.results.indexOf(item) + 1+index;
          return item;
        })
        res.data.results = results
        const data = res.data
        this.setState({data:data});
    });
  }

  handleHideEditModal() {
    this.setState({ show: false, updatingQuestion:false, questionUpdated:false, value:'',clear:false});
  }

  handleHideAddModal() {
    this.setState({ 
      show3: false, 
      addingQuestion:false, 
      questionAdded:false,
      subject:'Select Subject',
      formData:{
        title:'',
        description:'',
        file:null,
        image:'',
        subject:''
    }});
  }

  handleHideDeleteModal() {
    this.setState({ show2: false, deletingQuestion:false, questionDeleted:false});
  }

  handleAdd(){
    this.setState({ addingQuestion: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('subject',this.state.formData.subject)
      formData.append('description',this.state.formData.description)
      if(this.state.formData.file !== null){
        formData.append('image',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('image','')
      }
      axios.post('/api/questions/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingQuestion: false, questionAdded:true }, this.fetchQuestions(`?page=1`), this.fetchSubjectsChoice()))
      .catch((err) => this.setState({ addingQuestion: false }, () => console.log(err)))
    });
  }

  handleDelete = () => {
    this.setState({ deletingQuestion: true }, () => {
      axios.delete(`/api/questions/delete/${this.state.id}/`,{
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {
        this.setState({ deletingQuestion: false,questionDeleted:true},this.fetchQuestions(`?page=${this.state.page}`,(this.state.page-1)*10))
      })
      .catch((err) => this.setState({ deletingQuestion: false }, () => console.log(err)))
    });
  }

  handleEdit() {
    this.setState({ updatingQuestion: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('subject',this.state.formData.subject)
      formData.append('description',this.state.formData.description)
      this.state.clear ? formData.append('image','') : (this.state.formData.file !== null ? formData.append('image',this.state.formData.file,this.state.formData.file.name) : console.log("debug") )
      axios.patch(`/api/questions/edit/${this.state.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingQuestion: false, questionUpdated:true },this.fetchQuestions(`?page=1`), this.fetchSubjectsChoice());})
      .catch((err) => this.setState({ updatingQuestion: false }, () => console.log(err)))
    });
  }

  handleShowEditModal(obj){
    console.log(obj.subject.id)
    console.log(this.state.subjects.filter(item=> obj.subject.id===item.id)[0].title)
    this.setState({ id: obj.id ,subject: this.state.subjects.filter(item=> obj.subject.id===item.id)[0].title,
      formData: {
      title:obj.title,
      image:obj.image,
      subject:this.state.subjects.filter(item=> obj.subject.id===item.id )[0].id,
      description:obj.description,
      file:null
    }},()=>{
      this.setState({show:true})
    })
  }
  
  fetchSubjectsQuestions(questionID){
    axios.get(`/api/questions/${questionID}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({questions:data});
    });
  }

  handleViewButton(obj){
    this.props.history.push({pathname:`/tests/sections/questions/detail/${obj.id}`})
  }

  handleViewPassageButton(obj){
    this.props.history.push({pathname:`/tests/sections/questions/passages/${obj.passage.split('/')[8]}`})
  }

  handleShowDeleteModal(obj){
    this.setState({ id: obj.id},()=>{
      this.setState({show2:true})
    })
  }

  handleAddButton(obj){
    this.props.history.push({pathname:'/questions/add'})
  }

  handleEditButton(obj){
    this.props.history.push({pathname:`/questions/edit/${obj.id}`})
  }

  handleFormDataChange(e) {
    console.log(this.state.formData.file,this.state)
    if(e.target.name === 'course' ){
        if(e.target.checked){
          this.state.formData.course.push(e.target.value)
        }else{
          this.setState({
            formData:{
              ...this.state.formData,
              course:this.state.formData.course.filter( (item) => {
                if(item !== e.target.value){
                  return item
                }
              })
            }
          })
        }
    }else if(e.target.name === 'image'){
      if(e.target.files.length){
        let file = e.target.files[0]
        this.setState({ formData: {
          ...this.state.formData,
          file : file,
      }});
      }
    }
    else if(e.target.name==='clear'){
      this.setState({ 
        clear: e.target.checked
      });
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value
    }});
    }
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

  onPageChange(page, sizePerPage=10) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchQuestions(`?page=${page}`,currentIndex)
    console.log(currentIndex,page,sizePerPage,this.state.data)
    this.setState({
      page: page,
    });
  }

  render() {
    return (
      <div className="content modal-container">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="Questions"
                addButton={true}
                handleShowAddModal={this.handleAddButton.bind(this)}
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data.results}
                      search remote
                      fetchInfo={ { dataTotalSize: this.state.data.count } }
                      options={ { sizePerPage: 10,
                                  onPageChange: this.onPageChange.bind(this),
                                  sizePerPageList: [ 10 ],
                                  page: this.state.page} }>
                        <TableHeaderColumn width={60} dataField='quesNumber' isKey hiddenOnInsert>QNO.</TableHeaderColumn>
                        <TableHeaderColumn width={400} dataField='questionText' dataFormat={this.renderQuestion.bind(this)}>Question</TableHeaderColumn>
                        <TableHeaderColumn width={120} dataField='questionType'>Question Type</TableHeaderColumn>
                        <TableHeaderColumn width={120} dataField='marksPositive' dataFormat={this.renderMarks.bind(this)}>Marks</TableHeaderColumn>
                        <TableHeaderColumn width={120} dataField='valid'>Valid</TableHeaderColumn>
                        <TableHeaderColumn width={180} dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    {/* <DeleteQuestion
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      questionDeleted={this.state.questionDeleted}
                      deletingQuestion={this.state.deletingQuestion}
                      handleDelete={this.handleDelete.bind(this)}
                      id={this.state.id}
                    /> */}
                    {/* <EditQuestion 
                      show={this.state.show} 
                      onHide={this.handleHideEditModal.bind(this)} 
                      questionUpdated={this.state.questionUpdated} 
                      formData={this.state.formData} 
                      handleFormDataChange={this.handleFormDataChange.bind(this)} 
                      subjects={this.state.subjects}
                      subject={this.state.subject}
                      handleSelect={this.handleSelectSubject.bind(this)}
                      updatingQuestion={this.state.updatingQuestion}
                      handleEdit={this.handleEdit.bind(this)}
                      fetchMore={this.fetchMore.bind(this)}
                      hasMore={this.state.next === null ? false :true}
                      dropdown={this.state.dropdown}
                      toggle={this.toggleDropdown.bind(this)}
                    />
                    <DeleteQuestion
                      show={this.state.show2}
                      onHide={this.handleHideDeleteModal.bind(this)}
                      questionDeleted={this.state.questionDeleted}
                      deletingQuestion={this.state.deletingQuestion}
                      handleDelete={this.handleDelete.bind(this)}
                      transferData={this.state.transferData}
                      toggle={this.toggleTransferData.bind(this)}
                      questions={this.state.questions}
                      id={this.state.id}
                      question={this.state.transferTo}
                      handleSelect={this.handleSelect.bind(this)}
                    />
                    <AddQuestions
                      show={this.state.show3}
                      onHide={this.handleHideAddModal.bind(this)}
                      questionAdded={this.state.questionAdded}
                      addingQuestion={this.state.addingQuestion}
                      handleAdd={this.handleAdd.bind(this)}
                      formData={this.state.formData}
                      subjects={this.state.subjects}
                      subject={this.state.subject}
                      handleSelect={this.handleSelectSubject.bind(this)}
                      handleFormDataChange={this.handleFormDataChange.bind(this)}
                      fetchMore={this.fetchMore.bind(this)}
                      hasMore={this.state.next === null ? false :true}
                      dropdown={this.state.dropdown}
                      toggle={this.toggleDropdown.bind(this)}/> */}
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

export default Questions;
