import { ref, RefObject } from '../../src/ref.js';
import { Wc } from '../../src/wc.js';
import { html } from '../../src/html.js';

customElements.define(
    'get-ref',
    class extends Wc {
        divRef: RefObject<HTMLDivElement | null>;

        constructor() {
            super();
            this.divRef = ref(null);
        }

        passRefOut() {
            (window as any)._wc_ref = this.divRef;
        }

        render() {
            return html`<div ref=${this.divRef}>Get this reference</div>
                <button onclick=${() => this.passRefOut()}>
                    Set value object to window._wc_ref
                </button>`;
        }
    }
);

describe('basic initialization', () => {
    beforeEach(() => {
        cy.mount('<get-ref></get-ref>');
    });

    it('gets a reference to the element', () => {
        cy.get('button').click();
        cy.window().its('_wc_ref').should('exist');
        cy.window().its('_wc_ref.ref').should('exist');
    });
});
