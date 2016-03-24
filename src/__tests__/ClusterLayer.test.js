import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { Map } from 'react-leaflet';
import ClusterLayer from '../ClusterLayer.js';

jest.unmock('../ClusterLayer.js');

const L = jest.genMockFromModule('leaflet');

describe('ClusterLayer', () => {
  const ClusterComponent = (props) => <div class="cluster-component">Cluster component</div>;

  it('should render', () => {
    const map = render(
        <ClusterLayer
          markers={[]}
          clusterComponent={ClusterComponent} />
    );
    expect(map).toBeTruthy();
  });

  // TODO real tests

});
