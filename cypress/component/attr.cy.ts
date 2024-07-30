import { attr } from '../../src/attr.js';

describe('attr', () => {
    it('avoids unnecessary escaping of text', () => {
        expect(attr('It works!')).to.equal('It works!');
    });
    it('escapes attribute text with special characters', () => {
        expect(attr('<script>alert("It works!")</script>')).to.equal(
            '<script>alert(&quot;It works!&quot;)</script>'
        );
    });
});
