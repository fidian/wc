import { Parsed } from '../../src/parsed.js';

describe('Parsed', () => {
    it('starts blank', () => {
        const p = new Parsed();
        expect(p.s).to.equal('');
        expect(Object.keys(p.v).length).to.equal(0);
    });
    it('appends a string', () => {
        const p = new Parsed();
        p.append('hello');
        expect(p.s).to.equal('hello');
        expect(Object.keys(p.v).length).to.equal(0);
    });
    it('appends a parsed object and merges values', () => {
        const parent = new Parsed();
        parent.s = 'PARENT';
        parent.v = { 1: 'PARENT', 3: 'PARENT' };

        const child = new Parsed();
        child.s = 'CHILD';
        child.v = { 2: 'CHILD', 3: 'CHILD' };

        parent.append(child);

        expect(parent.s).to.equal('PARENTCHILD');

        // The parent's values should have priority
        expect(parent.v).to.deep.equal({ 1: 'PARENT', 2: 'CHILD', 3: 'PARENT' });
    });
});
