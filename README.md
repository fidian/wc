Wc - Minimal Web Component Framework
====================================

What can you get in just over 1k of gzipped JavaScript? How about an easier way to create custom elements using a web component framework? What if it included automatic updates to the DOM when properties change? How about binding to events and emitting your own events?

Features
--------

* No compiling necessary.
* Full TypeScript support.
* Internals are exposed so they can be leveraged by other tools.
* No dependencies.
* *Super small!* 1.1k gzipped (1096 bytes when last checked)
* Automatic updates based on state changes, inspired by Vue.
* HTML template literals for values and event bindings.
* DOM diffing and updates instead of complete replacement.
* Support for binding to custom elements.

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

```
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

Example
-------

```js
import { html, text, Wc } from '@fidian/wc';

customElements.define('my-counter', class extends Wc {
    // onSetup is called when the element is constructed
    onSetup() {
        // Create a component state. Updates to any property in this state will
        // automatically trigger view updates. The property values are only
        // checked shallowly.
        this.state = this.reactive({
            count: 1
        });

        // This shows how you can get a DOM reference
        this.pRef = this.ref();

        // An effect is something whose value can change. When it changes, call
        // the callback. Effects are only checked when rendered, so a state
        // change needs to happen first.
        this.effect(
            // A callback to return the current value
            () => this.state.count,
            // When changed, call this callback
            (newValue, oldValue) => {
                console.log(`Count changed from ${oldValue} to ${newValue}`);
            }
        );
    }

    // When the element is attached
    onInit() {
        console.log('Initialized');
    }

    // When the element's first render is done
    onMount() {
        console.log('Mounted');
    }

    // When the view is updated
    onUpdate() {
        console.log('Updated');

        // Showing how to get the DOM element referenced in the template
        console.log('P ref', this.pRef?.ref);
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
                <button onclick=${() => this.addCount()}>
                    Add count
                </button>
                <my-counter-child p:count=${this.state.count + 5}>
                </my-counter-child>
            </div>
        `;
    }
});
```


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

Apply the given parsed HTML and mapped data values to the DOM. If you are going to use `html` yourself, then use this function to update the DOM.

```js
const counter = 1;
const parsed = html`<div>${counter}</div>`;
apply(document.getElementById('target-element'), parsed);
```

### `attr(value: string): string`

Escape a value so it is safe to embed as an attribute. This is used automatically for attribute bindings within `html`.

```js
const escaped = attr('A "great" value');
document.body.innerHTML = `<custom-element value="${escaped}"></custom-element>`;
````

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

```
// Sample class to illustrate the examples
class extends Wc {
    delay = 5;
    username = 'timmy';

    clickHandler() {
        console.log('Click handler');
    }

    render() {
        return html`INSERT EXAMPLE HERE - SEE BELOW`;
    }
}

// Correct event binding
html`<div onclick=${() => this.clickHandler()}>Click me</div>`

// Incorrect - do not use quotation marks
html`<div onclick="${() => this.clickHandler()}">Click me</div>`

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
        joined.append(thing);

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


### `text(value: string): string`

Escapes a value so it is safe to embed into HTML.

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

**`this.onSetup()`**

Called when constructed. There will be no DOM attached at this point, no attributes set, nothing.

**`this.onInit()`**

Element is added to the DOM but not rendered. Remember, the element might get detached and reattached multiple times when other code changes the DOM structure.

**`this.onMount()`**

Element is added to the DOM and has been rendered.

**`this.onUnmount()`**

Element is being removed from the DOM. This is as close as you can get to a destructor.

**`this.onUpdate()`**

A state change has triggered an update and the update has been performed.

**`this.effect(valueFn, effectCallback)`**

On updates, check if the value function returns a different value. If so, call the callback.

* `valueFn: () => any` - Provides the current value of something.
* `effectCallback: (newValue, oldValue) => void - When the value changes, call this callback and pass both the new and old values.

```js
this.effect(() => this.count, (newValue, oldValue) => {
    console.log('Count changed from', oldValue, 'to', newValue);
});
```

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
    onSetup() {
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

There's no way to manually trigger updates by calling a method. If you work with deep objects, you can use immutable objects or update any property in your state. One easy way to do that is simply to keep a counter and increment it as necessary. This is not needed at all when using a shallow object for state.


Acknowledgments
---------------

This project is only possible due to the heroic work done by [pin705](https://github.com/pin705) and his project, [@pinjs/cona](https://github.com/pin705/cona). If you like what you see here, it's only possible due to this previous work. The main changes from the original version to this one include the following list.

* Removed support for `.watch()` and `.computed()`, which were helper methods to call `.effect()`.
* Removed support for `.setup()`, `.onUpdated()`, `.onMounted()`, and `.onUnmounted()` to minify better. These can be achieved by overriding `.connectedCallback()` (and similar methods).
* Added several tests, using Cypress to run them within real browsers.
* Broke out internals and exported them separately so outside tools can leverage them as well.
* Allow attaching to any event names, not just ones supported via element attributes, allowing communication out from custom web components via events.


License
-------

Published under the [MIT](https://github.com/pin705/cf-scraper-bypass/blob/main/LICENSE) license.
