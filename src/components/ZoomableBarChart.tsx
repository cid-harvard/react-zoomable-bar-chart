import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import createBarChart, {
  Datum as BarChartDatum,
  LabelPlacement,
} from '../d3/barChart';
import debounce from 'lodash/debounce';
import * as d3 from 'd3';

const SizingElm = styled.div`
  height: 450px;
  width: 100%;

  svg {
    width: 100%;
    height: 100%;
  }
`;

interface Props {
  id: string;
  data: BarChartDatum[][];
  axisLabels?: {left?: string, bottom?: string};
    axisMinMax?: {
    minY?: number,
    maxY?: number,
  };
  hideAxis?: {
    left?: boolean;
    bottom?: boolean;
  }
  averageLines?: {
    value: number,
    label?: string;
    labelPlacement?: LabelPlacement;
    strokeWidth?: number;
    strokeDasharray?: number;
    strokeColor?: string;
  }[]
  labelFont?: string;
}

export const ZoomableBarChart = (props: Props) => {
  const {
    id
  } = props;
  const sizingNodeRef = useRef<HTMLDivElement | null>(null);
  const svgNodeRef = useRef<any>(null);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const updateWindowWidth = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 500);
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);


  useEffect(() => {
    console.log('effect runs')
    let svgNode: HTMLDivElement | null = null;
    if (svgNodeRef && svgNodeRef.current && sizingNodeRef && sizingNodeRef.current) {
      const sizingNode = sizingNodeRef.current;
      svgNode = svgNodeRef.current;
      console.log({svgNode, sizingNode});
      const svg = d3.select(svgNode);
      createBarChart({
        svg, data: props.data, labelFont: props.labelFont, size: {
          width: sizingNode.clientWidth, height: sizingNode.clientHeight,
        },
        axisLabels: props.axisLabels,
        axisMinMax: props.axisMinMax,
        hideAxis: props.hideAxis,
        averageLines: props.averageLines,
      });
    }
    return () => {
      if (svgNode) {
        console.log('clean up')
        svgNode.innerHTML = '';
      }
    };
  }, [svgNodeRef, sizingNodeRef, windowWidth, props]);

  return (
    <SizingElm ref={sizingNodeRef}>
      <svg ref={svgNodeRef} key={id + windowWidth + 'svg'} />
    </SizingElm>
  );
};

export {
  Props
}
export default ZoomableBarChart;
