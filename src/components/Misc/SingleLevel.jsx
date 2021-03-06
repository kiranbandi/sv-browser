import React, { Component } from 'react';
import { Information, GenomeView, PanelView, TableView } from '../';

export default class SingleLevel extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        let { configuration, plotType = 'dashboard' } = this.props,
            { markers = { source: [], target: [] }, alignmentList = [] } = configuration;

        const isMarkerListEmpty = markers.source.length == 0 || markers.target.length == 0,
            areLinksAvailable = alignmentList.length > 0;

        return (
            <div>
                <Information />
                {isMarkerListEmpty ?
                    <h2 className='text-danger text-xs-center m-t-lg'>Source or Target Empty</h2> :
                    areLinksAvailable &&
                    <div className='anchor-root'>
                        <div>
                            <PanelView configuration={configuration} plotType={plotType} />
                            <GenomeView configuration={configuration} />
                            {/* <TableView configuration={configuration} /> */}
                        </div>
                    </div>}
            </div>
        );
    }
}  
