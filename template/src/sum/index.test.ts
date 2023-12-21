import { expect, test } from 'bun:test';
import sum from './';

test('sum: sum given numbers', () => {
    expect(sum(1, 2, 3)).toBe(6);
    expect(sum(7, 8, 9, 100)).toBe(124);
});
