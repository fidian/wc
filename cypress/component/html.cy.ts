import { html } from '../../src/html.js';
import { Parsed } from '../../src/parsed.js';

describe('html', () => {
    it('returns an empty Parsed object', () => {
        const p = html``;
        expect(p).to.instanceOf(Parsed);
        expect(p.s).to.equal('');
        expect(Object.keys(p.v).length).to.equal(0);
    });
    it('parses some text', () => {
        const p = html`hello`;
        expect(p.s).to.equal('hello');
        expect(Object.keys(p.v).length).to.equal(0);
    });
    it('adds values as strings', () => {
        const a = 'a';
        const n = 1;
        const b = false;
        const o = { object: true };
        const p = html`${a}${n}${b}${o}`;
        expect(p.s).to.equal('a1false[object Object]');
        expect(Object.keys(p.v).length).to.equal(0);
    });
    it('combines arrays', () => {
        const items = ['one', 'two', 'three'];
        const p = html`outer{${items}}{${items.map(item => html`[${item}]`)}}`;
        expect(p.s).to.equal('outer{onetwothree}{[one][two][three]}');
        expect(Object.keys(p.v).length).to.equal(0);
    });
});
