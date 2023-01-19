// The default type should be `any` so that `Struct<T>` extends `Struct` for any `T`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Struct<T = any> = StructFunction<T, false>;

export type Infer<S extends Struct> = S extends Struct<infer T> ? T : never;

export type Describe<T> = Struct<T>;

export const assert: {
  <T>(value: unknown, struct: Struct<T>, message?: string): asserts value is T;
} = (value, struct, message) => {
  if (!struct(value)) {
    throw new StructError(value, message);
  }
};

export const is = <T>(value: unknown, struct: Struct<T>): value is T => struct(value);

export const validate = <T>(
  value: unknown,
  struct: Struct<T>,
  options?: { message?: string },
): [StructError, undefined] | [undefined, T] => {
  return struct(value)
    ? [undefined, value as T]
    : [new StructError(value, options && options.message), undefined];
};

export const parse = <T>(json: string, struct: Struct<T>): T | undefined => {
  try {
    const value: unknown = JSON.parse(json);
    return struct(value) ? (value as T) : undefined;
  } catch (_error: unknown) {
    return undefined;
  }
};

// `any()` should be of type `Struct<any>`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const any: () => Struct<any> = () => _value => true;

export const array: { (): Struct<unknown[]>; <T>(es: Struct<T>): Struct<T[]> } =
  <T>(es?: Struct<T>) =>
  (value: unknown) =>
    Array.isArray(value) && (!es || value.every(e => es(e)));

export const bigint: () => Struct<bigint> = () => value => typeof value === 'bigint';

export const boolean: () => Struct<boolean> = () => value => typeof value === 'boolean';

export const date: () => Struct<Date> = () => value =>
  value instanceof Date && !Number.isNaN(value.getTime());

export const enums: {
  <E extends number>(es: readonly E[]): Struct<E>;
  <E extends string>(es: readonly E[]): Struct<E>;
} =
  <E extends number | string>(es: readonly E[]) =>
  (value: unknown) =>
    (es as readonly unknown[]).includes(value);

export const func: () => Struct<
  <Args extends readonly unknown[]>(...args: readonly [...Args]) => unknown
> = () => value => typeof value === 'function';

export const instance: <
  C extends new <Args extends readonly unknown[]>(...args: readonly [...Args]) => unknown,
>(
  c: C,
) => Struct<InstanceType<C>> = t => value => value instanceof t;

export const integer: () => Struct<number> = () => value => Number.isInteger(value);

export const intersection: <HS extends Struct, TS extends Struct>(
  ss: readonly [HS, ...TS[]],
) => Struct<
  HS | TS extends infer S
    ? (S extends Struct ? (t: Infer<S>) => void : never) extends (t: infer T) => void
      ? T
      : never
    : never
> = ss => value => ss.every(s => s(value));

export const literal: <L extends boolean | number | string>(l: L) => Struct<L> = l => value =>
  value === l;

export const map: {
  (): Struct<Map<unknown, unknown>>;
  <K, V>(ks: Struct<K>, vs: Struct<V>): Struct<Map<K, V>>;
} =
  <K, V>(ks?: Struct<K>, vs?: Struct<V>) =>
  (value: unknown) =>
    value instanceof Map && (!ks || !vs || Array.from(value).every(([k, v]) => ks(k) && vs(v)));

export const never: () => Struct<never> = () => _value => false;

export const nullable: <T>(s: Struct<T>) => Struct<T | null> = s => value =>
  value === null || s(value);

export const number: () => Struct<number> = () => value =>
  typeof value === 'number' && !Number.isNaN(value);

export const object: {
  (): Struct<Record<string, unknown>>;
  <SS extends Readonly<Record<string, Struct>>>(ss: SS): Struct<InferObject<SS>>;
} =
  <SS extends Readonly<Record<string, Struct>>>(ss?: SS) =>
  (value: unknown) =>
    typeof value === 'object' &&
    value !== null &&
    (!ss ||
      // `k` is a key of `ss`.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (Object.keys(ss).every(k => ss[k]!((value as ReadonlyObject)[k])) &&
        Object.keys(value as ReadonlyObject).every(Object.prototype.hasOwnProperty.bind(ss))));

export const optional: <T>(s: Struct<T>) => StructFunction<T | undefined, boolean> = s => value =>
  value === undefined || s(value);

export const record: <K extends string, V>(ks: Struct<K>, vs: Struct<V>) => Struct<Record<K, V>> =
  (ks, vs) => value =>
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).every(k => ks(k) && vs((value as ReadonlyObject)[k]));

export const regexp: () => Struct<RegExp> = () => value => value instanceof RegExp;

export const set: { (): Struct<Set<unknown>>; <T>(s: Struct<T>): Struct<Set<T>> } =
  <T>(s?: Struct<T>) =>
  (value: unknown) =>
    value instanceof Set && (!s || Array.from(value).every(v => s(v)));

export const string: () => Struct<string> = () => value => typeof value === 'string';

export const tuple: <SS extends readonly Struct[]>(
  ss: readonly [...SS],
) => Struct<InferTuple<SS>> = ss => value =>
  Array.isArray(value) && value.length <= ss.length && ss.every((s, i) => s(value[i]));

export const type: <SS extends Readonly<Record<string, Struct>>>(ss: SS) => Struct<InferType<SS>> =
  ss => value =>
    typeof value === 'object' &&
    value !== null &&
    // `k` is a key of `ss`.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Object.keys(ss).every(k => ss[k]!((value as ReadonlyObject)[k]));

export const union: <HS extends Struct, TS extends Struct>(
  ss: readonly [HS, ...TS[]],
) => Struct<Infer<HS> | Infer<TS>> = ss => value => ss.some(s => s(value));

export const unknown: () => Struct<unknown> = () => _value => true;

export const define: <T>(validator: (value: unknown) => boolean) => Struct<T> = validator =>
  validator;

export class StructError extends TypeError {
  value: unknown;
  constructor(value: unknown, message?: string) {
    super(message);
    this.name = 'StructError';
    this.value = value;
  }
}

type StructFunction<T, Optional> = (value: unknown, t?: T, optional?: Optional) => boolean;

type InferObject<SS extends Readonly<Record<string, Struct>>> = keyof SS extends infer K
  ? (
      K extends keyof SS
        ? (
            t: SS[K] extends StructFunction<infer T, boolean>
              ? { [_K in K]?: Exclude<T, undefined> }
              : { [_K in K]: Infer<SS[K]> },
          ) => void
        : never
    ) extends (t: infer T) => void
    ? { [K in keyof T]: T[K] }
    : never
  : never;

type InferTuple<
  SS extends readonly Struct[],
  I extends readonly 0[] = [],
  A extends readonly unknown[] = [],
> = SS['length'] extends I['length']
  ? A
  : InferTuple<
      SS,
      [...I, 0],
      SS[I['length']] extends StructFunction<infer T, boolean>
        ? [...A, Exclude<T, undefined>?]
        : [...A, Infer<SS[I['length']]>]
    >;

type InferType<SS extends Readonly<Record<string, Struct>>> = InferObject<SS>;

type ReadonlyObject = Readonly<Record<string, unknown>>;
