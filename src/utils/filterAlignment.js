import _ from 'lodash';
import sortAlphaNum from './sortAlphaNum';

export default (markers, alignmentList, showLoops = false) => {

    let sourceKeyList = markers.source,
        targetKeyList = markers.target,
        filteredList = [];

    _.each(alignmentList, (alignment) => {

        let { source, target } = alignment;

        // add boolean to show or hide alignment
        alignment.hidden = false;
        // add boolean to highlight an alignment 
        alignment.highlight = false;

        if (source && target) {
            // if the alignment is from source to target we return the alignment directly 
            if ((sourceKeyList.indexOf(source) > -1) && (targetKeyList.indexOf(target) > -1)) {
                filteredList.push(alignment);
            }
        }
    });


    let looper = [];
    _.map(filteredList, (e, currentIndex) => {
        // loop over each of the targets
        _.map(filteredList, (f, currentInnerIndex) => {
            if (e.source == f.source && e.target == f.target && currentIndex != currentInnerIndex) {

                if (Math.abs(e.sourceIndex - f.sourceIndex) < 10000 && Math.abs(e.targetIndex - f.targetIndex) < 10000) {
                    looper.push(e);
                }
            }
        })
    });

    return showLoops ? looper.sort(sortAlphaNum('source')) : filteredList.sort(sortAlphaNum('source'));

}