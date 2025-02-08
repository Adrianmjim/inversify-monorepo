import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { BindingConstraints } from '@inversifyjs/core';

jest.mock('./isAnyAncestorBindingConstraints');

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints';

describe(isNoAncestorBindingConstraints.name, () => {
  let conditionMock: jest.Mock<(constraints: BindingConstraints) => boolean>;
  let isAnyAncestorBindingConstraintsConstraintMock: jest.Mock<
    (constraints: BindingConstraints) => boolean
  >;

  beforeAll(() => {
    conditionMock = jest.fn();
    isAnyAncestorBindingConstraintsConstraintMock = jest.fn();
    (
      isAnyAncestorBindingConstraints as jest.Mock<
        typeof isAnyAncestorBindingConstraints
      >
    ).mockReturnValue(isAnyAncestorBindingConstraintsConstraintMock);
  });

  describe('when called, and isAnyAncestorBindingConstraints() returns true', () => {
    let constraintsFixture: BindingConstraints;
    let result: boolean;

    beforeAll(() => {
      constraintsFixture = Symbol() as unknown as BindingConstraints;
      isAnyAncestorBindingConstraintsConstraintMock.mockReturnValueOnce(true);

      result =
        isNoAncestorBindingConstraints(conditionMock)(constraintsFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call isAnyAncestorBindingConstraints()', () => {
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledWith(
        conditionMock,
      );
    });

    it('should call isAnyAncestorBindingConstraintsConstraint()', () => {
      expect(
        isAnyAncestorBindingConstraintsConstraintMock,
      ).toHaveBeenCalledTimes(1);
      expect(
        isAnyAncestorBindingConstraintsConstraintMock,
      ).toHaveBeenCalledWith(constraintsFixture);
    });

    it('should return false', () => {
      expect(result).toBe(false);
    });
  });

  describe('when called, and isAnyAncestorBindingConstraints() returns false', () => {
    let constraintsFixture: BindingConstraints;
    let result: boolean;

    beforeAll(() => {
      constraintsFixture = {} as BindingConstraints;
      isAnyAncestorBindingConstraintsConstraintMock.mockReturnValueOnce(false);

      result =
        isNoAncestorBindingConstraints(conditionMock)(constraintsFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call isAnyAncestorBindingConstraints()', () => {
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledWith(
        conditionMock,
      );
    });

    it('should call isAnyAncestorBindingConstraintsConstraint()', () => {
      expect(
        isAnyAncestorBindingConstraintsConstraintMock,
      ).toHaveBeenCalledTimes(1);
      expect(
        isAnyAncestorBindingConstraintsConstraintMock,
      ).toHaveBeenCalledWith(constraintsFixture);
    });

    it('should return true', () => {
      expect(result).toBe(true);
    });
  });
});
