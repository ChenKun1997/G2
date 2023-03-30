import { deepMix } from '@antv/util';
import { CompositionComponent as CC } from '../runtime';
import { ProgressMark } from '../spec';
import { subObject } from '../utils/helper';

export type ProgressOptions = Omit<ProgressMark, 'type'>;

// { current: 11, total: 100 } | { percent: 0.75 }
// TODO: 复用gauge
const dataTransform = (data, scale) => {
  const { current, target, percent } = data;
  const _current = percent ?? current ?? 0;
  const _target = ((percent ?? -1) !== -1 ? 1 : target) ?? 1;
  const { color } = scale;
  const newScale = {
    y: {
      domain: [0, _target],
    },
    ...scale,
  };
  const options = {
    current: _current,
    target: _target,
    scale: newScale,
  };
  if (!color || !color.domain?.length) {
    return {
      ...options,
      data: [
        {
          y: _current,
          color: 'current',
        },
        {
          y: _target - _current,
          color: 'target',
        },
      ],
    };
  }

  const { domain } = color;
  return {
    ...options,
    data: domain.map((_domain, index) => ({
      y: _domain - (domain[index - 1] ?? 0),
      color: index,
    })),
  };
};

export const Progress: CC<ProgressOptions> = (options) => {
  const DEFAULT_OPTIONS = {
    axis: {
      y: false,
    },
    legend: false,
    tooltip: false,
    encode: {
      y: 'y',
      color: 'color',
    },
    scale: {
      color: {
        range: ['#30BF78', '#D0D0D0'],
      },
    },
    transform: [{ type: 'stackY' }],
  };

  const DEFAULT_BAR_OPTIONS = {
    coordinate: {
      transform: [
        {
          type: 'transpose',
        },
      ],
    },
    ...DEFAULT_OPTIONS,
  };

  const DEFAULT_RING_OPTIONS = {
    coordinate: {
      type: 'radial',
      innerRadius: 0.9,
      outerRadius: 1,
    },
    ...DEFAULT_OPTIONS,
  };

  const DEFAULT_TEXT_OPTIONS = {
    type: 'text',
    style: {
      x: '50%',
      y: '50%',
      textAlign: 'center',
      textBaseline: 'middle',
      fontSize: 20,
      fontWeight: 800,
      fill: '#888',
    },
  };

  return () => {
    const {
      intervalShape = 'ring',
      data = {},
      scale = {},
      style = {},
      animate = {},
      ...resOptions
    } = options;

    const {
      data: renderData,
      scale: newScale,
      current,
      target,
    } = dataTransform(data, scale);

    const markOptions = [];

    // add interval option.
    markOptions.push(
      deepMix(
        {},
        intervalShape === 'ring' ? DEFAULT_RING_OPTIONS : DEFAULT_BAR_OPTIONS,
        {
          type: 'interval',
          data: renderData,
          scale: newScale,
          animate:
            typeof animate === 'object' ? subObject(animate, 'graph') : animate,
          ...resOptions,
        },
      ),
    );
    // add text option.
    if (intervalShape === 'ring') {
      const textStyle = subObject(style, 'text');
      markOptions.push(
        deepMix({}, DEFAULT_TEXT_OPTIONS, {
          style: {
            text: textStyle.content?.(current, target) || current.toString(),
            ...textStyle,
          },
          animate:
            typeof animate === 'object' ? subObject(animate, 'text') : animate,
        }),
      );
    }

    return markOptions;
  };
};

Progress.props = {};
