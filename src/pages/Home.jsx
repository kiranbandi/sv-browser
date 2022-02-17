import React, { Component } from 'react';

//  Image url handling is convoluted in scss , much easier to set inline and get images from root
let backgroundStyle = { background: 'url(assets/img/synvisio.jpg)' };

class Home extends Component {
  render() {
    return (
      <div>

        <div className="home-header" style={backgroundStyle}>
          <div className="container-fluid">
            <div className='col-lg-12 text-lg-left text-md-center text-sm-center text-xs-center'><h1>SV Browser</h1>
              <p>An Interactive Multiscale Visualization Tool for Structural Variations</p>
            </div>
          </div>
        </div>

        <div className="container-fluid home-body">
          <h1>How does it work ?</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste quis et possimus, quod alias enim necessitatibus eligendi numquam nobis hic?</p>
        </div>
      </div>

    )
  }
};

export default Home;



