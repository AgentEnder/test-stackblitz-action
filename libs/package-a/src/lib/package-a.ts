import { packageB } from '@test-stackblitz-action/package-b';

export function packageA() {
  console.log(packageB());
}
