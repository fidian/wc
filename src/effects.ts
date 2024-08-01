export type EffectCallback = (newValue: any, oldValue: any) => void;
export type EffectFunction = () => any;
interface EffectInfo {
    c: EffectCallback;
    v: any;
}

import { each } from './each';

export class Effects {
    private _effects?: Map<EffectFunction, EffectInfo>;

    add(valueFn: EffectFunction, c: EffectCallback) {
        this._effects??= new Map();
        this._effects.set(valueFn, { c, v: valueFn() });
    }

    check() {
        each(this._effects??[], ([valueFn, info]) => {
            const newValue = valueFn();

            if (info.v !== newValue) {
                info.c(newValue, info.v);
                info.v = newValue;
            }
        });
    }
}
