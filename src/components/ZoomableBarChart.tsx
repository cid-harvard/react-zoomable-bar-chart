import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import createBarChart, {
  Datum as BarChartDatum,
} from '../d3/barChart';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import * as d3 from 'd3';
import usePrevious from 'react-use-previous-hook';

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
  data: BarChartDatum[];
  axisLabels?: {left?: string, bottom?: string};
  axisMinMax?: {minY?: number, maxY?: number};
  labelFont?: string;
}

export const ZoomableBarChart = (props: Props) => {
  const {
    id, data,
  } = props;
  const sizingNodeRef = useRef<HTMLDivElement | null>(null);
  const svgNodeRef = useRef<any>(null);

  const previousData = usePrevious(data);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [updateDataFunc, setUpdateDataFunc] = useState<undefined | ((newData: BarChartDatum[]) => void)>(undefined);

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
    let svgNode: HTMLDivElement | null = null;
    if (svgNodeRef && svgNodeRef.current && sizingNodeRef && sizingNodeRef.current && !updateDataFunc) {
      const sizingNode = sizingNodeRef.current;
      svgNode = svgNodeRef.current;
      const svg = d3.select(svgNode);
      const update = createBarChart({
        svg, data: props.data, labelFont: props.labelFont, size: {
          width: sizingNode.clientWidth, height: sizingNode.clientHeight,
        },
        axisLabels: props.axisLabels,
      });
      setUpdateDataFunc(() => update);
    }
  }, [svgNodeRef, sizingNodeRef, windowWidth, props, updateDataFunc]);

  useEffect(() => () => {
    if (svgNodeRef.current) {
      svgNodeRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    if (updateDataFunc && data && previousData && !isEqual(data, previousData)) {
      updateDataFunc(data);
    }
  }, [data, updateDataFunc, previousData])


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
