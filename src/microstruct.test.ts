import { expect, test } from '@jest/globals';
import {
  StructError,
  assert,
  is,
  validate,
  parse,
  any,
  array,
  bigint,
  boolean,
  date,
  enums,
  func,
  instance,
  integer,
  intersection,
  literal,
  map,
  never,
  nullable,
  number,
  object,
  optional,
  record,
  regexp,
  set,
  string,
  tuple,
  type,
  union,
  unknown,
  define,
} from './microstruct.js';

// https://docs.superstructjs.org/api-reference/core

test('`assert(value, struct)` asserts that `value` is valid according to a `struct`', () => {
  expect(() => assert(42, number())).not.toThrow();
  expect(() => assert('42', number())).toThrow(StructError);
  expect(() => assert('42', number(), "'42' is not a number")).toThrow(StructError);
  expect(() => assert('42', number(), "'42' is not a number")).toThrow("'42' is not a number");
});

test('`is(value, struct)` tests that `value` is valid, returning a boolean representing whether it is valid or not', () => {
  expect(is(42, number())).toBe(true);
  expect(is('42', number())).toBe(false);
});

test('`validate(value, struct)` validates `value`, returning a result tuple', () => {
  expect(validate(42, number())).toEqual([undefined, 42]);
  expect(validate('42', number())).toEqual([new StructError('42'), undefined]);
  expect(validate('42', number(), { message: "'42' is not a number" })).toEqual([
    new StructError('42', "'42' is not a number"),
    undefined,
  ]);
});

test('`parse(json, struct)` returns a typed value parsed from `json` if it is valid, otherwise `undefined`', () => {
  expect(
    parse('{"result": true, "count": 42}', object({ result: boolean(), count: number() })),
  ).toEqual({ result: true, count: 42 });
  expect(parse('{"result":true,"count":42}', object({ result: boolean(), count: string() }))).toBe(
    undefined,
  );
  expect(parse('{"result":true,"count":42', object({ result: boolean(), count: number() }))).toBe(
    undefined,
  );
});

// https://docs.superstructjs.org/api-reference/types

test('`any` structs accept any value as valid', () => {
  expect(is('valid', any())).toBe(true);
  expect(is(42, any())).toBe(true);
  expect(is(true, any())).toBe(true);
  expect(is(undefined, any())).toBe(true);
  expect(is(null, any())).toBe(true);
  expect(is({ also: 'valid' }, any())).toBe(true);
});

test('`array` structs accept a list of values of a specific type', () => {
  expect(is([1, 2, 3], array(number()))).toBe(true);
  expect(is([{ id: 1 }], array(object({ id: number() })))).toBe(true);
  expect(is('invalid', array(number()))).toBe(false);
  expect(is({ 0: 1, 1: 2, 2: 3 }, array(number()))).toBe(false);
  expect(is(['1', '2', '3'], array(number()))).toBe(false);
  expect(is([1, 2, '3'], array(number()))).toBe(false);
  // `array()`
  expect(is([], array())).toBe(true);
  expect(is([1, 2, 3], array())).toBe(true);
  expect(is([1, 2, '3'], array())).toBe(true);
  expect(is('invalid', array())).toBe(false);
});

test('`bigint` structs validate that a value is a bigint', () => {
  expect(is(42n, bigint())).toBe(true);
  expect(is(42, bigint())).toBe(false);
});

test('`boolean` structs accept the boolean values `true` and `false`', () => {
  expect(is(true, boolean())).toBe(true);
  expect(is(false, boolean())).toBe(true);
  expect(is('true', boolean())).toBe(false);
  expect(is(0, boolean())).toBe(false);
  expect(is({ also: 'invalid' }, boolean())).toBe(false);
  expect(is(new Boolean(true), boolean())).toBe(false);
});

test('`date` structs accept JavaScript `Date` instances', () => {
  expect(is(new Date(), date())).toBe(true);
  expect(is(new Date('2022-12-22'), date())).toBe(true);
  expect(is('2022-12-22', date())).toBe(false);
  // invalid date
  expect(is(new Date('invalid date'), date())).toBe(false);
});

