# react-leaflet-cluster-layer

`react-leaflet-cluster-layer` provides a simple `<ClusterLayer />` component for plotting React components as markers and clusters in a `react-leaflet` map.

![A screenshot of a cluster on a leaflet map](../master/screenshot.jpg?raw=true)

## Usage

```js
import React from 'react';
import { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import ClusterLayer from 'react-leaflet-cluster-layer';

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
  }
];

class ExampleClusterComponent extends React.Component {

  render() {
    const style = {
      border: 'solid 2px darkgrey',
      borderRadius: '8px',
      backgroundColor: 'white',
      padding: '1em',
      textAlign: 'center'
    };
    const cluster = this.props.cluster;

    if (cluster.markers.length == 1) {
      return (
        <div style={style} >{cluster.markers[0].text}</div>
      );
    }

    return (
      <div style={style}>{cluster.markers.length} items</div>
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
```

## API

The `ClusterLayer` component takes the following props:

- `markers`: an array of objects that expose the properties defined in the `Marker` type
- `clusterComponent`: (required) the React component to be rendered for each marker and cluster, this component will receive the following props
  - `cluster`: a `Cluster` object, as defined by the Cluster Flow type
  - `style`: a style object for positioning
  - `map`: the Leaflet map object from the `react-leaflet` `MapLayer`
  - `...propsForClusters`: the component will also receive the properties of `propsForClusters` as props
- `propsForClusters`: props to pass on to marker and cluster components
- `gridSize`: optional prop to control how bounds of clusters expand while being generated (default: 60)
- `minClusterSize`: optional prop to enforce a minimum cluster size (default: 2)

## Example

To try the example:

1. Clone this repository
2. run `npm install` in the root of your cloned repository
3. run `npm run example`
4. Visit [localhost:8000](http://localhost:8000)

## Contributing

See [CONTRIBUTING.md](https://www.github.com/OpenGov/react-leaflet-cluster-layer/blob/master/CONTRIBUTING.md)

## License

`react-leaflet-cluster-layer` is MIT licensed.

See [LICENSE.md](https://www.github.com/OpenGov/react-leaflet-cluster-layer/blob/master/LICENSE.md) for details.
