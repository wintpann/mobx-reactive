import { autorun } from 'mobx';

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const runEffect = <T>(effect: () => T) => {
  const updates = {
    current: [] as T[],
  };

  const dispose = autorun(() => {
    updates.current.push(effect());
  });

  return { updates, dispose };
};

export const readEffect = <T>(effect: () => T) => effect();