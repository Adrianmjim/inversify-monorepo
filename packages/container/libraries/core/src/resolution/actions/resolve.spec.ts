import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./resolveConstantValueBinding');
jest.mock('./resolveDynamicValueBinding');
jest.mock('./resolveFactoryBinding');
jest.mock('./resolveInstanceBindingConstructorParams', () => ({
  resolveInstanceBindingConstructorParams: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('./resolveInstanceBindingNode', () => ({
  resolveInstanceBindingNode: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('./resolveInstanceBindingNodeAsyncFromConstructorParams', () => ({
  resolveInstanceBindingNodeAsyncFromConstructorParams: jest
    .fn()
    .mockReturnValue(jest.fn()),
}));
jest.mock('./resolveInstanceBindingNodeFromConstructorParams', () => ({
  resolveInstanceBindingNodeFromConstructorParams: jest
    .fn()
    .mockReturnValue(jest.fn()),
}));
jest.mock('./resolveProviderBinding');
jest.mock('./resolveScopedInstanceBindingNode', () => ({
  resolveScopedInstanceBindingNode: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('./resolveServiceRedirectionBindingNode', () => ({
  resolveServiceRedirectionBindingNode: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('./setInstanceProperties', () => ({
  setInstanceProperties: jest.fn().mockReturnValue(jest.fn()),
}));

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { DynamicValueBinding } from '../../binding/models/DynamicValueBinding';
import { Factory } from '../../binding/models/Factory';
import { FactoryBinding } from '../../binding/models/FactoryBinding';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { Writable } from '../../common/models/Writable';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { PlanBindingNode } from '../../planning/models/PlanBindingNode';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolve } from './resolve';
import { resolveConstantValueBinding } from './resolveConstantValueBinding';
import { resolveDynamicValueBinding } from './resolveDynamicValueBinding';
import { resolveFactoryBinding } from './resolveFactoryBinding';
import { resolveProviderBinding } from './resolveProviderBinding';
import { resolveScopedInstanceBindingNode } from './resolveScopedInstanceBindingNode';
import { resolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode';

describe(resolve.name, () => {
  let resolveScopedInstanceBindingNodeMock: jest.Mock<
    ReturnType<typeof resolveScopedInstanceBindingNode>
  >;
  let resolveServiceRedirectionBindingNodeMock: jest.Mock<
    ReturnType<typeof resolveServiceRedirectionBindingNode>
  >;

  beforeAll(() => {
    resolveScopedInstanceBindingNodeMock = resolveScopedInstanceBindingNode(
      jest.fn<
        (
          params: ResolutionParams,
          node: InstanceBindingNode,
        ) => unknown[] | Promise<unknown[]>
      >(),
    ) as jest.Mock<ReturnType<typeof resolveScopedInstanceBindingNode>>;
    resolveServiceRedirectionBindingNodeMock =
      resolveServiceRedirectionBindingNode(jest.fn()) as jest.Mock<
        ReturnType<typeof resolveServiceRedirectionBindingNode>
      >;
  });

  describe('having ResolutionParams with plan tree with root with no bindings', () => {
    let resolutionParamsFixture: ResolutionParams;

    beforeAll(() => {
      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: {
              bindings: undefined,
              parent: undefined,
              serviceIdentifier: 'service-id',
            },
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolve(resolutionParamsFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with empty array bindings', () => {
    let resolutionParamsFixture: ResolutionParams;

    beforeAll(() => {
      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: {
              bindings: [],
              parent: undefined,
              serviceIdentifier: 'service-id',
            },
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolve(resolutionParamsFixture);
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with constant value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ConstantValueBinding<unknown>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
        parent: serviceNode,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        (
          resolveConstantValueBinding as jest.Mock<
            typeof resolveConstantValueBinding
          >
        ).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveConstantValueBinding()', () => {
        expect(resolveConstantValueBinding).toHaveBeenCalledTimes(1);
        expect(resolveConstantValueBinding).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with constant value binding array', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ConstantValueBinding<unknown>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
        parent: serviceNode,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = [bindingNode];

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        (
          resolveConstantValueBinding as jest.Mock<
            typeof resolveConstantValueBinding
          >
        ).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveConstantValueBinding()', () => {
        expect(resolveConstantValueBinding).toHaveBeenCalledTimes(1);
        expect(resolveConstantValueBinding).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolveValue]);
      });
    });

    describe('when called, and resolveConstantValueBinding returns a Promise value', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(async () => {
        resolveValue = Symbol();

        (
          resolveConstantValueBinding as jest.Mock<
            typeof resolveConstantValueBinding
          >
        ).mockReturnValueOnce(Promise.resolve(resolveValue));

        result = await resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveConstantValueBinding()', () => {
        expect(resolveConstantValueBinding).toHaveBeenCalledTimes(1);
        expect(resolveConstantValueBinding).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolveValue]);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with dynamic value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: DynamicValueBinding<unknown>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.DynamicValue,
        value: () => Symbol(),
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
        parent: serviceNode,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        (
          resolveDynamicValueBinding as jest.Mock<
            typeof resolveDynamicValueBinding
          >
        ).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveDynamicValueBinding()', () => {
        expect(resolveDynamicValueBinding).toHaveBeenCalledTimes(1);
        expect(resolveDynamicValueBinding).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with factory value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: FactoryBinding<Factory<unknown>>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        factory: () => () => Symbol,
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Factory,
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
        parent: serviceNode,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: Factory<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveValue = () => Symbol();

        (
          resolveFactoryBinding as jest.Mock<typeof resolveFactoryBinding>
        ).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveFactoryBinding()', () => {
        expect(resolveFactoryBinding).toHaveBeenCalledTimes(1);
        expect(resolveFactoryBinding).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with instance binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingNodeFixture: InstanceBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: InstanceBinding<unknown> = {
        cache: {
          isRight: true,
          value: Symbol(),
        },
        id: 1,
        implementationType: class {},
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      };

      bindingNodeFixture = {
        binding: bindingFixture,
        classMetadata: Symbol() as unknown as ClassMetadata,
        constructorParams: [],
        parent: serviceNode,
        propertyParams: new Map(),
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNodeFixture;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        (
          resolveScopedInstanceBindingNodeMock as jest.Mock<
            typeof resolveScopedInstanceBindingNodeMock
          >
        ).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveInstanceBindingNode()', () => {
        expect(resolveScopedInstanceBindingNodeMock).toHaveBeenCalledTimes(1);
        expect(resolveScopedInstanceBindingNodeMock).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with root with provider value binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let bindingFixture: ProviderBinding<Provider<unknown>>;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        provider: () => async () => Symbol(),
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Provider,
      };

      const bindingNode: PlanBindingNode = {
        binding: bindingFixture,
        parent: serviceNode,
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = bindingNode;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called', () => {
      let resolveValue: Provider<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveValue = async () => Symbol();

        (
          resolveProviderBinding as jest.Mock<typeof resolveProviderBinding>
        ).mockReturnValueOnce(resolveValue);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveProviderBinding()', () => {
        expect(resolveProviderBinding).toHaveBeenCalledTimes(1);
        expect(resolveProviderBinding).toHaveBeenCalledWith(
          resolutionParamsFixture,
          bindingFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });
  });

  describe('having ResolutionParams with plan tree with service redirection root with service redirection binding', () => {
    let resolutionParamsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: ServiceRedirectionBinding<unknown> = {
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        serviceIdentifier: 'service-id',
        targetServiceIdentifier: 'target-service-id',
        type: bindingTypeValues.ServiceRedirection,
      };

      serviceRedirectionBindingNodeFixture = {
        binding: bindingFixture,
        parent: serviceNode,
        redirections: [],
      };

      (serviceNode as Writable<PlanServiceNode>).bindings =
        serviceRedirectionBindingNodeFixture;

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with a single element', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        resolveServiceRedirectionBindingNodeMock.mockReturnValueOnce([
          resolveValue,
        ]);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(resolveServiceRedirectionBindingNodeMock).toHaveBeenCalledTimes(
          1,
        );
        expect(resolveServiceRedirectionBindingNodeMock).toHaveBeenCalledWith(
          resolutionParamsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolveValue);
      });
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with no elements', () => {
      let result: unknown;

      beforeAll(() => {
        resolveServiceRedirectionBindingNodeMock.mockReturnValueOnce([]);

        try {
          resolve(resolutionParamsFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(resolveServiceRedirectionBindingNodeMock).toHaveBeenCalledTimes(
          1,
        );
        expect(resolveServiceRedirectionBindingNodeMock).toHaveBeenCalledWith(
          resolutionParamsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: 'Unexpected multiple resolved values on single injection',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having ResolutionParams with plan tree with service redirection root with service redirection binding array', () => {
    let resolutionParamsFixture: ResolutionParams;
    let serviceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;

    beforeAll(() => {
      const serviceNode: PlanServiceNode = {
        bindings: undefined,
        parent: undefined,
        serviceIdentifier: 'service-id',
      };

      const bindingFixture: ServiceRedirectionBinding<unknown> = {
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        serviceIdentifier: 'service-id',
        targetServiceIdentifier: 'target-service-id',
        type: bindingTypeValues.ServiceRedirection,
      };

      serviceRedirectionBindingNodeFixture = {
        binding: bindingFixture,
        parent: serviceNode,
        redirections: [],
      };

      (serviceNode as Writable<PlanServiceNode>).bindings = [
        serviceRedirectionBindingNodeFixture,
      ];

      resolutionParamsFixture = {
        planResult: {
          tree: {
            root: serviceNode,
          },
        },
      } as Partial<ResolutionParams> as ResolutionParams;
    });

    describe('when called, and resolveServiceRedirectionBindingNode() returns an array with a single element', () => {
      let resolveValue: unknown;

      let result: unknown;

      beforeAll(() => {
        resolveValue = Symbol();

        resolveServiceRedirectionBindingNodeMock.mockReturnValueOnce([
          resolveValue,
        ]);

        result = resolve(resolutionParamsFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call resolveServiceRedirectionBindingNode()', () => {
        expect(resolveServiceRedirectionBindingNodeMock).toHaveBeenCalledTimes(
          1,
        );
        expect(resolveServiceRedirectionBindingNodeMock).toHaveBeenCalledWith(
          resolutionParamsFixture,
          serviceRedirectionBindingNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([resolveValue]);
      });
    });
  });
});
