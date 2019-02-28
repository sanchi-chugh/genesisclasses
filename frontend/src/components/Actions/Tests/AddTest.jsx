import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
} from "react-bootstrap";

import axios from 'axios';

import { Card } from "../../../components/Card/Card.jsx";
import { FormInputs } from "../../../components/FormInputs/FormInputs.jsx";
import Button from "../../../components/CustomButton/CustomButton.jsx";
import { Checkbox } from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../../../node_modules/antd/dist/antd.css'; 
class AddTests extends Component {

  constructor() {
    super();
    this.state = {
      courses:[],
      subjects:[],
      units:[],
      categories:[],
      formData:{
        title:'',
        duration:'',
        instructions: EditorState.createEmpty(),
        typeOfTest:'',
        startTime:'',
        endTime:'',
        doc:'',
        file:null,
        course:[],
        category:[],
        subject:'',
        unit:'',
        description:'',
      },
      addingTest:false,
      testAdded:false
    };
  }

  componentWillMount() {
    this.fetchCategories();
    this.fetchCourses();
  }

  fetchSubjects(){
    if(this.state.formData.course.length > 0){
      axios.get(`/api/subjects/${this.state.formData.course.join(',')}/`, {
          headers: {
          Authorization: `Token ${localStorage.token}`
          }
      }).then(res => {
          const data = res.data;
          this.setState({subjects:data});
      });
    }else{
      this.setState({subjects:[]})
    }
  }

