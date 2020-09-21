import React from 'react'
import ZoomableTreeMap from 'react-zoomable-bar-chart'

const data = [
  [
    {
      x: '2011',
      y: 10,
      stroke: 'lightblue',
      fill: 'transparent',
    },
    {
      x: '2012',
      y: 11,
      stroke: 'lightblue',
      fill: 'transparent',
    },
    {
      x: '2013',
      y: 6,
      stroke: 'lightblue',
      fill: 'transparent',
    },
    {
      x: '2014',
      y: 8,
      stroke: 'lightblue',
      fill: 'transparent',
    },
    {
      x: '2015',
      y: 9,
      stroke: 'lightblue',
      fill: 'transparent',
    },
    {
      x: '2016',
      y: 12,
      stroke: 'lightblue',
      fill: 'transparent',
    },
  ],
  [
    {
      x: '2011',
      y: 6,
      fill: 'blue',
    },
    {
      x: '2012',
      y: 9,
      fill: 'blue',
    },
    {
      x: '2013',
      y: 2,
      fill: 'blue',
    },
    {
      x: '2014',
      y: 5,
      fill: 'blue',
    },
    {
      x: '2015',
      y: 8,
      fill: 'blue',
    },
    {
      x: '2016',
      y: 7,
      fill: 'blue',
    },
  ],
];

const App = () => {
  return (
    <ZoomableTreeMap
      id={'example-bar-chart'}
      data={[data[0]]}
      axisLabels={{left: 'Value', bottom: 'Year'}}
    />
  );
}

export default App
