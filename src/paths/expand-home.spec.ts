import { describe, expect, it } from 'vitest';

import { expandHome } from './expand-home';

describe('expandHome', () => {
  it('should expand ~/ prefixes', () => expect(expandHome('~/x', '/home/u')).toBe('/home/u/x'));
  it('should expand a bare ~', () => expect(expandHome('~', '/home/u')).toBe('/home/u'));
  it('should keep a ~ that is not leading', () => expect(expandHome('/a/~', '/home/u')).toBe('/a/~'));
});
