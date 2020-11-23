/*!
 * Copyright 2013 Justinmind. All rights reserved.
 */

(function(window, undefined) {
  var jimEvent = (function() {
    var jimEvent = function(event) {
      return new jimEvent.fn.init(event);
    };
    jimEvent.pauseStack = [];
    jimEvent.thresholds = {
      "pinch": 0.2,
      "rotate": 10,
      "swipe": 20,
      "swipeDirection": 35,
      "tapDuration": 2000
    };
    jimEvent.fn = jimEvent.prototype = {
      "constructor": jimEvent,
      "event": {},
      "dragoverStack": [],
      "init": function(event) {
        this.event = event;
        return this;
      }
    };
    jimEvent.fn.init.prototype = jimEvent.fn;
	var jEventFirer;

    /*********************** START STATIC EVENT FUNCTIONS ************************/
    jQuery.extend(jimEvent, {
      "clearPauseStack": function() {
        while(jimEvent.pauseStack.length) {
          clearTimeout(jimEvent.pauseStack.pop());
        }
      },
      "tryDateConversion": function(value) {
        if(typeof(value) === "string") {
          if(value.match(/^(19|20)\d\d([\- \/\.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])/) || /* check for date conversion: yyyy-mm-dd */
             value.match(/^(0[1-9]|[12][0-9]|3[01])([\- \/\.])(0[1-9]|1[012])\2(19|20)\d\d/) || /* check for date conversion: dd-mm-yyyy */
             value.match(/^(0[1-9]|1[012])([\- \/\.])(0[1-9]|[12][0-9]|3[01])\2(19|20)\d\d/)    /* check for date conversion: mm-dd-yyyy */
          ) {
            value = new Date(value);
          }
        }
        return value;
      },
      "tryBooleanConversion": function(value) {
        var testFalse, testTrue, trimmedValue;
        if(typeof(value) === "string") {
          testFalse = new RegExp("^false$", "i");
          testTrue = new RegExp("^true$", "i");
          trimmedValue = jQuery.trim(value);
          if(testFalse.test(trimmedValue)) {
            return false;
          } else if (testTrue.test(trimmedValue)) {
            return true;
          }
        }
        return value;
      },
      "tryNumberConversion": function(value) {
        var result = value;
        switch(typeof(value)) {
          case "string":
            if(value.match(/^[\-+]?(?:(?:(?:\d{1,3})[,](?=\d\d\d))+(?:\d\d\d)(?:[\.]\d*)?|\d*(?:[\.]\d*)?)$/)) { /* check for number conversion */
              result = parseFloat(value.replace(/,/g, ""));
            } else if (value.match(/^[\-+]?(?:(?:(?:\d{1,3})[\.](?=\d\d\d))+(?:\d\d\d)(?:[,]\d*)?|\d*(?:[,]\d*)?)$/)) { /* check for number conversion */
              result = parseFloat(value.replace(/\./g, "").replace(",", "."));
            }
            if(isNaN(result)) {
              result = value;
            }
            break;
          case "number":
            /* TODO: precision, trailing zeros */
            break;
          case "object":
            if(value instanceof Date) {
              result = value.getTime();
            }
            if(value instanceof areaMutable) {
            	var area=0;
            	for(var v = 0; v < value.points.length-1; v ++) {
            		area = area + (value.points[v+1].x+value.points[v].x) * (value.points[v+1].y-value.points[v].y)
            	}
            	area = area + (value.points[0].x+value.points[value.points.length-1].x) * (value.points[0].y-value.points[value.points.length-1].y)
            	result = area;
            }
            break;
        }
        return result;
      },
      "tryStringConversion": function(value) {
        switch(typeof(value)) {
          case "string":
            return value;
          case "object":
            return (jQuery.isEmptyObject(value)) ? null : jQuery("<div>" + value.toString() + "</div>").text(); 
          default:
            return jQuery("<div>" + value.toString() + "</div>").text();
        }
      },
      "tryAreaConversion": function(value) {
          switch(typeof(value)) {
          	case "object":
          	if(value instanceof areaMutable) {
                return value;
            }
          }
          return false;
        },
      "isInDataDataRow": function($target) {
        return ($target.closest(".datarow").length === 0) ? false : true;
      },
      "isNumber": function(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
      },
      "printObjectProperties": function(o) {
        var value = "", property;
        if(jimUtil.exists(o) && typeof(o) === "object" && !jQuery.isEmptyObject(o)) {
          if(o.hasOwnProperty("id") && o.hasOwnProperty("datamaster")) {
            value = jimEvent.printObjectProperties(o.userdata);
          } else {
            for (property in o) {
              if (o.hasOwnProperty(property)) {
                value += o[property] + ",";
              }
            }
            value = value.substring(0, value.length-1); /* remove last , */
          }
        }
        return value;
      },
      "getHtml": function(type, values, $component) {
        var html = "", option, isHorizontal, property, readonly, v, vLen;
        switch(type) {
          case itemType.dropdown:
          case itemType.nativedropdown:
          case itemType.selectionlist:
          case itemType.multiselectionlist:
            for(v = 0, vLen = values.length; v < vLen; v += 1) {
              option = values[v];
              if (jimUtil.exists(option) && jimUtil.exists(option.value)) {
                option = jimUtil.toHTML(option.value);
              } else if (typeof(option) === "object") {
                option = jimUtil.toHTML(jimEvent.printObjectProperties(option));
              } else {
                option = jimUtil.toHTML(option);
              }
              
              if(type === itemType.dropdown || type === itemType.nativedropdown) {
                html += "<option class='option'>"+option+"</option>";
              } else {
                html += "<div class='option'>"+option+"</div>";
              }
            }
            break;
          case itemType.radiobuttonlist:
          case itemType.checkboxlist:
            isHorizontal = $component.css("width") === "100%";
            property = $component.attr("name");
            property = (property === undefined) ? "name=\""+$component.attr("id")+"\"" : "name=\""+property+"\"";
            readonly = $component.attr("readonly");
            readonly = (readonly === undefined) ? "" : "disabled=\"disabled\""; 
            type = (type === itemType.radiobuttonlist) ? "radio" : "checkbox";
            if(isHorizontal) { html += "<tr>"; }
            for(i = 0; i < values.length; i += 1) {
              option = values[i];
              if (option.value !== undefined) {
                option = jimUtil.toHTML(option.value);
              } else if (typeof(option) === "object") {
                option = jimUtil.toHTML(jimEvent.printObjectProperties(option));
              } else {
                option = jimUtil.toHTML(option);
              }
              if(!isHorizontal) { html += "<tr>"; }
              if(jimDevice.isMobile() && jimDevice.isiOS()) {
            	  type = (type === itemType.radiobuttonlist) ? "radiobutton" : "checkbox";
            	  html += "<td><div class=\""+type+"\" "+property+" "+readonly+" /><span class=\"option\">"+option+"</span></td>";
              }
              else {
                html += "<td><input type=\""+type+"\" "+property+" "+readonly+" /><span class=\"option\">"+option+"</span></td>";
              }
              if(!isHorizontal) { html += "</tr>"; }
            }
            if(isHorizontal) { html += "</tr>"; }
            break;
        }
        return html;
      }
    });
    /************************ END STATIC EVENT FUNCTIONS *************************/
    
    return jimEvent;
  })(); 
  
  window.jimEvent = jimEvent;
  
  /*********************** START SPECIAL EVENT DELEGATION ************************/
  
  /* Search elements from #simulation by depth */
  function atPoint(clientX, clientY, lastElement) {
	var element = document.elementFromPoint(clientX, clientY);
	if(element) {
		if(jQuery(element).is('input:not([readonly]), textarea:not([readonly]), select:not([readonly])')) {
		  return [];
		} else if(element === lastElement || element.id === "simulation" || document.getElementsByTagName("html")[0] === element) {
		  return [];
		} else {
		  return $(element).parentsUntil(".input:not([readonly]), .textarea:not([readonly]), .select:not([readonly])", ".firer");
		}
	}
	return [];
  }
  function triggerGesture(jFirer, eventType, data) {
	var hasGesture = false, option, items = atPoint(data.startX, data.startY, null);
    for(v = 0, vLen = items.length; v < vLen; v += 1) {
      option = items[v];
      if(jQuery(option).is("." + eventType)) {
    	jFirer.removeData("jimGesture");
		jQuery(option).trigger(eventType);
    	hasGesture = true;
    	break;
      }
    } 
    return hasGesture;
  }
  function searchClickAndGesture(data, jFirer) {
	var option, target, items = atPoint(data.startX, data.startY, null);
    for(v = 0, vLen = items.length; v < vLen; v += 1) {
      option = items[v];
      if(jQuery(option).is(".click, .mouseup") && jQuery(option).is(".swiperight, .swipeleft, .swipeup, .swipedown, .swipeleftup, .swipeleftdown, .swiperightup, .swiperightdown, .rotateleft, .rotateright, .pinchopen, .pinchclose")) {
    	target = option;
		break;
      }
    } 
    return target;
  }
  
  if(jimUtil.isAndroidDevice()){
	var oldLength = -1;
	var backspaceCode = 8;
		  
	jQuery(".firer")
	.on("keydown", function(event, data) {
		//this is a patch in order to capture when the backspace key is pressed
		//the value of the input shouldn't be updated at this moment, but it's possible if there's some kind
		//of delay or lag between the event and this handler.
		oldLength = jimEvent(event).getEventFirer().find("input:first")[0].value.length;
	})
	.bind("keypress", function(event, data) { // Enter is the only key in the soft keyboard triggering this function
	  var $firer = jimEvent(event).getEventFirer();
	  if(!(data && data.preventTrigger)) { /* prevent infinite loop */
	    $firer.trigger("keyup.jim", [{"preventTrigger": true, "altKey":event.altKey, "ctrlKey":event.ctrlKey, "shiftKey": event.shiftKey, "which":event.which}]);
	  }
	})
	.bind("input", function(event, data) { // Almost every key in the soft keyboard trigger this function
	  	//we filter the events as this is not an OnKeyUp event
	  	if(event.originalEvent.inputType != "insertText" && event.originalEvent.inputType != "insertCompositionText" && event.originalEvent.inputType != "deleteContentBackward")
	  		return;
	  	var $firer = jimEvent(event).getEventFirer();
	  	var newLength = $firer.find("input:first")[0].value.length;
	  	var isBackspace = !event.originalEvent.data || (oldLength != -1 && event.originalEvent.inputType == "insertCompositionText" && oldLength > newLength);
	  	oldLength = -1; // reset variable
	  	//The "period on double space" feature triggers a deleteContentBackward event, completely breaking this patch
	  	var which = isBackspace ? backspaceCode : event.originalEvent.data.toUpperCase().charCodeAt(event.originalEvent.data.length - 1);
	  	if(!(data && data.preventTrigger)) { /* prevent infinite loop */
	      $firer.trigger("keyup.jim", [{"preventTrigger": true, "altKey": event.altKey ? event.altKey : false, "ctrlKey": event.ctrlKey ? event.ctrlKey : false, "shiftKey": event.shiftKey ? event.shiftKey : false, "which":which}]);
	   }
	})
  }
  
  jQuery("html")
  .bind("keydown keyup", function(event, data) {
	var $firer = jimEvent(event).getEventFirer();
	if(!(data && data.preventTrigger)) { /* prevent infinite loop */
      $firer.trigger(event.type + ".jim", [{"preventTrigger": true, "altKey":event.altKey, "ctrlKey":event.ctrlKey, "shiftKey": event.shiftKey, "which":event.which}]);
    }
    if(event.which === 9 && $firer.is(".text, .password, .textarea")) { /* prevent TAB in our input components */
      return false;
    }
    if(event.which !== 116 && $firer.not("textarea.annotation, input#search-field, .text, .password, .textarea, #blockui input").length) { // prevent default behavior except for comments and F5 
      return false;
    }
  })
  .bind("variablechange", function(event, data) {
	var $firer = jimEvent(event).getEventFirer();
    $firer.trigger(event.type + ".jim", [{"variableTarget": data.variableTarget}]);
  })
  .bind("mouseup", function(event) {
	if(event.button === 2) {
      var jFirer = jimEvent(event).getEventFirer();
      jFirer.trigger("rightclick");
      if(jFirer.hasClass("screen")) {
        jQuery(".template").trigger("rightclick");
      }
    }
  })
  .bind("click dblclick", function(event) {
    var jFirer = jimEvent(event).getEventFirer();
    if(jFirer.hasClass("screen")) {
      jQuery(".template").trigger(event.type);
    }
  })
  .bind("touchstart mousedown gesturestart gestureend touchend mouseup touchmove", function(event) {
    var jEvent = jimEvent(event),
        jFirer = jEvent.getEventFirer(),
        target = jFirer[0],
        touches = event.originalEvent && (event.originalEvent.changedTouches || event.originalEvent.touches),
        hasTouches = !!touches,
        hasGesture = false, 
        data, deltaPinch, deltaRotate, deltaX, deltaY, eventType;
    
	if(jimEvent.jEventFirer && event.type==="mouseup") {
		jFirer = jimEvent.jEventFirer;
	}
	
    switch(event.type) {
      case "touchstart":
      case "mousedown":
      case "gesturestart":
        jimEvent.jEventFirer = jFirer;
        jFirer.data("jimGesture", {"startX": (hasTouches) ? touches[0].pageX : event.pageX, "startY": (hasTouches) ? touches[0].pageY : event.pageY});
        break;
      case "gestureend":
        data = jFirer.data("jimGesture");
        if(data) {
          deltaPinch = event.originalEvent.scale;
          deltaRotate = event.originalEvent.rotation;
          if(Math.abs(deltaRotate) > jimEvent.thresholds.rotate) {
        	eventType = "rotate" + ((deltaRotate > 0) ? "right" : "left");
        	triggerGesture(jFirer, eventType, data);
          } else if((deltaPinch%1) > jimEvent.thresholds.pinch) {
        	eventType = "pinch" + ((deltaPinch > 1) ? "open" : "close");
            triggerGesture(jFirer, eventType, data);
          }
        }
        jFirer.removeData("jimGesture");
        jimEvent.jEventFirer = undefined;
        break;
      case "touchend":
      case "mouseup":
    	if(jFirer.data("jimStartGesture") && jFirer.data("jimEndGesture")){
    		data = jFirer.data("jimStartGesture");
    		
    		var initialDeltaX = data.startX[0] - data.startX[1];
    		var initialDeltaY = data.startY[0] - data.startY[1];
    		var initialDist = Math.sqrt(initialDeltaX*initialDeltaX + initialDeltaY*initialDeltaY);
    		var initialAngle = 180*Math.atan2(initialDeltaY, initialDeltaX) / Math.PI;
    		
    		data = jFirer.data("jimEndGesture");
    		var endDeltaX = data.endX[0] - data.endX[1];
    		var endDeltaY = data.endY[0] - data.endY[1];
    		var endDist = Math.sqrt(endDeltaX*endDeltaX + endDeltaY*endDeltaY);
    		var endAngle = 180*Math.atan2(endDeltaY, endDeltaX) / Math.PI;
    		
    		var deltaPinch = Math.abs(endDist-initialDist)/initialDist;
    		var deltaRotate = endAngle - initialAngle;
    		
    		data = jFirer.data("jimGesture");
    		if(Math.abs(deltaRotate) > jimEvent.thresholds.rotate) {
              eventType = "rotate" + ((deltaRotate > 0) ? "right" : "left");
              triggerGesture(jFirer, eventType, data);
            } else if((deltaPinch > 1 ? deltaPinch-1 : deltaPinch) > jimEvent.thresholds.pinch) {
              eventType = "pinch" + ((deltaPinch > 1) ? "open" : "close");
              triggerGesture(jFirer, eventType, data);
            }
    		
        	jFirer.removeData("jimStartGesture");
        	jFirer.removeData("jimEndGesture");
    	} else if(jFirer.data("jimGesture")) {
            data = jFirer.data("jimGesture");
        	deltaX = ((hasTouches) ? touches[0].pageX : event.pageX) - data.startX;
            deltaY = ((hasTouches) ? touches[0].pageY : event.pageY) - data.startY;
            if(Math.abs(deltaX) > jimEvent.thresholds.swipe || Math.abs(deltaY) > jimEvent.thresholds.swipe) {
            	eventType = "swipe" + ((Math.abs(deltaX) > jimEvent.thresholds.swipeDirection) ? ((deltaX > 0) ? "right" : "left") : "") + ((Math.abs(deltaY) > jimEvent.thresholds.swipeDirection) ? ((deltaY > 0) ? "down" : "up") : "");
            	hasGesture = triggerGesture(jFirer, eventType, data);
            } else if(hasTouches) {
            	var option = searchClickAndGesture(data, jFirer);
            	if(option !== undefined && event.type==="touchend") {
					jFirer.trigger("click");
            	}
            }
        }
        jFirer.removeData("jimGesture");
        jimEvent.jEventFirer = undefined;
		break;
      case "touchmove":
      	if(jimUtil.isAndroidDevice() && hasTouches && touches.length == 2){ //pinch-rotate cases in android
          	if(!jFirer.data("jimStartGesture"))
          		jFirer.data("jimStartGesture", {"startX": [touches[0].pageX, touches[1].pageX], "startY": [touches[0].pageY, touches[1].pageY]});
          	else
          		jFirer.data("jimEndGesture", {"endX": [touches[0].pageX, touches[1].pageX], "endY": [touches[0].pageY, touches[1].pageY]});
      	}
      	break;
    }
  });
  jQuery.event.special.taphold = {
    "setup": function() {
      var $this = jQuery(this);
      $this.bind("touchstart mousedown", function(event) {
        var timer, $target = jQuery(event.target);
  		var prevented = false;
        if (event.which && event.which !== 1) {
          return false;
        }
        if($target.closest(".firer").hasClass("taphold")) {
          event.preventDefault(); /* prevent context menu etc. */
  		  prevented = true;
        }
        function clearTabTimer() {
          clearTimeout(timer);
  		  if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android|Windows Phone)/) && prevented) {
  			$target.trigger("click", jQuery.Event("click", {target: event.target}));
  			$this.unbind("touchend mouseup");
  		  }
  		}
        $this.bind("touchend mouseup", clearTabTimer);
        timer = setTimeout(function() {
          $target.trigger("taphold", jQuery.Event("taphold", {target: event.target}));
          return false;
        }, 750);
      });
    }
  };
  jQuery(window)
  .bind("orientationchange", function() {
    var newOrientation = "orientation" + (((window.orientation/90)%2 === 0) ? "portrait" : "landscape");
    jQuery("." + newOrientation).trigger(newOrientation);
  })
  .bind("loadcomponent", function(event) {
    jQuery(".windowresize").trigger("windowresize");
    //pin optimization when scroll is enabled only in one axis
    var $simulation = jQuery("#simulation");
    if($simulation.css("overflow-y")=="hidden"){
    	jimPin.scrollAxisChanged("horizontal");
    	jimPin.oldScrollDir = "horizontal";
    }else{
	    jimPin.scrollAxisChanged("vertical");
	    jimPin.oldScrollDir = "vertical";
    }
  })
  .bind("resize", function() {
	 //jimResponsive.refreshResponsiveComponents();
	 //jimPin.notifySizeChange(undefined,true);
     jQuery(".windowresize").trigger("windowresize");
     jimLayout.relayoutContent();
  });  
  jQuery("#simulation").bind("scroll", function() {
	  jQuery(".windowscroll").trigger("windowscroll");
  });
  /************************** END SPECIAL EVENT DELEGATION ************************/
  
  window.mousePos = {x:0,y:0};
  var saveMousePosition = function(e){ 
	  var simulationBounds = jQuery("#simulation")[0].getBoundingClientRect();
	  mousePos.x = (e.clientX || e.pageX)-simulationBounds.left + jimEvent.fn.jimWindowScrollX(); 
	  mousePos.y = (e.clientY || e.pageY)-simulationBounds.top + jimEvent.fn.jimWindowScrollY(); 
  };
  if(document.addEventListener){
	  document.addEventListener('mousemove',saveMousePosition , false);
  }else{//IE8
	  document.attachEvent("onmousemove", saveMousePosition);
	  
  }
  
})(window);

function areaMutable(areas){
	  this.areas = areas;
}

function area(points){
	  this.points = points;
}
