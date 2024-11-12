import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MaybeClassMetadata } from '../models/MaybeClassMetadata';

export function updateMaybeClassMetadataProperty(
  updateMetadata: (
    classElementMetadata: MaybeClassElementMetadata | undefined,
  ) => MaybeClassElementMetadata,
  propertyKey: string | symbol,
): (classMetadata: MaybeClassMetadata) => MaybeClassMetadata {
  return (classMetadata: MaybeClassMetadata): MaybeClassMetadata => {
    const propertyMetadata: MaybeClassElementMetadata | undefined =
      classMetadata.properties.get(propertyKey);

    classMetadata.properties.set(propertyKey, updateMetadata(propertyMetadata));

    return classMetadata;
  };
}
