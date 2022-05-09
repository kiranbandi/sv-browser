import React, { Component } from 'react';
import { connect } from 'react-redux';
import { scaleLinear, scaleLog } from 'd3';
import _ from 'lodash';
import { Range } from 'rc-slider';
import { bindActionCreators } from 'redux';
import { refineAlignmentList } from '../../redux/actions/actions';

class PanelView extends Component {

    constructor(props) {
        super(props);
        this.onReset = this.onReset.bind(this);
    }

    onReset(event) {
        const { configuration, refineAlignmentList } = this.props;
        const { alignmentList } = configuration;
        refineAlignmentList({}, alignmentList);
    }

    onQualityScoreChange = (value) => {
        const { configuration, refineAlignmentList } = this.props;
        let { filterLevel = {} } = this.props.configuration;
        filterLevel['quality_score'] = value;
        refineAlignmentList(filterLevel, configuration.alignmentList);
    }

    onSupportValueChange = (value) => {
        const { configuration, refineAlignmentList } = this.props;
        let { filterLevel = {} } = this.props.configuration;
        filterLevel['support_value'] = value;
        refineAlignmentList(filterLevel, configuration.alignmentList);
    }


    render() {

        let { configuration } = this.props, { filterLevel = {}, alignmentList } = configuration;

        let min_quality_score = (_.minBy(alignmentList, d => d.qualityScore) || { 'qualityScore': 0 }).qualityScore,
            max_quality_score = (_.maxBy(alignmentList, d => d.qualityScore) || { 'qualityScore': 0 }).qualityScore,
            min_support_value = (_.minBy(alignmentList, d => d.supportValue) || { 'supportValue': 0 }).supportValue,
            max_support_value = (_.maxBy(alignmentList, d => d.supportValue) || { 'supportValue': 0 }).supportValue;

        let quality_score = filterLevel['quality_score'] || [min_quality_score, max_quality_score],
            support_value = filterLevel['support_value'] || [min_support_value, max_support_value];


        return (
            <div className='panelViewRoot text-center' >
                <div className='slider-wrapper'>
                    <h4>SNP Quality Score ({quality_score[0]}-{quality_score[1]})</h4>
                    <Range min={min_quality_score} max={max_quality_score} value={quality_score} onChange={this.onQualityScoreChange} />
                </div>
                <div className='slider-wrapper'>
                    <h4>Support Value ({support_value[0]}-{support_value[1]})</h4>
                    <Range min={min_support_value} max={max_support_value} value={support_value} onChange={this.onSupportValueChange} />
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

function mapStateToProps(state) {
    return {
        originalAlignmentList: state.oracle.configuration.alignmentList
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PanelView);