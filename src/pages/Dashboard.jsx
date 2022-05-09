import React, { Component } from 'react';
import { processGenomicData, getFileByPath } from '../utils/fetchData';
import { hashHistory } from 'react-router';
import { Loader, SingleLevel } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    configureSourceID, setLoaderState,
    setGenomicData, setALignmentList, setConfiguration
} from '../redux/actions/actions';
import Dropzone from 'react-dropzone';

class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            fileList: []
        };
        this.onProcessFile = this.onProcessFile.bind(this);
    }


    async onProcessFile() {

        event.preventDefault();

        const { actions } = this.props,
            { setGenomicData, configureSourceID, setLoaderState } = actions,
            { fileList = [] } = this.state;

        if (fileList.length > 0) {
            // Turn on loader
            setLoaderState(true);
            configureSourceID('uploaded');

            try {
              
                // First get the file by its file path
                const fileContents = await getFileByPath(fileList[0]);
                // Then process the file and extract its contents
                let data = await processGenomicData(fileContents);

                setGenomicData(data);

            } catch (error) {
                alert("There was an error in processing file - " + fileList[0].name, "ERROR");
            }

            // Turn off the loader
            setLoaderState(false);
        }
        else {
            alert("Please add a file first.", "ERROR");
        }
    }


    componentWillUnmount() {
        // clear alignment list 
        this.props.actions.setALignmentList([]);
    }

    render() {

        let { loaderState, configuration, genome = {}, plotType } = this.props, { fileList } = this.state;

        return (
            <div className='dashboard-root m-t'>

                <div className='container-fluid text-center m-y-lg'>

                    <Dropzone onDrop={fileList => this.setState({ fileList })}>
                        {({ getRootProps, getInputProps }) => (
                            <section className='dropzone-container'>
                                <div className='dropzone' {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p>Click to upload/Drag and drop file here</p>
                                    {fileList.length > 0 && <h4 className='text-primary'> {fileList[0].name}</h4>}
                                </div>
                            </section>
                        )}
                    </Dropzone>
                    <button className="btn btn-primary-outline m-t process-btn" onClick={this.onProcessFile}>
                        <span className='process-span'>{"VISUALIZE"} </span>
                    </button>
                </div>

                {!loaderState ?
                    <div className='dashboard-container'>
                        {genome.chromosomeMap &&
                            <div>
                                <SingleLevel
                                    plotType={plotType}
                                    configuration={configuration} />
                            </div>}
                    </div>
                    : <Loader />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            configureSourceID,
            setLoaderState,
            setGenomicData,
            setALignmentList,
            setConfiguration
        }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        sourceID: state.oracle.sourceID,
        isModalVisible: state.oracle.isModalVisible,
        loaderState: state.oracle.loaderState,
        configuration: state.oracle.configuration,
        multiLevel: state.oracle.multiLevel,
        multiLevelType: state.oracle.multiLevelType,
        plotType: state.oracle.plotType,
        isSnapShotAvailable: state.oracle.isSnapShotAvailable,
        genome: state.genome,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


