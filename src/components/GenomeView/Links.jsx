import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10, interpolateNumber } from 'd3';
import { refineAlignmentList } from '../../redux/actions/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class Links extends Component {

    constructor(props) {
        super(props);
        this.generateLinkElements = this.generateLinkElements.bind(this);
    }

    onLinkClick(alignment) {
        let { filterLevel = {}, alignmentList } = this.props.configuration;
        const { refineAlignmentList } = this.props;
        filterLevel['alignment'] = { ...alignment };
        refineAlignmentList(filterLevel, alignmentList);
    }






    // for (Connection conn : connections) {
    //     from = conn.from;
    //     to = conn.to;
    //     if (from.chrom == targetChrom) { // only draw connections from target chromosome
    //       x1 = map(from.index, 0, maxindexes[from.chrom], 100, width-100);
    //       x2 = map(chromStarts[to.chrom]+to.index, 0, total, 100, width-100);
    //       y = 500 + (to.chrom - 1) * 20;
    //       noFill();
    //       xMid = (x1+x2)/2;
    //       if (conn.type.equals("FF")) {
    //         stroke(200, 0, 0);
    //         if (xMid - x1 < 100) {
    //           cx1 = x1+200;
    //           cx2 = x2-200;
    //         } else {
    //           cx1 = xMid;
    //           cx2 = xMid;
    //         }
    //         bezier(x1, 100, cx1, 100, cx2, y, x2, y); // see https://processing.org/reference/bezier_.html
    //       }
    //       if (conn.type.equals("FR")) {
    //         stroke(220, 140, 0);
    //         //stroke(100, 0, 200);
    //         bezier(x1, 100, x1+200, 100, x2+200, y, x2, y);
    //       }
    //       if (conn.type.equals("RR")) {
    //         stroke(0, 200, 0);
    //         if (x1 - xMid < 100) {
    //           cx1 = x1-200;
    //           cx2 = x2+200;
    //         } else {
    //           cx1 = xMid;
    //           cx2 = xMid;
    //         }
    //         bezier(x1, 100, cx1, 100, cx2, y, x2, y);
    //       }
    //       if (conn.type.equals("RF")) {
    //         stroke(0, 0, 200);
    //         bezier(x1, 100, x1-200, 100, x2-200, y, x2, y);
    //       }
    //     }
    //   }

    createLinkLinePath(d, type) {
        let curvature = 0.3;
        // code block sourced from d3-sankey https://github.com/d3/d3-sankey for drawing curved blocks
        var x0 = d.source.x,
            x1 = d.target.x,
            y0 = d.source.y,
            y1 = d.target.y,
            yi = interpolateNumber(y0, y1),
            y2 = yi(0.2),
            y3 = yi(0.8);

        let factor = 150;

        let xMid = (x0 + x1) / 2, cx0, cx1;

        if (d.type == 'FF') {
            if (xMid - x0 < d.sourceMarker.x) {
                cx0 = x0 + factor;
                cx1 = x1 - factor;
            } else {
                cx0 = xMid;
                cx1 = xMid;
            }
        }
        if (d.type == 'FR') {
            cx0 = x0 + factor;
            cx1 = x1 + factor;
        }
        if (d.type == 'RR') {
            if (x0 - xMid < d.sourceMarker.x) {
                cx0 = x0 - factor;
                cx1 = x1 + factor;
            } else {
                cx0 = xMid;
                cx1 = xMid;
            }
        }
        else if (d.type == 'RF') {
            cx0 = x0 - factor;
            cx1 = x1 - factor;
        }

        return "M" + x0 + "," + y0 + // svg start point
            "C" + cx0 + "," + y0 + // curve point 1
            " " + cx1 + "," + y1 + // curve point 2
            " " + x1 + "," + y1; // end point

    }



    generateLinkElements() {

        const { configuration, linkPositions, isDark } = this.props,
            { alignmentColor = 'tenColor', colorMap = {}, isChromosomeModeON = true } = configuration;

        let linkElements = [];

        const isColorMapAvailable = Object.keys(colorMap).length > 0;

        // split links into two parts , the links that have widths of less than 2px can be drawn as lines 
        // and the other are drawn as polygon links
        let link_collection = _.partition(linkPositions, function (link) { return link.width == '2'; });

        // 0th index has line links and 1st index has polygon links
        // Draw links lines for small links
        let genomicLinks = link_collection[0].map((d, i) => {
            let stroke = 'white', style;

            if (d.type == 'FF') {
                stroke = schemeCategory10[0];
            }
            else if (d.type == 'FR') {
                stroke = schemeCategory10[1];
            }
            else if (d.type == 'RR') {
                stroke = schemeCategory10[2];
            }
            else if (d.type == 'RF') {
                stroke = schemeCategory10[3];
            }

            // Add style to elements
            style = {
                'strokeWidth': d.width,
                stroke
            }
            // if the link is part of a search result paint it in white
            if (d.taggedLink) {
                style = {
                    'stroke': isDark ? 'white' : '#1a1c22',
                    'strokeWidth': '5',
                    'strokeOpacity': 1
                }
            }

            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"line-link-" + i}
                className={'genome-link link hover-link' + ' alignmentID-' + d.alignment.alignmentID + " link-source-" + d.alignment.source + " " + (d.alignment.hidden ? 'hidden-alignment-link' : '')}
                d={this.createLinkLinePath(d, d.type)}
                style={style}
                // Not so elegant but since the number of elements are few this is a workable solution
                onDoubleClick={isChromosomeModeON ? this.onLinkClick.bind(this, d.alignment) : null}>
                {isChromosomeModeON && <title>
                    {d.alignment.source + " => " + d.alignment.target +
                        "\n type : " + d.alignment.type +
                        "\n E value : " + d.alignment.e_value +
                        "\n score : " + d.alignment.score +
                        "\n count : " + d.alignment.count}
                </title>}
            </path>

        });
        linkElements.push(genomicLinks);

        return linkElements;
    }

    render() {
        return (
            <g className='linkContainer'>
                {this.generateLinkElements()}
            </g>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

export default connect(null, mapDispatchToProps)(Links);