import Ember from 'ember';
import AutoReloadMixin from 'ember-data-autoreload';
import { module, test } from 'qunit';

const { Object: Obj } = Ember;

module('Unit | Mixin | auto reload');

test('Attribute diff: works with simple properties', function(assert) {
  let AutoReloadObject = Obj.extend(AutoReloadMixin);
  let subject = AutoReloadObject.create();

  let oldAttrs = {
    prop: 'old'
  };

  let newAttrs = {
    prop: 'new'
  };

  assert.ok(subject._didAttributesChange(oldAttrs, newAttrs));

  oldAttrs = {
    prop: 4
  };

  newAttrs = {
    prop: 4
  };

  assert.ok(!subject._didAttributesChange(oldAttrs, newAttrs));
});

test('Attribute diff: works with hash property', function(assert) {
  let AutoReloadObject = Obj.extend(AutoReloadMixin);
  let subject = AutoReloadObject.create();

  let oldAttrs = {
    prop: {
      sub: 'old'
    }
  };

  let newAttrs = {
    prop: {
      sub: 'new'
    }
  };

  assert.ok(subject._didAttributesChange(oldAttrs, newAttrs));

  oldAttrs = {
    prop: {
      sub: 4
    }
  };

  newAttrs = {
    prop: {
      sub: 4
    }
  };

  assert.ok(!subject._didAttributesChange(oldAttrs, newAttrs));
});

test('Attribute diff: works with array property', function(assert) {
  let AutoReloadObject = Obj.extend(AutoReloadMixin);
  let subject = AutoReloadObject.create();

  let oldAttrs = {
    prop: [
      'old'
    ]
  };

  let newAttrs = {
    prop: [
      'new'
    ]
  };

  assert.ok(subject._didAttributesChange(oldAttrs, newAttrs));

  oldAttrs = {
    prop: [
      4
    ]
  };

  newAttrs = {
    prop: [
      4
    ]
  };

  assert.ok(!subject._didAttributesChange(oldAttrs, newAttrs));
});
