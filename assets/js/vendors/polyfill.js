/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

 if (!("currentStyle" in Element.prototype)) {
    Object.defineProperty(Element.prototype, "currentStyle", {
      get: function() {
        return window.getComputedStyle(this);
      }
    });
  }