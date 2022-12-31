import {
  Struct,
  is,
  parse,
  any,
  array,
  boolean,
  enums,
  integer,
  intersection,
  literal,
  never,
  nullable,
  number,
  object,
  optional,
  record,
  string,
  tuple,
  type,
  union,
  unknown,
  define,
} from '..';

// ref: https://docs.superstructjs.org/api-reference/types

function testValid<T, V extends T>(value: V, struct: Struct<T>): void {
  expect(is(value, struct)).toBe(true);
}

function testInvalid<T>(value: unknown, struct: Struct<T>): void {
  expect(is(value, struct)).toBe(false);
}

test('any structs accept any value as valid', () => {
  testValid('valid', any());
  testValid(42, any());
  testValid(true, any());
  testValid(undefined, any());
  testValid(null, any());
  testValid({ also: 'valid' }, any());
});

test('array structs accept a list of values of a specific type', () => {
  testValid([1, 2, 3], array(number()));
  testValid([{ id: 1 }], array(object({ id: number() })));
  testInvalid('invalid', array(number()));
  testInvalid({ 0: 1, 1: 2, 2: 3 }, array(number()));
  testInvalid(['1', '2', '3'], array(number()));
  testInvalid([1, 2, '3'], array(number()));
});

test('boolean structs accept the boolean values true and false', () => {
  testValid(true, boolean());
  testValid(false, boolean());
  testInvalid('true', boolean());
  testInvalid(0, boolean());
  testInvalid({ also: 'invalid' }, boolean());
  testInvalid(new Boolean(true), boolean());
});

test('enums structs validate that a value is one of a specific set of literals values', () => {
  testValid('Jane', enums(['Jane', 'John', 'Jack', 'Jill']));
  testValid(42, enums([23, 42]));
  testInvalid('Joe', enums(['Jane', 'John', 'Jack', 'Jill']));
  testInvalid('23', enums([23, 42]));
});

test('integer structs validate that a value is an integer', () => {
  testValid(-7, integer());
  testValid(0, integer());
  testValid(42, integer());
  testInvalid('42', integer());
  testInvalid(3.14, integer());
  testInvalid(false, integer());
  testInvalid(new Number(42), integer());
});

test('intersection structs validate that a value matches all of many structs. It takes existing struct objects as arguments', () => {
  testValid(
    { a: 1, b: 2, c: 3 },
    intersection([type({ a: number(), b: number() }), type({ a: number(), c: number() })]),
  );
  testValid({ a: 1, b: 2, c: 3 }, intersection([]));
  testInvalid(
    { a: 1, b: 2 },
    intersection([type({ a: number(), b: number() }), type({ a: number(), c: number() })]),
  );
});

test('literal structs enforce that a value matches an exact value using the === operator', () => {
  testValid(42, literal(42));
  testValid('valid', literal('valid'));
  testValid(true, literal(true));
  testInvalid(23, literal(42));
  testInvalid('42', literal(42));
  testInvalid('invalid', literal('valid'));
  testInvalid(1, literal(true));
});

test('never structs will fail validation for every value', () => {
  testInvalid(42, never());
  testInvalid(null, never());
});

test('nullable structs validate that a value matches a specific struct, or that it is null', () => {
  testValid('a string of text', nullable(string()));
  testValid(null, nullable(string()));
  testValid({ a: null }, object({ a: nullable(string()) }));
  testInvalid(23, nullable(string()));
  testInvalid(undefined, nullable(string()));
  testInvalid({}, object({ a: nullable(string()) }));
});

test('object structs validate that a value is an object and that each of its properties match a specific type as well', () => {
  testValid({ id: 1, name: 'Jane Smith' }, object({ id: number(), name: string() }));
  testValid({ 0: 1, 1: 2, 2: 3 }, object({ 0: number(), 1: number(), 2: number() }));
  testValid([1, 2, 3], object({ length: number(), 0: number(), 1: number(), 2: number() }));
  testInvalid({ id: 1, name: 'Jane Smith' }, object({ id: number() }));
  testInvalid('id', object({ id: number(), name: string() }));
  testInvalid(1, object({ id: number(), name: string() }));
  testInvalid({ id: 1 }, object({ id: number(), name: string() }));
  testInvalid({ id: 1, name: false }, object({ id: number(), name: string() }));
});

