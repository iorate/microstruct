/* eslint-disable no-empty, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unused-vars */

type ReadonlyObject = Readonly<Record<string, unknown>>;

const typeStartsWith = (char: string) => (value: unknown) => (typeof value)[0] == char;

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const keys = (value: ReadonlyObject) => Object.keys(value);

const keysLength = (value: ReadonlyObject) => keys(value).length;

export type Struct<T = any> = (value: unknown, type?: T) => unknown;

export type Infer<S extends Struct> = S extends Struct<infer T> ? T : never;

export const any: () => Struct<any> = (unused?: unknown) => value => 1;

export const array: <T>(es: Struct<T>) => Struct<T[]> = es => value =>
  isArray(value) && value.every(e => es(e));

export const boolean: () => Struct<boolean> = (unused?: unknown) => typeStartsWith('b');

export const enums: <E extends number | string>(es: readonly E[]) => Struct<E> = es => value =>
  (es as readonly unknown[]).includes(value);

export const integer: () => Struct<number> = (unused?: unknown) => value => Number.isInteger(value);

export const intersection: <S extends Struct>(
  ss: readonly S[],
) => Struct<
  (S extends Struct ? (t: Infer<S>) => void : never) extends (t: infer T) => void ? T : never
> = ss => value => ss.every(s => s(value));

export const literal: <L extends boolean | number | string>(l: L) => Struct<L> = l => value =>
  value === l;

export const never: () => Struct<never> = (unused?: unknown) => value => 0;

export const nullable: <T>(s: Struct<T>) => Struct<T | null> = s => value =>
  value === null || s(value);

export const number: () => Struct<number> = (unused?: unknown) => typeStartsWith('n');

export const object: <S extends Readonly<Record<string, Struct>>>(
  s: S,
) => Struct<
  { [K in keyof S as undefined extends Infer<S[K]> ? never : K]: Infer<S[K]> } & {
    [K in keyof S as undefined extends Infer<S[K]> ? K : never]?: Infer<S[K]>;
  }
> = s => value => type(s)(value) && keysLength(value as ReadonlyObject) <= keysLength(s);

export const optional: <T>(s: Struct<T>) => Struct<T | undefined> = s => value =>
  typeStartsWith('u')(value) || s(value);

export const record: <K extends string, V>(
  ks: Struct<K>,
  vs: Struct<V>,
) => Struct<string extends K ? Record<string, V> : Partial<Record<K, V>>> = (ks, vs) => value =>
  typeStartsWith('o')(value) &&
  value &&
  keys(value as ReadonlyObject).every(k => ks(k) && vs((value as ReadonlyObject)[k]));

export const string: () => Struct<string> = (unused?: unknown) => typeStartsWith('s');

export const tuple: <SS extends readonly Struct[]>(
  ss: readonly [...SS],
) => Struct<{
  [I in keyof SS]: SS[I] extends infer S ? (S extends Struct ? Infer<S> : never) : never;
}> = ss => value => isArray(value) && value.length == ss.length && value.every((e, i) => ss[i]!(e));

export const type: <S extends Readonly<Record<string, Struct>>>(
  s: S,
) => Struct<
  { [K in keyof S as undefined extends Infer<S[K]> ? never : K]: Infer<S[K]> } & {
    [K in keyof S as undefined extends Infer<S[K]> ? K : never]?: Infer<S[K]>;
  }
> = s => value =>
  typeStartsWith('o')(value) && value && keys(s).every(k => s[k]!((value as ReadonlyObject)[k]));

export const union: <S extends Struct>(
  ss: readonly S[],
) => Struct<S extends Struct ? Infer<S> : never> = ss => value => ss.some(s => s(value));

export const unknown: () => Struct<unknown> = (unused?: unknown) => value => 1;

export const define: <T>(p: (value: unknown) => boolean) => Struct<T> = p => p;

export const is = <T>(value: unknown, s: Struct<T>): value is T => !!s(value);

export const parse = <T>(json: string, s: Struct<T>): T | undefined => {
  try {
    const v: unknown = JSON.parse(json);
    if (s(v)) {
      return v as T;
    }
  } catch {}
};
