/*!
 * Copyright 2013 Justinmind. All rights reserved.
 */

(function (window, undefined) {
  jQuery("#simulation")
  .on("mousedown", ".dropdown-options", function(event) {    
    var $dd = jQuery(event.target || event.srcElement).closest(".dropdown, .nativedropdown");
    if(jimUtil.isAlternateModeActive() || !($dd.length && typeof($dd.attr("readonly")) === "undefined")) {
      return false;
    }
    if(jimDevice.isMobile()) {
      if(jimDevice.isIOS() && jQuery("#jim-body #jim-case").length>0) {
    	$("#jim-container").trigger("mousedown");
    	if($.browser.msie && $.browser.version<9) {
    		$dd.attr("disabled", "disabled");
    	}
        return false;
      }
    }
  })
  .on("mouseup", ".dropdown-options", function(event) {
	if($.browser.msie && $.browser.version<9) {
      var $dd = jQuery(event.target || event.srcElement).closest(".dropdown, .nativedropdown");
      $dd.removeAttr("disabled");
	}
  })
  .on("change", ".dropdown-options", function(event) {
	var $parent = jQuery(this).parent();
	var value = this.value;
	for (var intLoop = 0; intLoop < this.length; intLoop++) {
        if(this[intLoop].selected) {
            value = this[intLoop].value;
        }
    }
    $parent.find(".value").text(value);
    if(window.jimDevice.isMobile() && window.jimUtil.isMobileDevice() && $parent.hasClass("pressed")) {
      $parent.removeClass("pressed");
    }
  });
})(window);