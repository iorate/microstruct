export declare type Struct<T = any> = (value: unknown, type?: T) => unknown;
export declare type Infer<S extends Struct> = S extends Struct<infer T> ? T : never;
export declare const any: () => Struct<any>;
export declare const array: <T>(es: Struct<T>) => Struct<T[]>;
export declare const boolean: () => Struct<boolean>;
export declare const enums: <E extends number | string>(es: readonly E[]) => Struct<E>;
export declare const integer: () => Struct<number>;
export declare const intersection: <S extends Struct>(ss: readonly S[]) => Struct<(S extends Struct ? (t: Infer<S>) => void : never) extends (t: infer T) => void ? T : never>;
export declare const literal: <L extends boolean | number | string>(l: L) => Struct<L>;
export declare const never: () => Struct<never>;
export declare const nullable: <T>(s: Struct<T>) => Struct<T | null>;
export declare const number: () => Struct<number>;
export declare const object: <S extends Readonly<Record<string, Struct>>>(s: S) => Struct<{
    [K in keyof S as undefined extends Infer<S[K]> ? never : K]: Infer<S[K]>;
} & {
    [K in keyof S as undefined extends Infer<S[K]> ? K : never]?: Infer<S[K]>;
}>;
export declare const optional: <T>(s: Struct<T>) => Struct<T | undefined>;
export declare const record: <KS extends Struct<string>, VS extends Struct>(ks: KS, vs: VS) => Struct<Record<Infer<KS>, Infer<VS>>>;
export declare const string: () => Struct<string>;
export declare const tuple: <SS extends readonly Struct[]>(ss: readonly [...SS]) => Struct<{
    [I in keyof SS]: SS[I] extends infer S ? (S extends Struct ? Infer<S> : never) : never;
}>;
export { object as type };
export declare const union: <S extends Struct>(ss: readonly S[]) => Struct<S extends Struct ? Infer<S> : never>;
export declare const unknown: () => Struct<unknown>;
export declare const define: <T>(p: (value: unknown) => boolean) => Struct<T>;
export declare const is: <T>(value: unknown, s: Struct<T>) => value is T;
export declare const parseJSON: <T>(json: string, s: Struct<T>) => T | undefined;
