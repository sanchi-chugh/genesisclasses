import React, { Component } from "react";
import { Button, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel,
         DropdownButton,
         MenuItem,
         } from "react-bootstrap";

import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';
import  './styles.css';

class AddUnits extends Component {

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
                        ADD UNIT
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { 
                        this.props.unitAdded 
                        ?
                        <center><b><p>Added Successfully</p></b></center>
                        :
                    <form>
                        <FormGroup
                        controlId="formBasicText"
                        >
                        <ControlLabel>UNIT NAME</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.title}
                            placeholder="Unit Name"
                            name='title'
                            onChange={this.props.handleFormDataChange}
                        />
                        <br/>
                        <ControlLabel>DESCRIPTION</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.props.formData.description}
                            placeholder="Description"
                            name='description'
                            onChange={this.props.handleFormDataChange}
                        />
                        <br/>
                        <ControlLabel>Subjects (Courses)</ControlLabel>
                        <div>
                            <DropdownButton open={this.props.dropdown} onToggle={this.props.toggle} title={this.props.subject} id="dropdown-size-medium" style={{width:'300px',borderWidth:1}}>
                                <div style={{height:"200px",width:"500px",overflow:"auto",display:'block'}}>
                                    <InfiniteScroll
                                        pageStart={0}
                                        loadMore={this.props.fetchMore}
                                        hasMore={this.props.hasMore}
                                        loader={<div key={0}><LinearProgress
                                        color="primary"
                                        /></div>}
                                        useWindow={false}
                                        threshold={10}
                                    >
                                    {   
                                        this.props.subjects.map(item=>{
                                        return <MenuItem onSelect={this.props.handleSelect} bsClass='test' eventKey={item}>{item.title}</MenuItem>;
                                    })}
                                    </InfiniteScroll>
                                </div>
                            </DropdownButton>
                        </div>
                        <br/>
                        <ControlLabel>IMAGE</ControlLabel>
                        <FormControl
                            type="file"
                            placeholder="Image"
                            name='image'
                            onChange={this.props.handleFormDataChange}
                        />
                        </FormGroup>
                        <LinearProgress
                        style={
                            this.props.addingUnit ? 
                            {visibility: 'visible'} :
                            {visibility: 'hidden'}
                            }
                        color="primary"
                        />
                    </form>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>CLOSE</Button>
                    {this.props.unitAdded ? null : <Button bsStyle="success" onClick={this.props.handleAdd}>ADD UNIT</Button>}
                </Modal.Footer>
        </Modal>
    );
  }
}

export default AddUnits;
