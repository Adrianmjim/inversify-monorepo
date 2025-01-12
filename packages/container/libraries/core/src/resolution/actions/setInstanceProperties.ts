import { isPromise } from '@inversifyjs/common';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadata } from '../../metadata/models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { ResolutionParams } from '../models/ResolutionParams';

export function setInstanceProperties(
  resolveServiceNode: (
    params: ResolutionParams,
    serviceNode: PlanServiceNode,
  ) => unknown,
): (
  params: ResolutionParams,
  instance: Record<string | symbol, unknown>,
  node: InstanceBindingNode,
) => void | Promise<void> {
  return (
    params: ResolutionParams,
    instance: Record<string | symbol, unknown>,
    node: InstanceBindingNode,
  ): void | Promise<void> => {
    const propertyAssignmentPromises: Promise<void>[] = [];

    for (const [propertyKey, propertyNode] of node.propertyParams) {
      const metadata: ClassElementMetadata | undefined =
        node.classMetadata.properties.get(propertyKey);

      if (metadata === undefined) {
        throw new InversifyCoreError(
          InversifyCoreErrorKind.resolution,
          `Expecting metadata at property "${propertyKey.toString()}", none found`,
        );
      }

      if (
        metadata.kind !== ClassElementMetadataKind.unmanaged &&
        propertyNode.bindings !== undefined
      ) {
        instance[propertyKey] = resolveServiceNode(params, propertyNode);

        if (isPromise(instance[propertyKey])) {
          propertyAssignmentPromises.push(
            (async () => {
              instance[propertyKey] = await instance[propertyKey];
            })(),
          );
        }
      }
    }

    if (propertyAssignmentPromises.length > 0) {
      return Promise.all(propertyAssignmentPromises).then(() => undefined);
    }
  };
}
