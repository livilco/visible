import Ember from 'ember';

export default Ember.Service.extend({
  now: true, //Main property we are modifying
  state: "init",
  visibilityChangeEvent: "visibilitychange",
  visibleStateName: "visibilityState",

  /*
    This function is the heart of the service, it determines
    if the document is visible or not
  */
  determineVisibility: function() {
    var state = document[this.get("visibleStateName")];
    switch (state) {
     case "visible":
        this.set("now", true);
        break;
     case "hidden":
        this.set("now", false);
    }
  },

  init: function() {
    this._super();
    this.setupVendorSupport();
    this.setupEventListeners();
    this.determineVisibility();
  },
  setupVendorSupport: function() {
    if (typeof document.mozHidden !== "undefined") {
      this.set("visibilityChangeEvent", "mozvisibilitychange");
      this.set("visibleStateName", "mozVisibilityState");
    } else if (typeof document.msHidden !== "undefined") {
      this.set("visibilityChangeEvent", "msvisibilitychange");
      this.set("visibleStateName", "msVisibilityState");
    } else if (typeof document.webkitHidden !== "undefined") {
      this.set("visibilityChangeEvent", "webkitvisibilitychange");
      this.set("visibleStateName", "webkitVisibilityState");
    }
  },


  setupEventListeners: function() {
    this._onFocus = Ember.run.bind(this, 'determineVisibility');
    document.addEventListener(this.get("visibilityChangeEvent"), this._onFocus);

    this._onBlur = () => {
      this.set("state", "blur");
      this.set("now", false);
    };

    window.addEventListener('blur', this._onBlur);
    window.addEventListener('focus', this._onFocus);
  },
  willDestroy: function() {
    window.removeEventListener('blur', this._onBlur);
    window.removeEventListener('focus', this._onFocus);
  }

});
