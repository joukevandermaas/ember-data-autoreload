# ember-data-autoreload

[![Build Status](https://travis-ci.org/joukevandermaas/ember-data-autoreload.svg?branch=master)](https://travis-ci.org/joukevandermaas/ember-data-autoreload)


`ember-data-autoreload` allows you to auto-reload models after some time 
has passed. It provides a mixin you can add to any Ember Data model:

```js
import DS from 'ember-data';
import AutoReload from 'ember-data-autoreload';

export default DS.Model.extend(AutoReload, {
  // ...
});
```

Now you can call `startAutoReloading()` and `stopAutoReloading()` on this
model to start or stop automatically reloading, respectively.

## Configuration

`ember-data-autoreload` supports the following configuration options, all 
of which are set as properties on the model:

| Property | Possible values | Description | Default value |
|---|---|---|--:|
| `autoReloadStrategy`     | `'fixed'`, `'incremental'` | Determines how the delay between automatic reloads is determined. See below for a more complete explanation. | `'incremental'` |
| `autoReloadDelay`        | Any number `> 0` | The (initial) delay between automatic reloads. | `30000` |
| `autoReloadMaximumDelay` | Any number `> 0` and `>= autoReloadDelay` | The maximum delay between automatic reloads, if `autoReloadStrategy === 'incremental'` | `300000` |
| `autoReloadDelayGrowth`  | Any number `> 1` | The rate with which the delay between automatic reloads grows, if `autoReloadStrategy === 'incremental'` | `2` |

### Reload strategies

The `autoReloadStrategy` property is used to influence the delay between
automatic reloads of your models. If this property is set to `'fixed'`,
the model always reloads itself after a fixed interval, determined by the
`autoReloadDelay` property.

If the property is set to `'incremental'`, the delay between automatic reloads
will keep increasing every time the *attributes* on the model do not change. This 
will reduce the load on your API server if the model doesn't change often. As soon 
as the model *does* change in between reloads, the delay is reset. To increase or 
decrease the amount with which the delay grows, you can use the `autoDelayGrowth` 
property. Every time the model doesn't change, the new delay is calculated using 
`previousDelay * autoReloadDelayGrowth`.

## Hooks

`ember-data-autoreload` provides two hooks into the auto reload process: `willAutoReload` and
`didAutoReload`. If you want to manually adjust the delay between auto reloads, or trigger side-effects,
you can do so here. Both hooks are promise-aware.

### `willAutoReload` *(snapshot)*

This hook is called right before `this.reload` is called on the model.

#### Parameters:

**snapshot** [Ember Data Snapshot](http://emberjs.com/api/data/classes/DS.Snapshot.html)  
A snapshot of the model before reloading.

### `didAutoReload` *(attributesChanged, newSnapshot, oldSnapshot)*

This hook is called after `this.reload` is called on the model, and before
the delay for the next automatic reload is scheduled.

#### Parameters:

**attributesChanged** Boolean  
`true` if the model's attributes changed since before the reload, otherwise false.

**newSnapshot** [Ember Data Snapshot](http://emberjs.com/api/data/classes/DS.Snapshot.html)  
A snapshot of the model after reloading.

**oldSnapshot** [Ember Data Snapshot](http://emberjs.com/api/data/classes/DS.Snapshot.html)  
A snapshot of the model before reloading.
