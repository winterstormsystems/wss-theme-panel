import { expect, test } from 'vitest';
import extension from './index';

test('exports an extension definition the panel can load', () => {
    expect(extension).toBeTruthy();
});
