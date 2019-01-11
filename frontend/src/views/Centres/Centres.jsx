import React, { Component } from "react";
import { Grid, 
         Row, 
         Col, 
         ButtonToolbar, 
         ButtonGroup, 
         Button, 
         Glyphicon, 
         Modal, 
         FormGroup, 
         FormControl,
         ControlLabel} from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import LinearProgress from '@material-ui/core/LinearProgress';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

class Centres extends Component {

    constructor() {
        super();
        this.handleTextChange = this.handleTextChange.bind(this);
        this.state = {
          data: [],
          show: false,
          value: '',
          id:null,
          updatingCentre:false,
          centreUpdated:false,
        };
      }
  
  componentDidMount() {
   this.fetchCentres();
  }

  fetchCentres(){
    axios.get("/api/centres/", {
        headers: {
        Authorization: `Token ${localStorage.token}`
        }
    }).then(res => {
          const data = res.data.map(item => {
          item.sno = res.data.indexOf(item) + 1;
          return item;
        })
        this.setState({data:data});
    });
  }
  handleHide() {
    this.setState({ show: false, updatingCentre:false, centreUpdated:false});
  }

  handleDelete = (id) => {
  } 

  handleEdit() {
    this.setState({ updatingCentre: true }, () => {
      const data = {location:this.state.value}
      axios.put(`/api/centres/edit/${this.state.id}/`, data, {
        headers: {
          Authorization: `Token ${localStorage.token}`
        },
      })
      .then((res) => {this.setState({ updatingCentre: false, centreUpdated:true }); this.fetchCentres()})
      .catch((err) => this.setState({ updatingCentre: false }, () => console.log(err)))
    });
  }

  handleShowEditModal(obj){
    console.log(obj.id)
    this.setState({ id: obj.id , value: obj.location},()=>{
      this.setState({show:true})
    })
  }

  getValidationState() {
    const length = this.state.value.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
    return null;
  }
  
  handleTextChange(e) {
    this.setState({ value: e.target.value });
  }

  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Col>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" onClick={this.handleShowEditModal.bind(this,row)}>
                  <Glyphicon glyph="edit" /> EDIT
                </Button>
                <Button bsSize="small" onClick={this.handleDelete.bind(this,row)}>
                  <Glyphicon glyph="trash" /> DELETE
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Grid>
      </div>
    )
  }

  render() {
    return (
      <div className="content modal-container">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="Centres"
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data}
                      search>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='location'>Centre</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' dataFormat={this.renderColumn.bind(this)}>Edit/Delete</TableHeaderColumn>
                    </BootstrapTable>
                    <Modal
                      show={this.state.show}
                      onHide={this.handleHide.bind(this)}
                      container={this}
                      aria-labelledby="contained-modal-title"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title">
                          EDIT CENTRE
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        { 
                          this.state.centreUpdated 
                          ?
                          <center><b><p>Updated Successully</p></b></center>
                          :
                        <form>
                          <FormGroup
                            controlId="formBasicText"
                          >
                            <ControlLabel>CENTRE NAME</ControlLabel>
                            <FormControl
                              type="text"
                              value={this.state.value}
                              placeholder="Centre Name Cannot Be Empty"
                              onChange={this.handleTextChange}
                            />
                          </FormGroup>
                          <LinearProgress
                            style={
                              this.state.updatingCentre ? 
                                {visibility: 'visible'} :
                                {visibility: 'hidden'}
                              }
                            color="primary"
                          />
                        </form>
                        }
                      </Modal.Body>
                      <Modal.Footer>
                        <Button onClick={this.handleHide.bind(this)}>CLOSE</Button>
                        {this.state.centreUpdated ? null : <Button bsStyle="primary" onClick={this.handleEdit.bind(this)}>EDIT CENTRE</Button>}
                      </Modal.Footer>
                    </Modal>
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

export default Centres;