test('`enums` structs validate that a value is one of a specific set of literals values', () => {
  expect(is('Jane', enums(['Jane', 'John', 'Jack', 'Jill']))).toBe(true);
  expect(is(42, enums([23, 42]))).toBe(true);
  expect(is('Joe', enums(['Jane', 'John', 'Jack', 'Jill']))).toBe(false);
  expect(is('23', enums([23, 42]))).toBe(false);
});

test('`func` structs validate that a value is a function', () => {
  expect(is(() => 42, func())).toBe(true);
  expect(is((x: number, y: number) => x + y, func())).toBe(true);
  expect(is(42, func())).toBe(false);
});

test('`instance` structs validate that a value is an instance of a particular class', () => {
  expect(is(new Date('2022-12-22'), instance(Date))).toBe(true);
  expect(is(/test/, instance(RegExp))).toBe(true);
  expect(is('2022-12-22', instance(Date))).toBe(false);
  expect(is('test', instance(RegExp))).toBe(false);
});

test('`integer` structs validate that a value is an integer', () => {
  expect(is(-7, integer())).toBe(true);
  expect(is(0, integer())).toBe(true);
  expect(is(42, integer())).toBe(true);
  expect(is('42', integer())).toBe(false);
  expect(is(3.14, integer())).toBe(false);
  expect(is(false, integer())).toBe(false);
  expect(is(new Number(42), integer())).toBe(false);
});

test('`intersection` structs validate that a value matches all of many structs', () => {
  expect(
    is(
      { a: 1, b: 2, c: 3 },
      intersection([type({ a: number(), b: number() }), type({ a: number(), c: number() })]),
    ),
  ).toBe(true);
  expect(
    is(
      { a: 1, b: 2 },
      intersection([type({ a: number(), b: number() }), type({ a: number(), c: number() })]),
    ),
  ).toBe(false);
});

test('`literal` structs enforce that a value matches an exact value using the `===` operator', () => {
  expect(is(42, literal(42))).toBe(true);
  expect(is('valid', literal('valid'))).toBe(true);
  expect(is(true, literal(true))).toBe(true);
  expect(is(23, literal(42))).toBe(false);
  expect(is('42', literal(42))).toBe(false);
  expect(is('invalid', literal('valid'))).toBe(false);
  expect(is(1, literal(true))).toBe(false);
});

test('`map` structs validate that a value is a `Map` object with specific types for its keys and values', () => {
  expect(
    is(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
      map(string(), number()),
    ),
  ).toBe(true);
  expect(is(new Map(), map(string(), number()))).toBe(true);
  expect(
    is(
      new Map([
        ['a', '1'],
        ['b', '2'],
      ]),
      map(string(), number()),
    ),
  ).toBe(false);
  expect(
    is(
      new Map([
        [1, 1],
        [2, 2],
      ]),
      map(string(), number()),
    ),
  ).toBe(false);
  expect(
    is(
      [
        ['a', 1],
        ['b', 2],
      ],
      map(string(), number()),
    ),
  ).toBe(false);
  // `map()`
  expect(
    is(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
      map(),
    ),
  ).toBe(true);
  expect(is(new Map(), map())).toBe(true);
  expect(
    is(
      [
        ['a', 1],
        ['b', 2],
      ],
      map(),
    ),
  ).toBe(false);
});

test('`never` structs will fail validation for every value', () => {
  expect(is(42, never())).toBe(false);
  expect(is(null, never())).toBe(false);
});

test('`number` structs validate that a value is a number', () => {
  expect(is(42, number())).toBe(true);
  expect(is(3.14, number())).toBe(true);
  expect(is(true, number())).toBe(false);
  expect(is('42', number())).toBe(false);
  // `Number.NaN`
  expect(is(Number.NaN, number())).toBe(false);
});

