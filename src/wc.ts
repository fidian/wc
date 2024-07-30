/**
 * Almost all of this is from @pinjs/cona. Some things were trimmed out for
 * size or extracted in order to expose the internal workings to the wiki.
 */

import { apply } from './apply';
import { each } from './each';
import { html } from './html';
import { Parsed } from './parsed';

export type EffectCallback = (newValue: any, oldValue: any) => void;
export type EffectFunction = () => any;

export type RefObject<T> = {
    ref: T;
};

export interface State {
    [key: string]: any;
}

interface EffectInfo {
    c: EffectCallback;
    v: any;
}

export class Wc extends HTMLElement {
    private _effects: Map<EffectFunction, EffectInfo>;
    private _timeout: ReturnType<typeof requestAnimationFrame> | null;

    // Lifecycle methods
    public onSetup?(): void;
    public onInit?(): void;
    public onMount?(): void;
    public onUnmount?(): void;
    public onUpdate?(): void;

    constructor() {
        super();
        this._effects = new Map();
        this._timeout = null;
        this.onSetup?.();
    }

    connectedCallback() {
        this.onInit?.();
        this._update();
        this.onMount?.();
    }

    disconnectedCallback() {
        this.onUnmount?.();
    }

    effect(valueFn: EffectFunction, c: EffectCallback) {
        this._effects.set(valueFn, { c, v: valueFn() });
    }

    emit(event: string, detail?: any, options: CustomEventInit = {}) {
        this.dispatchEvent(new CustomEvent(event, {
            ...options,
            detail
        }));
    }

    reactive<T extends State>(state: T): T {
        return new Proxy(state, {
            set: (target, key: string | symbol, value: any) => {
                if (target[key as keyof T] !== value) {
                    target[key as keyof T] = value;

                    if (!this._timeout) {
                        this._timeout = requestAnimationFrame(() => {
                            this._timeout = null;
                            this._update();
                        });
                    }
                }

                return true;
            },
            get: (target, key: string | symbol) => {
                return target[key as keyof T];
            },
        });
    }

    ref<T>(ref: T): RefObject<T> {
        return { ref };
    }

    render(): Parsed {
        return html``;
    }

    private _update() {
        apply(this, this.render());
        this.onUpdate?.();

        each(this._effects, ([valueFn, info]) => {
            const newValue = valueFn();

            if (info.v !== newValue) {
                info.c(newValue, info.v);
                info.v = newValue;
            }
        });
    }
}
