import { e } from './e';

export const text = (value: string): string => {
    const p = e('p');
    p.textContent = value;

    return p.innerHTML;
}
