Wc - Minimal Web Component Framework
====================================

What can you get in just over 1k of gzipped JavaScript? How about an easier way to create custom elements using a web component framework? What if it included automatic updates to the DOM when properties change? How about binding to events and emitting your own events?

Features
--------

* No compiling necessary.
* Full TypeScript support.
* Internals are exposed so they can be leveraged by other tools.
* No dependencies.
* *Super small!* about 1k gzipped (1200 bytes when last checked) with everything included.
* Automatic updates based on state changes. Code is from [@pinjs/cona], which appears to be based on [nho], which was inspired by Vue.
* HTML template literals for values and event bindings.
* DOM diffing and updates instead of complete replacement.
* Support for binding to custom elements.
* Tree-shakeable, reducing total bundle size when built with many systems.

Installation
------------

This library can be installed in a variety of ways.

### Command-Line

```bash
# Auto-detect
npx nypm install @fidian/wc

# Or use one of these
npm install @fidian/wc
yarn add @fidian/wc
pnpm install @fidian/wc
bun install @fidian/wc
```

Once installed, your code can use it via an import

```js
import { Wc, html } from '@fidian/wc';

customElements.define('test-component', class extends Wc {
    render() {
        return html`<div>Hello world!</div>`
    }
});
```

### UMD via CDN

Add this to your HTML.

```html
<script src="https://unpkg.com/@fidian/wc"></script>
```

This will add all of the exports to `window.wc`.

```html
<script>
    customElements.define('test-component', class extends window.wc.Wc {
        render() {
            return window.wc.html`<div>Hello world!</div>`;
        }
    });
</script>
```

### Module via CDN

Scripts can now be loaded as modules, which are fun.

```html
<script type="module">
    import { Wc, html } from 'https://unpkg.com/@fidian/wc?module';

    customElements.define('test-component', class extends Wc {
        render() {
            return html`<div>Hello world!</div>`;
        }
    });
</script>
```

Counter Example
---------------

```js
import { html, text, Wc } from '@fidian/wc';

customElements.define('my-counter', class extends Wc {
    constuctor() {
        // Create a component state. Updates to any property in this state will
        // automatically trigger view updates. The property values are only
        // checked shallowly.
        this.state = this.reactive({
            count: 1
        });

        // This shows how you can get a DOM reference
        this.pRef = this.ref();
    }

    // onInit is called when the element is being attached but before the first
    // render has completed.
    onInit() {
        // An effect is something whose value can change. When it changes, call
        // the callback. Effects need to be checked. See onUpdate().
        this.effects = new Effects();
        this.effects.add(
            // A callback to return the current value
            () => this.state.count,
            // When changed, call this callback
            (newValue, oldValue) => {
                console.log(`Count changed from ${oldValue} to ${newValue}`);
            }
        );
    }

    // When the element's first render is done
    onMount() {
        console.log('Mounted');
    }

    // When the view has been updated
    onUpdate() {
        console.log('Updated');

        // Showing how to get the DOM element referenced in the template
        console.log('P ref', this.pRef?.ref);

        // Check effects whenever the state changes
        this.effects.check();
    }

    // When the element is removed from the DOM
    onUnmount() {
        console.log('Unmounted');
    }

    addCount() {
        // Update state by altering a property on the state.
        this.state.count += 1;
    }

    render() {
        // Change the template literal into an HTML string with associated data.
        //
        // In order to bind the attribute values, make sure you do not quote
        // the value. These will be escaped correctly.
        //     GOOD:  <div id=${this.id}>
        //     BAD:   <div id="${this.id}">
        //
        // Bind to properties of the element using "p:" prefix. Bind to events
        // with a prefix of "on" before the event name. Custom event names are
        // supported.
        //
        // Arrays are supported, and array members must be either strings or
        // parsed HTML.
        //     const list = ['one', 'two'];
        //     return html`<ol>${
        //         list.map((item) => html`<li>${text(item)}</li>`)
        //     }</ol>`;
        return html`
            <div class="box">
                <p ref=${this.pRef}>
                    Name: ${text(this.state.count)}
                </p>
                <button onclick=${this.addCount}>
                    Add count
                </button>
                <my-counter-child p:count=${this.state.count + 5}>
                </my-counter-child>
            </div>
        `;
    }
});
```

Events, Attributes, and Properties Example
------------------------------------------

Web components are expected to receive input via attributes and properties, and communicate back out to parents via events. Here is an example that shows how to use all of these techniques.

```js
import { Wc, html, text } from '@fidian/wc';

