import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl
} from "react-bootstrap";

import axios from 'axios';

import { Card } from "../../../components/Card/Card.jsx";
import { FormInputs } from "../../../components/FormInputs/FormInputs.jsx";
import { UserCard } from "../../../components/UserCard/UserCard.jsx";
import Button from "../../../components/CustomButton/CustomButton.jsx";
import { Checkbox, Menu, Dropdown, Icon} from 'antd';

import '../../../../node_modules/antd/dist/antd.css'; 

class AddStudents extends Component {

  constructor() {
    super();
    this.state = {
      centres:[],
      centreName:'Select Centre',
      centreId:'',
      preview:'',
      courses:[],
      formData:{
        first_name:'',
        last_name:'',
        email:'',
        contact_number:'',
        endAccessDate:'',
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
        clear:false
      },
      addingStudent:false,
      studentAdded:false
    };
  }

  componentDidMount() {
    this.fetchCentres();
    this.fetchCourses();
    this.setOldData();
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

  setOldData(){
    this.setState({
      // centreId:this.props.location.data.centre.id,
      // centreName:this.props.location.data.centre.location,
      formData:{
        ...this.state.formData,
        first_name:this.props.location.data.first_name,
        last_name:this.props.location.data.last_name,
        email:this.props.location.data.email,
        contact_number:this.props.location.data.contact_number,
        endAccessDate:this.props.location.data.endAccessDate,
        father_name:this.props.location.data.father_name,
        gender:this.props.location.data.gender,
        dateOfBirth:this.props.location.data.dateOfBirth,
        address:this.props.location.data.address,
        city:this.props.location.data.city,
        state:this.props.location.data.state,
        pinCode:this.props.location.data.pinCode,
        image:this.props.location.data.file,
        file:null,
        course:this.props.location.data.course.map(item=>{
          return item.id
        }),
      }
    })
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
      formData.append('course',this.state.formData.course.join(','))
      formData.append('centre',this.state.centreId)
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
      .then((res) => this.setState({ addingStudent: false, studentAdded:true }))
      .catch((err) => this.setState({ addingStudent: false }, () => console.log(err)))
    });
  }

  handleSelect(item){
    this.setState({centreName:item.location, centreId:item.id})
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
        let file = e.target.files[0]
        this.setState({ 
          preview:URL.createObjectURL(e.target.files[0]),
          formData: {
          ...this.state.formData,
          file : file
      }});
      }
    }else{
      this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value
    }});
    }
  }

  render() {
    const menu = (
      <Menu>
        {this.state.centres.map(item =>{
            return(
              <Menu.Item key={item.id}>
                  <p onClick={()=> this.handleSelect(item)}>{item.location}</p>
              </Menu.Item>
            )
        })}
      </Menu>
    );


    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={8}>
              <Card
                title="Edit Profile"
                content={
                  <form onSubmit={(event)=>this.handleAdd(event)}>
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
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Last Name *",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "Last Name",
                          name:'last_name',
                          value:this.state.formData.last_name,
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
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Contact Number *",
                          type: "phone-number",
                          bsClass: "form-control",
                          placeholder: "Contact Number",
                          name:'contact_number',
                          value:this.state.formData.contact_number,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Access Date *",
                          type: "date",
                          bsClass: "form-control",
                          name:'endAccessDate',
                          value:this.state.formData.endAccessDate,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                      ]}
                    />
                    <Row>
                      <Col md={4}>
                      <ControlLabel>Centre Name</ControlLabel>
                        <div>
                        <Dropdown overlay={menu}>
                            <a className="ant-dropdown-link" style={{marginLeft:8}}>
                                {this.state.centreName} 
                            <Icon type="down" />
                            </a>
                        </Dropdown>
                        </div>
                      </Col>
                      <Col md={8}>
                        <ControlLabel>Courses</ControlLabel>
                        <br/>
                        <FormGroup>
                            {this.state.courses.map((props)=>{
                                return(<Checkbox 
                                            style={{marginLeft:8}}
                                            inline
                                            value={props.id}
                                            name='course'
                                            defaultChecked={
                                              this.state.formData.course.find((item)=>{
                                                  return item === props.id
                                              })
                                            }
                                            onChange={this.handleFormDataChange.bind(this)}
                                        >{props.title}</Checkbox>);
                            })} 
                        </FormGroup>
                      </Col>
                    </Row>
                    <FormInputs
                      ncols={["col-md-4", "col-md-4", "col-md-4"]}
                      proprieties={[
                        {
                          label: "Father Name",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "Father Name",
                          name:'father_name',
                          value:this.state.formData.father_name,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Gender",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "Gender",
                          name:'gender',
                          value:this.state.formData.gender,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Date Of Birth",
                          type: "date",
                          bsClass: "form-control",
                          placeholder: "Date Of Birth",
                          name:'dateOfBirth',
                          value:this.state.formData.dateOfBirth,
                          onChange:this.handleFormDataChange.bind(this)
                        }
                      ]}
                    />
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
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "State",
                          type: "text",
                          bsClass: "form-control",
                          placeholder: "State",
                          name:'',
                          value:this.state.formData.state,
                          onChange:this.handleFormDataChange.bind(this)
                        },
                        {
                          label: "Postal Code",
                          type: "number",
                          bsClass: "form-control",
                          placeholder: "ZIP Code",
                          name:'pinCode',
                          value:this.state.formData.pinCode,
                          onChange:this.handleFormDataChange.bind(this)
                        }
                      ]}
                    />
                    <FormInputs
                      ncols={["col-md-12"]}
                      proprieties={[
                        {
                          label: "Profile Image",
                          type: "file",
                          bsClass: "form-control",
                          name:'image',
                          onChange:this.handleFormDataChange.bind(this)
                        }
                      ]}
                    />
                    <Button bsStyle="success" pullRight fill type="submit">
                      EDIT PROFILE
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
        </Grid>>
      </div>
    );
  }
}

export default AddStudents;