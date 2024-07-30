import { Wc } from '../../src/wc.js';
import { html } from '../../src/html.js';

customElements.define('it-works', class extends Wc {
    render() {
        return html`It works!`
    }
});

describe('basic initialization', () => {
    beforeEach(() => {
        cy.mount('<it-works></it-works>');
    });

    it('works with a simple template', () => {
        cy.get('it-works').should('have.text', 'It works!');
    });
});
