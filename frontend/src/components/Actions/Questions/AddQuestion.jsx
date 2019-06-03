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
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import IntegerType from "./IntegerType/IntegerType.jsx";

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../../../node_modules/antd/dist/antd.css'; 
import ChoiceType from "./ChoiceQuestion/ChoiceQueston.jsx";
import PassageType from "./PassageType/PassageType.jsx";
class AddQuestions extends Component {

  constructor() {
    super();
    this.state = {
      type:null,
      courses:[],
      subjects:[],
      units:[],
      categories:[],
      formData:{
        section:'Section ...',
        questionText: EditorState.createEmpty(),
        explanation:'',
        marksPositive:'',
        marksNegative:'',
        intAnswer:'',
        paragraph: EditorState.createEmpty()
      },
      addingQuestion:false,
      QuestionAdded:false,
      errors: {},
      flag:false // for adding question in a paragraph
    };
  }
  
  componentDidMount(){
    if(this.props.location.data !== undefined){
      this.setState({flag: true, type:'passage'})
    }
  }

  handleAddPassage(callback){
    var formData = new FormData();
    formData.append('paragraph',draftToHtml(convertToRaw(this.state.formData.passage.getCurrentContent())))
    formData.append('section',this.props.match.params.id)
    axios.post('/api/tests/sections/questions/passages/add/', formData, {
      headers: {
        Authorization: `Token ${localStorage.token}`,
      },
    })
    .then(callback)
    .catch((err) => this.setState({ addingQuestion: false, errors: err.response.data }, () => console.log(err)))
  }

  handleAddUtil(res=null){
    var formData = new FormData();
      formData.append('questionText',draftToHtml(convertToRaw(this.state.formData.questionText.getCurrentContent())))
      formData.append('explanation',this.state.formData.explanation)
      formData.append('intAnswer',this.state.formData.intAnswer)
      formData.append('questionType',this.state.type)
      formData.append('passage', res !== null ? res.data.passage : this.state.flag ? this.props.location.data.id :  '')
      formData.append('marksPositive',this.state.formData.marksPositive)
      formData.append('marksNegative',this.state.formData.marksNegative)
      formData.append('section',this.props.match.params.id)
      axios.post('/api/tests/sections/questions/detail/add/', formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ addingQuestion: false, QuestionAdded:true },() =>{
        this.props.handleClick('tr','Added Successfully');
        this.props.history.goBack();
      }))
      .catch((err) => this.setState({ addingQuestion: false, errors: err.response.data }, () => console.log(err)))
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ addingQuestion: true }, () => {
      if(this.state.type === 'passage' && !this.state.flag){
        this.handleAddPassage(this.handleAddUtil.bind(this));
      }
      else{
        this.handleAddUtil();
      }
    });
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      formData:{
        ...this.state.formData,
        questionText: editorState
      },
    });
  };

  onEditorStateChange2 = (editorState) => {
    this.setState({
      formData:{
        ...this.state.formData,
        passage: editorState
      },
    });
  };

  handleTypeChange(e){
      this.setState({ 
        [e.target.name] : e.target.value
    });
  }

  handleFormDataChange(e) {
    this.setState({ formData: {
        ...this.state.formData,
        [e.target.name] : e.target.value
    }});
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Add Question"
                content={
                  <form onSubmit={(event)=>this.handleAdd(event)}>
                    <LinearProgress
                        style={
                            this.state.addingQuestion ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    <FormGroup>
                        <ControlLabel  className='form-input'>SELECT TYPE OF QUESTION</ControlLabel>
                        <FormControl
                          componentClass="select"
                          value={this.state.type} 
                          onChange={this.handleTypeChange.bind(this)} 
                          name="type"
                          disabled={this.state.type !== null}>
                            <option value={null}>...</option>
                            <option value='passage'>PASSAGE TYPE</option>
                            <option value='integer'>INTEGER TYPE</option>
                            <option value='mcq'>MULTIPLE CHOICE QUESTION</option>
                            <option value='scq'>SINGLE CHOICE QUESTION</option>
                        </FormControl>
                        {
                          Object.keys(errors)
                                  .some(item=> item === "questionType") && 
                                      errors.questionType.map(err=>
                                          <HelpBlock>{err}</HelpBlock>
                                      )
                        }
                    </FormGroup>
                    { this.state.type === 'passage'?
                          <PassageType 
                            formData = {this.state.formData}
                            flag={this.state.flag}
                            data={this.props.location.data}
                            errors={errors}
                            onEditorStateChange = {this.onEditorStateChange.bind(this)}
                            onEditorStateChange2 = {this.onEditorStateChange2.bind(this)}
                            handleFormDataChange = {this.handleFormDataChange.bind(this)}
                          /> : null
                    }
                    { 
                      this.state.type === 'integer'?
                         <IntegerType 
                            formData = {this.state.formData}
                            errors={errors}
                            onEditorStateChange = {this.onEditorStateChange.bind(this)}
                            handleFormDataChange = {this.handleFormDataChange.bind(this)}
                         />
                      : null
                    }
                    { this.state.type === 'mcq' || this.state.type ==='scq' ?
                          <ChoiceType
                            formData = {this.state.formData}
                            errors={errors}
                            onEditorStateChange = {this.onEditorStateChange.bind(this)}
                            handleFormDataChange = {this.handleFormDataChange.bind(this)}
                          /> 
                      : null
                    }
                    {
                      this.state.type !== null ?
                      <div>
                        <LinearProgress
                              style={
                                  this.state.addingQuestion ? 
                                  {visibility: 'visible',marginBottom:10} :
                                  {visibility: 'hidden'}
                                  }
                              color="primary"
                              />
                          <Button bsStyle="success" pullRight fill type="submit">
                            ADD Question
                          </Button>
                      </div> : null
                    }
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

export default AddQuestions;
