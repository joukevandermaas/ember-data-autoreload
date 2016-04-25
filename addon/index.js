import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Mixin, assert, RSVP: { resolve }, isArray } = Ember;

export default Mixin.create({
  /* overridable properties/methods */
  autoReloadStrategy: 'incremental', // can be 'incremental' or 'fixed'

  autoReloadDelay: 30000,

  autoReloadMaximumDelay: 300000,
  autoReloadDelayGrowth: 2,

  willAutoReload(/* currentSnapshot */) { },
  didAutoReload(/* attributesChanged, newSnapshot, oldSnapshot */) { },

  shouldAutoReload(/* currentSnapshot */) {
    return true;
  },

  /* end overridable properties/methods */

  /* public api */

  startAutoReloading() {
    this.get('_autoReloadTask').perform();
  },

  stopAutoReloading() {
    this.get('_autoReloadTask').cancelAll();
  },

  /* end public api */

  unloadRecord() {
    this._super(...arguments);

    this.get('_autoReloadTask').cancelAll();
  },

  _autoReloadTask: task(function*() {
    let nextDelay = this._getNextReloadDelay(
      this.get('autoReloadDelay'),
      true);

    while (true) {
      yield timeout(nextDelay);

      let oldState = this._createSnapshot();

      if (this.get('isLoaded') &&
          !this.get('isDeleted')) {
        let shouldReload = yield resolve(this.shouldAutoReload(oldState));

        if (!shouldReload) {
          continue;
        }

        yield resolve(this.willAutoReload(oldState));
        yield this.reload();

        let newState = this._createSnapshot();

        let changeOccured = this._didAttributesChange(oldState.attributes(), newState.attributes());
        yield resolve(this.didAutoReload(changeOccured, newState, oldState));

        nextDelay = this._getNextReloadDelay(nextDelay, changeOccured);
      }
    }
  }).drop(),

  _getNextReloadDelay(currentDelay, attributesChanged) {
    let strategy = this.get('autoReloadStrategy');
    switch (strategy) {
      case 'fixed':
        return this.get('autoReloadDelay');
      case 'incremental':
        return attributesChanged ?
          this.get('autoReloadDelay') :
          Math.min(
            this.get('autoReloadMaximumDelay'),
            currentDelay * this.get('autoReloadDelayGrowth'));
      default:
        assert(`\`autoReloadStrategy\` must be either "fixed" or "incremental", you specified "${strategy}"`);
    }
  },

  _didAttributesChange(oldAttrs, newAttrs) {
    for (let key in oldAttrs) {
      if (isArray(oldAttrs[key] && isArray[newAttrs[key]])) {
        if (oldAttrs[key].length === newAttrs[key].length) {
          let allItemsSame = true;
          for (let i = 0; i < oldAttrs[key].length; i++) {
            if (this._didAttributesChange(oldAttrs[key][i], newAttrs[key][i])) {
              allItemsSame = false;
              break;
            }
          }

          if (!allItemsSame) {
            return true;
          }
        }

        return true;
      } else if ((oldAttrs[key] && typeof oldAttrs[key] === 'object') &&
        (newAttrs[key] && typeof newAttrs[key] === 'object')) {

        // recursively go through the hash
        if (this._didAttributesChange(oldAttrs[key], newAttrs[key])) {
          return true;
        }
      } else if (oldAttrs[key] !== newAttrs[key]) {
        return true;
      }
    }

    return false;
  }
});
