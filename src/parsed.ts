import { each } from './each';

export class Parsed {
    s = '';
    v: Record<string, any> = {};

    // append
    a(x: any) {
        if (x instanceof Parsed) {
            this.s += x.s;
            this.v = { ...x.v, ...this.v };
        } else {
            this.s += x;
        }
    }

    // bind
    b(context: any) {
        const v = this.v;
        each(Object.keys(v), (k) => {
            v[k] = v[k].bind?.(context) ?? v[k];
        });

        return this;
    }
}
