import {
  Map,
  Iterable,
} from 'immutable';


/**
 * Interface that inherit from Immutable.Map that overrides all methods that
 * would return a new version of Immutable.Map itself to return <T> instead.
 * Although it is possible to do, this interface is not currently
 * supports a different Immutable.Map rather than Map<string, any>. Thus
 * all TypedRecord<T> operators will have <any> as the object type and also
 * notSetValue argument type when performing functional programming changes.
 * Key will always be a string.
 *
 * Map<string, any> is a very flexible combination that supports basically
 * everything. However another interface can be created between TypedRecord
 * and Immutable.Map to support the generic Map arguments <K> and <V> or this
 * interface can require more generic arguments in order to support K, V.
 *
 * The implementation of this TypedRecord interface requires two interfaces. One
 * representing the target data structure, and another the Record itself, that
 * makes the bridge between them.
 *
 * For instance:
 *   interface IPerson {
 *     name: string;
 *   }
 *
 *   interface IPersonRecord extends from TypedRecord<IPersonRecord>, IPerson {}
 *
 * Examples in test file: 'test/typed.record.test.ts'
 */
export interface TypedRecord<T extends TypedRecord<T>, E>
  extends Map<string, any> {



  set: (prop: string, val: any) => T;
  delete: (key: string) => T;
  remove: (key: string) => T;
  clear: () => T;
  update: {
    (updater: (value: T) => any): T;
    (key: string, updater: <A extends E>(value: A) => A): T;
    (key: string, notSetValue: any, updater: <A extends E>(value: A) => A): T;
  };
  merge: (obj: E) => T;
  mergeWith: (
    merger: (previous?: any, next?: any, key?: string) => any,
    obj: E
  ) => T;
  mergeDeep: (obj: E) => T;
  mergeDeepWith: (
    merger: (previous?: any, next?: any, key?: string) => any,
    obj: E
  ) => T;
  setIn: (keyPath: any[] | Iterable<any, any>, value: E) => T;
  deleteIn: (keyPath: Array<any> | Iterable<any, any>) => T;
  removeIn: (keyPath: Array<any> | Iterable<any, any>) => T;
  updateIn: {
    (keyPath: any[] | Iterable<any, any>, updater: (value: E) => E): T;
    (
      keyPath: any[] | Iterable<any, any>,
      notSetValue: any,
      updater: (value: any) => any
    ): T
  };
  mergeIn: (keyPath: any[] | Iterable<any, any>, obj: E) => T;
  mergeDeepIn: (keyPath: any[] | Iterable<any, any>, obj: E) => T;
  withMutations: (mutator: (mutable: T) => any) => T;
  asMutable: () => T;
  asImmutable: () => T;
  toJS: () => E;
};
