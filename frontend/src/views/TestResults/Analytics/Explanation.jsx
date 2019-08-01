import React, { Component } from "react";
import { Button, 
         Modal,
         } from "react-bootstrap";
import renderHTML from 'react-render-html';

class Explanation extends Component {

  render() {
    if(this.props.type==="passage")
        return(
                <Modal
                    show={this.props.show}
                    onHide={this.props.onHide}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title">
                           Explanation
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.data.map(question=>(
                                <div>
                                    <p>Ques:- {question.quesNumber} {renderHTML(question.explanation)}</p>
                                </div>
                            ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onHide}>OKAY</Button>
                    </Modal.Footer>
                </Modal>
            )
    return ( 
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                container={this}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                       Explanation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <p>{renderHTML(this.props.data)}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>OKAY</Button>
                </Modal.Footer>
        </Modal>
    );
  }
}

export default Explanation;
