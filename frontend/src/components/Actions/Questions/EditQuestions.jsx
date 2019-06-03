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
import Button from "../../../components/CustomButton/CustomButton.jsx";
import LinearProgress from '@material-ui/core/LinearProgress';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import IntegerType from "./IntegerType/IntegerType.jsx";

import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../../../node_modules/antd/dist/antd.css'; 
import ChoiceType from "./ChoiceQuestion/ChoiceQueston.jsx";
import PassageType from "./PassageType/PassageType.jsx";
class EditQuestions extends Component {

  constructor() {
    super();
    this.state = {
      type:null,
      courses:[],
      subjects:[],
      units:[],
      categories:[],
      passageId:null,
      sectionId:null,
      formData:{
        section:'Section ...',
        questionText: EditorState.createEmpty(),
        explanation:'',
        marksPositive:null,
        marksNegative:null,
        intAnswer:null,
        passage: EditorState.createEmpty()
      },
      updatingQuestion:false,
      errors:{},
      questionUpdated:false
    };
  }

  componentWillMount(){
    axios.get(`/api/tests/sections/questions/detail/${this.props.match.params.id}/`, {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
        const data = res.data;
        console.log(data)
        this.setState({
            type: data.details.questionType,
            passageId: data.details.questionType === 'passage' ? data.details.passage.id : null,
            sectionId: data.details.section.id,
            formData:{
                ...this.state.formData,
                section: data.details.section,
                questionText: EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(data.details.questionText))),
                passage: data.details.questionType === 'passage' ? EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(data.details.passage.paragraph))) : '',
                explanation: data.details.explanation,
                marksPositive: data.details.marksPositive,
                marksNegative: data.details.marksNegative,
                intAnswer: data.details.questionType === 'integer' ? data.details.intAnswer : '',
            }
        });
    });
  }

  handleEditUtil(){
    var formData = new FormData();
      formData.append('questionText',draftToHtml(convertToRaw(this.state.formData.questionText.getCurrentContent())))
      formData.append('explanation',this.state.formData.explanation)
      formData.append('intAnswer',this.state.formData.intAnswer)
      if(this.state.type === 'passage'){
        formData.append('passage', this.state.passageId);
      }
      if(this.state.type === 'mcq' || this.state.type === 'scq'){
        formData.append('questionType', this.state.type);
      }
      formData.append('marksPositive',this.state.formData.marksPositive)
      formData.append('marksNegative',this.state.formData.marksNegative)
      // formData.append('section',this.state.sectionId)
      axios.put(`/api/tests/sections/questions/detail/edit/${this.props.match.params.id}/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ updatingQuestion: false, questionUpdated:true }, ()=>{
        this.props.handleClick('tr','Updated Successfully'); 
        this.props.history.goBack();
      }))
      .catch((err) => this.setState({ updatingQuestion: false, errors: err.response.data }, () => console.log(err)))
  }

  handleAdd(e){
    e.preventDefault();
    this.setState({ updatingQuestion: true }, () => {
      this.handleEditUtil();
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
                title="Edit Question"
                content={
                  <form onSubmit={(event)=>this.handleAdd(event)}>
                    <LinearProgress
                        style={
                            this.state.updatingQuestion ? 
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
                            errors={errors}
                            onEditorStateChange = {this.onEditorStateChange.bind(this)}
                            onEditorStateChange2 = {this.onEditorStateChange2.bind(this)}
                            handleFormDataChange = {this.handleFormDataChange.bind(this)}
                          /> : null
                    }
                    { 
                      this.state.type === 'integer'?
                         <IntegerType
                            errors={errors} 
                            formData = {this.state.formData}
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
                                  this.state.updatingQuestion ? 
                                  {visibility: 'visible',marginBottom:10} :
                                  {visibility: 'hidden'}
                                  }
                              color="primary"
                              />
                          <Button bsStyle="info" pullRight fill type="submit">
                            Edit Question
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

export default EditQuestions;
