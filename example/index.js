import React from 'react';
import { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import ClusterLayer from '../src/ClusterLayer';

const position = { lng: -122.673447, lat: 45.522558 };
const markers = [
  {
    position: { lng: -122.673447, lat: 45.5225581 },
    text: 'Voodoo Doughnut',
  },
  {
    position: { lng: -122.6781446, lat: 45.5225512 },
    text: 'Bailey\'s Taproom',
  },
  {
    position: { lng: -122.67535700000002, lat: 45.5192743 },
    text: 'Barista'
  },
  {
    position: { lng: -122.65596570000001, lat: 45.5199148000001 },
    text: 'Base Camp Brewing'
  }
];

class ExampleClusterComponent extends React.Component {

  render() {
    const style = {
      border: 'solid 3px lightblue',
      backgroundColor: '#333333',
      color: 'white',
      textAlign: 'center',
      margin: '0',
      padding: '0.25em 0.25em 0.5em',
      fontSize: '1.25em',
      fontWeight: '700'
    };
    const cluster = this.props.cluster;

    if (cluster.markers.length == 1) {
      const markerStyle = Object.assign({}, style, {
        minWidth: '110px',
        borderRadius: '16px',
        borderTopLeftRadius: '0',
      });

      return (
        <div style={markerStyle} >{cluster.markers[0].text}</div>
      );
    }

    const clusterStyle = Object.assign({}, style, {
      borderRadius: '50%',
      borderTopLeftRadius: '0',
      width: '24px',
      height: '24px'
    });

    return (
      <div style={clusterStyle}>{cluster.markers.length}</div>
    );
  }

}

const map = (
  <Map center={position} zoom={13}>
    <ClusterLayer
      markers={markers}
      clusterComponent={ExampleClusterComponent} />
    <TileLayer
      url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    />
  </Map>
);

render(map, document.getElementById('app'));
