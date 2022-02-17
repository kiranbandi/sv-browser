import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FilterPanel, PieChart } from '../';

class Information extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const classList = 'col-sm-12';
        return (
            <div id='information-root' className='row m-a-0'>
                <div className={"graphic-container " + classList + " text-xs-center"}>
                    <h2 className='text-primary text-xs-center'>Filter Panel</h2>
                    <FilterPanel />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { information: state.genome.information };
}

export default connect(mapStateToProps)(Information);
