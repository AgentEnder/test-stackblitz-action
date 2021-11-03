import { packageA } from './package-a';

describe('packageA', () => {
  it('should work', () => {
    expect(packageA()).toEqual('package-a');
  });
});
