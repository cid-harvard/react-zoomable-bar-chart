import React, {useState} from 'react'
import DataViz, {
  VizType,
  ClusterBarChartDatum,
} from 'react-fast-charts';
import raw from 'raw.macro';
import {rgba} from 'polished';
import sortBy from 'lodash/sortBy';
import styled from 'styled-components';
import './styling/fonts/fonts.css'
import PanelSearch, {Datum as PanelDatum} from 'react-panel-search';

const font = "OfficeCodeProWeb, monospace";

const Root = styled.div`
  padding: 1rem;
  font-family: ${font};
  max-width: 1180px;
  margin: auto;
`;

const BreadCrumbList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  min-height: 80px;
`;

const BreadCrumb = styled.li`
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 20%;
`;

const BreadCrumbLink = styled.button`
  border: none;
  background-color: transparent;
  padding: 0;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: ${font};
  color: rgb(78, 140, 141);
  cursor: pointer;
  text-align: left;
  margin-right: 1rem;
  display: flex;
  align-items: center;

  span {
    text-decoration: underline;
  }

  &:after {
    content: '→';
    margin: 0 0.5rem;
    font-size: 1rem;
    text-decoration: none;
    display: inline-block;
  }
`;

const LegendRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 4rem 0rem 0;
`;

const LegendBlock = styled.div`
  width: 4em;
  height: 2rem;
  margin: 0 0.1rem;
`;

const LegendText = styled.div`
  font-size: 0.85rem;
  text-transform: uppercase;
  margin: 0 0.5rem;
`;

const SearchContainer = styled.div`
max-width: 280px;
width: 100%;
font-family: ${font};

.react-panel-search-search-bar-input,
button {
  font-family: ${font};
}

.react-panel-search-search-bar-input {
  text-transform: uppercase;
  font-weight: 400;
  font-size: 1rem;
  background-color: #fff;
  border: solid 1px #7c7c7c;
  box-shadow: none;
  outline: none;

  &:focus::placeholder {
    color: #fff;
  }
}

.react-panel-search-current-tier-breadcrumb-outer,
.react-panel-search-next-button,
.react-panel-search-search-bar-dropdown-arrow {
  svg polyline {
    stroke: #7c7c7c;
  }
}
.react-panel-search-search-bar-dropdown-arrow {
  width: 1rem;
}
.react-panel-search-search-bar-dropdown-arrow,
.react-panel-search-search-bar-clear-button {
  background-color: #fff;
}

.react-panel-search-search-bar-search-icon {
  svg path {
    fill: #7c7c7c;
  }
}

.react-panel-search-search-results {
  border-left: solid 1px #7c7c7c;
  border-right: solid 1px #7c7c7c;
  border-bottom: solid 1px #7c7c7c;
}

.react-panel-search-current-tier-title,
.react-panel-search-current-tier-breadcrumb-outer {
  border-color: #cfbc3c;
}
`;

interface NaicsDatum {
  naics_id: number,
  code: string,
  name: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  parent_id: null | number,
  parent_code: null | string,
  code_hierarchy: string,
  naics_id_hierarchy: string,
}

interface BosNYDatum {
  city_id: 945 | 1022,
  name: "New York" | "Boston",
  naics_id: number,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  year: 2019 | 2020,
  num_company: number,
  num_employ: number,
}
const naics_2017: NaicsDatum[] = JSON.parse(raw('./data/naics_2017.json'));
const bos_nyc_extract: BosNYDatum[] = JSON.parse(raw('./data/bos_nyc_extract.json'));

const colorMap = [
  { id: 0, color: '#A973BE' },
  { id: 1, color: '#F1866C' },
  { id: 2, color: '#FFC135' },
  { id: 3, color: '#93CFD0' },
  { id: 4, color: '#488098' },
  { id: 5, color: '#77C898' },
  { id: 6, color: '#6A6AAD' },
  { id: 7, color: '#D35162' },
  { id: 8, color: '#F28188' },
]

