# react-leaflet-cluster-layer

`react-leaflet-cluster-layer` provides a simple `<ClusterLayer />` component for plotting React components as markers and clusters in a `react-leaflet` map.

## API

The `ClusterLayer` component takes the following props:

- `markers`: an array of objects that expose the properties defined in the `Marker` type
- `clusterComponent`: (required) the React component to be rendered for each marker and cluster, this component will receive the following props
  - `cluster`: a `Marker` or `Cluster` object, as defined by their respective types
  - `style`: a style object for positioning
  - `map`: the Leaflet map object from the `react-leaflet` `MapLayer`
  - `...propsForClusters`: the component will also receive the properties of `propsForClusters` as props
- `propsForClusters`: props to pass on to marker and cluster components
- `gridSize`: optional prop to control how bounds of clusters expand while being generated (default: 60)
- `minClusterSize`: optional prop to enforce a minimum cluster size (default: 2)

## Contributing

To contribute, please fork this repository and submit a Pull Request.

You'll need Node version 4.3.0 or newer and NPM 3.3.10 or newer to work with the project. Please ensure that all tests pass when submitting a Pull Request.

Tests for the component are in `lib/__tests__/ClusterLayer.test.js`.

You can run the tests with `npm test`.

## Versioning

This project will follow Semantic Versioning when publishing. This project is still very new so, the API may change rapidly.

## License

`react-leaflet-cluster-layer` is MIT licensed.

See `LICENSE` in this repository for the text of this license.
