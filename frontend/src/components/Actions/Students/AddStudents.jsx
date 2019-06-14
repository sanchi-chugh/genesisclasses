import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Form,
  HelpBlock
} from "react-bootstrap";

import axios from 'axios';

import { Card } from "../../../components/Card/Card.jsx";
import { FormInputs } from "../../../components/FormInputs/FormInputs.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";
import Button from "../../../components/CustomButton/CustomButton.jsx";
import { Checkbox, Menu, Dropdown, Icon} from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';

import '../../../../node_modules/antd/dist/antd.css'; 

class AddStudents extends Component {

  constructor() {
    super();
    this.state = {
      centres:[],
      preview:'',
      courses:[],
      formData:{
        first_name:'',
        last_name:'',
        location: '',
        email:'',
        contact_number:'',
        endAccessDate:'',
        joiningDate:moment(new Date()).format("YYYY-MM-DD"),
        father_name:'',
        gender:'',
        dateOfBirth:'',
        address:'',
        city:'',
        state:'',
        pinCode:'',
        image:'',
        file:null,
        course:[],
      },
      addingStudent:false,
      studentAdded:false,
      errors:{}
    };
  }

  componentWillMount() {
    this.fetchCentres();
    this.fetchCourses();
  }

  fetchCentres(){
    axios.get("/api/centres/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        this.setState({centres:data});
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
    this.setState({ addingStudent: true }, () => {
      var formData = new FormData();
      formData.append('first_name',this.state.formData.first_name)
      formData.append('last_name',this.state.formData.last_name)
      formData.append('contact_number',this.state.formData.contact_number)
      formData.append('email',this.state.formData.email)
      formData.append('endAccessDate',this.state.formData.endAccessDate)
      formData.append('joiningDate',this.state.formData.joiningDate)
      formData.append('course',this.state.formData.course.join(','))
      formData.append('centre',this.state.formData.location)
      formData.append('father_name',this.state.formData.father_name)
      formData.append('gender',this.state.formData.gender)
      formData.append('dateOfBirth',this.state.formData.dateOfBirth)
      formData.append('address',this.state.formData.address)
      formData.append('city',this.state.formData.city)
      formData.append('state',this.state.formData.state)
      formData.append('pinCode',this.state.formData.pinCode)
      console.log(formData)
      if(this.state.formData.file !== null){
        formData.append('image',this.state.formData.file,this.state.formData.file.name)
      }else{
        formData.append('image','')
      }
      axios.post('/api/users/students/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingStudent: false, studentAdded:true },() => {
        this.props.history.goBack(),
        this.props.handleClick('tr','Added Successfully')
      }))
      .catch((err) => this.setState({ addingStudent: false, errors: err.response.data }, () => console.log(err)))
    });
  }
  
  handleFormDataChange(e) {
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
        document.getElementById('text').innerHTML = `<a href="${URL.createObjectURL(e.target.files[0])}" target="_blank">${e.target.files[0].name}</a>`
        let file = e.target.files[0]
        this.setState({ 
          preview:URL.createObjectURL(e.target.files[0]),
          formData: {
          ...this.state.formData,
          file : file,
      }});
      }
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value.trimLeft()
    }});
    }
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={8}>
              <Card
                title="Add Student"
                content={
                  <form onSubmit={(event)=>this.handleAdd(event)}>
                    <LinearProgress
                        style={
                            this.state.addingStudent ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    <FormInputs
                      ncols={["col-md-6", "col-md-6"]}
                      proprieties={[
                        {
                          label: `First Name *`,
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "First Name",
                          name:'first_name',
                          value:this.state.formData.first_name,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Last Name *",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "Last Name",
                          name:'last_name',
                          value:this.state.formData.last_name,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        }
                      ]}
                    />
                    <FormInputs
                      ncols={["col-md-4", "col-md-4", "col-md-4"]}
                      proprieties={[
                        {
                          label: "Email address *",
                          type: "email",
                          bsClass: "form-control",
                          placeholder: "Email",
                          name:'email',
                          value:this.state.formData.email,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Contact Number *",
                          type: "phone-number",
                          bsClass: "form-control",
                          placeholder: "Contact Number",
                          name:'contact_number',
                          value:this.state.formData.contact_number,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Expiry Date *",
                          type: "date",
                          bsClass: "form-control",
                          name:'endAccessDate',
                          value:this.state.formData.endAccessDate,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                      ]}
                    />
                    <FormInputs
                        ncols={["col-md-6"]}
                        proprieties={[
                          {
                            label: "JOINING Date *",
                            type: "date",
                            bsClass: "form-control",
                            name:'joiningDate',
                            value:this.state.formData.joiningDate,
                            errors: errors,
                            onChange:this.handleFormDataChange.bind(this)
                          },
                        ]}
                        contents={
                          <Col md={6}>
                            <FormGroup>
                              <ControlLabel className='form-input'>Centres * </ControlLabel>
                              <FormControl 
                                componentClass="select" 
                                value={this.state.formData.location} 
                                onChange={this.handleFormDataChange.bind(this)} 
                                name="location">
                                  <option value=''>Select Centre...</option>
                                  { this.state.centres.map(item =>{
                                    return(
                                      <option value={item.id}>{item.location}</option>
                                    )
                                  })}
                              </FormControl>  
                              {
                                Object.keys(errors)
                                        .some(item=> item === "centre") && 
                                            errors.centre.map(err=>
                                                <HelpBlock>{err}</HelpBlock>
                                            )
                              }
                            </FormGroup>
                          </Col>
                        }
                      />
                    <Row>
                      <Col md={12}>
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
                    <div>
                      <FormInputs
                        ncols={["col-md-4", "col-md-4"]}
                        proprieties={[
                          {
                            label: "Father Name",
                            type: "text",
                            bsClass: "form-control",
                            placeholder: "Father Name",
                            name:'father_name',
                            value:this.state.formData.father_name,
                            errors: errors,
                            onChange:this.handleFormDataChange.bind(this)
                          },
                          {
                            label: "Date Of Birth",
                            type: "date",
                            bsClass: "form-control",
                            placeholder: "Date Of Birth",
                            name:'dateOfBirth',
                            value:this.state.formData.dateOfBirth,
                            errors: errors,
                            onChange:this.handleFormDataChange.bind(this)
                          }
                        ]}
                        contents={
                            <Col md={4}>
                              <FormGroup>
                                  <ControlLabel className='form-input'>Gender</ControlLabel>
                                  <FormControl 
                                    componentClass="select" 
                                    value={this.state.formData.gender} 
                                    onChange={this.handleFormDataChange.bind(this)} 
                                    name="gender">
                                      <option value=''>Choose Gender...</option>
                                      <option value='male'>Male</option>
                                      <option value='female'>Female</option>   
                                  </FormControl>  
                                  {
                                    Object.keys(errors)
                                            .some(item=> item === "gender") && 
                                                errors.gender.map(err=>
                                                    <HelpBlock>{err}</HelpBlock>
                                                )
                                  }
                              </FormGroup>
                            </Col>
                        }
                      />
                    </div>
                    <FormInputs
                      ncols={["col-md-12"]}
                      proprieties={[
                        {
                          label: "Address",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "Home Adress",
                          name:'address',
                          value:this.state.formData.address,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        }
                      ]}
                    />
                    <FormInputs
                      ncols={["col-md-4", "col-md-4", "col-md-4"]}
                      proprieties={[
                        {
                          label: "City",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "City",
                          name:'city',
                          value:this.state.formData.city,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "State",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "State",
                          name:'state',
                          value:this.state.formData.state,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Postal Code",
                          type: "number",
                          bsClass: "form-control",
                          placeholder: "ZIP Code",
                          name:'pinCode',
                          value:this.state.formData.pinCode,
                          errors: errors,
                          onChange:this.handleFormDataChange.bind(this)
                        }
                      ]}
                    />
                    <ControlLabel>Profile Image</ControlLabel>
                        <label className="file">
                            <FormControl
                                type="file"
                                placeholder="Profile Image"
                                name='image'
                                onChange={this.handleFormDataChange.bind(this)}
                            />
                            <span className="file-custom"><span id="text">Choose Image...</span></span>
                        </label>
                        {
                            Object.keys(errors)
                                .some(item=> item === "image") && 
                                    errors.image.map(err=>
                                        <HelpBlock>{err}</HelpBlock>
                                    )
                        }
                    <LinearProgress
                        style={
                            this.state.addingStudent ? 
                            {visibility: 'visible',marginBottom:10} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    <Button bsStyle="success" pullRight fill type="submit">
                      ADD STUDENT
                    </Button>
                    <div className="clearfix" />
                  </form>
                }
              />
            </Col>
            <Col md={4}>
              <UserCard
                bgImage="https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=300&q=75&w=400"
                avatar={this.state.formData.file === null ? "https://scc.rhul.ac.uk/files/2018/06/placeholder.png" : this.state.preview}
                name={this.state.formData.first_name + ' ' + this.state.formData.last_name}
                userName={this.state.formData.email}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default AddStudents;