test('`nullable` structs validate that a value matches a specific struct, or that it is `null`', () => {
  expect(is('a string of text', nullable(string()))).toBe(true);
  expect(is(null, nullable(string()))).toBe(true);
  expect(is({ a: null }, object({ a: nullable(string()) }))).toBe(true);
  expect(is(23, nullable(string()))).toBe(false);
  expect(is(undefined, nullable(string()))).toBe(false);
  expect(is({}, object({ a: nullable(string()) }))).toBe(false);
});

test('`object` structs validate that a value is an object and that each of its properties match a specific type as well', () => {
  expect(is({ id: 1, name: 'Jane Smith' }, object({ id: number(), name: string() }))).toBe(true);
  expect(is({ 0: 1, 1: 2, 2: 3 }, object({ 0: number(), 1: number(), 2: number() }))).toBe(true);
  expect(is([1, 2, 3], object({ length: number(), 0: number(), 1: number(), 2: number() }))).toBe(
    true,
  );
  expect(is({ id: 1, name: 'Jane Smith' }, object({ id: number() }))).toBe(false);
  expect(is('id', object({ id: number(), name: string() }))).toBe(false);
  expect(is(1, object({ id: number(), name: string() }))).toBe(false);
  expect(is({ id: 1 }, object({ id: number(), name: string() }))).toBe(false);
  expect(is({ id: 1, name: false }, object({ id: number(), name: string() }))).toBe(false);
  // optional
  expect(is({ a: 23, b: 42 }, object({ a: optional(number()), b: optional(number()) }))).toBe(true);
  expect(is({ a: 23, b: 42 }, object({ a: number(), b: optional(number()) }))).toBe(true);
  expect(
    is({ a: 23, b: 42 }, object({ a: number(), b: optional(number()), c: optional(number()) })),
  ).toBe(true);
  expect(is({ a: 23, b: 42 }, object({ a: number(), b: number(), c: optional(number()) }))).toBe(
    true,
  );
  expect(is({}, object({ a: optional(number()) }))).toBe(true);
  expect(is({ a: 23, b: 42 }, object({ a: number(), b: optional(string()) }))).toBe(false);
  expect(is({ a: 23, b: 42 }, object({ a: number(), c: optional(number()) }))).toBe(false);
  expect(is({ a: 23 }, object({ b: optional(number()), c: optional(number()) }))).toBe(false);
  // `Object.prototype` properties
  expect(is({ a: 23 }, object({ a: number(), toString: func() }))).toBe(true);
  expect(is({ a: 23, toString: { b: 42 } }, object({ a: number() }))).toBe(false);
});

test('`optional` structs validate that a value matches a specific struct, or that it is `undefined`', () => {
  expect(is('a string of text', optional(string()))).toBe(true);
  expect(is(undefined, optional(string()))).toBe(true);
  expect(is({ a: 23, b: 42 }, object({ a: number(), b: optional(number()) }))).toBe(true);
  expect(is({ a: 23 }, object({ a: number(), b: optional(number()) }))).toBe(true);
  expect(is(23, optional(string()))).toBe(false);
  expect(is(null, optional(string()))).toBe(false);
  expect(is({ a: 23, b: '42' }, object({ a: number(), b: optional(number()) }))).toBe(false);
  expect(is({ a: 23, b: null }, object({ a: number(), b: optional(number()) }))).toBe(false);
});

test('`record` structs validate an object with specific types for its keys and values', () => {
  expect(is({ a: 1, b: 2 }, record(string(), number()))).toBe(true);
  expect(is('a', record(string(), number()))).toBe(false);
  expect(is(1, record(string(), number()))).toBe(false);
  expect(is({ a: 1, b: '2' }, record(string(), number()))).toBe(false);
});

test('`regexp` structs validate that a value is a `RegExp` object', () => {
  expect(is(/test/, regexp())).toBe(true);
  expect(is(/test/gi, regexp())).toBe(true);
  expect(is(new RegExp('test', 'gi'), regexp())).toBe(true);
  expect(is('/test/', regexp())).toBe(false);
});

