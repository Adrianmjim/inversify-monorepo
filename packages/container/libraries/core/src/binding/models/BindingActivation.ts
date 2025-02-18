import { ResolutionContext } from '../../resolution/models/ResolutionContext';
import { Resolved } from '../../resolution/models/Resolved';

export type BindingActivation<T = unknown> = (
  context: ResolutionContext,
  injectable: T,
) => Resolved<T>;
