import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         HelpBlock
         } from "react-bootstrap";

import { Checkbox, Menu, Dropdown, Icon} from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class AddBulkStudents extends Component {

  render() {
    const { errors } = this.props;
    const menu = (
        <Menu>
          {this.props.centres.map(item =>{
              return(
                <Menu.Item key={item.id}>
                    <p onClick={()=> this.props.handleSelect(item)}>{item.location}</p>
                </Menu.Item>
              )
          })}
        </Menu>
      );

    return ( 
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        ADD BULK STUDENTS
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <FormGroup
                        controlId="formBasicText"
                        >
                            <ControlLabel>Numebr Of Students</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.props.formData.number}
                                placeholder="Number Of Students"
                                name='number'
                                required
                                onChange={this.props.handleFormDataChange}
                            />
                            {
                                Object.keys(errors)
                                    .some(item=> item === "number") && 
                                        errors.number.map(err=>
                                            <HelpBlock>{err}</HelpBlock>
                                        )
                            }
                            <br/>
                            <ControlLabel>Access Date</ControlLabel>
                            <FormControl
                                type="date"
                                value={this.props.formData.endAccessDate}
                                placeholder="Access Date"
                                name='endAccessDate'
                                required
                                onChange={this.props.handleFormDataChange}
                            />
                            {
                                Object.keys(errors)
                                    .some(item=> item === "endAccessDate") && 
                                        errors.endAccessDate.map(err=>
                                            <HelpBlock>{err}</HelpBlock>
                                        )
                            }
                            <br/>
                            <ControlLabel>Joining Date</ControlLabel>
                            <FormControl
                                type="date"
                                value={this.props.formData.joiningDate}
                                placeholder="Joining Date"
                                name='joiningDate'
                                required
                                onChange={this.props.handleFormDataChange}
                            />
                            {
                                Object.keys(errors)
                                    .some(item=> item === "joiningDate") && 
                                        errors.joiningDate.map(err=>
                                            <HelpBlock>{err}</HelpBlock>
                                        )
                            }
                            <br/>
                            <ControlLabel>Centre Name</ControlLabel>
                            <center>
                            <Dropdown overlay={menu}>
                                <a className="ant-dropdown-link">
                                    {this.props.centreName} 
                                <Icon type="down" />
                                </a>
                            </Dropdown>
                            </center>
                            {
                                Object.keys(errors)
                                    .some(item=> item === "centre") && 
                                        errors.centre.map(err=>
                                            <HelpBlock>{err}</HelpBlock>
                                        )
                            }
                            <br/>
                            <ControlLabel>Courses</ControlLabel>
                            <br/>
                            <FormGroup>
                                {this.props.courses.map((props)=>{
                                    return(<Checkbox 
                                                style={{marginLeft:8}}
                                                inline
                                                value={props.id}
                                                name='course'
                                                onChange={this.props.handleFormDataChange}
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
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.addingBulk ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.bulkAdded ? null : <Button bsStyle="success" onClick={this.props.handleAdd}>ADD BULK STUDENTS</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default AddBulkStudents;
