/**
 * Nearly all of this comes from @pinjs/cona.
 *
 * Apply the given parsed HTML and value map to a DOM.
 */

import { attributeList } from './attribute-list';
import { each } from './each';
import { link } from './link';
import { Parsed } from './parsed';

export const apply = (parent: HTMLElement | ShadowRoot, parsed: Parsed): void => {
    diff(parent, Document.parseHTMLUnsafe(parsed.s).body);
    link(parent, parsed.v);
};

const diff = (current: Node, next: Node) => {
    const cNodes = [...current.childNodes];

    each(next.childNodes, n => {
        const c = cNodes.shift();
        const clone = n.cloneNode(true);
        const replace = () => c!.parentNode!.replaceChild(clone, c!);
        const updateAttributes = () => {
            each(attributeList(c!), ({ name }) => {
                (c as HTMLElement).removeAttribute(name);
            });
            each(attributeList(n), ({ name, value }) => {
                (c as HTMLElement).setAttribute(name, value);
            });
        };

        if (!c) {
            (current as Element).append(clone);
        } else if (c.nodeName !== n.nodeName) {
            replace();
        } else if (n.childNodes.length > 0) {
            diff(c, n);
            updateAttributes();
        } else if (c.nodeName.includes('-')) {
            updateAttributes();
        } else if (c.textContent !== n.textContent) {
            replace();
        }
    });
    each(cNodes, c => c.remove());
};
