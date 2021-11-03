import { packageB } from './package-b';

describe('packageB', () => {
  it('should work', () => {
    expect(packageB()).toEqual('package-b');
  });
});