test('`set` structs validate that a value is a `Set` instance with elements of a specific type', () => {
  expect(is(new Set([1, 2, 3]), set(number()))).toBe(true);
  expect(is(new Set(), set(number()))).toBe(true);
  expect(is(new Set([1, 2, '3']), set(number()))).toBe(false);
  expect(is([1, 2, 3], set(number()))).toBe(false);
  // `set()`
  expect(is(new Set([1, 2, 3]), set())).toBe(true);
  expect(is(new Set(), set())).toBe(true);
  expect(is(new Set([1, 2, '3']), set())).toBe(true);
  expect(is([1, 2, 3], set())).toBe(false);
});

test('`string` structs validate that a value is a string', () => {
  expect(is('a string of text', string())).toBe(true);
  expect(is('42', string())).toBe(true);
  expect(is(42, string())).toBe(false);
  expect(is(['a string of text'], string())).toBe(false);
});

test('`tuple` structs validate that a value is an array of a specific length with values each of a specific type', () => {
  expect(is(['a', 1, true], tuple([string(), number(), boolean()]))).toBe(true);
  expect(is([], tuple([]))).toBe(true);
  expect(is('a', tuple([string(), number(), boolean()]))).toBe(false);
  expect(is(1, tuple([string(), number(), boolean()]))).toBe(false);
  expect(is(['a', 1], tuple([string(), number(), boolean()]))).toBe(false);
  expect(is(['a', 1, true, []], tuple([string(), number(), boolean()]))).toBe(false);
  expect(is(['a'], tuple([]))).toBe(false);
  // optional
  expect(is(['a', 1], tuple([optional(string()), optional(number())]))).toBe(true);
  expect(is(['a', 1], tuple([string(), optional(number())]))).toBe(true);
  expect(is(['a', 1], tuple([string(), number(), optional(boolean())]))).toBe(true);
  expect(is(['a', 1], tuple([string(), optional(number()), optional(boolean())]))).toBe(true);
  expect(is([], tuple([optional(string())]))).toBe(true);
  expect(is(['a', 1], tuple([optional(number()), optional(number())]))).toBe(false);
  expect(is(['a', 1], tuple([string(), optional(string())]))).toBe(false);
});

test('`type` structs validate that a value has a set of properties on it, but it does not assert anything about unspecified properties', () => {
  expect(is({ id: 1, name: 'Jane Smith' }, type({ id: number(), name: string() }))).toBe(true);
  expect(is({ id: 1, name: 'Jane Smith' }, type({ id: number() }))).toBe(true);
  expect(is({ a: 23, b: 42 }, type({ a: number(), b: optional(number()) }))).toBe(true);
  expect(is({ a: 23 }, type({ a: number(), b: optional(number()) }))).toBe(true);
  expect(is({ id: 1 }, type({ id: number(), name: string() }))).toBe(false);
  expect(is({ id: 1, name: false }, type({ id: number(), name: string() }))).toBe(false);
  expect(is({ a: 23, b: '42' }, type({ a: number(), b: optional(number()) }))).toBe(false);
});

test('`union` structs validate that a value matches at least one of many types', () => {
  expect(is('a string', union([string(), number()]))).toBe(true);
  expect(is(42, union([string(), number()]))).toBe(true);
  expect(is(true, union([string(), number()]))).toBe(false);
  expect(is(['a string', 42], union([string(), number()]))).toBe(false);
});

test('`unknown` structs accept unknown value as valid without loosening its type to `any`', () => {
  expect(is('valid', unknown())).toBe(true);
  expect(is(42, unknown())).toBe(true);
  expect(is(true, unknown())).toBe(true);
  expect(is(undefined, unknown())).toBe(true);
  expect(is(null, unknown())).toBe(true);
  expect(is({ also: 'valid' }, unknown())).toBe(true);
});

test('`define(validator)` takes a validator function that returns either `true/false`, returning a custom type', () => {
  expect(
    is(
      42,
      define<number>(n => n === 42),
    ),
  ).toBe(true);
  expect(
    is(
      54,
      define<number>(n => n === 42),
    ),
  ).toBe(false);
});
