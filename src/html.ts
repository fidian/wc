/**
 * Thanks to @pinjs/cona for this technique. For reference, see
 * Cona.prototype._render().
 *
 * Changes HTML template literals into DOM elements. It also supplies the
 * lookup data so events and refs can be bound.
 */
import { attr } from './attr';
import { each } from './each';
import { Parsed } from './parsed';

let mapKey = 0;

export const html = (
    strings: TemplateStringsArray,
    ...values: any[]
): Parsed => {
    const result = new Parsed();
    each(strings, (str) => {
        result.s += str;
        const value = values.shift();

        if (/\s(p:\S+|on\S+|ref)=$/.test(str)) {
            // Functions and references
            mapKey += 1;
            result.v[mapKey] = value;
            result.s += mapKey;
        } else if (str.endsWith('=')) {
            // Unlike the text, attributes are escaped when set without quotes.
            result.s += `"${attr(value)}"`;
        } else {
            // Convert everything else to strings. If it's an array, convert
            // elements to strings or HtmlParsed objects and merge into one.
            each([].concat(value), (v) => {
                result.append(v ?? '');
            })
        }
    });

    return result;
};
