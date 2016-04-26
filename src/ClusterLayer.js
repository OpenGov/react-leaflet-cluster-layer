import React from 'react';
import ReactDOM from 'react-dom';

import L from 'leaflet';
import { MapLayer } from 'react-leaflet';

export type LngLat = {
  lng: number;
  lat: number;
}

export type Marker = {
  position: LngLat;
  isAdded: boolean;
}

export type Point = {
  x: number;
  y: number;
}

export type Bounds = {
  contains: (latLng: LngLat) => boolean;
  extend: (latLng: LngLat) => void;
  getNorthEast: () => LngLat;
  getSouthWest: () => LngLat;
}

export type Map = {
  layerPointToLatLng: (lngLat: Point) => LngLat;
  latLngToLayerPoint: (lngLat: LngLat) => Point;
  on: (event: string, handler: () => void) => void;
  getBounds: () => Bounds;
  getPanes: () => Panes;
  invalidateSize: () => void;
}

export type Panes = {
  overlayPane: Pane;
}

export type Pane = {
  appendChild: (element: Object) => void;
}

export type Cluster = {
  center: LngLat;
  markers: Array<Marker>;
  bounds: Bounds;
}

// Taken from http://stackoverflow.com/questions/1538681/how-to-call-fromlatlngtodivpixel-in-google-maps-api-v3/12026134#12026134
// and modified to use Leaflet API
function getExtendedBounds(map: Map, bounds: Bounds, gridSize: number): Bounds {
  // Turn the bounds into latlng.
  const northEastLat = bounds && bounds.getNorthEast() && bounds.getNorthEast().lat;
  const northEastLng = bounds && bounds.getNorthEast() && bounds.getNorthEast().lng;
  const southWestLat = bounds && bounds.getSouthWest() && bounds.getSouthWest().lat;
  const southWestLng = bounds && bounds.getSouthWest() && bounds.getSouthWest().lng;

  const tr = L.latLng(northEastLat, northEastLng);
  const bl = L.latLng(southWestLat, southWestLng);

  // Convert the points to pixels and the extend out by the grid size.
  const trPix = map.latLngToLayerPoint(tr);
  trPix.x += gridSize;
  trPix.y -= gridSize;

  const blPix = map.latLngToLayerPoint(bl);
  blPix.x -= gridSize;
  blPix.y += gridSize;

  // Convert the pixel points back to LatLng
  const ne = map.layerPointToLatLng(trPix);
  const sw = map.layerPointToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
}

