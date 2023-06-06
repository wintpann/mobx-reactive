export type FutureIdle = { data: null; error: null; state: 'idle' };

export type FuturePending<A> = {
  data: A | null;
  error: null;
  state: 'pending';
};

export type FutureSuccess<A> = { data: A; error: null; state: 'success' };

export type FutureFailure<E = Error> = {
  data: null;
  error: E;
  state: 'failure';
};

export type Future<A, E = Error> =
  | FutureIdle
  | FuturePending<A>
  | FutureSuccess<A>
  | FutureFailure<E>;

export interface FutureMap {
  <A, B, E>(f: (a: A) => B): (future: Future<A, E>) => Future<B, E>;
}

export interface FutureMapLeft {
  <E1, E2, A>(f: (e1: E1) => E2): (future: Future<A, E1>) => Future<A, E2>;
}

export interface FutureGetOrElse {
  <A, E>(onElse: () => A): (future: Future<A, E>) => A;
}

export interface FutureToNullable {
  <A, E>(future: Future<A, E>): A | null;
}

export interface FutureChain {
  <A, B, E>(f: (a: A) => Future<B, E>): (future: Future<A, E>) => Future<B, E>;
}

export interface FutureSequence {
  <A, E>(a: Future<A, E>): Future<[A], E>;

  <A, B, E>(a: Future<A, E>, b: Future<B, E>): Future<[A, B], E>;

  <A, B, C, E>(a: Future<A, E>, b: Future<B, E>, c: Future<C, E>): Future<
    [A, B, C],
    E
  >;

  <A, B, C, D, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
  ): Future<[A, B, C, D], E>;

  <A, B, C, D, F, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
    f: Future<F, E>,
  ): Future<[A, B, C, D, F], E>;

  <A, B, C, D, F, G, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
    f: Future<F, E>,
    g: Future<G, E>,
  ): Future<[A, B, C, D, F, G], E>;

  <A, B, C, D, F, G, H, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
    f: Future<F, E>,
    g: Future<G, E>,
    h: Future<H, E>,
  ): Future<[A, B, C, D, F, G, H], E>;

  <A, B, C, D, F, G, H, I, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
    f: Future<F, E>,
    g: Future<G, E>,
    h: Future<H, E>,
    i: Future<I, E>,
  ): Future<[A, B, C, D, F, G, H, I], E>;

  <A, B, C, D, F, G, H, I, J, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
    f: Future<F, E>,
    g: Future<G, E>,
    h: Future<H, E>,
    i: Future<I, E>,
    j: Future<J, E>,
  ): Future<[A, B, C, D, F, G, H, I, J], E>;

  <A, B, C, D, F, G, H, I, J, K, E>(
    a: Future<A, E>,
    b: Future<B, E>,
    c: Future<C, E>,
    d: Future<D, E>,
    f: Future<F, E>,
    g: Future<G, E>,
    h: Future<H, E>,
    i: Future<I, E>,
    j: Future<J, E>,
    k: Future<K, E>,
  ): Future<[A, B, C, D, F, G, H, I, J, K], E>;
}

export interface FutureCombine {
  <S extends Record<string, Future<any, any>>>(struct: S): Future<
    {
      [K in keyof S]: S[K] extends Future<infer R, any> ? R : never;
    },
    S extends Record<string, Future<any, infer R>> ? R : never
  >;
}

export interface FutureFold {
  <A, B, E>(
    onInitial: () => B,
    onPending: (data: A | null) => B,
    onFailure: (e: E) => B,
    onSuccess: (a: A) => B,
  ): (future: Future<A, E>) => B;
}
