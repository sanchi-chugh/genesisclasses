import React, { Component } from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import InfiniteScroll from 'react-infinite-scroller';
import { Card } from "../../WebAppComponents/Card/Card.jsx";
import icon from "../../assets/img/rank_icon.png";

class TestList extends Component {

    render(){
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
                        return(
                                <div className="results-rank-list" key={item.id}>
                                    <div style={{display: 'block'}}>
                                        <div style={{display: 'inline-block', fontWeight:'600',fontSize:'16px', position: 'relative', marginBottom:'4px'}}>
                                            <img src={icon} />
                                            <p>{item.student.name.toUpperCase()}</p>
                                        </div>
                                        <div style={{float:'right', display: 'inline-block'}}>
                                            <p>{item.rank}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                    })}
                </InfiniteScroll>
            </div>
        )
    }
}

export default TestList;