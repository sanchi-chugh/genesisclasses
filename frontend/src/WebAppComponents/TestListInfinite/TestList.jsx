import React, { Component } from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';
import { Card } from "../../WebAppComponents/Card/Card.jsx";

class TestList extends Component {
    render(){
        return(
            <div style={{display:'block', textAlign:'center'}}>
                <InfiniteScroll
                    pageStart={0}
                    loadMore={this.props.fetchMore}
                    hasMore={this.props.next === null ? false : true}
                    loader={<div key={0}><LinearProgress
                    color="primary"
                    /></div>}
                    useWindow={true}
                    threshold={10}>
                    {this.props.data.results.map(item=>{
                        return(
                            <div className="test inline" key={item.id}>
                                <Card
                                    image={item.image !== null && item.image !== '' ? item.image :'https://countrylakesdental.com/wp-content/uploads/2016/10/orionthemes-placeholder-image.jpg'}
                                    title={'Take Test'}
                                    content={item} disabled={!item.isStarted}
                                    handleClick={this.props.testFunction}
                                />
                            </div>
                        );
                    })}
                </InfiniteScroll>
            </div>
        )
    }
}

export default TestList;