import { ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from '../../metadata/models/MetadataName';
import { PlanParamsTagConstraint } from './PlanParamsTagConstraint';

export interface PlanParamsConstraint {
  name?: MetadataName;
  isMultiple: boolean;
  isOptional?: true;
  serviceIdentifier: ServiceIdentifier;
  tag?: PlanParamsTagConstraint;
}
