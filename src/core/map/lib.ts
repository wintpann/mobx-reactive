import { Map } from './typings.ts';
import { createDerivation, Observable } from '../observable/lib.ts';

export const map: Map =
  <A, B>(fn: (value: A) => B) =>
  (source: Observable<A>): Observable<B> => {
    const noArgs = fn.length === 0;

    return createDerivation<B>({
      interceptor: () => fn(noArgs ? source.raw : source.value),
    });
  };
