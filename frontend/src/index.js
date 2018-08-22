import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

import React from 'react'
import ReactDOM from 'react-dom'

import stores from './stores.json'

const StoreMap = withScriptjs(withGoogleMap((props) => 
    <GoogleMap
      defaultZoom={ 17 }
      defaultCenter={ props.current.location }
    >
    {
      props.stores.map(s => <Marker position={ s.location }/>)
    }
    </GoogleMap>
  ))

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: {
        location: props.currentLocation
      },
      stores: stores
    };
  }

  render() {
    return (
      <div>
        <StoreMap
          current={ this.state.current }
          stores={ this.state.stores }
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}/>
      </div>
    )
  }
}

function init(currentLocation) {
  ReactDOM.render(
    <MainApp currentLocation={ currentLocation }/>,
    document.getElementById('root')
  );
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(position => {
    init({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    })
  })
} else {
  init({
    lat: 35.664011,
    lng: 139.69919
  })
}
