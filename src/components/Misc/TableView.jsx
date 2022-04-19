import _ from 'lodash';
import React, { Component } from 'react';
import ReactTable from 'react-table';
import { customFilter } from '../../utils/genericUtility';

const columns = [{
    Header: 'Source',
    accessor: 'source',
    className: 'text-center',
    filterMethod: customFilter
}, {
    Header: 'Target',
    accessor: 'target',
    className: 'text-center',
    filterMethod: customFilter
}, {
    Header: 'SNP Type',
    accessor: 'type',
    className: 'text-center',
    filterMethod: customFilter
}, {
    Header: 'Support Value',
    accessor: 'supportValue',
    className: 'text-center',
    filterMethod: customFilter
}, {
    Header: 'Quality Score',
    accessor: 'qualityScore',
    filterMethod: customFilter
}];

export default class SNPTableView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isVisible: true
        };
        this.toggleVisibility = this.toggleVisibility.bind(this);
    }

    toggleVisibility(event) {
        event.preventDefault();
        this.setState({ isVisible: !this.state.isVisible });
    }

    render() {

        let { configuration = [] } = this.props,
            { alignmentList } = configuration;

        return (
            <div className='snp-table-wrapper container'>
                {alignmentList.length > 0 &&
                    <div>
                        <h4 onClick={this.toggleVisibility} className="text-left">
                            {this.state.isVisible ? <span className="icon icon-chevron-down"></span> : <span className="icon icon-chevron-right"></span>}
                            View SNP Table
                        </h4>
                        <div className={'table-box ' + (this.state.isVisible ? '' : 'hidden-table-box')}>
                            <ReactTable
                                data={_.filter(alignmentList, d => !d.hidden)}
                                columns={columns}
                                defaultPageSize={10}
                                resizable={false}
                                filterable={true}
                                className='-highlight'
                                defaultSorted={[{ id: "Date", desc: true }]} />
                        </div>
                    </div>
                }
            </div>)
    }
}

