import { ServiceIdentifier } from '@inversifyjs/common';

import { BindingConstraints } from './BindingConstraints';
import { BindingType } from './BindingType';

export interface BaseBinding<TType extends BindingType, TActivated> {
  readonly id: number;
  readonly moduleId: number | undefined;
  readonly serviceIdentifier: ServiceIdentifier<TActivated>;
  readonly type: TType;

  isSatisfiedBy(constraints: BindingConstraints): boolean;
}
