import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./buildFilteredServiceBindings');
jest.mock('./checkServiceNodeSingleInjectionBindings');

import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

import { BindingMetadataImplementation } from '../../binding/models/BindingMetadataImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ConstantValueBinding } from '../../binding/models/ConstantValueBinding';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { Writable } from '../../common/models/Writable';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata';
import { UnmanagedClassElementMetadata } from '../../metadata/models/UnmanagedClassElementMetadata';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParams } from '../models/PlanParams';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceNodeParent } from '../models/PlanServiceNodeParent';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { SubplanParams } from '../models/SubplanParams';
import {
  buildFilteredServiceBindings,
  BuildFilteredServiceBindingsOptions,
} from './buildFilteredServiceBindings';
import { checkServiceNodeSingleInjectionBindings } from './checkServiceNodeSingleInjectionBindings';
import { plan } from './plan';

describe(plan.name, () => {
  describe('having PlanParams with name and tag root constraint', () => {
    let planParamsMock: jest.Mocked<PlanParams>;

    beforeAll(() => {
      planParamsMock = {
        getBindings: jest.fn() as unknown,
        getClassMetadata: jest.fn() as unknown,
        rootConstraints: {
          isMultiple: true,
          name: 'name',
          serviceIdentifier: 'service-id',
          tag: {
            key: 'tag-key',
            value: 'tag-value',
          },
        },
        servicesBranch: new Set(),
      } as Partial<jest.Mocked<PlanParams>> as jest.Mocked<PlanParams>;
    });

    describe('when called, and params.getBindings() returns an array with a ConstantValueBinding', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([constantValueBinding]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        planServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: planServiceNode,
        });

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having PlanParams with isMultiple true root constraint', () => {
    let planParamsMock: jest.Mocked<PlanParams>;

    beforeAll(() => {
      planParamsMock = {
        getBindings: jest.fn() as unknown,
        getClassMetadata: jest.fn() as unknown,
        rootConstraints: {
          isMultiple: true,
          serviceIdentifier: 'service-id',
        },
        servicesBranch: new Set(),
        setBinding: jest.fn() as unknown,
      } as Partial<jest.Mocked<PlanParams>> as jest.Mocked<PlanParams>;
    });

    describe('when called, and params.getBindings() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const expected: PlanResult = {
          tree: {
            root: {
              bindings: [],
              parent: undefined,
              serviceIdentifier:
                planParamsMock.rootConstraints.serviceIdentifier,
            },
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ConstantValueBinding', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([constantValueBinding]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        planServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: planServiceNode,
        });

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single InstanceBinding with empty class metadata', () => {
      let classMetadataFixture: ClassMetadata;
      let instanceBindingFixture: InstanceBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        classMetadataFixture = ClassMetadataFixtures.any;
        instanceBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          implementationType: class {},
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([instanceBindingFixture]);

        planParamsMock.getClassMetadata.mockReturnValueOnce(
          classMetadataFixture,
        );

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const instanceBindingNode: InstanceBindingNode = {
          binding: instanceBindingFixture,
          classMetadata: classMetadataFixture,
          constructorParams: [],
          parent: planServiceNode,
          propertyParams: new Map(),
        };

        planServiceNodeBindings.push(instanceBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single InstanceBinding with non empty class metadata with multiple injection', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let constructorArgumentMetadata: ManagedClassElementMetadata;
      let propertyMetadata: ManagedClassElementMetadata;
      let propertyKey: string;
      let classMetadataFixture: ClassMetadata;
      let instanceBindingFixture: InstanceBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };
        constructorArgumentMetadata = {
          kind: ClassElementMetadataKind.multipleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: 'constructor-param-service-id',
        };
        propertyKey = 'property-key';
        propertyMetadata = {
          kind: ClassElementMetadataKind.multipleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: 'property-param-service-id',
        };
        classMetadataFixture = {
          constructorArguments: [constructorArgumentMetadata],
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          properties: new Map([[propertyKey, propertyMetadata]]),
          scope: undefined,
        };
        instanceBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          implementationType: class {},
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([instanceBindingFixture])
          .mockReturnValueOnce([constantValueBinding])
          .mockReturnValueOnce([constantValueBinding]);

        planParamsMock.getClassMetadata.mockReturnValueOnce(
          classMetadataFixture,
        );

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedSublan: jest.Mocked<SubplanParams> = {
          autobindOptions: planParamsMock.autobindOptions,
          getBindings: planParamsMock.getBindings,
          getClassMetadata: planParamsMock.getClassMetadata,
          node: expect.any(
            Object,
          ) as unknown as jest.Mocked<PlanServiceNodeParent>,
          servicesBranch: expect.any(Set) as unknown as jest.Mocked<
            Set<ServiceIdentifier>
          >,
          setBinding: planParamsMock.setBinding,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(3);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          3,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const instanceBindingNode: InstanceBindingNode = {
          binding: instanceBindingFixture,
          classMetadata: classMetadataFixture,
          constructorParams: [],
          parent: planServiceNode,
          propertyParams: new Map(),
        };

        const constructorParamsPlanServiceNodeBindings: PlanBindingNode[] = [];

        const constructorParamsPlanServiceNode: PlanServiceNode = {
          bindings: constructorParamsPlanServiceNodeBindings,
          parent: instanceBindingNode,
          serviceIdentifier:
            constructorArgumentMetadata.value as ServiceIdentifier,
        };

        constructorParamsPlanServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: constructorParamsPlanServiceNode,
        });

        const propertyParamsPlanServiceNodeBindings: PlanBindingNode[] = [];

        const propertyParamsPlanServiceNode: PlanServiceNode = {
          bindings: propertyParamsPlanServiceNodeBindings,
          parent: instanceBindingNode,
          serviceIdentifier: propertyMetadata.value as ServiceIdentifier,
        };

        propertyParamsPlanServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: propertyParamsPlanServiceNode,
        });

        instanceBindingNode.constructorParams.push(
          constructorParamsPlanServiceNode,
        );

        instanceBindingNode.propertyParams.set(
          propertyKey,
          propertyParamsPlanServiceNode,
        );

        planServiceNodeBindings.push(instanceBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single InstanceBinding with non empty class metadata with lazy multiple injection', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let constructorArgumentMetadata: ManagedClassElementMetadata;
      let propertyMetadata: ManagedClassElementMetadata;
      let propertyKey: string;
      let classMetadataFixture: ClassMetadata;
      let instanceBindingFixture: InstanceBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };
        constructorArgumentMetadata = {
          kind: ClassElementMetadataKind.multipleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: new LazyServiceIdentifier(
            () => 'constructor-param-service-id',
          ),
        };
        propertyKey = 'property-key';
        propertyMetadata = {
          kind: ClassElementMetadataKind.multipleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: new LazyServiceIdentifier(() => 'property-param-service-id'),
        };
        classMetadataFixture = {
          constructorArguments: [constructorArgumentMetadata],
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          properties: new Map([[propertyKey, propertyMetadata]]),
          scope: undefined,
        };
        instanceBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          implementationType: class {},
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([instanceBindingFixture])
          .mockReturnValueOnce([constantValueBinding])
          .mockReturnValueOnce([constantValueBinding]);

        planParamsMock.getClassMetadata.mockReturnValueOnce(
          classMetadataFixture,
        );

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedSublan: jest.Mocked<SubplanParams> = {
          autobindOptions: planParamsMock.autobindOptions,
          getBindings: planParamsMock.getBindings,
          getClassMetadata: planParamsMock.getClassMetadata,
          node: expect.any(
            Object,
          ) as unknown as jest.Mocked<PlanServiceNodeParent>,
          servicesBranch: expect.any(Set) as unknown as jest.Mocked<
            Set<ServiceIdentifier>
          >,
          setBinding: planParamsMock.setBinding,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(3);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          3,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const instanceBindingNode: InstanceBindingNode = {
          binding: instanceBindingFixture,
          classMetadata: classMetadataFixture,
          constructorParams: [],
          parent: planServiceNode,
          propertyParams: new Map(),
        };

        const constructorParamsPlanServiceNodeBindings: PlanBindingNode[] = [];

        const constructorParamsPlanServiceNode: PlanServiceNode = {
          bindings: constructorParamsPlanServiceNodeBindings,
          parent: instanceBindingNode,
          serviceIdentifier: (
            constructorArgumentMetadata.value as LazyServiceIdentifier
          ).unwrap(),
        };

        constructorParamsPlanServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: constructorParamsPlanServiceNode,
        });

        const propertyParamsPlanServiceNodeBindings: PlanBindingNode[] = [];

        const propertyParamsPlanServiceNode: PlanServiceNode = {
          bindings: propertyParamsPlanServiceNodeBindings,
          parent: instanceBindingNode,
          serviceIdentifier: (
            propertyMetadata.value as LazyServiceIdentifier
          ).unwrap(),
        };

        propertyParamsPlanServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: propertyParamsPlanServiceNode,
        });

        instanceBindingNode.constructorParams.push(
          constructorParamsPlanServiceNode,
        );

        instanceBindingNode.propertyParams.set(
          propertyKey,
          propertyParamsPlanServiceNode,
        );

        planServiceNodeBindings.push(instanceBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single InstanceBinding with non empty class metadata with single injection', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let constructorArgumentMetadata: ManagedClassElementMetadata;
      let propertyMetadata: ManagedClassElementMetadata;
      let propertyKey: string;
      let classMetadataFixture: ClassMetadata;
      let instanceBindingFixture: InstanceBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };
        constructorArgumentMetadata = {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: 'constructor-param-service-id',
        };
        propertyKey = 'property-key';
        propertyMetadata = {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: 'property-param-service-id',
        };
        classMetadataFixture = {
          constructorArguments: [constructorArgumentMetadata],
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          properties: new Map([[propertyKey, propertyMetadata]]),
          scope: undefined,
        };
        instanceBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          implementationType: class {},
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([instanceBindingFixture])
          .mockReturnValueOnce([constantValueBinding])
          .mockReturnValueOnce([constantValueBinding]);

        planParamsMock.getClassMetadata.mockReturnValueOnce(
          classMetadataFixture,
        );

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedSublan: jest.Mocked<SubplanParams> = {
          autobindOptions: planParamsMock.autobindOptions,
          getBindings: planParamsMock.getBindings,
          getClassMetadata: planParamsMock.getClassMetadata,
          node: expect.any(
            Object,
          ) as unknown as jest.Mocked<PlanServiceNodeParent>,
          servicesBranch: expect.any(Set) as unknown as jest.Mocked<
            Set<ServiceIdentifier>
          >,
          setBinding: planParamsMock.setBinding,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(3);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          3,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should call checkServiceNodeSingleInjectionBindings()', () => {
        const constructorParamsPlanServiceNode: PlanServiceNode = {
          bindings: expect.any(Object) as unknown as PlanBindingNode,
          parent: expect.any(Object) as unknown as PlanServiceNodeParent,
          serviceIdentifier:
            constructorArgumentMetadata.value as ServiceIdentifier,
        };

        const propertyParamsPlanServiceNode: PlanServiceNode = {
          bindings: expect.any(Object) as unknown as PlanBindingNode,
          parent: expect.any(Object) as unknown as PlanServiceNodeParent,
          serviceIdentifier: propertyMetadata.value as ServiceIdentifier,
        };

        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenCalledTimes(
          2,
        );
        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenNthCalledWith(
          1,
          constructorParamsPlanServiceNode,
          constructorArgumentMetadata.optional,
          expect.any(BindingMetadataImplementation),
        );
        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenNthCalledWith(
          2,
          propertyParamsPlanServiceNode,
          propertyMetadata.optional,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const instanceBindingNode: InstanceBindingNode = {
          binding: instanceBindingFixture,
          classMetadata: classMetadataFixture,
          constructorParams: [],
          parent: planServiceNode,
          propertyParams: new Map(),
        };

        const constructorParamsPlanServiceNode: PlanServiceNode = {
          bindings: undefined,
          parent: instanceBindingNode,
          serviceIdentifier:
            constructorArgumentMetadata.value as ServiceIdentifier,
        };

        (
          constructorParamsPlanServiceNode as Writable<PlanServiceNode>
        ).bindings = {
          binding: constantValueBinding,
          parent: constructorParamsPlanServiceNode,
        };

        const propertyParamsPlanServiceNode: PlanServiceNode = {
          bindings: undefined,
          parent: instanceBindingNode,
          serviceIdentifier: propertyMetadata.value as ServiceIdentifier,
        };

        (propertyParamsPlanServiceNode as Writable<PlanServiceNode>).bindings =
          {
            binding: constantValueBinding,
            parent: propertyParamsPlanServiceNode,
          };

        instanceBindingNode.constructorParams.push(
          constructorParamsPlanServiceNode,
        );

        instanceBindingNode.propertyParams.set(
          propertyKey,
          propertyParamsPlanServiceNode,
        );

        planServiceNodeBindings.push(instanceBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single InstanceBinding with non empty class metadata with unmanaged injection', () => {
      let constructorArgumentMetadata: UnmanagedClassElementMetadata;
      let propertyArgumentMetadata: UnmanagedClassElementMetadata;
      let propertyKey: string;
      let classMetadataFixture: ClassMetadata;
      let instanceBindingFixture: InstanceBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constructorArgumentMetadata = {
          kind: ClassElementMetadataKind.unmanaged,
        };
        propertyKey = 'property-key';
        propertyArgumentMetadata = {
          kind: ClassElementMetadataKind.unmanaged,
        };
        classMetadataFixture = {
          constructorArguments: [constructorArgumentMetadata],
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          properties: new Map([[propertyKey, propertyArgumentMetadata]]),
          scope: undefined,
        };
        instanceBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          implementationType: class {},
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([instanceBindingFixture]);

        planParamsMock.getClassMetadata.mockReturnValueOnce(
          classMetadataFixture,
        );

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const instanceBindingNode: InstanceBindingNode = {
          binding: instanceBindingFixture,
          classMetadata: classMetadataFixture,
          constructorParams: [undefined],
          parent: planServiceNode,
          propertyParams: new Map(),
        };

        planServiceNodeBindings.push(instanceBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ResolvedValueBinding with empty metadata', () => {
      let resolvedValueBindingFixture: jest.Mocked<
        ResolvedValueBinding<unknown>
      >;
      let result: unknown;

      beforeAll(() => {
        resolvedValueBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          factory: jest.fn(),
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          metadata: {
            arguments: [],
          },
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ResolvedValue,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([resolvedValueBindingFixture]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const instanceBindingNode: ResolvedValueBindingNode = {
          binding: resolvedValueBindingFixture,
          params: [],
          parent: planServiceNode,
        };

        planServiceNodeBindings.push(instanceBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ResolvedValueBinding with non empty metadata with multiple injection', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let resolvedValueElementMetadataFixture: ResolvedValueElementMetadata;
      let resolvedValueMetadataFixture: ResolvedValueMetadata;
      let resolvedValueBindingFixture: ResolvedValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };
        resolvedValueElementMetadataFixture = {
          kind: ResolvedValueElementMetadataKind.multipleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: 'param-service-id',
        };
        resolvedValueMetadataFixture = {
          arguments: [resolvedValueElementMetadataFixture],
        };
        resolvedValueBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          factory: jest.fn(),
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          metadata: resolvedValueMetadataFixture,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ResolvedValue,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([resolvedValueBindingFixture])
          .mockReturnValueOnce([constantValueBinding]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedSublan: jest.Mocked<SubplanParams> = {
          autobindOptions: planParamsMock.autobindOptions,
          getBindings: planParamsMock.getBindings,
          getClassMetadata: planParamsMock.getClassMetadata,
          node: expect.any(
            Object,
          ) as unknown as jest.Mocked<PlanServiceNodeParent>,
          servicesBranch: expect.any(Set) as unknown as jest.Mocked<
            Set<ServiceIdentifier>
          >,
          setBinding: planParamsMock.setBinding,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(2);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const resolvedValueBindingNode: ResolvedValueBindingNode = {
          binding: resolvedValueBindingFixture,
          params: [],
          parent: planServiceNode,
        };

        const paramsPlanServiceNodeBindings: PlanBindingNode[] = [];

        const paramsPlanServiceNode: PlanServiceNode = {
          bindings: paramsPlanServiceNodeBindings,
          parent: resolvedValueBindingNode,
          serviceIdentifier:
            resolvedValueElementMetadataFixture.value as ServiceIdentifier,
        };

        paramsPlanServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: paramsPlanServiceNode,
        });

        resolvedValueBindingNode.params.push(paramsPlanServiceNode);

        planServiceNodeBindings.push(resolvedValueBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ResolvedValueBinding with non empty metadata with lazy multiple injection', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let resolvedValueElementMetadataFixture: ResolvedValueElementMetadata;
      let resolvedValueMetadataFixture: ResolvedValueMetadata;
      let resolvedValueBindingFixture: ResolvedValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };
        resolvedValueElementMetadataFixture = {
          kind: ResolvedValueElementMetadataKind.multipleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: new LazyServiceIdentifier(() => 'param-service-id'),
        };
        resolvedValueMetadataFixture = {
          arguments: [resolvedValueElementMetadataFixture],
        };
        resolvedValueBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          factory: jest.fn(),
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          metadata: resolvedValueMetadataFixture,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ResolvedValue,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([resolvedValueBindingFixture])
          .mockReturnValueOnce([constantValueBinding]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedSublan: jest.Mocked<SubplanParams> = {
          autobindOptions: planParamsMock.autobindOptions,
          getBindings: planParamsMock.getBindings,
          getClassMetadata: planParamsMock.getClassMetadata,
          node: expect.any(
            Object,
          ) as unknown as jest.Mocked<PlanServiceNodeParent>,
          servicesBranch: expect.any(Set) as unknown as jest.Mocked<
            Set<ServiceIdentifier>
          >,
          setBinding: planParamsMock.setBinding,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(2);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const resolvedValueBindingNode: ResolvedValueBindingNode = {
          binding: resolvedValueBindingFixture,
          params: [],
          parent: planServiceNode,
        };

        const paramsPlanServiceNodeBindings: PlanBindingNode[] = [];

        const paramsPlanServiceNode: PlanServiceNode = {
          bindings: paramsPlanServiceNodeBindings,
          parent: resolvedValueBindingNode,
          serviceIdentifier: (
            resolvedValueElementMetadataFixture.value as LazyServiceIdentifier
          ).unwrap(),
        };

        paramsPlanServiceNodeBindings.push({
          binding: constantValueBinding,
          parent: paramsPlanServiceNode,
        });

        resolvedValueBindingNode.params.push(paramsPlanServiceNode);

        planServiceNodeBindings.push(resolvedValueBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ResolvedValueBinding with non empty metadata with single injection', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let resolvedValueElementMetadataFixture: ResolvedValueElementMetadata;
      let resolvedValueMetadataFixture: ResolvedValueMetadata;
      let resolvedValueBindingFixture: ResolvedValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };
        resolvedValueElementMetadataFixture = {
          kind: ResolvedValueElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          value: 'param-service-id',
        };
        resolvedValueMetadataFixture = {
          arguments: [resolvedValueElementMetadataFixture],
        };
        resolvedValueBindingFixture = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          factory: jest.fn(),
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          metadata: resolvedValueMetadataFixture,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          type: bindingTypeValues.ResolvedValue,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([resolvedValueBindingFixture])
          .mockReturnValueOnce([constantValueBinding]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedSublan: jest.Mocked<SubplanParams> = {
          autobindOptions: planParamsMock.autobindOptions,
          getBindings: planParamsMock.getBindings,
          getClassMetadata: planParamsMock.getClassMetadata,
          node: expect.any(
            Object,
          ) as unknown as jest.Mocked<PlanServiceNodeParent>,
          servicesBranch: expect.any(Set) as unknown as jest.Mocked<
            Set<ServiceIdentifier>
          >,
          setBinding: planParamsMock.setBinding,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(2);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          expectedSublan,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const resolvedValueBindingNode: ResolvedValueBindingNode = {
          binding: resolvedValueBindingFixture,
          params: [],
          parent: planServiceNode,
        };

        const paramsPlanServiceNode: PlanServiceNode = {
          bindings: undefined,
          parent: resolvedValueBindingNode,
          serviceIdentifier:
            resolvedValueElementMetadataFixture.value as ServiceIdentifier,
        };

        (paramsPlanServiceNode as Writable<PlanServiceNode>).bindings = {
          binding: constantValueBinding,
          parent: paramsPlanServiceNode,
        };

        resolvedValueBindingNode.params.push(paramsPlanServiceNode);

        planServiceNodeBindings.push(resolvedValueBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ServiceRedirectionBinding with non existing target', () => {
      let serviceRedirectionBinding: ServiceRedirectionBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        serviceRedirectionBinding = {
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          targetServiceIdentifier: 'target-service-id',
          type: bindingTypeValues.ServiceRedirection,
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([serviceRedirectionBinding])
          .mockReturnValueOnce([]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedOptions: BuildFilteredServiceBindingsOptions = {
          customServiceIdentifier:
            serviceRedirectionBinding.targetServiceIdentifier,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(2);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
          expectedOptions,
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const serviceRedirectionBindingNode: PlanServiceRedirectionBindingNode =
          {
            binding: serviceRedirectionBinding,
            parent: planServiceNode,
            redirections: [],
          };

        serviceRedirectionBindingNode.redirections.push();

        planServiceNodeBindings.push(serviceRedirectionBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and params.getBindings() returns an array with a single ServiceRedirectionBinding with existing target', () => {
      let constantValueBinding: ConstantValueBinding<unknown>;
      let serviceRedirectionBinding: ServiceRedirectionBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        serviceRedirectionBinding = {
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
          targetServiceIdentifier: 'target-service-id',
          type: bindingTypeValues.ServiceRedirection,
        };

        constantValueBinding = {
          cache: {
            isRight: true,
            value: Symbol(),
          },
          id: 1,
          isSatisfiedBy: jest.fn(() => true),
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: serviceRedirectionBinding.targetServiceIdentifier,
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };

        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        )
          .mockReturnValueOnce([serviceRedirectionBinding])
          .mockReturnValueOnce([constantValueBinding]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedOptions: BuildFilteredServiceBindingsOptions = {
          customServiceIdentifier:
            serviceRedirectionBinding.targetServiceIdentifier,
        };

        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(2);
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          1,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
        expect(buildFilteredServiceBindings).toHaveBeenNthCalledWith(
          2,
          planParamsMock,
          expect.any(BindingMetadataImplementation),
          expectedOptions,
        );
      });

      it('should return expected PlanResult', () => {
        const planServiceNodeBindings: PlanBindingNode[] = [];

        const planServiceNode: PlanServiceNode = {
          bindings: planServiceNodeBindings,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        const expected: PlanResult = {
          tree: {
            root: planServiceNode,
          },
        };

        const serviceRedirectionBindingNode: PlanServiceRedirectionBindingNode =
          {
            binding: serviceRedirectionBinding,
            parent: planServiceNode,
            redirections: [],
          };

        serviceRedirectionBindingNode.redirections.push({
          binding: constantValueBinding,
          parent: serviceRedirectionBindingNode,
        });

        planServiceNodeBindings.push(serviceRedirectionBindingNode);

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having PlanParams with isMultiple false root constraint', () => {
    let planParamsMock: jest.Mocked<PlanParams>;

    beforeAll(() => {
      planParamsMock = {
        getBindings: jest.fn(),
        getClassMetadata: jest.fn(),
        rootConstraints: {
          isMultiple: false,
          serviceIdentifier: 'service-id',
        },
        servicesBranch: new Set(),
      } as Partial<PlanParams> as jest.Mocked<PlanParams>;
    });

    describe('when called, and params.getBindings() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        (
          buildFilteredServiceBindings as jest.Mock<
            typeof buildFilteredServiceBindings
          >
        ).mockReturnValueOnce([]);

        result = plan(planParamsMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledTimes(1);
        expect(buildFilteredServiceBindings).toHaveBeenCalledWith(
          planParamsMock,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should call checkServiceNodeSingleInjectionBindings()', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: undefined,
          parent: undefined,
          serviceIdentifier: planParamsMock.rootConstraints.serviceIdentifier,
        };

        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenCalledTimes(
          1,
        );
        expect(checkServiceNodeSingleInjectionBindings).toHaveBeenCalledWith(
          expectedServiceNode,
          false,
          expect.any(BindingMetadataImplementation),
        );
      });

      it('should return expected PlanResult', () => {
        const expected: PlanResult = {
          tree: {
            root: {
              bindings: undefined,
              parent: undefined,
              serviceIdentifier:
                planParamsMock.rootConstraints.serviceIdentifier,
            },
          },
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
