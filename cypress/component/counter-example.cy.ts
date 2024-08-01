import { Wc } from '../../src/wc.js';
import { html } from '../../src/html.js';

let counterId = 0;

interface CounterInfo {
    id: string;
    label: string;
    value: number;
}

customElements.define(
    'counter-parent',
    class extends Wc {
        state: {
            counters: CounterInfo[];
            updateCount: number;
        };

        onInit() {
            this.state = this.reactive({
                counters: [],
                updateCount: 0, // silly trigger to cause updates
            });
        }

        newCounter() {
            counterId += 1;
            this.state.counters.push({
                id: `counter-${counterId}`,
                label: `Counter ${counterId}`,
                value: 0,
            });
            this.state.updateCount++;
        }

        changeLabels() {
            for (const counter of this.state.counters) {
                counter.label = `Changed ${counter.label}`;
            }
            this.state.updateCount++;
        }

        incrementCounter(counter: CounterInfo) {
            counter.value += 1;
            this.state.updateCount++;
        }

        removeCounter(counter: CounterInfo) {
            this.state.counters = this.state.counters.filter(
                c => c !== counter
            );
            this.state.updateCount++;
        }

        render() {
            return html`
                <button id="new-counter" onclick=${this.newCounter}>
                    New Counter
                </button>
                <button id="change-labels" onclick=${this.changeLabels}>
                    Change Labels
                </button>
                ${this.state.counters.map(
                    counter =>
                        html`<counter-child
                            id=${counter.id}
                            counter-label=${counter.label}
                            p:counter-value=${counter.value}
                            onincrement=${() => this.incrementCounter(counter)}
                            onremovecounter=${() => this.removeCounter(counter)}
                        ></counter-child>`
                )}
                <p>
                    There are
                    <span id="counter-count"
                        >${this.state.counters.length}</span
                    >
                    counters.
                </p>
            `;
        }
    }
);

interface CounterChildState {
    counterLabel: string;
    counterValue: number;
}

customElements.define(
    'counter-child',
    class extends Wc {
        state: CounterChildState;
        static observedAttributes = ['counter-label'];

        constructor() {
            super();
            this.state = this.reactive({
                counterLabel: this.getAttribute('counter-label') ?? 'Unknown',
                counterValue: 0,
            });
        }

        // Watching for attribute changes.
        attributeChangedCallback(name, _oldValue, newValue) {
            if (name === 'counter-label' && this.state) {
                this.state.counterLabel = newValue;
            }
        }

        // Watching for property changes
        set counterValue(value: number) {
            this.state.counterValue = value;
        }

        increment() {
            this.emit('increment');
        }

        removeCounter(e: Event) {
            this.emit('removecounter');
            e.stopPropagation();
        }

        render() {
            return html`
                <div>
                    <span class="label">${this.state.counterLabel}</span>:
                    <span class="value">${this.state.counterValue}</span>
                    <button class="increment" onclick=${this.increment}>
                        +1
                    </button>
                    <button class="remove" onclick=${this.removeCounter}>
                        Remove
                    </button>
                </div>
            `;
        }
    }
);

describe('counters', () => {
    beforeEach(() => {
        cy.mount('<counter-parent></counter-parent>');
    });

    it('works with no counters', () => {
        cy.get('#counter-count').should('have.text', '0');
    });

    it('adds a counter', () => {
        cy.get('button#new-counter').click();
        cy.get('#counter-count').should('have.text', '1');
        cy.get('counter-child#counter-1 .label').should(
            'have.text',
            'Counter 1'
        );
    });

    it('increments a counter and changes labels', () => {
        cy.get('button#new-counter').click();
        cy.get('counter-child#counter-2 button.increment').click();
        cy.get('counter-child#counter-2 .value').should('have.text', '1');
        cy.get('counter-child#counter-2 .label').should(
            'have.text',
            'Counter 2'
        );
        cy.get('button#change-labels').click();
        cy.get('counter-child#counter-2 .label').should(
            'have.text',
            'Changed Counter 2'
        );
    });

    it('increments and removes a set of counters', () => {
        cy.get('button#new-counter').click();
        cy.get('button#new-counter').click();
        cy.get('button#new-counter').click();
        cy.get('button#new-counter').click();
        cy.get('button#new-counter').click();
        cy.get('counter-child#counter-4 button.increment').click();
        cy.get('counter-child#counter-6 button.increment').click();
        cy.get('counter-child#counter-6 button.increment').click();
        cy.get('counter-child#counter-5 button.remove').click();
        cy.get('#counter-count').should('have.text', '4');
        cy.get('counter-child#counter-3 .value').should('have.text', '0');
        cy.get('counter-child#counter-4 .value').should('have.text', '1');
        cy.get('counter-child#counter-5').should('not.exist');
        cy.get('counter-child#counter-6 .value').should('have.text', '2');
        cy.get('counter-child#counter-7 .value').should('have.text', '0');
    });
});
