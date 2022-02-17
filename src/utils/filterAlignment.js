import sortAlphaNum from './sortAlphaNum';

export default (markers, alignmentList) => {

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
    return filteredList.sort(sortAlphaNum('source'));
}