customElements.define('list-parent', class extends Wc {
    onSetup() {
        this.itemId = 0;
        this.state = this.reactive({
            items: [],
            manualUpdates: 0, // Trigger to cause updates
        });
    }

    newItem() {
        // Does not change the array reference, so this will not trigger an
        // update.
        this.state.items.push({
            label: `Item ${this.itemId}`,
            value: Math.random()
        });

        // Manually trigger an update.
        this.state.manualUpdates ++;
    }

    changeLabels() {
        // This does change the array reference and automatically triggers
        // an update.
        this.state.items = this.state.items.map(
            (item) => { item.label = `Changed ${item.label}` }
        );
    }

    removeItem(item) {
        // No need to trigger a manual update since the array reference is
        // changed.
        this.state.items = this.state.items.filter(x => x !== item);
    }

    render() {
        return html`
            <button onclick=${this.newItem}>New Item</button>
            <button onclick=${this.changeLabels}>Change Labels</button>
            ${this.state.items.map((item) => html`
                <list-item
                    item-label=${item.label}
                    p:item-value=${item.value}
                    onremoveitem=${() => this.removeItem(item)}
                ></list-item>
            `)}
        `;
    }
});

// Label is an attribute that could change.
//     <list-item item-label="Label">
// Value is a number assigned to a propety on the element.
//     const item = document.getElementsByTagName('list-item')[0];
//     item.itemValue = 123;
customElements.define('list-item', class extends Wc {
    static observedAttributes = ['item-label'];

    onSetup() {
        this.state = this.reactive({
            label: this.getAttribute('item-label') ?? 'Unknown',
            value: 0
        });
    }

    // Watch for attribute changes
    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === 'item-label') {
            this.state.label = newValue;
        }
    }

    // Watch for property changes
    set itemValue(value: number) {
        this.state.value = value;
    }

    render() {
        return html`
            <div>
                ${text(this.state.label)} (Last update: ${text(this.state.value)})
                <button onclick=${() => this.emit('removeitem')}>Remove</button>
            </div>
        `;
    }
});
```


Shadow DOM
----------

`Wc`-based elements do not use a shadow DOM. When you want to use one, use `Wcs`.

```
import { Wcs } from 'wc';

