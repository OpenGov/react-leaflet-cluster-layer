'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Taken from http://stackoverflow.com/questions/1538681/how-to-call-fromlatlngtodivpixel-in-google-maps-api-v3/12026134#12026134
// and modified to use Leaflet API
function getExtendedBounds(map, bounds, gridSize) {
  // Turn the bounds into latlng.
  var northEastLat = bounds && bounds.getNorthEast() && bounds.getNorthEast().lat;
  var northEastLng = bounds && bounds.getNorthEast() && bounds.getNorthEast().lng;
  var southWestLat = bounds && bounds.getSouthWest() && bounds.getSouthWest().lat;
  var southWestLng = bounds && bounds.getSouthWest() && bounds.getSouthWest().lng;

  var tr = _leaflet2.default.latLng(northEastLat, northEastLng);
  var bl = _leaflet2.default.latLng(southWestLat, southWestLng);

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = map.latLngToLayerPoint(tr);
  trPix.x += gridSize;
  trPix.y -= gridSize;

  var blPix = map.latLngToLayerPoint(bl);
  blPix.x -= gridSize;
  blPix.y += gridSize;

  // Convert the pixel points back to LatLng
  var ne = map.layerPointToLatLng(trPix);
  var sw = map.layerPointToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
}

function distanceBetweenPoints(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km

  var degreesToRadians = function degreesToRadians(degree) {
    return degree * Math.PI / 180;
  };
  var sinDouble = function sinDouble(degree) {
    return Math.pow(Math.sin(degree / 2), 2);
  };
  var cosSquared = function cosSquared(point1, point2) {
    return Math.cos(degreesToRadians(point1.lat)) * Math.cos(degreesToRadians(point2.lat));
  };

  var dLat = degreesToRadians(p2.lat - p1.lat);
  var dLon = degreesToRadians(p2.lng - p1.lng);
  var a = sinDouble(dLat) + cosSquared(p1, p2) * sinDouble(dLon);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

var ClusterLayer = function (_MapLayer) {
  _inherits(ClusterLayer, _MapLayer);

  function ClusterLayer() {
    var _temp, _this, _ret;

    _classCallCheck(this, ClusterLayer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _MapLayer.call.apply(_MapLayer, [this].concat(args))), _this), _this.state = {
      clusters: []
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  ClusterLayer.prototype.componentDidMount = function componentDidMount() {
    this.leafletElement = _reactDom2.default.findDOMNode(this.refs.container);
    this.props.map.getPanes().overlayPane.appendChild(this.leafletElement);
    this.setClustersWith(this.props.markers);
    this.attachEvents();
  };

  ClusterLayer.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (!this.props || nextProps.markers !== this.props.markers) {
      this.setClustersWith(nextProps.markers);
    }
  };

  ClusterLayer.prototype.componentWillUnmount = function componentWillUnmount() {
    this.props.map.getPanes().overlayPane.removeChild(this.leafletElement);
  };

  ClusterLayer.prototype.componentDidUpdate = function componentDidUpdate() {
    this.props.map.invalidateSize();
    this.updatePosition();
  };

  ClusterLayer.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
    return true;
  };

  ClusterLayer.prototype.setClustersWith = function setClustersWith(markers) {
    this.setState({
      clusters: this.createClustersFor(markers)
    });
  };

  ClusterLayer.prototype.recalculate = function recalculate() {
    this.setClustersWith(this.props.markers);
    this.updatePosition();
  };

  ClusterLayer.prototype.attachEvents = function attachEvents() {
    var _this2 = this;

    var map = this.props.map;

    map.on('viewreset', function () {
      return _this2.recalculate();
    });
    map.on('moveend', function () {
      return _this2.recalculate();
    });
  };

  ClusterLayer.prototype.updatePosition = function updatePosition() {
    var _this3 = this;

    this.state.clusters.forEach(function (cluster, i) {
      var clusterElement = _reactDom2.default.findDOMNode(_this3.refs[_this3.getClusterRefName(i)]);

      _leaflet2.default.DomUtil.setPosition(clusterElement, _this3.props.map.latLngToLayerPoint(cluster.center));
    });
  };

  ClusterLayer.prototype.render = function render() {
    return _react2.default.createElement(
      'div',
      { ref: 'container',
        className: 'leaflet-objects-pane leaflet-marker-pane leaflet-zoom-hide react-leaflet-cluster-layer'
      },
      this.renderClusters()
    );
  };

  ClusterLayer.prototype.renderClusters = function renderClusters() {
    var _this4 = this;

    var style = { position: 'absolute' };
    var ClusterComponent = this.props.clusterComponent;
    return this.state.clusters.map(function (cluster, index) {
      return _react2.default.createElement(ClusterComponent, _extends({}, _this4.props.propsForClusters, {
        key: index,
        style: style,
        map: _this4.props.map,
        ref: _this4.getClusterRefName(index),
        cluster: cluster
      }));
    });
  };

  ClusterLayer.prototype.getGridSize = function getGridSize() {
    return this.props.gridSize || 60;
  };

  ClusterLayer.prototype.getMinClusterSize = function getMinClusterSize() {
    return this.props.minClusterSize || 2;
  };

  ClusterLayer.prototype.isMarkerInBounds = function isMarkerInBounds(marker, bounds) {
    return bounds.contains(marker.position);
  };

  ClusterLayer.prototype.calculateClusterBounds = function calculateClusterBounds(cluster) {
    var bounds = _leaflet2.default.latLngBounds(cluster.center, cluster.center);
    cluster.bounds = getExtendedBounds(this.props.map, bounds, this.getGridSize());
  };

  ClusterLayer.prototype.isMarkerInClusterBounds = function isMarkerInClusterBounds(cluster, marker) {
    return cluster.bounds.contains(_leaflet2.default.latLng(marker.position));
  };

  ClusterLayer.prototype.addMarkerToCluster = function addMarkerToCluster(cluster, marker) {
    var center = cluster.center;
    var markersLen = cluster.markers.length;

    if (!center) {
      cluster.center = _leaflet2.default.latLng(marker.position);
      this.calculateClusterBounds(cluster);
    } else {
      var len = markersLen + 1;
      var _lng = (center.lng * (len - 1) + marker.position.lng) / len;
      var _lat = (center.lat * (len - 1) + marker.position.lat) / len;
      cluster.center = _leaflet2.default.latLng({ lng: _lng, lat: _lat });
      this.calculateClusterBounds(cluster);
    }

    marker.isAdded = true;
    cluster.markers.push(marker);
  };

  ClusterLayer.prototype.createClustersFor = function createClustersFor(markers) {
    var _this5 = this;

    var map = this.props.map;
    var extendedBounds = getExtendedBounds(map, map.getBounds(), this.getGridSize());
    return markers.filter(function (marker) {
      return extendedBounds.contains(_leaflet2.default.latLng(marker.position));
    }).reduce(function (clusters, marker) {
      var distance = 40000; // Some large number
      var clusterToAddTo = null;
      var pos = marker.position;

      clusters.forEach(function (cluster) {
        var center = cluster.center;
        if (center) {
          var d = distanceBetweenPoints(center, pos);
          if (d < distance) {
            distance = d;
            clusterToAddTo = cluster;
          }
        }
      });

      if (clusterToAddTo && _this5.isMarkerInClusterBounds(clusterToAddTo, marker)) {
        _this5.addMarkerToCluster(clusterToAddTo, marker);
      } else {
        var cluster = {
          markers: [marker],
          center: _leaflet2.default.latLng(pos),
          bounds: _leaflet2.default.latLngBounds()
        };
        _this5.calculateClusterBounds(cluster);
        clusters.push(cluster);
      }
      return clusters;
    }, []);
  };

  ClusterLayer.prototype.getClusterRefName = function getClusterRefName(index) {
    return 'cluster' + index;
  };

  return ClusterLayer;
}(_reactLeaflet.MapLayer);

ClusterLayer.propTypes = {
  markers: _react2.default.PropTypes.array,
  clusterComponent: _react2.default.PropTypes.func.isRequired,
  propsForClusters: _react2.default.PropTypes.object,
  gridSize: _react2.default.PropTypes.number,
  minClusterSize: _react2.default.PropTypes.number
};
exports.default = ClusterLayer;