  fetchUnits(){
      if(this.state.formData.subject.trim() !== ''){
        axios.get(`/api/units/${this.state.formData.subject}/`, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            const data = res.data;
            this.setState({units:data});
        });
      }else{
        this.setState({units:[]})
    }
  }
  
  fetchCategories(){
    axios.get("/api/testCategories/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({categories:data});
    });
  }

  fetchCourses(){
    axios.get("/api/courses/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({courses:data});
    });
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingTest: true }, () => {
      var formData = new FormData();
      formData.append('title',this.state.formData.title)
      formData.append('duration',this.state.formData.duration)
      formData.append('instructions',draftToHtml(convertToRaw(this.state.formData.instructions.getCurrentContent())))
      formData.append('description',this.state.formData.description)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('category',this.state.formData.category.join(','))
      formData.append('typeOfTest',this.state.formData.typeOfTest)
      formData.append('active',false)
      formData.append('startTime',this.state.formData.startTime)
      formData.append('endTime',this.state.formData.endTime)
      formData.append('subject',this.state.formData.subject)
      formData.append('unit',this.state.formData.unit)
      if(this.state.formData.file !== null){
        formData.append('doc',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('doc','')
      }
      axios.post('/api/tests/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState(this.props.history.goBack(),{ addingTest: false, testAdded:true },this.props.handleClick('tr','Added Successfully')))
      .catch((err) => this.setState({ addingTest: false }, () => console.log(err)))
    });
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      formData:{
        ...this.state.formData,
        instructions: editorState
      },
    });
  };

  handleFormDataChange(e) {
    if(e.target.name === 'course' ){
        if(e.target.checked){
          this.state.formData.course.push(e.target.value)
          this.fetchSubjects();
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
          },this.fetchSubjects.bind(this))
        }
    }else if(e.target.name === 'category' ){
        if(e.target.checked){
          this.state.formData.category.push(e.target.value)
        }else{
          this.setState({
            formData:{
              ...this.state.formData,
              category:this.state.formData.category.filter( (item) => {
                if(item !== e.target.value){
                  return item
                }
              })
            }
          })
        }
    }else if(e.target.name === 'doc'){
        if(e.target.files.length){
          let file = e.target.files[0]
          this.setState({ 
            formData: {
            ...this.state.formData,
            file : file
        }});
      }
    }else{
        if(e.target.name === 'subject'){
            this.setState({ formData: {
              ...this.state.formData,
              [e.target.name] : e.target.value
          }},this.fetchUnits.bind(this));
        }else{
          this.setState({ formData: {
              ...this.state.formData,
              [e.target.name] : e.target.value
          }}
        );
      }
    }
  }

  render() {

    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Add Test"
                activeButton={true}
                handleRadioButton={this.handleFormDataChange.bind(this)}
                content={
                  <form onSubmit={(event)=>this.handleAdd(event)}>
                    <LinearProgress
                        style={
                            this.state.addingTest ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    <FormInputs
                      ncols={["col-md-12"]}
                      proprieties={[
                        {
                          label: `Test Name *`,
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "Test Name",
                          name:'title',
                          value:this.state.formData.title,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                      ]}
                    />
                    <FormInputs
                        ncols={["col-md-12"]}
                        proprieties={[
                          {
                            label: "Duration (in minutes)*",
                            type: "number",
                            bsClass: "form-control",
                            placeholder: "Duration of test",
                            name:'duration',
                            value:this.state.formData.duration,
                            onChange:this.handleFormDataChange.bind(this)
                          },
                        ]}
                      />
                    <FormGroup>
                        <ControlLabel  className='form-input'>Type *</ControlLabel>
                        <FormControl 
                          componentClass="select" 
                          value={this.state.formData.typeOfTest} 
                          onChange={this.handleFormDataChange.bind(this)} 
                          name="typeOfTest">
                            <option value=''>Choose Type Of Test...</option>
                            <option value='practice'>Practice</option>
                            <option value='upcoming'>Upcoming</option>   
                        </FormControl>  
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel  className='form-input'>Instructions *</ControlLabel>
                      <Editor
                        editorState={this.state.formData.instructions}
                        name='instructons'
                        editorClassName={'textarea'}
                        onEditorStateChange={this.onEditorStateChange.bind(this)}
                      /><hr/>
                    </FormGroup>
                    <FormInputs
                      ncols={["col-md-12"]}
                      proprieties={[
                        {
                          label: `Description *`,
                          componentClass: 'textarea',
                          bsClass: "form-control",
                          placeholder: "Enter Description",
                          name:'description',
                          value:this.state.formData.description,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                      ]}
                    />
                    <Row>
                      <Col md={8}>
                        <ControlLabel className='form-input'>Courses *</ControlLabel>
                        <br/>
                        <FormGroup>
                            {this.state.courses.map((props)=>{
                                return(<Checkbox 
                                            style={{marginLeft:8}}
                                            inline
                                            value={props.id}
                                            name='course'
                                            onChange={this.handleFormDataChange.bind(this)}
                                        >{props.title}</Checkbox>);
                            })} 
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={8}>
                        <ControlLabel className='form-input'>Category *</ControlLabel>
                        <br/>
                        <FormGroup>
                            {this.state.categories.map((props)=>{
                                return(<Checkbox 
                                            style={{marginLeft:8}}
                                            inline
                                            value={props.id}
                                            name='category'
                                            onChange={this.handleFormDataChange.bind(this)}
                                        >{props.title}</Checkbox>);
                            })} 
                        </FormGroup>
                      </Col>
                    </Row>
                    <hr/>
                    <FormGroup>
                      <ControlLabel  className='form-input'>Start Time</ControlLabel>
                      <Row>
                        <Col md={6}>
                            <FormControl 
                                  type='date'
                                  name='startDate'
                                  onchange={this.handleFormDataChange.bind(this)}
                                  value={this.state.formData.startDate}
                                />
                        </Col>
                        <Col md={6}>
                            <FormControl 
                              type='time'
                              name='startTime'
                              onchange={this.handleFormDataChange.bind(this)}
                              value={this.state.formData.startTime}
                            />
                        </Col>
                      </Row>
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel  className='form-input'>End Time</ControlLabel>
                      <Row>
                        <Col md={6}>
                            <FormControl 
                                  type='date'
                                  name='endDate'
                                  onchange={this.handleFormDataChange.bind(this)}
                                  value={this.state.formData.endDate}
                                />
                        </Col>
                        <Col md={6}>
                            <FormControl 
                              type='time'
                              name='endTime'
                              onchange={this.handleFormDataChange.bind(this)}
                              value={this.state.formData.endTime}
                            />
                        </Col>
                      </Row>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel  className='form-input'>Subject (Select Course First)</ControlLabel>
                        <FormControl 
                          componentClass="select" 
                          value={this.state.formData.subject} 
                          onChange={this.handleFormDataChange.bind(this)} 
                          name="subject">
                            <option value=''>...</option>
                            {this.state.subjects.map(item=>{
                              return(
                                <option value={item.id}>{item.title.toUpperCase()}</option>
                              )
                            })}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel  className='form-input'>Unit (Select Subject First)</ControlLabel>
                        <FormControl 
                          componentClass="select" 
                          value={this.state.formData.unit} 
                          onChange={this.handleFormDataChange.bind(this)} 
                          name="unit">
                            <option value=''>...</option>
                            {this.state.units.map(item=>{
                              return(
                                <option value={item.id}>{item.title.toUpperCase()}</option>
                              )
                            })}
                        </FormControl>  
                    </FormGroup>
                    <FormInputs
                      ncols={["col-md-12"]}
                      proprieties={[
                        {
                          label: "UPLOAD DOCUMENT",
                          type: "file",
                          bsClass: "form-control",
                          name:'doc',
                          onChange:this.handleFormDataChange.bind(this),
                          accept:".docx,.doc",
                        }
                      ]}
                    />
                    <LinearProgress
                        style={
                            this.state.addingTest ? 
                            {visibility: 'visible',marginBottom:10} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    <Button bsStyle="success" pullRight fill type="submit">
                      ADD TEST
                    </Button>
                    <div className="clearfix" />
                  </form>
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default AddTests;
