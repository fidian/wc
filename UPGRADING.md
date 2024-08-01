# 1.0 -> 1.1

* Removed `Wc.onSetup()` - use `constructor()` instead.
* Removed `this.effect()` and split into tree-shakeable code. `import { Effects }` instead and use `this.effects = new Effects(); this.effects.add(getter, onChanges);` and in your `onUpdate()` add `this.effects.check()`;
* For minification, `Parsed.prototype.append()` is now `Parsed.prototype.a()`.
* Binding of functions passed to `html` now happens automatically in `Wc`. If you are using `html` and `apply` yourself, look at `Parsed.prototype.b()` ("b" is for bind.)
