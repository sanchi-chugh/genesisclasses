import React, { Component } from "react";
import { Grid, 
         Row, 
         Col, 
         ButtonToolbar, 
         ButtonGroup, 
         Button, 
         Glyphicon, 
} from "react-bootstrap";
import axios from 'axios';

import Card from "../../components/Card/Card.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import "../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import DeleteStudent from "../../components/Actions/Students/DeleteStudents";

class Students extends Component {

    constructor() {
        super();
        this.state = {
          data: [],
          page:1,
          show:false,
          id:null,
          studentDeleted:false,
          deletingStudent:false,
        };
      }
  
  componentWillMount() {
   this.fetchStudents(`?page=1`);
  }

  fetchStudents(page,index=0){
    if(page===`?page=1`){
        page=""
    }
    axios.get(`/api/users/students/${page}`, {
        headers: {
        Authorization: `Token ${localStorage.token}`,
        }
    }).then(res => {
          const results = res.data.results.map(item => {
          item.sno = res.data.results.indexOf(item) + 1+index;
          return item;
        })
        res.data.results = results
        const data = res.data
        this.setState({data:data});
    });
  }

  handleHideDeleteModal() {
    this.setState({ show: false, deletingStudent:false, studentDeleted:false, transferData:false,transferTo:'Select Student', student:null});
  }

  handleDelete = () => {
    this.setState({ deletingStudent: true }, () => {
        axios.delete(`/api/users/students/delete/${this.state.id}/`,{
            headers: {
              Authorization: `Token ${localStorage.token}`
            },
          })
          .then((res) => {
            this.setState({ deletingStudent: false,studentDeleted:true},this.fetchStudents(`?page=${this.state.page}`,(this.state.page-1)*10))
          })
          .catch((err) => this.setState({ deletingStudent: false }, () => console.log(err)))
    });
  } 

  handleShowDeleteModal(obj){
    this.setState({ id: obj.id},()=>{
      this.setState({show:true})
    })
  }

  handleAddButton(){
    this.props.history.push('/students/add')
  }

  handleEditButton(obj){
    this.props.history.push({pathname:'/students/edit',data:obj})
  }

  handleViewButton(obj){
    this.props.history.push({pathname:'/students/info',data:obj})
  }

  renderCentres(cell, row, enumObject, rowIndex) {
    return (
      <Row md={12}>
        <Col md={6}>{row.centre.location}</Col>  
      </Row>
    )
  }

  renderNames(cell, row, enumObject, rowIndex) {
    return (
      <Row md={12}>
        <Col md={6}>{row.first_name} {row.last_name}</Col>  
      </Row>
    )
  }

  renderEmail(cell, row, enumObject, rowIndex) {
    return (
      <Row md={12}>
        <Col md={6}>{ row.email === null || row.email === '' ? 'No email specified' : row.email }</Col>  
      </Row>
    )
  }

  renderNumber(cell, row, enumObject, rowIndex) {
    return (
      <Row md={12}>
        <Col md={6}>{row.contact_number === null || row.contact_number === '' ? 'No number specified' : row.contact_number}</Col>  
      </Row>
    )
  }
  
  renderColumn(cell, row, enumObject, rowIndex) {
    return (
      <div>
        <Grid> 
          <Row>
           <Button bsSize="small" style={{width:'180px'}} bsStyle="primary" onClick={this.handleViewButton.bind(this,row)}>
            <Glyphicon glyph="list-alt" /> VIEW
           </Button>
          </Row>
          <Row>
            <ButtonToolbar>
              <ButtonGroup>
                <Button bsSize="small" style={{width:'90px'}} bsStyle="info" onClick={this.handleEditButton.bind(this,row)}>
                  <Glyphicon glyph="edit" /> EDIT
                </Button>
                <Button bsSize="small" style={{width:'90px'}} bsStyle="danger" onClick={this.handleShowDeleteModal.bind(this,row)}>
                  <Glyphicon glyph="trash" /> DELETE
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Row>
        </Grid>
      </div>
    )
  }

  onPageChange(page, sizePerPage) {
    const currentIndex = (page - 1) * sizePerPage;
    this.fetchStudents(`?page=${page}`,currentIndex)
    this.setState({
      page: page,
    });
  }

  render() {
    return (
      <div className="content modal-container">
        <Grid fluid>
          <Row>
            <Col>
              <Card
                title="Students"
                addButton={true}
                downloadButton={true}
                handleDownloadButton={()=>{
                  axios.get("/api/getStudentData/", {
                      headers: {
                      Authorization: `Token ${localStorage.token}`
                      }
                  }).then(res => {
                    window.open(res.data.csvFile, '_blank');
                  });
                }}
                handleShowAddModal={this.handleAddButton.bind(this)}
                ctTableFullWidth
                ctTableResponsive
                content={
                  <div style={{margin:10}}>
                    <BootstrapTable
                      condensed pagination
                      data={this.state.data.results}
                      search remote
                      fetchInfo={ { dataTotalSize: this.state.data.count } }
                      options={ { sizePerPage: 10,
                                  onPageChange: this.onPageChange.bind(this),
                                  sizePerPageList: [ 10 ],
                                  page: this.state.page} }>
                        <TableHeaderColumn width={60} dataField='sno' isKey hiddenOnInsert>SNO.</TableHeaderColumn>
                        <TableHeaderColumn dataField='name' dataFormat={this.renderNames.bind(this)}>Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='email' dataFormat={this.renderEmail.bind(this)}>Email</TableHeaderColumn>
                        <TableHeaderColumn dataField='contact_number' dataFormat={this.renderNumber.bind(this)}>Contact Numebr</TableHeaderColumn>
                        <TableHeaderColumn dataField='centre' dataFormat={this.renderCentres.bind(this)}>Centre</TableHeaderColumn>
                        <TableHeaderColumn dataField='info' dataFormat={this.renderColumn.bind(this)}>Profile</TableHeaderColumn>
                    </BootstrapTable>
                  </div>
                }
              />
              <DeleteStudent
                show={this.state.show}
                onHide={this.handleHideDeleteModal.bind(this)}
                studentDeleted={this.state.studentDeleted}
                deletingStudent={this.state.deletingStudent}
                handleDelete={this.handleDelete.bind(this)}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Students;
