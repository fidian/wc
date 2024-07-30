import { text } from '../../src/text.js';

describe('text', () => {
    it('avoids unnecessary escaping of text', () => {
        expect(text('It works!')).to.equal('It works!');
    });
    it('escapes text with special characters', () => {
        expect(text('<script>alert("It works!")</script>')).to.equal(
            '&lt;script&gt;alert("It works!")&lt;/script&gt;'
        );
    });
});
