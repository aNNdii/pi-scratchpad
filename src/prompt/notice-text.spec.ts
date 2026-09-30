import { describe, expect, it } from 'vitest';

import { noticeText } from './notice-text';

describe('noticeText', () => {
  it('should explain a lost scratchpad', () => expect(noticeText('lost', '/d')).toContain('earlier files are gone'));

  it('should explain a failed fork copy', () =>
    expect(noticeText('fork-failed', '/d')).toContain('could not be copied'));
});
