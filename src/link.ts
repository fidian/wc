/**
 * Thanks to @pinjs/cona for this technique. For reference, see
 * Cona.prototype._event().
 *
 * Links event handlers, properties, and refs to a DOM tree given a map of
 * lookup data.
 */
import { attributeList } from './attribute-list';
import { each } from './each';

const storedEvents = Symbol();

export const link = (root: HTMLElement, v: Record<string, any>): void => {
    each(root.querySelectorAll('*'), node => {
        const events: Record<string, any> =
            (node as any)[storedEvents] || ((node as any)[storedEvents] = {});

        each(attributeList(node), ({ name, value }) => {
            // All instances of camel casing is done with "p:" or "on", and
            // those prefixes get removed.
            const camel = name
                .slice(2)
                .replace(/-(.)/g, match => match[1].toUpperCase());

            // Updating an event handler might be done by a parent/child by
            // accident, so only update if we have an event handler.
            if (/^on/.test(name) && v[value]) {
                // Event names should be all lowercase with no hyphens
                (node as HTMLElement).removeEventListener(camel, events[camel]);
                (node as HTMLElement).addEventListener(camel, v[value]);
                events[camel] = v[value];
            }

            if (/^p:/.test(name)) {
                // Property names can be camelCase, so support changing
                // kebab-case to camelCase
                (node as any)[camel] = v[value];
            }

            if (name === 'ref') {
                v[value].ref = node;
            }
        });
    });
};
