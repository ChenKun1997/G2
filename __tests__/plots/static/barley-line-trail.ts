import { csv } from 'd3-fetch';
import { autoType } from 'd3-dsv';
import { rollup } from 'd3-array';
import { G2Spec } from '../../../src';

export async function barleyLineTrail(): Promise<G2Spec> {
  const data = await csv('data/barley.csv', autoType);
  const key = (d) => `${d.site},${d.variety}`;
  const keyDelta = rollup(
    data,
    ([a, b]) => {
      if (b.year < a.year) [a, b] = [b, a];
      return b.yield - a.yield;
    },
    key,
  );
  return {
    type: 'facetRect',
    data,
    paddingLeft: 120,
    paddingBottom: 100,
    encode: { x: 'site' },
    children: [
      {
        type: 'line',
        frame: false,
        encode: {
          x: (d) => `${d.year}`,
          y: 'variety',
          series: 'variety',
          color: (d) => keyDelta.get(key(d)),
          size: 'yield',
        },
        tooltip: { title: '', items: [{ field: 'year' }, { field: 'yield' }] },
        legend: { size: false, color: { title: 'yield delta' } },
        scale: {
          size: { range: [0, 12] },
          color: { palette: 'rdBu' },
        },
        style: { shape: 'trail' },
        interaction: { tooltip: { series: false } },
      },
    ],
  };
}