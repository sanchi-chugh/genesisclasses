import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
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
import renderHTML from 'react-render-html';
 
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../../../node_modules/antd/dist/antd.css'; 
class AddTests extends Component {

  constructor() {
    super();
    this.state = {
      doc_errors:false,
      courses:[],
      subjects:[],
      units:[],
      categories:[],
      formData:{
        title:'',
        duration:'',
        instructions: EditorState.createEmpty(),
        typeOfTest:'',
        edate:'',
        etime:'',
        sdate:'',
        stime:'',
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
      testAdded:false,
      errors: {}
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
          this.setState({
            subjects:data, 
            formData:{
              ...this.state.formData,
              subject:''
            }
          });
      });
    }else{
      this.setState({
        subjects:[],
        formData:{
          ...this.state.formData,
          subject:''
        }
      })
    }
  }

  fetchUnits(){
      if(this.state.formData.subject !== '' && this.state.formData.subject !== null){
        axios.get(`/api/units/${this.state.formData.subject}/`, {
            headers: {
            Authorization: `Token ${localStorage.token}`
            }
        }).then(res => {
            const data = res.data;
            this.setState({
              units:data,
              formData:{
                ...this.state.formData,
                unit:''
              }
            });
        });
      }else{
        this.setState({
          units:[],
          formData:{
            ...this.state.formData,
            unit:''
          }
        })
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
      formData.append('duration',this.state.formData.duration * 60 )
      formData.append('instructions',draftToHtml(convertToRaw(this.state.formData.instructions.getCurrentContent())))
      formData.append('description',this.state.formData.description)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('category',this.state.formData.category.join(','))
      formData.append('typeOfTest',this.state.formData.typeOfTest)
      formData.append('active',false)
      if(this.state.formData.sdate !== '' && this.state.formData.stime !== ''){
        formData.append('startTime', this.state.formData.sdate + ' ' + this.state.formData.stime + ':00');
      }
      if(this.state.formData.edate !== '' && this.state.formData.etime !== ''){
        formData.append('endtime', this.state.formData.edate + ' ' + this.state.formData.etime + ':00');
      }
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
      .then((res) => this.setState({ addingTest: false, testAdded:true },()=>{
        this.props.history.goBack();
        this.props.handleClick('tr','Added Successfully');
      }))
      .catch((err) => this.setState({ addingTest: false, errors: err.response.data }, () => {
        console.log(err);
        if(this.state.errors.doc_errors !== undefined){
          this.setState({
            doc_errors: true
          })
        }
      }))
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

  async handleFormDataChange(e) {
    if(e.target.name === 'course' ){
        if(e.target.checked){
          await this.state.formData.course.push(e.target.value)
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
          document.getElementById('text').innerHTML = `<a href="${URL.createObjectURL(e.target.files[0])}" target="_blank">${e.target.files[0].name}</a>`
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
              [e.target.name] : e.target.value,
              unit:''
          }},this.fetchUnits.bind(this));
        }else{
          console.log(e.target.name,e.target.value,this.state.formData)
          this.setState({ formData: {
              ...this.state.formData,
              [e.target.name] : e.target.value.trimLeft()
          }}
        );
      }
    }
  }

  render() {
    const  { errors } = this.state;
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title={this.state.doc_errors ? null : "Add Test"}
                // activeButton={true}
                // handleRadioButton={this.handleFormDataChange.bind(this)}
                content={
                  this.state.doc_errors 
                  ? 
                    renderHTML("<p>"+this.state.errors.doc_errors+"</p>")
                  :
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
                          errors: errors,
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
                            errors: errors,
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
                        {
                            Object.keys(errors)
                                .some(item=> item === "typeOfTest") && 
                                    errors.typeOfTest.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel  className='form-input'>Instructions *</ControlLabel>
                      <Editor
                        editorState={this.state.formData.instructions}
                        name='instructons'
                        editorClassName={'textarea'}
                        onEditorStateChange={this.onEditorStateChange.bind(this)}
                      /><hr/>
                      {
                            Object.keys(errors)
                                .some(item=> item === "instructions") && 
                                    errors.instructions.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
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
                          errors: errors,
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
                            {
                                Object.keys(errors)
                                    .some(item=> item === "course") && 
                                        errors.course.map(err=>
                                            <HelpBlock>{err}</HelpBlock>
                                        )
                            }
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
                        {
                            Object.keys(errors)
                                .some(item=> item === "category") && 
                                    errors.category.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                      </Col>
                    </Row>
                    <hr/>
                    <FormGroup>
                      <ControlLabel  className='form-input'>Start Time</ControlLabel>
                      <Row>
                        <Col md={6}>
                            <FormControl 
                                  type='date'
                                  name='sdate'
                                  onChange={this.handleFormDataChange.bind(this)}
                                  value={this.state.formData.sdate}
                                />
                            {
                                Object.keys(errors)
                                    .some(item=> item === "startTime") && 
                                        errors.startTime.map(err=>
                                            <HelpBlock>{err}</HelpBlock>
                                        )
                            }
                        </Col>
                        <Col md={6}>
                            <FormControl 
                              type='time'
                              name='stime'
                              onChange={this.handleFormDataChange.bind(this)}
                              value={this.state.formData.stime}
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
                                  name='edate'
                                  onChange={this.handleFormDataChange.bind(this)}
                                  value={this.state.formData.edate}
                                />
                                {
                                    Object.keys(errors)
                                        .some(item=> item === "endtime") && 
                                            errors.endtime.map(err=>
                                                <HelpBlock>{err}</HelpBlock>
                                            )
                                }
                        </Col>
                        <Col md={6}>
                            <FormControl 
                              type='time'
                              name='etime'
                              onChange={this.handleFormDataChange.bind(this)}
                              value={this.state.formData.etime}
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
                        {
                            Object.keys(errors)
                                .some(item=> item === "subject") && 
                                    errors.subject.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
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
                        {
                            Object.keys(errors)
                                .some(item=> item === "unit") && 
                                    errors.unit.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                    </FormGroup>
                    <ControlLabel>UPLOAD DOCUMENT</ControlLabel>
                        <label className="file">
                            <FormControl
                                type="file"
                                placeholder="Document"
                                name='doc'
                                accept=".docx,.doc"
                                onChange={this.handleFormDataChange.bind(this)}
                            />
                            <span className="file-custom"><span id="text">Choose Document...</span></span>
                        </label>
                        {
                            Object.keys(errors)
                                .some(item=> item === "doc") && 
                                    errors.doc.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                    {this.state.addingTest && <div className="no-tests-placeholder">Parsing the doc...</div>}<br/>
                    <LinearProgress
                        style={
                            this.state.addingTest ? 
                            {visibility: 'visible',marginBottom:10} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    <Button bsStyle="success" pullRight fill type="submit" disabled={this.state.addingTest}>
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
