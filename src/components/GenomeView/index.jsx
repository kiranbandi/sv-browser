import React, { Component } from 'react';
import { connect } from 'react-redux';
import Markers from './Markers';
import Links from './Links';
import * as d3 from 'd3';
import ChartLegend from './ChartLegend';

class GenomeView extends Component {

    constructor(props) {
        super(props);
        this.zoom = d3.zoom()
            .scaleExtent([1, 4])
            .filter(() => !(d3.event.type == 'dblclick'))
            .on("zoom", this.zoomed.bind(this));
        this.resetZoom = this.resetZoom.bind(this);
        this.removeZoom = this.removeZoom.bind(this);
        this.attachZoom = this.attachZoom.bind(this);
    }

    componentDidMount() {
        this.attachZoom();
    }
    componentDidUpdate() {
        this.attachZoom();
    }

    attachZoom() {
        if (this.props.configuration.isChromosomeModeON) {
            d3.select(this.outerG)
                .call(this.zoom)
        }
        else {
            this.removeZoom();
        }
    }

    resetZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
    }

    removeZoom() {
        this.resetZoom();
        d3.select(this.outerG).on('.zoom', null);
    }

    zoomed() {
        let zoomTransform = d3.event.transform;
        zoomTransform = zoomTransform || { x: 0, y: 0, k: 1 };
        d3.select(this.innerG).attr('transform', 'translate(' + zoomTransform.x + "," + zoomTransform.y + ") scale(" + zoomTransform.k + ")")
    }

    initialiseMarkers(configuration, chromosomeCollection, areTracksVisible, additionalTrackHeight) {

        const maxWidthAvailable = configuration.genomeView.width;

        const { isNormalized = false, reversedMarkers } = configuration;
        // To arrange the markers in a proper way we find the marker List that has the maximum genome width
        //  We need this to fit in the maximum available width so we use this and find the scale factor 
        // we then fit all the other markers using the same scale factors
        // this way the chromosome width ratio is maintainer across all the marker list while at the same time they are
        //  fit relative to the webpage width

        // find the widths for each marker list 
        let widthCollection = _.map(configuration.markers, (chromosomeList, markerId) => {
            // for each list we calculate the sum of all the widths of chromosomes in it 
            return { markerId: markerId, width: _.sumBy(chromosomeList, (key) => chromosomeCollection[key].width) };
        })

        // find the marker list that has the maximum width
        let maxGeneticWidthMarkerList = _.maxBy(widthCollection, (o) => o.width);

        //  we use 90% of the available width for the actual markers and the remaining 10% is used as padding between the markers 
        let scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;

        // no we initialise the markers and set the width directly on the markers lists directly 
        let markers = {};
        _.each(configuration.markers, (chromosomeList, markerId) => {

            if (isNormalized) {
                // find the marker list that has the maximum width
                maxGeneticWidthMarkerList = _.find(widthCollection, (o) => o.markerId == markerId);
                scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;
            }

            // the remaining width is 20% for the maximum width marker list but will change for others
            let remainingWidth = (maxWidthAvailable - (_.find(widthCollection, (o) => o.markerId == markerId).width * scaleFactor)),
                markerPadding = remainingWidth / (chromosomeList.length),
                reversedMarkerList = reversedMarkers[markerId],
                widthUsedSoFar = 0,
                markerList = _.map(chromosomeList, (key) => {
                    let marker = {
                        'data': chromosomeCollection[key],
                        'key': key,
                        // if the chromosome key is in the reverse marker list set it here
                        'reversed': (_.findIndex(reversedMarkerList, (d) => d == key) > -1),
                        // marker start point = used space + half marker padding 
                        'x': widthUsedSoFar + (markerPadding / 2),
                        'y': configuration.genomeView.verticalPositions[markerId] + (areTracksVisible ? additionalTrackHeight / 2 : 0),
                        // width of the marker
                        'dx': (scaleFactor * chromosomeCollection[key].width)
                    }
                    // total width used = previous used space + half marker padding + width + end marker padding
                    widthUsedSoFar = marker.x + marker.dx + (markerPadding / 2);
                    return marker;
                })
            markers[markerId] = markerList;
        })
        return markers;
    }

    initialiseLinks(configuration, chromosomeMap, markerPositions, searchResult, sourceID = '') {

        const linkList = [];

        _.map(configuration.alignmentList, (alignment) => {

            let sourceChromosome = chromosomeMap[alignment.source],
                targetChromosome = chromosomeMap[alignment.target];

            let sourceMarker = _.find(markerPositions.source, (o) => o.key == alignment.source),
                targetMarker = _.find(markerPositions.target, (o) => o.key == alignment.target);

            let sourceX = ((alignment.sourceIndex - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx),
                targetX = ((alignment.targetIndex - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx),
                linkWidth = 2;

            let source, target;
            if (sourceMarker.reversed) {
                source = {
                    'x': sourceMarker.x + sourceMarker.dx - sourceX,
                    'y': sourceMarker.y - 5
                }
            }
            else {
                source = {
                    'x': sourceMarker.x + sourceX,
                    'y': sourceMarker.y - 5
                }
            }

            if (targetMarker.reversed) {
                target = {
                    'x': targetMarker.x + targetMarker.dx - targetX,
                    'y': targetMarker.y + 5
                }
            }
            else {
                target = {
                    'x': targetMarker.x + targetX,
                    'y': targetMarker.y + 5,
                }
            }

            // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
            linkList.push({
                source,
                sourceMarker,
                target,
                targetMarker,
                alignment,
                type: alignment.type,
                width: linkWidth,
                taggedLink: false
            });
        })

        return linkList;
    }


    areTracksVisible(configuration, trackData) {
        return (_.reduce(trackData, (acc, d) => (!!d || acc), false) && configuration.showTracks);
    }

    render() {

        const { configuration, genomeData, isDark, searchResult, sourceID } = this.props,
            { genomeView } = configuration;

        const markerPositions = this.initialiseMarkers(configuration, genomeData.chromosomeMap, false),
            linkPositions = this.initialiseLinks(configuration, genomeData.chromosomeMap, markerPositions, searchResult, sourceID);

        const height = genomeView.height;

        return (
            <div className='genomeViewRoot m-t m-b text-center' >
                <svg style={{ 'background': isDark ? '#252830' : 'white' }} id={'parallel-plot-graphic'}
                    className={'genomeViewSVG m-b'}
                    ref={node => this.outerG = node} height={height} width={genomeView.width}>
                    <g ref={node => this.innerG = node} >
                        <Markers areTracksVisible={false} isDark={isDark} configuration={configuration} markerPositions={markerPositions} />
                        <Links isDark={isDark} configuration={configuration} linkPositions={linkPositions} />
                    </g>
                </svg>
                <ChartLegend height={genomeView.height} width={configuration.genomeView.width} />
            </div >
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        trackType: state.oracle.trackType,
        searchResult: state.oracle.searchResult,
        isDark: state.oracle.isDark,
        sourceID: state.oracle.sourceID
    };
}

export default connect(mapStateToProps)(GenomeView);