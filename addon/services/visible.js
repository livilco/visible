import Ember from 'ember';
import { observer } from '@ember/object';

export default Ember.Service.extend({
  now: true, //Main property we are modifying
  state: 'init',
  visibilityChangeEvent: 'visibilitychange',
  visibleStateName: 'visibilityState',

  /*
    This function is the heart of the service, it determines
    if the document is visible or not
  */
  determineVisibility() {
    if (this.get('isDestroyed')) { return; }

    var state = document[this.get('visibleStateName')];
    switch (state) {
     case 'visible':
        this.set('_now', true);
        break;
     case 'hidden':
        this.set('_now', false);
    }
  },

  // buffer the output, only update our prop once
  visibilityChanged: observer('_now', function() {
    let _now = this.get('_now');
    if (this._prevNow === _now) { return; }
    this._prevNow = _now;
    this.set('now', _now);
  }),

  init() {
    this._super();
    this.setupVendorSupport();
    this.setupEventListeners();
    this.determineVisibility();
  },

  setupVendorSupport() {
    if (typeof document.mozHidden !== 'undefined') {
      this.set('visibilityChangeEvent', 'mozvisibilitychange');
      this.set('visibleStateName', 'mozVisibilityState');
    } else if (typeof document.msHidden !== 'undefined') {
      this.set('visibilityChangeEvent', 'msvisibilitychange');
      this.set('visibleStateName', 'msVisibilityState');
    } else if (typeof document.webkitHidden !== 'undefined') {
      this.set('visibilityChangeEvent', 'webkitvisibilitychange');
      this.set('visibleStateName', 'webkitVisibilityState');
    }
  },

  setupEventListeners() {
    this._onFocus = Ember.run.bind(this, 'determineVisibility');
    document.addEventListener(this.get('visibilityChangeEvent'), this._onFocus);

    this._onBlur = () => {
      this.set('state', 'blur');
      this.set('_now', false);
    };

    window.addEventListener('blur', this._onBlur);
    window.addEventListener('focus', this._onFocus);
  },

  willDestroy() {
    window.removeEventListener('blur', this._onBlur);
    window.removeEventListener('focus', this._onFocus);
  }

});
