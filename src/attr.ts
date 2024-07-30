import { e } from './e';

export const attr = (value: string): string => {
    const p = e('p');
    p.setAttribute('p', `${value}`);

    return (p.outerHTML.match(/"(.*)"/) ?? [])[1];
}
