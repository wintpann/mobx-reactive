import { createDerivation, createObservable } from './lib.ts';
import { readEffect, runEffect } from '../test-utils.ts';
import { of } from '../of/lib.ts';

describe('createObservable', () => {
  it('should create observable', () => {
    const source = createObservable({ a: 1, b: 2 });

    expect(source.value).toStrictEqual({ a: 1, b: 2 });
    expect(source.raw).toStrictEqual({ a: 1, b: 2 });
  });

  it('should call onObserved & onUnobserved', () => {
    const onObserved = jest.fn();
    const onUnobserved = jest.fn();

    const source = createObservable('0', {
      onObserved: () => {
        onObserved();
        return onUnobserved;
      },
    });

    readEffect(() => source.value);

    expect(onObserved).not.toHaveBeenCalled();
    expect(onUnobserved).not.toHaveBeenCalled();

    const run1 = runEffect(() => source.value);
    expect(onObserved).toHaveBeenCalledTimes(1);
    expect(onUnobserved).not.toHaveBeenCalled();

    run1.dispose();
    expect(onUnobserved).toHaveBeenCalledTimes(1);
  });

  it('should update value', () => {
    const source = createObservable({ count: 0 });

    const run1 = runEffect(() => source.raw);
    expect(run1.updates.current).toStrictEqual([{ count: 0 }]);

    source.next({ count: 1 });
    expect(run1.updates.current).toStrictEqual([{ count: 0 }, { count: 1 }]);

    source.mutate((value) => {
      value.count++;
    });

    expect(run1.updates.current).toStrictEqual([
      { count: 0 },
      { count: 1 },
      { count: 2 },
    ]);

    source.mutate((value) => {
      value.count = 3;
    });
    expect(run1.updates.current).toStrictEqual([
      { count: 0 },
      { count: 1 },
      { count: 2 },
      { count: 3 },
    ]);

    run1.dispose();
  });

  it('should run effect only if accessed value changed', () => {
    const source = createObservable({ a: 0, b: 0 });

    const runA = runEffect(() => source.value.a);
    const runB = runEffect(() => source.value.b);

    source.next({ a: 1, b: 1 });
    expect(runA.updates.current).toStrictEqual([0, 1]);
    expect(runB.updates.current).toStrictEqual([0, 1]);

    source.mutate((value) => {
      value.a = 2;
    });
    expect(runA.updates.current).toStrictEqual([0, 1, 2]);
    expect(runB.updates.current).toStrictEqual([0, 1]);

    source.mutate((value) => {
      value.b = 2;
    });
    expect(runA.updates.current).toStrictEqual([0, 1, 2]);
    expect(runB.updates.current).toStrictEqual([0, 1, 2]);

    runA.dispose();
    runB.dispose();
  });

  it('should intercept value and update source when interceptingSource updating', () => {
    const interceptingSource = createObservable('1');

    const interceptor = jest.fn(() => interceptingSource.value);

    const source = createDerivation<string>({
      interceptor,
    });

    expect(interceptor).not.toHaveBeenCalled();

    readEffect(() => source.value);
    expect(interceptor).toHaveBeenCalledTimes(1);

    const run1 = runEffect(() => source.value);
    expect(interceptor).toHaveBeenCalledTimes(2);

    interceptingSource.next('2');
    expect(interceptor).toHaveBeenCalledTimes(3);
    expect(run1.updates.current).toStrictEqual(['1', '2']);

    run1.dispose();
  });

  it('should derive value automatically on unobserved access', () => {
    const derivingSource = createObservable('1');

    const deriver = jest.fn(() => derivingSource.value);

    const source = createDerivation<string>({
      deriver,
    });

    expect(deriver).not.toHaveBeenCalled();

    readEffect(() => source.value);
    expect(deriver).toHaveBeenCalledTimes(1);

    const derived1 = readEffect(() => source.value);
    expect(deriver).toHaveBeenCalledTimes(2);
    expect(derived1).toBe('1');

    derivingSource.next('2');
    expect(deriver).toHaveBeenCalledTimes(2);

    const derived2 = readEffect(() => source.value);
    expect(deriver).toHaveBeenCalledTimes(3);
    expect(derived2).toBe('2');
  });

  it('should derive value by derive() call and not update source when derivingSource updating', () => {
    const derivingSource = createObservable('1');

    const deriver = jest.fn(() => derivingSource.value);

    const source = createDerivation<string>({
      deriver,
      onObserved: (_self, _state, controller) => {
        controller.derive();
      },
    });

    expect(deriver).not.toHaveBeenCalled();

    const run1 = runEffect(() => source.value);
    expect(deriver).toHaveBeenCalledTimes(1);
    expect(run1.updates.current).toStrictEqual(['1']);

    derivingSource.next('2');
    expect(deriver).toHaveBeenCalledTimes(1);
    expect(run1.updates.current).toStrictEqual(['1']);

    run1.dispose();
  });

  it('should update lastUpdateTime', () => {
    jest.useFakeTimers({ now: 1000 });
    const source = of({ a: 0 });
    expect(source.lastUpdatedTime).toBe(1000);

    jest.useFakeTimers({ now: 2000 });
    source.next({ a: 1 });
    expect(source.lastUpdatedTime).toBe(2000);

    jest.useFakeTimers({ now: 3000 });
    source.update(() => ({ a: 2 }));
    expect(source.lastUpdatedTime).toBe(3000);

    jest.useFakeTimers({ now: 4000 });
    source.mutate((value) => {
      value.a = 3;
    });
    expect(source.lastUpdatedTime).toBe(4000);

    jest.useRealTimers();
  });

  it('should update timesUpdated', () => {
    const source = of({ a: 0 });
    expect(source.timesUpdated).toBe(0);

    source.next({ a: 1 });
    expect(source.timesUpdated).toBe(1);

    source.update(() => ({ a: 2 }));
    expect(source.timesUpdated).toBe(2);

    source.mutate((value) => {
      value.a = 3;
    });
    expect(source.timesUpdated).toBe(3);
  });
});
