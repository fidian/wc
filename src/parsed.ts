export class Parsed {
    s = '';
    v: Record<string, any> = {};

    append(x: any) {
        if (x instanceof Parsed) {
            this.s += x.s;
            this.v = { ...x.v, ...this.v };
        } else {
            this.s += `${x}`;
        }
    }
}
