# Microstruct

Less than 500B (gzipped) subset of [Superstruct](https://github.com/ianstormtaylor/superstruct) specialized in validating and typing data decoded from JSON.

## Example

```typescript
// ref: https://github.com/ianstormtaylor/superstruct#usage

import { is, object, number, string, array } from 'microstruct';

const Article = object({
  id: number(),
  title: string(),
  tags: array(string()),
  author: object({
    id: number(),
  }),
});

const data: unknown = {
  id: 34,
  title: 'Hello World',
  tags: ['news', 'features'],
  author: {
    id: 1,
  },
};

if (is(data, Article)) {
  // 'data' is guaranteed to be of type '{ id: number; title: string; tags:
  // string[]; author: { id: number } }' in this block.
}
```

## Main Differences to Superstruct

### No Support for `assert()`, `create()` or `validate()`

Of the core methods of Superstruct, only `is()` is supported.

### No Support for Classes or Functions

Because Microstruct is specialized in validating and typing data decoded from JSON, structs validating classes and functions such as `date` and `func` are not supported.

However, you can still define them yourself.

```typescript
const date = define<Date>(value =>
  value instanceof Date && !Number.isNaN(value.getTime()));

const data: unknown = new Date();

if (is(data, date)) {
  // 'data' is guaranteed to be of type 'Date' in this block.
}
```

### `object` Accepts Extra Properties

`object` accepts extra properties like `type`.

```typescript
const User = object({
  id: number(),
  name: string(),
});

const data: unknown = {
  id: 1,
  name: 'Jane Smith',
  email: 'jane@example.com',
};

if (is(data, User)) {
  // 'data' is guaranteed to be of type '{ id: number; name: string }' in this
  // block.
}
```

### `parse()`: A Type-safe JSON Parser

`parse()` returns a typed value parsed from a JSON string if it is valid, otherwise `undefined`.

```typescript
const json = '{"result":true, "count":42}';

const value = parse(json, object({ result: boolean(), count: number() }));

if (value !== undefined) {
  // 'value' is guaranteed to be of type '{ result: boolean; count: number }' in
  // this block.
}
```

## Getting Started

```shell
npm i microstruct
```

To use Microstruct with TypeScript, `typescript >=4.1.2` is required.

## Author

[iorate](https://github.com/iorate) ([Twitter](https://twitter.com/iorate))

## License

Microstruct is licensed under [MIT License](LICENSE.txt).
