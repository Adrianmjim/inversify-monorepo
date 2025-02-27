import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { ResolutionParams } from '../models/ResolutionParams';

export function resolveProviderBindingCallback<
  TActivated extends Provider<unknown>,
>(params: ResolutionParams, binding: ProviderBinding<TActivated>): TActivated {
  return binding.provider(params.context);
}