function distanceBetweenPoints(p1: LngLat, p2: LngLat): number {
  if (!p1 || !p2) {
    return 0;
  }

  const R = 6371; // Radius of the Earth in km

  const degreesToRadians = degree => (degree * Math.PI / 180);
  const sinDouble = degree => Math.pow(Math.sin(degree / 2), 2);
  const cosSquared = (point1, point2) => {
    return Math.cos(degreesToRadians(point1.lat)) * Math.cos(degreesToRadians(point2.lat));
  };

  const dLat = degreesToRadians(p2.lat - p1.lat);
  const dLon = degreesToRadians(p2.lng - p1.lng);
  const a = sinDouble(dLat) + cosSquared(p1, p2) * sinDouble(dLon);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export default class ClusterLayer extends MapLayer {
  static propTypes = {
    markers: React.PropTypes.array,
    clusterComponent: React.PropTypes.func.isRequired,
    propsForClusters: React.PropTypes.object,
    gridSize: React.PropTypes.number,
    minClusterSize: React.PropTypes.number
  };

  state: Object = {
    clusters: []
  };

  componentDidMount(): void {
    this.leafletElement = ReactDOM.findDOMNode(this.refs.container);
    this.props.map.getPanes().overlayPane.appendChild(this.leafletElement);
    this.setClustersWith(this.props.markers);
    this.attachEvents();
  }

  componentWillReceiveProps(nextProps: Object): void {
    if (!this.props || nextProps.markers !== this.props.markers) {
      this.setClustersWith(nextProps.markers);
    }
  }

  componentWillUnmount(): void {
    this.props.map.getPanes().overlayPane.removeChild(this.leafletElement);
  }

  componentDidUpdate(): void {
    this.props.map.invalidateSize();
    this.updatePosition();
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  setClustersWith(markers: Array<Marker>): void {
    this.setState({
      clusters: this.createClustersFor(markers)
    });
  }

  recalculate(): void {
    this.setClustersWith(this.props.markers);
    this.updatePosition();
  }

  attachEvents(): void {
    const map: Map = this.props.map;

    map.on('viewreset', () => this.recalculate());
    map.on('moveend', () => this.recalculate());
  }

  updatePosition(): void {
    this.state.clusters.forEach((cluster: Cluster, i) => {
      const clusterElement = ReactDOM.findDOMNode(
        this.refs[this.getClusterRefName(i)]
      );

      L.DomUtil.setPosition(
        clusterElement,
        this.props.map.latLngToLayerPoint(cluster.center)
      );
    });
  }

  render(): React.Element {
    return (
      <div ref="container"
        className={`leaflet-objects-pane
           leaflet-marker-pane
           leaflet-zoom-hide
           react-leaflet-cluster-layer`}
      >
        {this.renderClusters()}
      </div>
    );
  }

  renderClusters(): Array<React.Element> {
    const style = { position: 'absolute' };
    const ClusterComponent = this.props.clusterComponent;
    return this.state.clusters
      .map((cluster: Cluster, index: number) => (
        <ClusterComponent
          {...this.props.propsForClusters}
          key={index}
          style={style}
          map={this.props.map}
          ref={this.getClusterRefName(index)}
          cluster={cluster}
        />
      ));
  }

  getGridSize(): number {
    return this.props.gridSize || 60;
  }

  getMinClusterSize(): number {
    return this.props.minClusterSize || 2;
  }

  isMarkerInBounds(marker: Marker, bounds: Bounds): boolean {
    return bounds.contains(marker.position);
  }

  calculateClusterBounds(cluster: Cluster) {
    const bounds = L.latLngBounds(cluster.center, cluster.center);
    cluster.bounds = getExtendedBounds(this.props.map, bounds, this.getGridSize());
  }

  isMarkerInClusterBounds(cluster: Cluster, marker: Marker): boolean {
    return cluster.bounds.contains(L.latLng(marker.position));
  }

  addMarkerToCluster(cluster: Cluster, marker: Marker) {
    const center = cluster.center;
    const markersLen = cluster.markers.length;

    if (!center) {
      cluster.center = L.latLng(marker.position);
      this.calculateClusterBounds(cluster);
    } else {
      const len = markersLen + 1;
      const lng = (center.lng * (len - 1) + marker.position.lng) / len;
      const lat = (center.lat * (len - 1) + marker.position.lat) / len;
      cluster.center = L.latLng({ lng, lat });
      this.calculateClusterBounds(cluster);
    }

    marker.isAdded = true;
    cluster.markers.push(marker);
  }

  createClustersFor(markers: Array<Marker>): Array<Cluster> {
    const map: Map = this.props.map;
    const extendedBounds = getExtendedBounds(map, map.getBounds(), this.getGridSize());
    return markers
      .filter(marker => extendedBounds.contains(L.latLng(marker.position)))
      .reduce((clusters: Array<Cluster>, marker: Marker) => {
        let distance = 40000; // Some large number
        let clusterToAddTo = null;
        const pos = marker.position;

        clusters.forEach((cluster) => {
          const center = cluster.center;
          if (center) {
            const d = distanceBetweenPoints(center, pos);
            if (d < distance) {
              distance = d;
              clusterToAddTo = cluster;
            }
          }
        });

        if (clusterToAddTo && this.isMarkerInClusterBounds(clusterToAddTo, marker)) {
          this.addMarkerToCluster(clusterToAddTo, marker);
        } else {
          const cluster = {
            markers: [marker],
            center: L.latLng(pos),
            bounds: L.latLngBounds()
          };
          this.calculateClusterBounds(cluster);
          clusters.push(cluster);
        }
        return clusters;
      }, []);
  }

  getClusterRefName(index: number): string {
    return `cluster${index}`;
  }

}
