import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

import { BaseClassElementMetadata } from './BaseClassElementMetadata';
import { ClassElementMetadataKind } from './ClassElementMetadataKind';
import { MetadataName } from './MetadataName';
import { MetadataTag } from './MetadataTag';

export interface ManagedClassElementMetadata
  extends BaseClassElementMetadata<
    | ClassElementMetadataKind.singleInjection
    | ClassElementMetadataKind.multipleInjection
  > {
  isFromTypescriptParamType?: true;
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
  value: ServiceIdentifier | LazyServiceIdentifier;
}
