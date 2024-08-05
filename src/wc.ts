/**
 * Almost all of this is from @pinjs/cona. Some things were trimmed out for
 * size or extracted in order to expose the internal workings to the wiki.
 */

import { apply } from './apply';
import { Parsed } from './parsed';

export interface State {
    [key: string]: any;
}

export class Wc extends HTMLElement {
    private _timeout?: ReturnType<typeof requestAnimationFrame> | null;

    // Lifecycle methods
    onInit?(): void;
    onMount?(): void;
    onUnmount?(): void;
    onUpdate?(): void;
    render?(): Parsed;

    connectedCallback() {
        this.onInit?.();
        this._update();
        this.onMount?.();
    }

    disconnectedCallback() {
        this.onUnmount?.();
    }

    emit(event: string, detail?: any, options: CustomEventInit = {}) {
        this.dispatchEvent(
            new CustomEvent(event, {
                ...options,
                detail,
            })
        );
    }

    reactive<T extends State>(state: T): T {
        return new Proxy(state, {
            set: (target, key: string | symbol, value: any) => {
                if (target[key as keyof T] !== value) {
                    target[key as keyof T] = value;

                    this._timeout ??= requestAnimationFrame(() => {
                        this._timeout = null;
                        this._update();
                    });
                }

                return true;
            },
            get: (target, key: string | symbol) => target[key as keyof T],
        });
    }

    private _update() {
        apply(this.shadowRoot || this, (this.render?.()??new Parsed()).b(this));
        this.onUpdate?.();
    }
}
