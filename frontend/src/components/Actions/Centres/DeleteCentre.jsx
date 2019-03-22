import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup,
         FormControl,
         ControlLabel} from "react-bootstrap";

import { Checkbox } from 'antd';
import LinearProgress from '@material-ui/core/LinearProgress';

import '../../../../node_modules/antd/dist/antd.css'; 

class DeleteCentre extends Component {

  render() {

    return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                        DELETE CENTRE
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={this.props.handleDelete}>
                    <Modal.Body>
                        <Checkbox onChange={this.props.toggle}>Shift the staff users and students of the centre to be deleted to another centre.</Checkbox> 
                        {
                            this.props.transferData ? 
                            <FormGroup>
                                <ControlLabel  className='form-input'>Centre Name *</ControlLabel>
                                <FormControl 
                                componentClass="select" 
                                value={this.props.centre} 
                                onChange={this.props.handleSelect} 
                                required={this.props.transferData}
                                name="typeOfTest">
                                    <option value=''>Select Centre Name...</option>
                                    {this.props.centres.map(item => {
                                        return(
                                            <option value={item.id}>{item.location}</option>
                                        )
                                    })}   
                                </FormControl>  
                            </FormGroup>
                            : null
                        }
                        <LinearProgress
                            style={
                                this.props.deletingCentre ? 
                                {visibility: 'visible'} :
                                {visibility: 'hidden'}
                                }
                            color="primary"
                            />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>CLOSE</Button>
                        {this.props.centreDeleted ? null : <Button bsStyle="danger" type="submit">DELETE CENTRE</Button>}
                    </Modal.Footer>
                </form>
        </Modal>
    );
  }
}

export default DeleteCentre;
