import React, {useState} from 'react'
import DataViz, {
  VizType,
  ClusterBarChartDatum,
} from 'react-fast-charts';
import raw from 'raw.macro';
import {rgba} from 'polished';

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
  cities.forEach(c => {
    if (c.level === 1 && c.year === targetYear) {
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
})

const App = () => {
  const [focusedIndustryId, setFocusedIndustryId] = useState<number | null>(null);
  const filtered = merged.filter(d => d.parentId === focusedIndustryId);
  const data: ClusterBarChartDatum[] = [];
  filtered.forEach(d => {
    d.numberOfFirms.forEach(f => {
      if (f.year === targetYear) {
        data.push({
          groupName: f.city.name,
          x: d.name,
          y: (f.value / totals[f.city.name].numberOfFirms) * 100,
          fill: f.city.id === 945 ? d.color : rgba(d.color, 0.4),
          onClick: d.level < 6 ? () => setFocusedIndustryId(d.naicsId) : undefined,
        })
      }
    });
  });

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
        <li key={industry.naicsId}>
          {industry.name}
        </li>
      );
    }
    return (
      <li key={industry.naicsId}>
        <button onClick={() => setFocusedIndustryId(industry.naicsId)}>
          {industry.name}
        </button>
      </li>
    );
  })
  const topLevelBreadCrumb = breadCrumbList.length ? (
    <li>
      <button onClick={() => setFocusedIndustryId(null)}>
        Sector Level
      </button>
    </li>
  ) : (
    <li>
        Sector Level
    </li>
  )


  return (
    <>
      <ul>
        {topLevelBreadCrumb}
        {breadCrumbs}
      </ul>
      <DataViz
        id={'example-cluster-bar-chart'}
        vizType={VizType.ClusterBarChart}
        data={data}
        axisLabels={{left: '% of Total Firms'}}
      />
    </>
  );
}

export default App