customElements.define('my-component', class extends Wcs {
    // Fill in your render function here
}
```

This automatically attaches a shadow DOM during construction, uses the shadow root as the render target, and `.emit()` will now use `composed: true` to have events traverse up outside of the shadow root.


API
---

All of these are available to be imported or on `window.wc`. They are exported to make testing easier and to allow reuse of the library's core.

```js
// Import example
import { text } from '@fidian/wc';

// Window example
const text = window.wc.text;
```

### `apply(parent: HTMLElement, parsed: Parsed)`

Apply the given parsed HTML and mapped data values to the DOM. If you are going to use `html` yourself, then use this function to update the DOM. The call to `parsed.b()` will bind all functions to `this`, setting their contexts.

```js
const counter = 1;
const parsed = html`<div>${counter}</div>`;
apply(document.getElementById('target-element'), parsed.b(this));
```

### `attr(value: string): string`

Escape a value so it is safe to embed as an attribute. This is used automatically for attribute bindings within `html`.

```js
const escaped = attr('A "great" value');
document.body.innerHTML = `<custom-element value="${escaped}"></custom-element>`;
````

## `new Effects()`

Create a new Effects object that detects changes and will call callbacks when changes are detected. If you don't use this, the class is tree-shakeable and will be removed from the build.

```js
// Create an instance, most likely in your onSetup of your component.
this.effects = new Effects();

// Add an effect
this.effects.add(
    // The value getter, which returns any value.
    () => this.count,
    // When the value changes, call the callback.
    (newValue, oldValue) => {
        console.log('Count is', newValue, ' - was ', oldValue);
    }
);

// In your onUpdate method, check for effect updates.
this.effects.check();
```

### `html(strings: TemplateStringsArray, ...values: any[]): Parsed`

Creates a `Parsed` object with the HTML string and the map of values. This is best used through tagged template literals. The result is intented to be passed to `apply`.

```js
const title = 'Heading';
const click = () => console.log('Heading was clicked');
const parsed = html`<h1 onclick=${click}>${title}</h1>
```

When variables are injected into the template, they will be evaluated using the following rules.

* If the template string looks like it ends with an attribute assignment, such as ` ref=` or ` onclick=`, then save the value to the `Parsed` value map and insert a placeholder.
* If the template string ends with a `=`, convert the value to a string, then escape and add it as an attribute value.
* If the value is an array, append each string or `Parsed` object in the array to the result.
* Finally, convert the value to a string and append it to the result.

```js
// Correct event binding, using just the method
html`<div onclick=${this.handler}>Click me</div>`

// Correct event binding, using an arrow function
html`<div onclick=${() => this.handler()}>Click me</div>`

// Correct event binding with extra parameters passed
html`<div onclick=${(event) => this.handler(event, this.data)}>Click me</div>`

// Incorrect - do not use quotation marks
html`<div onclick="${this.handler}">Click me</div>`

// Correct escaping of HTML
html`Username: ${text(this.username)}`;

// Incorrect escaping of HTML - vulnerable to injection attacks
html`Username: ${this.username}`;

// Correct escaping of attributes - automatic escaping
html`<show-user username=${this.username}>`

// Correct escaping of attributes - manual escaping
html`<show-user username="${attr(this.username)}>`

// Incorrect escaping of attributes - vulnerable to attacks
html`<show-user username="${this.username}>`

// Correctly set a property to the number 5
html`<login-form p:delay=${this.delay}></login-form>

// Incorrect property assignment - assigns a string instead
html`<login-form p:delay="${this.delay}"></login-form>
```

It is easy to trick this function into producing invalid HTML strings, especially when multiple values are stuck together.

```js
const onsetLabel = 'onset=';
const onsetTime = 'immediate';

// To potentially break this, have one variable start immediately after
// another.
const broken = `<div>${onsetLabel}${onsetTime}</div>`;
// "<div>onset=1</div>"
// It's because "onset=" is seen as an attribute.

// The fix is to make sure the variables are not adjacent. Both of these
// solutions work.
const fixed1 = '<div><span>${text(onsetLabel)}</span>${text(onsetTime)}</div>`;
const fixed2 = '<div>${text(onsetLabel)} ${text(onsetTime)}</div>`;
```

### `new Parsed()`

Container to store an HTML string and the mapping of values. Exposed so alternate parsers could be utilized instead of `html`, plus it makes it easy to check if something is wrapped or not.

```js
const click = () => console.log('Clicked!');
const joined = new Parsed();
console.log(joined.s); // The string, which is nothing right now.
console.log(joined.v); // The value map, also empty

const things = ['apple', html`<span onclick=${click}>orange</span>`];

for (const thing of things) {
    // The first item is a string, apple
    if (typeof thing === 'string') {
        joined.a(thing);

        console.log(joined.s); // apple
        console.log(joined.v); // {}
    }

    if (thing instanceof Parsed) {
        // The second item is the orange with a click event handler
        joined.append(thing);
        console.log(joined.s); // apple<span onclick="1">orange</span>
        console.log(joined.v); // {1:click};
    }
}
```

The values that are functions can also all be bound to a specific context.

```
parsed.b(this);
```

### `text(value: string): string`

Escapes a value so it is safe to embed into HTML. If you do not use this to escape text safely, you should probably reconsider what you're doing. However, if this function isn't used then it is tree-shakeable.

```js
// This is malicious data
const username = '<script>alert("Hello");</script>';
const escaped = text(username);
document.body.innerHTML = escaped; // safe

// This is especially helpful in your component
customElements.define('test-component', class extends Wc {
    username = '<script>alert("Hello");</script>';

    render() {
        return html`<div>${text(this.username)}</div>`
    }
});
```


### `new Wc()`

This is the nano-framework for a new web component.

**`this.onInit()`**

Element is added to the DOM but not rendered. Remember, the element might get detached and reattached multiple times when other code changes the DOM structure.

**`this.onMount()`**

Element is added to the DOM and has been rendered.

**`this.onUnmount()`**

Element is being removed from the DOM. This is as close as you can get to a destructor.

**`this.onUpdate()`**

A state change has triggered an update and the update has been performed.

**`this.emit(name, detail?, options?)`**

Send an event out of this custom element. The expected way to communicate with custom elements is to use attributes or properties for input and events as output.

* `name: string` - The name of the event.
* `detail: any` - Optional data to pass with the event. It will be available on `event.detail`.
* `options?: CustomEventInit` - Allow changing the options for the custom event, such as `bubbles` or `cancelable`.

```js
this.emit('needdata');

this.emit('dataloaded', this.data);

this.emit('valuechange', { oldValue: 1, newValue: 2 }, {
    bubbles: true,
    cancelable: false,
    composed: true
});
```

**`this.reactive(state)`**

Create a proxy for a state object. When any value is set to a different value on the state (shallow only, not deeply), the component will automatically be updated.

```js
this.state = this.reactive({
    counter: 0,
    list: []
});

// Trigger an update
this.state.counter += 1;

// Does not trigger an update because it is not modifying a top-level property.
this.state.list.push('test');

// Trigger an update
this.state.list = [...this.state.list];
```

**`this.ref(ref): RefObject`**

Create a reference object that will get updated on updates when there's an element in the DOM with a matching `ref` attribute.

* `ref: any` - The initial value for the ref object.

```js
customElements.define('my-element', class extends Wc {
    onInit() {
        this.divRef = this.ref();
    }

    render() {
        return html`<div ref=${this.divRef}></div>`;
    }

    onUpdate() {
        console.log('DIV element', this.divRef.ref);
    }
});
```

**`this.render()`**

Returns a `Parsed` object that includes the HTML string to render and the mapping of data to add as event handlers and ref targets.


Warnings and Cautions
---------------------

Remember, your element is still a subclass of [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement), so avoid overriding built-in methods, such as [`.remove()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/remove). Failure to do so will cause unintended (usually catastrophic) problems.

There's no way to manually trigger updates by calling a method. If you work with deep objects, you can use immutable objects or update any property in your state. One easy way to do that is simply to keep a counter and increment it as necessary. This is not needed when using a shallow object for state.


Acknowledgments
---------------

This project is only possible due to the heroic work done by [pin705](https://github.com/pin705) and his project, [@pinjs/cona]. If you like what you see here, it's only possible due to this previous work. The main changes from the original version to this one include the following list.

* Removed support for `.watch()` and `.computed()`, which were helper methods to call `.effect()`.
* Added several tests, using Cypress to run them within real browsers.
* Broke out internals and exported them separately so outside tools can leverage them as well. This means some portions are tree-shakeable, making a rebundle potentially smaller.
* Allow attaching to any event names, not just ones supported via element attributes. Also added `.emit()` to send events. This allows `Wc`-flavored web components to have bidirectional communication with other web components.
* Removed the use of a shadow DOM from the main class.


License
-------

Published under the [MIT](https://github.com/pin705/cf-scraper-bypass/blob/main/LICENSE) license.

[nho]: https://github.com/anh-ld/nho
[@pinjs/cona]: https://github.com/pin705/cona
