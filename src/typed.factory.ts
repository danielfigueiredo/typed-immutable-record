import {TypedRecord} from './typed.record';
import {
  Record,
  List
} from 'immutable';
import * as R from 'ramda';

/**
 * Creates a factory function you can use to make TypedRecords.
 *
 * Every TypedRecord instance produced from the factory function will have a
 * read-only property for each of the fields in the argument object.
 *
 * Additionally, TypedRecords created by the factory function will have the
 * TypeScript shape defined by E.
 *
 * Finally, these TypedRecords expose the same interface as
 * Immutable.Map<string, any>, but type adjusted to that mutating methods return
 * a TypedRecord of the original type.
 *
 * The caller must provide two interfaces described below:
 *
 * <E>: The TypeScript shape of the plain JavaScript object to be made
 * immutable.
 * 
 * <T>: The desired TypedRecord type that each immutable record produced by the
 * factory will have. In nearly all cases this will be an interface
 * that extends TypedRecord<T> & E.
 *
 * @param obj is a plain JS that meets the requirements described in the
 * provided <E> interface. This object is used to set the default values of the
 * Immutable.Record
 * @param name of the record
 * @returns {function(E=): T} a function Factory to produce instances of a
 * TypedRecord<T>
 * @see recordify
 */
export function makeTypedFactory<E, T extends TypedRecord<T> & E>
  (obj: E, name?: string): (val?: E) => T {

  const ImmutableRecord = Record(obj, name);
  return function TypedFactory(val: E = null): T {
    return new ImmutableRecord(val) as T;
  };
};

/**
 * Utility function to generate an Immutable.Record for the provided type.
 * The caller must provide two interfaces described below:
 *
 * <E>: The TypeScript shape of the plain JavaScript object to be made
 * immutable.
 *
 * <T>: The desired TypedRecord type that each immutable record produced by the
 * factory will have. In nearly all cases this will be an interface
 * that extends TypedRecord<T> & E.
 *
 * This Method also does not return the {TypedFactory}, which means that it will
 * be impossible to generate new instances of the same TypedFactory. This is
 * ideal for scenarios where you are performing an operation that produces
 * one instance of <T>, with either a default or current val see the following
 * params:
 *
 * @param defaultVal is the default value for the created record type.
 * @param val is an optional attribute representing the current value for this
 * Record.
 * @param name of the record
 * @returns {T} that is the new created TypedRecord
 */
export function recordify<E, T extends TypedRecord<T> & E>(
  defaultVal: E,
  val: E = null,
  name?: string): T {

  const TypedRecordFactory = makeTypedFactory<E, T>(defaultVal, name);
  return val ? TypedRecordFactory(val) : TypedRecordFactory();
};


/**
 * Deeply parses a JS object into a known record structure.
 * @param obj POJO used to create the record
 * @param facTree an object which the key = factoryName and the value
 * is another object with two attributes: descriptor and factory. The descriptor
 * tells how to parse the object, and the factory holds a reference to
 * the factory used to create the Record.
 * The descriptor only needs to reference properties that are nested records. If
 * no other factories are required to generate the record, the descriptor can be
 * set to undefined. The following example creates a factoryTree for the
 * interfaces:
 *
 * interface IPet {
 *   name: string;
 *   type: string;
 * };
 *
 * interface IPetRecord extends TypedRecord<IPetRecord>, IPet {};
 *
 * interface IPerson {
 *   name: string;
 *   pet?: IPet[];
 *   master?: IPerson;
 * };
 *
 * interface IPersonRecord extends TypedRecord<IPersonRecord>, IPerson {};
 *
 * const factoryTree = {
 *   person: {
 *     descriptor: {
 *       pet: 'pet',
 *       master: 'person'
 *     },
 *     factory: personFactory
 *   },
 *   pet: {
 *     descriptor: undefined,
 *     factory: petFactory
 *   }
 * };
 *
 * @param facName the factory name to be used to parse obj
 * @returns {T} that is the new created TypedRecord
 */
export function fromJS<E, T extends TypedRecord<T> & E>(
  obj: any,
  facTree: {
    [key: string]: {
      descriptor: {[key: string]: string},
      factory: <F extends TypedRecord<F>>(val: any) => F
    }
  },
  facName: string): T {

  const facRef = facTree[facName].factory;
  if (!facRef) { throw new Error(`No factory found for ${facName}`); }

  const partialRecord = R.merge({}, obj);
  const descriptor = facTree[facName].descriptor;

  if (descriptor) {
    for (const key in descriptor) {
      if (Array.isArray(obj[key])) {
        partialRecord[key] = List(
          obj[key].map(entry => fromJS(entry, facTree, descriptor[key]))
        );
      } else if (typeof obj[key] === 'object') {
        partialRecord[key] = fromJS(obj[key], facTree, descriptor[key]);
      }
    }
  }
  return facRef(partialRecord) as T;
};
