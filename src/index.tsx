import * as React from 'react'
import ZoomableBarChart, {Props} from './components/ZoomableBarChart';
import styled from 'styled-components';

const Root = styled.div`
  width: 100%:
  height: 100vh;
`;


/* TO DO:

[ ] Implement D3 barchart, generic
[ ] Bar chart should return callback functions that allow for updating of the data
[ ] Add animations between data updates
[ ] Implement actual test data

*/

export {Props};

export default (props: Props) => {
  return (
    <Root>
      <ZoomableBarChart {...props} />
    </Root>
  );
}
