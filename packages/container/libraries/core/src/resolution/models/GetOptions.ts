import { MetadataName } from '../../metadata/models/MetadataName';
import { GetOptionsTagConstraint } from './GetOptionsTagConstraint';

export interface GetOptions {
  autobind?: boolean;
  name?: MetadataName;
  optional?: boolean;
  tag?: GetOptionsTagConstraint;
}
