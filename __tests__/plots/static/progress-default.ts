import { G2Spec } from '../../../src';

export function progressDefault(): G2Spec {
  return {
    type: 'progress',
    shape: 'bar',
    data: {
      value: {
        target: 400,
        current: 220,
        name: 'score',
      },
    },
  };
}
