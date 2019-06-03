import React, { Component } from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';
import { Card } from "../../WebAppComponents/Card/Card.jsx";

class TestList extends Component {

    testFunction(item){
        if(item.attempted){
            this.props.history.push(`/app/test/result/${item.id}`)
        }else{
            this.props.history.push(`/app/test/start/${item.id}`)
        }
    }

    render(){
        console.log(this.props.next)
        return(
            <div style={{display:'block'}}>
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
                        let width = item.userResult.marksObtained/item.totalMarks;
                        width += '%'
                        console.log(width);
                            return(
                                <div className="results-test-list" key={item.id}>
                                    <p>Rank {item.userResult.rank}</p>
                                    <div style={{display: 'block'}}>
                                        <div style={{display: 'inline-block', fontWeight:'600',fontSize:'16px', position: 'relative', marginBottom:'4px'}}>
                                            {item.title}
                                        </div>
                                        <div style={{float:'right', display: 'inline-block', fontWeight:'600',fontSize:'16px', position: 'relative', marginBottom:'4px'}}>
                                            {item.userResult.marksObtained} / {item.totalMarks}
                                        </div>
                                    </div>
                                    <div className="progressBar">
                                        <div className="progress-" style={{width:width}}></div>
                                    </div>
                                </div>
                            );
                            return(
                                <div className="test inline" key={item.id}>
                                    <Card
                                        subTitle={item.attempted ? 'View Result' : item.isStarted ? 'Take Test' : 'Not Yet Started'}
                                        color={!item.isStarted ? ' type4' : ''}
                                        content={item}
                                        disabled={!item.isStarted}
                                        handleClick={this.testFunction.bind(this,item)}
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