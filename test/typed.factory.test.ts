import {TypedRecord} from '../src/typed.record';
import {
  recordify,
  makeTypedFactory,
} from '../src/typed.factory';
import {expect} from 'chai';
import {fromJS, Map} from 'immutable';

describe('TypedFactory tests and implementation', () => {

  interface IPet {
    name: string;
    type: string;
  };

  interface IPetRecord extends TypedRecord<IPetRecord>, IPet {};

  interface IPerson {
    name: string;
    pet?: IPet;
  };

  interface IPersonRecord extends TypedRecord<IPersonRecord>, IPerson {};

  describe('The usage of makeTypedFactory and recordify', () => {
    describe('When creating multiples TypedRecords', () => {

      it('should get the TypedFactory reference to generate instances using ' +
        'the same default set of values', () => {
        const LukeRecordFactory = makeTypedFactory<IPerson, IPersonRecord>({
          name: 'Luke'
        });
        const master = LukeRecordFactory({
          name: 'Master Luke'
        });
        const councilMaster = LukeRecordFactory({
          name: 'Council Master Luke'
        });
        expect(master.name).to.equal('Master Luke');
        const notMaster = master.delete('name');
        expect(notMaster.name).to.equal('Luke');
        expect(councilMaster.name).to.equal('Council Master Luke');
      });
    });

    describe('When creating a TypedRecord with a default value', () => {
      it('should allow creation providing an interface as its type', () => {
        const darthVaderRecord = recordify<IPerson, IPersonRecord>({
          name: 'Darth Vader'
        });
        expect(darthVaderRecord.name).to.equal('Darth Vader');
      });
    });

    describe('When creating a TypedRecord with a default and current values',
      () => {
        it('should create a TypedRecord that has a current value', () => {
          const unhappyFamilyRecord = recordify<IPerson, IPersonRecord>(
            {
              name: 'Han Solo'
            },
            {
              name: 'Ben Organa Solo'
            }
          );
          expect(unhappyFamilyRecord.name).to.equal('Ben Organa Solo');
        });
      }
    );

    describe('When modeling data structure with TypedRecords', () => {
      it('should not reference other TypedRecords', () => {
        const skywalkerRecord = recordify<IPerson, IPersonRecord>({
          name: 'Luke Skywalker',
          pet: recordify<IPet, IPetRecord>({
            name: 'Artoo',
            type: 'Droid'
          })
        });
        expect(skywalkerRecord.name).to.equal('Luke Skywalker');
        expect(skywalkerRecord.pet.name).to.equal('Artoo');
        expect(skywalkerRecord.pet.type).to.equal('Droid');
      });
    });

    it('should generate records fromJS', () => {
      const ArtooFactory = makeTypedFactory<IPet, IPetRecord>({
        name: 'Artoo',
        type: 'Droid'
      });
      const LukeRecordFactory = makeTypedFactory<IPerson, IPersonRecord>({
        name: 'Luke',
        pet: ArtooFactory()
      });
      const FactoryMap = {
        root: {
          useFactory: LukeRecordFactory,
          pet: {
            useFactory: ArtooFactory
          }
        }
      };
      const root = FactoryMap.root;
      console.log('final', fromJS({
        name: 'Han solo',
        pet: {
          name: 'Chewbacca',
          type: 'Wookie'
        }
      }, function (key, val: any) {
        if (key !== '') {
          return root[key].factory(val);
        } else {
          return root.factory(val);
        }
      }));
    });

  });

});
