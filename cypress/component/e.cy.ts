import { e } from '../../src/e.js';

describe('e', () => {
    it('creates the named element', () => {
        const el = e('div');
        expect(el.tagName).to.equal('DIV');
    });
});