interface MergedDatum {
  naicsId: number,
  name: string,
  parentId: number | null,
  sectorId: number,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  color: string,
  numberOfEmployees: Array<{
    city: {id: number, name: string},
    value: number,
    year: number,
  }>,
  numberOfFirms: Array<{
    city: {id: number, name: string},
    value: number,
    year: number,
  }>,
}

const targetYear = 2020;

const totals = {
  'Boston': {numberOfEmployees: 0, numberOfFirms: 0},
  'New York': {numberOfEmployees: 0, numberOfFirms: 0},
}
const merged: MergedDatum[] = [];
const panelData: PanelDatum[] = [];

naics_2017.forEach(d => {
  const {naics_id, name, level, parent_id} = d;
  let sectorId = naics_id;
  let current = naics_2017.find(datum => datum.naics_id === naics_id);
  while(current && current.parent_id !== null) {
  // eslint-disable-next-line
    current = naics_2017.find(datum => datum.naics_id === (current as NaicsDatum).parent_id);
    if (current && current.parent_id !== null) {
      sectorId = current.parent_id;
    } else if (current && current.naics_id !== null) {
      sectorId = current.naics_id;
    }
  }
  if (sectorId > 8) {
    console.error(current);
    throw new Error('Parent out of range')
  }
  const {color} = colorMap.find(({id}) => id === sectorId) as {color: string};
  const cities = bos_nyc_extract.filter(c => c.naics_id === naics_id);
  const numberOfEmployees: MergedDatum['numberOfEmployees'] = [];
  const numberOfFirms: MergedDatum['numberOfFirms'] = [];
  if (!cities || cities.length < 2) {
    numberOfEmployees.push({
      city: {id: 945, name: 'New York'},
      value: 0,
      year: targetYear,
    })
    numberOfFirms.push({
      city: {id: 945, name: 'New York'},
      value: 0,
      year: targetYear,
    })
    numberOfEmployees.push({
      city: {id: 1022, name: 'Boston'},
      value: 0,
      year: targetYear,
    })
    numberOfFirms.push({
      city: {id: 1022, name: 'Boston'},
      value: 0,
      year: targetYear,
    })
  }
  cities.forEach(c => {
    if (c.year === targetYear) {
      if (c.level === 1) {
        totals[c.name].numberOfEmployees += c.num_employ;
        totals[c.name].numberOfFirms += c.num_company;
      }
      numberOfEmployees.push({
        city: {id: c.city_id, name: c.name},
        value: c.num_employ,
        year: c.year,
      })
      numberOfFirms.push({
        city: {id: c.city_id, name: c.name},
        value: c.num_company,
        year: c.year,
      })
    }
  });
  merged.push({
    naicsId: naics_id,
    name,
    parentId: parent_id,
    sectorId,
    level,
    color,
    numberOfEmployees,
    numberOfFirms,
  })
  panelData.push({
    id: naics_id,
    title: name,
    level: level,
    parent_id,
  })
});

