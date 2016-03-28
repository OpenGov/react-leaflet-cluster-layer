import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Map } from 'react-leaflet';
import ClusterLayer from '../ClusterLayer.js';

jest.unmock('../ClusterLayer.js');

const L = jest.genMockFromModule('leaflet');

class ClusterComponent extends React.Component {
  render() {
    return (
      <div className="cluster-component">Cluster component</div>
    );
  }
}

describe('ClusterLayer', () => {

  /*
    Here we declare mocks or fixtures of
    all the data structures that the component uses
  */
  const center = { lng: -122.673447, lat: 45.522558 };

  const mockBounds = {
    contains: jest.fn(() => true),
    extend: jest.fn(),
    getNorthEast: jest.fn(() => ({ lng: -122, lat: 46 })),
    getSouthWest: jest.fn(() => ({ lng: -123, lat: 45 })),
  };

  const mockPanes = { overlayPane: { appendChild: jest.fn() } };

  const mockMap = {
    layerPointToLatLng: jest.fn(() => ({ lng: -122.6, lat: 45.522 })),
    latLngToLayerPoint: jest.fn(() => ({ x: 100, y: 100 })),
    on:  jest.fn(),
    getBounds:  jest.fn(() => mockBounds),
    getPanes: jest.fn(() => mockPanes),
    invalidateSize: jest.fn()
  };

  const mockMarkers = [
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

  it('should render', () => {
    const layer = render(
        <ClusterLayer
          markers={[]}
          clusterComponent={ClusterComponent} />
    );
    expect(layer).toBeTruthy();
  });

  it('should render a single child <ClusterComponent /> given one marker', () => {
    const layer = mount(
        <ClusterLayer
          map={mockMap}
          markers={[mockMarkers[0]]}
          clusterComponent={ClusterComponent} />
    );
    expect(layer.find('.cluster-component').length).toEqual(1);
  });

  it('should render one child <ClusterComponent /> given three markers with the same position', () => {
    const layer = mount(
        <ClusterLayer
          map={mockMap}
          markers={[mockMarkers[0], mockMarkers[0], mockMarkers[0]]}
          clusterComponent={ClusterComponent} />
    );
    expect(layer.find('.cluster-component').length).toEqual(1);
  });

  it('should render three child <ClusterComponent /> given three markers with the different positions', () => {
    const layer = mount(
        <ClusterLayer
          map={mockMap}
          markers={mockMarkers}
          clusterComponent={ClusterComponent} />
    );
    expect(layer.find('.cluster-component').length).toEqual(3);
  });

  it('should pass the `propsForClusters` prop to rendered <ClusterComponent />', () => {
    const mockProps = {
      theAnswer: 42,
      numCoffees: 3
    };

    const layer = mount(
        <ClusterLayer
          map={mockMap}
          markers={mockMarkers}
          propsForClusters={mockProps}
          clusterComponent={ClusterComponent} />
    );
    const componentProps = layer.find(ClusterComponent).at(0).props();
    expect(componentProps).toBeTruthy();
    expect(componentProps.theAnswer).toEqual(mockProps.theAnswer);
    expect(componentProps.numCoffees).toEqual(mockProps.numCoffees);
  });
});
