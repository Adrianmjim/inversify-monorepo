import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  BindInWhenOnFluentSyntax,
  BindToFluentSyntax,
  Newable,
  ServiceIdentifier,
} from 'inversify';

import { bindingMetadataMapReflectKey } from '../../reflectMetadata/data/bindingMetadataMapReflectKey';
import { updateMetadataMap } from '../actions/updateMetadataMap';
import { buildDefaultBindingMetadataMap } from '../calculations/buildDefaultBindingMetadataMap';
import { BindingMetadata } from '../models/BindingMetadata';
import { BindingMetadataMap } from '../models/BindingMetadataMap';

export function provide<T>(
  serviceIdentifier?: ServiceIdentifier<T>,
  bind?: (bindSyntax: BindInWhenOnFluentSyntax<T>) => void,
): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function): void => {
    const bindingServiceIdentifier: ServiceIdentifier<T> =
      serviceIdentifier ?? target;

    const bindAction: (
      bindService: (
        serviceIdentifier: ServiceIdentifier<T>,
      ) => BindToFluentSyntax<T>,
    ) => void = (
      bindService: (
        serviceIdentifier: ServiceIdentifier<T>,
      ) => BindToFluentSyntax<T>,
    ): void => {
      const bindInWhenOnFluentSyntax: BindInWhenOnFluentSyntax<T> = bindService(
        bindingServiceIdentifier,
      ).to(target as Newable<T>);

      if (bind !== undefined) {
        bind(bindInWhenOnFluentSyntax);
      }
    };

    const bindingMetadata: BindingMetadata<T> = {
      action: bindAction,
      serviceIdentifier: bindingServiceIdentifier,
    };

    updateOwnReflectMetadata<BindingMetadataMap>(
      Object,
      bindingMetadataMapReflectKey,
      buildDefaultBindingMetadataMap,
      updateMetadataMap(target, bindingMetadata),
    );
  };
}