const App = () => {
  const [focusedIndustryId, setFocusedIndustryId] = useState<number | null>(null);
  const filtered = merged.filter(d => d.parentId === focusedIndustryId);
  const data: ClusterBarChartDatum[] = [];
  filtered.forEach(d => {
    d.numberOfFirms.forEach(f => {
      if (f.year === targetYear) {
        const city_0_total = d.numberOfFirms[0] && d.numberOfFirms[0].value
          ? (d.numberOfFirms[0].value / totals[d.numberOfFirms[0].city.name].numberOfFirms) * 100 : 0;
        const city_1_total = d.numberOfFirms[1] && d.numberOfFirms[1].value
          ? (d.numberOfFirms[1].value / totals[d.numberOfFirms[1].city.name].numberOfFirms) * 100 : 0;
        const diff = Math.abs(city_0_total - city_1_total);
        let digits: number = 20;
        if (city_0_total > 0.01 || city_1_total > 0.01 || diff > 0.01) {
          digits = 2;
        } else if (city_0_total > 0.001 || city_1_total > 0.001 || diff > 0.001) {
          digits = 3;
        } else if (city_0_total > 0.0001 || city_1_total > 0.0001 || diff > 0.0001) {
          digits = 4;
        } else if (city_0_total > 0.00001 || city_1_total > 0.00001 || diff > 0.00001) {
          digits = 5;
        } else if (city_0_total < 0.000001 || city_1_total < 0.000001 || diff < 0.000001) {
          digits = 6;
        }
        const x = d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name;
        data.push({
          groupName: f.city.name,
          x,
          y: (f.value / totals[f.city.name].numberOfFirms) * 100,
          fill: f.city.id === 945 ? d.color : rgba(d.color, 0.4),
          tooltipContent: `
            <div style='text-transform: uppercase; font-size: 0.85rem'>
              <div style='font-size: 0.9rem; margin-bottom: 0.5rem;'>
                <strong>${d.name}</strong>
              </div>
              <div>
                <div style='display: flex; justify-content: space-between;'>
                  <span style='margin-right: 1rem'>New York:</span> <span>${parseFloat((city_0_total).toFixed(digits))}%</span>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                  <span style='margin-right: 1rem'>Boston:</span> <span>${parseFloat((city_1_total).toFixed(digits))}%</span>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                  <span style='margin-right: 1rem'>Difference:</span> <span>${parseFloat((diff).toFixed(digits))}%</span>
                </div>
              </div>
            </div>
          `,
          tooltipContentOnly: true,
          onClick: d.level < 6 ? () => setFocusedIndustryId(d.naicsId) : undefined,
        })
      }
    });
  });
  const sortedData = sortBy(data, ['groupName', 'y']).reverse();

  const breadCrumbList: MergedDatum[] = [];
  let current = focusedIndustryId === null ? undefined : merged.find(d => d.naicsId === focusedIndustryId);
  while (current !== undefined) {
    breadCrumbList.push(current);
    const currentParentId = current.parentId;
    current = merged.find(d => d.naicsId === currentParentId)
  }
  const breadCrumbs = breadCrumbList.reverse().map((industry, i) => {
    if (i === breadCrumbList.length - 1) {
      return (
        <BreadCrumb key={industry.naicsId}>
          {industry.name}
        </BreadCrumb>
      );
    }
    return (
      <BreadCrumb key={industry.naicsId}>
        <BreadCrumbLink onClick={() => setFocusedIndustryId(industry.naicsId)}>
          <span>{industry.name}</span>
        </BreadCrumbLink>
      </BreadCrumb>
    );
  })
  const topLevelBreadCrumb = breadCrumbList.length ? (
    <BreadCrumb>
      <BreadCrumbLink onClick={() => setFocusedIndustryId(null)}>
        <span>Sector Level</span>
      </BreadCrumbLink>
    </BreadCrumb>
  ) : (
    <BreadCrumb>
        Sector Level
    </BreadCrumb>
  )

  const onSearchSelect = (datum: PanelDatum | null) => {
    if (!datum) {
      setFocusedIndustryId(null);
    } else {
      if ((datum.level as number) === 6 ) {
        setFocusedIndustryId(datum.parent_id as number);
      } else {
        setFocusedIndustryId(datum.id as number);
      }
    }
  }

  return (
    <Root>
      <SearchContainer>
        <PanelSearch
          data={panelData}
          topLevelTitle={'Sector Level'}
          onSelect={onSearchSelect}
          showCount={true}
          resultsIdentation={1.75}
          maxResults={500}
          defaultPlaceholderText={'Search an industry'}
        />
      </SearchContainer>
      <BreadCrumbList>
        {topLevelBreadCrumb}
        {breadCrumbs}
      </BreadCrumbList>
      <DataViz
        id={'example-cluster-bar-chart'}
        vizType={VizType.ClusterBarChart}
        data={sortedData}
        axisLabels={{left: '% of Total Firms'}}
      />
      <LegendRoot>
        <LegendItem>
          <LegendText>
            New York
          </LegendText>
          <LegendBlock style={{backgroundColor: '#666'}} />
        </LegendItem>
        <LegendItem>
          <LegendBlock style={{backgroundColor: '#bbb'}} />
          <LegendText>
            Boston
          </LegendText>
        </LegendItem>
      </LegendRoot>
    </Root>
  );
}

export default App
