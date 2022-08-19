import { useState, useEffect } from "react";
import { Subscribable, BehaviorSubject, Observable, Subject } from 'rxjs'

export const useSubscribable = <T>(
  s: Subscribable<T>, 
  defaultValue?: T
) => {
  const [ value, setValue ] = useState(defaultValue);
  useEffect(
    () => {
      const subscription = s.subscribe(setValue);
      return () => subscription.unsubscribe();
    },
    [s]
  );
  return value;
};
export const useRx = useSubscribable

export const useObservable = <T>(
  o: Observable<T>, 
  defaultValue?: T
) => useSubscribable(o, defaultValue)

export const useSubject = <T>(
  s: Subject<T>, 
  defaultValue?: T
) => useSubscribable(s, defaultValue)

export const useBehaviorSubject = <T>(
  s: BehaviorSubject<T>, 
) => useSubscribable(s, s.value)