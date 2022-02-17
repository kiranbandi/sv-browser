import React, { Component } from 'react';
import { schemeCategory10, scaleOrdinal, select } from 'd3';
import { legendColor } from 'd3-svg-legend';

export default class Legend extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() { this.createLegend() }
    componentDidUpdate() { this.createLegend() }

    createLegend = () => {

        const node = this.node;

        const { width, height, min, max } = this.props;

        var ordinal = scaleOrdinal()
            .domain(["FF", "FR", "RR", "RF"])
            .range(schemeCategory10.slice(0, 4));


        var legendSequential = legendColor()
            .shapeWidth(20)
            .shapePadding(10)
            .cells(20)
            .orient("horizontal")
            .title("")
            .titleWidth(500)
            .scale(ordinal)

        select(".legendSequential")
            .call(legendSequential);

    }


    render() {

        return (
            <svg className='custom-legend m-t' ref={node => this.node = node} width={200}>
                <g className='legendSequential' transform={'scale(1.5)'}>
                </g>
            </svg>
        );
    }
}