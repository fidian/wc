import { attributeList } from '../../src/attribute-list.js';

describe('attributeList', () => {
    it('converts the attribute list to an array', () => {
        const a = attributeList(document.body);
        expect(Array.isArray(a)).to.equal(true);
    });
})