test('optional structs validate that a value matches a specific struct, or that it is undefined', () => {
  testValid('a string of text', optional(string()));
  testValid(undefined, optional(string()));
  testValid({ a: 23, b: 42 }, object({ a: number(), b: optional(number()) }));
  testValid({ a: 23 }, object({ a: number(), b: optional(number()) }));
  testInvalid(23, optional(string()));
  testInvalid(null, optional(string()));
  testInvalid({ a: 23, b: '42' }, object({ a: number(), b: optional(number()) }));
  testInvalid({ a: 23, b: null }, object({ a: number(), b: optional(number()) }));
});

test('record structs validate an object with specific types for its keys and values', () => {
  testValid({ a: 1, b: 2 }, record(string(), number()));
  testInvalid('a', record(string(), number()));
  testInvalid(1, record(string(), number()));
  testInvalid({ a: 1, b: '2' }, record(string(), number()));
});

test('string structs validate that a value is a string', () => {
  testValid('a string of text', string());
  testValid('42', string());
  testInvalid(42, string());
  testInvalid(['a string of text'], string());
});

test('tuple structs validate that a value is an array of a specific length with values each of a specific type', () => {
  testValid(['a', 1, true], tuple([string(), number(), boolean()]));
  testValid([], tuple([]));
  testInvalid('a', tuple([string(), number(), boolean()]));
  testInvalid(1, tuple([string(), number(), boolean()]));
  testInvalid(['a', 1], tuple([string(), number(), boolean()]));
  testInvalid(['a', 1, true, []], tuple([string(), number(), boolean()]));
  testInvalid(['a'], tuple([]));
});

test('type structs validate that a value has a set of properties on it, but it does not assert anything about unspecified properties', () => {
  testValid({ id: 1, name: 'Jane Smith' }, type({ id: number(), name: string() }));
  testValid({ id: 1, name: 'Jane Smith' }, type({ id: number() }));
  testValid({ a: 23, b: 42 }, type({ a: number(), b: optional(number()) }));
  testValid({ a: 23 }, type({ a: number(), b: optional(number()) }));
  testInvalid({ id: 1 }, type({ id: number(), name: string() }));
  testInvalid({ id: 1, name: false }, type({ id: number(), name: string() }));
  testInvalid({ a: 23, b: '42' }, type({ a: number(), b: optional(number()) }));
});

test('union structs validate that a value matches at least one of many types', () => {
  testValid('a string', union([string(), number()]));
  testValid(42, union([string(), number()]));
  testInvalid(true, union([string(), number()]));
  testInvalid(['a string', 42], union([string(), number()]));
  intersection([]);
});

test('unknown structs accept unknown value as valid without loosening its type to any', () => {
  testValid('valid', unknown());
  testValid(42, unknown());
  testValid(true, unknown());
  testValid(undefined, unknown());
  testValid(null, unknown());
  testValid({ also: 'valid' }, unknown());
});

test('define structs take validator functions that return either true/false', () => {
  testValid(
    42,
    define<number>(n => n === 42),
  );
  testInvalid(
    54,
    define<number>(n => n === 42),
  );
});

function testValidJSON<T>(json: string, s: Struct<T>): void {
  expect(parse(json, s)).toEqual(JSON.parse(json));
}

function testInvalidJSON<T>(json: string, s: Struct<T>): void {
  expect(parse(json, s)).toBe(undefined);
}

test('parse() returns a typed value parsed from a JSON string if it is valid', () => {
  testValidJSON('{"result":true, "count":42}', object({ result: boolean(), count: number() }));
  testInvalidJSON('{"result":true, "count":42}', object({ result: boolean(), count: string() }));
  testInvalidJSON('{"result":true, "count":42', object({ result: boolean(), count: number() }));
});
