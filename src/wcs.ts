export interface State {
    [key: string]: any;
}

export class Wcs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    emit(event: string, detail?: any, options: CustomEventInit = {}) {
        this.dispatchEvent(
            new CustomEvent(event, {
                composed: true,
                ...options,
                detail,
            })
        );
    }
}
