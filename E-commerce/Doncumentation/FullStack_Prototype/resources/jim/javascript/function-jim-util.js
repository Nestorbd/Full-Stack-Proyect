(function( window, undefined) {
  var $simulation = jQuery("#simulation"), debugEnabled = false;

  /* START PREVENT RIGHT-CLICK CONTEXT MENU AND OTHERS */
  jQuery("html").bind("mouseup, mousedown", function(event) {
    if(event.button === 2) {
      this.oncontextmenu = function() { return false; };
    }
  });

  if($.browser.msie && $.browser.version<9) {
	jQuery("html")[0].attachEvent("ondragstart", function(event) {
	  if($(event.target || event.srcElement).is("img"))
    	return false;
    });
  }
  /* END PREVENT RIGHT-CLICK CONTEXT MEN.U AND OTHERS */

  /* START PROTOTYPICAL ADDITIONS */
  if(!Array.prototype.contains) {
    Array.prototype.contains = function(value) {
      if (value) {
        var array = this, i, iLen, org;
        for (i=0, iLen=array.length; i<iLen; i+=1) {
          org = array[i];
          if(org instanceof jQuery) {
            org = org[0];
          }
          if(value instanceof jQuery) {
            value = value[0];
          }
          if (org === value) {
            return true;
          }
        }
      }
      return false;
    };
  }

  if (!Array.prototype.indexOf){
	  Array.prototype.indexOf = function(elt /* , from */)
	  {
		var len = this.length >>> 0;

		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			 ? Math.ceil(from)
			 : Math.floor(from);
		if (from < 0)
		  from += len;

		for (; from < len; from++)
		{
		  if (from in this &&
			  this[from] === elt)
			return from;
		}
		return -1;
	};
  }

  jQuery.fn.reverse = [].reverse;

  /* IE: string has no trim function */
  if(!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(str) {
      return this.indexOf(str) === 0;
    };
  }

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  jQuery.expr[":"].econtains = function(obj, index, meta, stack) {
    return (obj.textContent || obj.innerText || $(obj).text() || "").toLowerCase() === meta[3].toLowerCase();
  };

  /* Rick Stahl: http://www.west-wind.com/WebLog/posts/282495.aspx */
  if(!String.repeat) {
    String.repeat = function(chr, count) {
      var str = "", x;
      for (x=0; x<count; x+=1) {
        str += chr;
      }
      return str;
    };
  }

  if(!String.prototype.padL) {
    String.prototype.padL = function(width, pad) {
      var length;
      if (!width || width < 1) {
        return this;
      }
      if (!pad) {
        pad = " ";
      }
      length = width - this.length;
      if (length < 1) {
        return this.substr(0, width);
      }
      return (String.repeat(pad, length) + this).substr(0, width);
    };
  }

  if(!String.prototype.padR) {
    String.prototype.padR = function(width, pad) {
      var length;
      if (!width || width < 1) {
        return this;
      }
      if (!pad) {
        pad = " ";
      }
      length = width - this.length;
      if (length < 1) {
        this.substr(0, width);
      }
      return (this + String.repeat(pad, length)).substr(0, width);
    };
  }

  if(!Date.prototype.formatDate) {
    Date.prototype.formatDate = function(format) {
      var date = this, month, year, hours;
      if (!format) {
        format = "MM/dd/yyyy";
      }
      month = date.getMonth() + 1;
      year = date.getFullYear();
      format = format.replace("MM", month.toString().padL(2, "0"));
      if (format.indexOf("yyyy") > -1) {
        format = format.replace("yyyy", year.toString());
      } else if (format.indexOf("yy") > -1) {
        format = format.replace("yy", year.toString().substr(2, 2));
      }
      format = format.replace("dd", date.getDate().toString().padL(2, "0"));
      hours = date.getHours();
      if (format.indexOf("t") > -1) {
        if (hours > 11) {
          format = format.replace("t", "pm");
        } else {
          format = format.replace("t", "am");
        }
      }
      if (format.indexOf("HH") > -1) {
        format = format.replace("HH", hours.toString().padL(2, "0"));
      }
      if (format.indexOf("hh") > -1) {
        if (hours > 12) {
          hours = hours - 12;
        }
        if (hours === 0) {
          hours = 12;
        }
        format = format.replace("hh", hours.toString().padL(2, "0"));
      }
      if (format.indexOf("mm") > -1) {
        format = format.replace("mm", date.getMinutes().toString().padL(2, "0"));
      }
      if (format.indexOf("ss") > -1) {
        format = format.replace("ss", date.getSeconds().toString().padL(2, "0"));
      }
      return format;
    };
  }
  /* END PROTOTYPICAL ADDITIONS */

  /* START JQUERY EXTENSION */
  jQuery.fn.extend({
    "jimForceVisibility": function() {
      var $hidden = this.parentsUntil("#simulation").andSelf().filter(function() { return jQuery(this).css('display') == 'none'; });
      this.data("hiddenElements", $hidden);
      var t, tLen, $target;
      for(t=0, tLen=(jimUtil.exists($hidden)) ? $hidden.length : 0; t<tLen; t+=1) {
         $target = jQuery($hidden[t]);
         if($target.jimGetType()=== itemType.panel || $target.jimGetType() === itemType.datarow || $target.jimGetType() === itemType.gridcell || $target.jimGetType() === itemType.gridrow){
            $target.removeClass('hidden');
            // $hidden.show(); //jimUtil.show() modify the visibility of sibling
			// panels but the original state of each of these panels isn't
			// restored on jimUndoVisibility
         }else{
            // jimUtil.show($target);
            $target.removeClass('forceVisible').addClass('forceVisible');
         }
      }
      return this;
    },
    "jimUndoVisibility": function() {
      var $hidden = this.data("hiddenElements");
      if(jimUtil.exists($hidden)) {
          var t, tLen, $target;
          for(t=0, tLen=$hidden.length; t<tLen; t+=1) {
             $target = jQuery($hidden[t]);
             if($target.jimGetType()=== itemType.panel || $target.jimGetType() === itemType.datarow || $target.jimGetType() === itemType.gridcell || $target.jimGetType() === itemType.gridrow){
                $target.addClass('hidden');
             }else{
                // $target.hide();
                $target.removeClass('forceVisible');
             }
          }
        this.data("hiddenElements", null);
      }
      return this;
    },
    "jimPosition": function(returnBBox) {
      var scroll = jimUtil.getScrollPosition(), simulationBounds = jQuery("#simulation")[0].getBoundingClientRect(), position, zoom = 1;
      var zoom = jimUtil.getZoom();
      this.jimForceVisibility();

      position = jQuery.extend({}, this[0].getBoundingClientRect());
	  
	  if (jimUtil.isRelative(this)) {
		var relativeBounds = jimUtil.getRelativeItemOffset(this);
		position.top = relativeBounds.y;
		position.left = relativeBounds.x;
		position.right = relativeBounds.x + relativeBounds.width;
		position.bottom = relativeBounds.y + relativeBounds.height;
	  }
	  
      position.height= position.bottom - position.top;
      position.width= position.right - position.left;
      position.top = position.top + (scroll.top*(1/zoom)) - simulationBounds.top;
      position.left = position.left + (scroll.left*(1/zoom)) - simulationBounds.left;

      if(!jimUtil.exists(returnBBox)  || returnBBox===false){
		  var width = jimUtil.isRelative(this) ? position.width : this[0].offsetWidth;
		  var height = jimUtil.isRelative(this) ? position.height : this[0].offsetHeight;
		  
          position.top += (position.height - (height/(1/jimUtil.getTotalScale())))/2;
          position.left += (position.width - (width/(1/jimUtil.getTotalScale())))/2;
		  position.height = height;
          position.width = width;
      }
      // apply scale
	  position.top = position.top*(1/jimUtil.getTotalScale());
	  position.left = position.left*(1/jimUtil.getTotalScale());
      // end scale
	  if(!jimUtil.exists(returnBBox)  || returnBBox===false){
	      position.bottom = position.top + position.height;
	      position.right= position.left + position.width;
	  }
	  else{
	      position.bottom = position.top + (position.height*(1/jimUtil.getTotalScale()));
	      position.right= position.left + (position.width*(1/jimUtil.getTotalScale()));
	  }

      this.jimUndoVisibility();

      return position;
    },

    "jimGetType": function() {
      var classes = this.attr("class"), i, iLen, type;
      if(classes !== undefined) {
        classes = classes.split(" ");
        for(i=0, iLen=classes.length; i<iLen; i+=1) {
          type = classes[i];
          if(itemType.hasOwnProperty(type)) {
            return itemType[type];
          }
        }
      }
    },
    "jimGetCanvasName": function() {
      return this.closest(".screen, .template, .master").attr("name");
    },
    "jimOuterHeight": function() {
    	var height = this.attr("datasizeheight");
    	if(height!==undefined)
    		height = parseInt(height);
    	else height = this.outerHeight();
    	if(this[0].nodeName === "svg"){
    		height = this[0].getBBox().height;
    	}
        return height;
      },
    "jimOuterWidth": function() {
    	var width = this.attr("datasizewidth");
    	if(width!==undefined)
    		width = parseInt(width);
    	else width = this.outerWidth();
    	if(this[0].nodeName === "svg"){
    		width = this[0].getBBox().width;
    	}
		if(this.hasClass("file"))
			width = width + 71;
        return width;
      }
  });
  /* START JQUERY EXTENSION */

  var itemType = {
    "label": 1,
    "image": 2,
    "richtext": 3,
    "table": 4,
    "cell": 5,
    "rectangle": 6,
    "dynamicpanel": 7,
    "panel": 8,
    "text": 9,
    "password": 10,
    "textarea": 11,
    "checkbox": 12,
    "radiobutton": 13,
    "date": 14,
    "time": 15,
    "file": 16,
    "selectionlist": 17,
    "multiselectionlist": 18,
    "dropdown": 19,
    "radiobuttonlist": 20,
    "checkboxlist": 21,
    "tree": 22,
    "treenode": 23,
    "menu": 24,
    "menunode": 25,
    "datalist": 26,
    "headerrow": 27,
    "datarow": 28,
    "datacell": 29,
    "summary": 30,
    "index": 31,
    "master": 32,
    "simulation": 33,
    "screen": 34,
    "template": 35,
    "texttable": 36,
    "textcell": 37,
    "line": 38,
    "button": 39,
    "imagemap": 40,
    "html": 41,
    "url": 42,
    "document": 43,
    "flash": 44,
    "website": 45,
    "group": 46,
    "ellipse": 47,
    "triangle": 48,
    "callout" : 49,
    "svgContainer":50,
    "shapewrapper":51,
    "nativedropdown": 52,
    "datagrid": 53,
	"gridcell": 54,
	"gridrow" : 55,
	"masterinstance" : 56
  };

  var eventTypes = [
  "click",
  "mouseup",
  "mousedown",
  "doubleclick",
  "rightclick",
  "toggle",
  "keyup",
  "keydown",
  "mouseover",
  "mouseenter",
  "mouseleave",
  "change",
  "focusin",
  "focusout",
  "pageload",
  "pageunload",
  "dragstart",
  "drag",
  "dragend",
  "swipeup",
  "swipedown",
  "swipeleftup",
  "swipeleft",
  "swipeleftdown",
  "swiperightup",
  "swiperight",
  "swiperightdown",
  "pinchopen",
  "pinchclose",
  "rotateleft",
  "rotateright",
  "taphold",
  "orientatiportrait",
  "orientationlandscape",
  "windowresize"
  ];

  /* START UTILITY FUNCTIONS */
  var jimUtil = {
    "eventTypes" : eventTypes,

    "debug": function(error) {
      if (debugEnabled && window.console) {
        if(typeof(error) === "string") {
          console.log(error);
        } else if(typeof(error) === "object") {
          console.dir(error);
        }
      }
    },
    "getKeys": function(o) {
      var accumulator = [], property;
      for(property in o) {
        if(o.hasOwnProperty(property)) {
          accumulator.push(property);
        }
      }
      return accumulator;
    },
    "isArray": function(obj) {
      return (obj.constructor.toString().indexOf("Array") === -1) ? false : true;
    },
    "getValues": function(o, filter) {
      var accumulator = [], property;
      for(property in o) {
        if(o.hasOwnProperty(property) && !filter.contains(property)) {
          accumulator.push(o[property]);
        }
      }
      return accumulator;
    },
    "unique": function(array) {
      var r = [], i, n, x, y;
      o: for (i=0, n=array.length; i<n; i+=1) {
        for(x=0, y=r.length; x<y; x+=1) {
          if (r[x].key === array[i].key) {
            continue o;
          }
        }
        r[r.length] = array[i];
      }
      return r;
    },
    "toArray": function(arrayLike) {
      var array, i, iLen;
      if(jimUtil.isArray(arrayLike)) {
        return arrayLike;
      } else {
        array = [];
        if(jimUtil.exists(arrayLike)) {
          if (typeof(arrayLike) === "string") {
            arrayLike = arrayLike.split(",");
          }
          for (i=0, iLen=arrayLike.length; i<iLen; i+=1) {
            array.push(arrayLike[i]);
          }
        }
        return array;
      }
    },
    "escapeRegex": function(value) {
      var acEscape, reReplace;
      acEscape = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^' ];
      reReplace = new RegExp('(\\' + acEscape.join('|\\') + ')', 'g');
      return value.replace(reReplace, '\\$1');
    },
    "exists": function(o) {
      return (typeof o !== "undefined" && o !== null);
    },
	"getCurrentScreen": function() {
      return jQuery.map(jQuery(".screen:visible"), function(canvas, i) {return canvas.id;})[0];
    },
    "getCanvases": function() {
      return jQuery.map(jQuery(".screen:visible, .template:visible, .master, .ui-scenario"), function(canvas, i) {return canvas.id;});
    },
    "hasCanvas": function(canvas) {
      return jimUtil.getCanvases().contains(canvas);
    },
    "showElementThroughParentPanes": function(c) {
    	// Fix for JP-10374
        // check that all c's parents are not panels or, if the are, are the
		// active one.
        // if not set active.
        var panel = c.closest(".panel");
        while (panel.jimGetType() === itemType.panel){
        	var activePanel = panel.parent().find(":visible");
        	if(!(activePanel === panel))
        		panel.trigger("panelactive");
        		jimUtil.show(panel, null).done(function() {
        			jimUtil.refreshPageMinSizeWithTarget(panel);
        		});
        	panel = panel.parent().closest(".panel");
        }
    },
    "getScrollPosition": function() {
        var $scrollableElement;
        if(jimUtil.isMobileDevice())
  	      	$scrollableElement = jQuery("#simulation");
  	  else if(window.jimDevice.isMobile())
  	      	$scrollableElement =  jQuery(".ui-page-active");
  	  else
  	      	$scrollableElement = jQuery("#simulation");

        return {
          "top": $scrollableElement.scrollTop(),
          "left": $scrollableElement.scrollLeft()
        };
      },
    "viewportHeight": function() {
      return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body.clientHeight;
    },
    "viewportWidth": function() {
      return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body.clientWidth;
    },
    "scrollbarWidth": 0,
    "getScrollbarWidth": function() {
      /*
		 * ! Copyright (c) 2008 Brandon Aaron (brandon.aaron@gmail.com ||
		 * http://brandonaaron.net) Dual licensed under the MIT
		 * (http://www.opensource.org/licenses/mit-license.php) and GPL
		 * (http://www.opensource.org/licenses/gpl-license.php) licenses.
		 */
      if (jimUtil.scrollbarWidth === 0) {
        if (jQuery.browser.msie) {
          var $textarea1 = jQuery('<textarea cols="10" rows="2"></textarea>').css({position : 'absolute', top : -1000, left : -1000}).appendTo('body'),
          $textarea2 = jQuery('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({position : 'absolute', top : -1000, left : -1000}).appendTo('body');
          jimUtil.scrollbarWidth = $textarea1.width() - $textarea2.width();
          $textarea1.add($textarea2).remove();
        } else {
          var $div = jQuery('<div />').css({width : 100, height : 100, overflow : 'auto', position : 'absolute', top : -1000, left : -1000}).prependTo('body').append('<div />').find('div').css({width : '100%', height : 200});
          jimUtil.scrollbarWidth = 100 - $div.width();
          $div.parent().remove();
        }
      }
      return jimUtil.scrollbarWidth;
    },
    /*
	 * based on idea:
	 * http://onemarco.com/2008/11/12/callbacks-and-binding-and-callback-arguments-and-references/
	 */
    "createCallback": function(action, opts) {
      return function() {
        var args = opts.args || [],
            scope = opts.scope || this,
            fargs = (opts.supressArgs === true) ? [] : jimUtil.toArray(arguments);
        action.apply(scope, fargs.concat(args));
      };
    },
    "isAlternateModeActive": function() {
      return !(typeof(annotation) === "undefined" || !annotation.isActive()) || jimDevelopers.isActive();
    },
    "isAnnotationInactive": function() {
      return (typeof(annotation) === "undefined" || !annotation.isActive());
    },
    "createUIEffectOptions": function(effect, callback) {
        var options = jimUtil.createAnimationOptions(effect);
        if(effect) {
      	  if(effect.type) {
             jQuery.extend(options, {"effect": effect.type});
          }
          if(effect.direction) {
            jQuery.extend(options, {"direction": effect.direction});
          }
          if(effect.times) {
            jQuery.extend(options, {"times": effect.times});
          }
          if(callback) {
        	jQuery.extend(options, {"complete": callback});
          }

        }
        return options;
      },
    "createAnimationOptions": function(effect,callback) {
      var options = {};
      if(effect) {
    	if(effect.duration) {
          jQuery.extend(options, {"duration": effect.duration});
        }
        if(effect.easing) {
          jQuery.extend(options, {"easing": effect.easing});
        }
        if(callback) {
          jQuery.extend(options, {"always":callback});
        }
        jQuery.extend(options, {"queue": false});
      }
      return options;
    },
	"createResizeAnimationOptions" : function(effect, vWrap, callback) {
      var options = this.createAnimationOptions(effect,callback);
      if (effect && vWrap.length > 0) {
        var functions = [];
        jQuery.each(vWrap, function (index, value) {
          functions[index] = function () {};
          var obj = $(value);
          if (obj.hasClass("verticalWrap"))
        	functions[index] = jimUtil.wrapVerticalLayout;
          else if (obj.hasClass("horizontal") && (obj.attr("hspacing") != 0 || obj.attr("vspacing") != 0))
            functions[index] = jimUtil.wrapHorizontalLayout;
        });

        var itCount = 0;
        jQuery.extend(options, {"progress": function () {
          if (itCount % 3 == 0)
            jQuery.each(vWrap, function (index, value) {functions[index](value, true);});
          ++itCount;
        }});
      }
      return options;
	},
    "showCallback": function(args) {
      if(jimUtil.exists(args) && jimUtil.exists(args.target)) {
        if(args.effect && args.effect.type && args.effect.type === "pulsate") {
          jQuery.effects.restore(args.target, ["opacity"]);
        }
       	if ($(args.target).parent(".layout.horizontal").length)
       	  $(args.target).css("display", "inline-block");
        switch(args.target.jimGetType()) {
          case itemType.panel:
			if(window.PIE) {
		      $(args.target).siblings().find('.pie').addBack().each(function(){
		    	PIE.detach(this);
		      });
		    }

		    args.target.removeClass("hidden").css("display", "");
		    args.target.siblings().addClass("hidden").css("display", "").end().css({"z-index": "", "position": "", "top": "", "left": ""});

			$(args.target).parent().css("width", $(args.target).data("width") +  $(args.target).data("widthUnit"));
			$(args.target).parent().css("height", $(args.target).data("height") +  $(args.target).data("heightUnit"));

		    if(window.PIE) {
		      $(args.target).find('.pie:not(.shape)').addBack().each(function() {
		    	PIE.detach(this);
		    	if($(this).hasClass('pie')) {
		    	  PIE.attach(this);
		    	}
		      });
		    };
            break;
          case itemType.menunode:
            if(!(args.target.closest(".menu").is(".vertical")))
                args.target.css("display", "inline-block");
            break;
        }
      }
    },
    "forceReflow": function($target) {
      if(jQuery.browser.webkit) {
        document.styleSheets[0].addRule('.force-reflow-webkit', '');
      } else {
        var $element = ($target && $target instanceof jQuery) ? $target : jQuery("body");
        $element.addClass("force-reflow").removeClass("force-reflow");
      }
    },
    "show": function($targets, args) {
      var t, tLen, $target, options, deferred = jQuery.Deferred();
      for(t=0, tLen=(jimUtil.exists($targets)) ? $targets.length : 0; t<tLen; t+=1) {
        $target = jQuery($targets[t]);
        if($target.parent(".layout.horizontal").length) {
          $target.css("display", "inline-block");
        }
        if(args && args.effect) {
          /* TODO: add .stop() to interrupt animation */
          if(args.effect.type==="pulsate") {
            $.effects.save($target, ["opacity"]);
          }
          options = jimUtil.createUIEffectOptions(args.effect, function() {
            jimUtil.showCallback({"target": $target, "effect": args.effect});
            deferred.resolve($targets, args);
          });
		  if (window.PIE) {
		    $target.show();
            $target.find(".pie").andSelf().each(function() {
              // force redraw
              $(this)[0].fireEvent("onresize");
            });
          }
		  var firstFrame = true;
          $target.hide().show(options);
        } else if (args && args.transition) {
          transition.start($target, $target.siblings(":visible"), args.transition, false).done(function() {
            jimUtil.showCallback({"target": $target});
            deferred.resolve($targets, args);
          });
        } else {
          $target.show();

		  if (window.PIE){
              $target.find(".pie").andSelf().each(function(){
            	  // force redraw
            	  $(this)[0].fireEvent("onresize");
              });
           }
          jimUtil.showCallback({"target": $target});
          deferred.resolve($targets, args);
        }
      }
      jimUtil.forceReflow();
      return deferred.promise();
    },
    "fitToScreen": function() {
		if (jimUtil.fitted && $(".ui-scenario").length == 0) {
		  var container = jQuery("#jim-container");
		  var screen = $(".screen").last();
		  var modelWidth = (screen.hasClass("LANDSCAPE")) ? parseInt(screen.attr("height")) : parseInt(screen.attr("width"));
		  var width, height;

		  if (window.jimDevice.isMobile() && !jimUtil.isMobileDevice()) {
			  width = parseFloat(container.css("width"));
			  height = parseInt(container.css("height"));
		  }
		  else if (jimUtil.isMobileDevice()) {
			  width = $(window).outerWidth();
			  height = $(window).outerHeight();
		  }
		  else {
			  width = $("#jim-body").outerWidth();
			  height =  $("#jim-body").outerHeight();
		  }

		  var scale = width / modelWidth;
		  if (scale != 1 || jimUtil.getScale() != 1) {
			  if (!window.jimDevice.isMobile() && !jimUtil.isMobileDevice() && jQuery("#simulation")[0].scrollHeight * scale > height) {
			  	width -= jimUtil.getScrollbarWidth();
			  	scale = width / modelWidth;
			  }

			  window.jimUtil.scale = scale*100;
			  $(".ui-page-active #zoomDiv").css({"width": 100/scale + "%", "height": 100/scale + "%"});
			  if (window.jimDevice.isMobile()) $("#zoomDiv #backgroundBox").not("#alignmentBox #backgroundBox").css({"width": width / scale, "height": height / scale});
			  jQuery(".ui-page #zoomDiv").css({"transform": "scale("+scale+")",
			                          "-webkit-transform": "scale("+scale+")",
			                          "-moz-transform": "scale("+scale+")",
			                          "-ms-transform": "scale("+scale+")"});
		  }
		}
    },
    "jimFocusOn": function($target, settings) {
    	if(jimUtil.exists($target) && $target.length && $target.is(":visible")) {
            var type = $target.jimGetType()
 	        switch(type) {
 	        case itemType.text:
 	        case itemType.password:
 	        case itemType.date:
 	        case itemType.time:
 	        case itemType.datetime:
 	          $target.find("input").focus();
 	          break;
 	        case itemType.file:
 	          $target.find("input:first").focus();
 	          break;
 	       case itemType.textarea:
			  $target.find("textarea").focus();
			  break;
 	        default:
 	          $target.focus();
 	          break;
 	      }
       }
    },
    "jimPointTo": function($target, settings) {
      if(jimUtil.exists($target) && $target.length && ($target.is(":visible") || (jimUtil.isRelative($target) && !$target.is(".hidden")))) {
        var type = $target.jimGetType(), targetOffset, scrollParents, i,iLen, $current, current, offsetTop, offsetLeft,dynamicPanel, scrollTop, scrollLeft, accumulatedScrollTop, accumulatedScrollLeft;
		var cellSelector = "> .cellContainerChild > .borderLayer > .layout";
        if(jimUtil.isMobileDevice()){
		  scrollParents = $target.parents(".firer:not(.screen, .template, .dynamicpanel, .cellcontainer, .datacell, .ui-page), .cellcontainer " + cellSelector + ", .datacell " + cellSelector + ", #simulation");
        } else if(window.jimDevice.isMobile()) {
		  scrollParents = $target.parents(".firer:not(.screen, .template, .dynamicpanel, .cellcontainer, .datacell, #simulation), .cellcontainer " + cellSelector + ", .datacell " + cellSelector + ", .ui-page");
		} else {
		  scrollParents = $target.parents(".firer:not(.screen, .template, .dynamicpanel, .cellcontainer, .datacell, .ui-page), .cellcontainer " + cellSelector + ", .datacell " + cellSelector + ", #simulation");
		}
        accumulatedScrollTop = $target[0].offsetTop;
        accumulatedScrollLeft = $target[0].offsetLeft;
		
		if (jimUtil.isRelative($target)) {
			var relativeOffset = jimUtil.getRelativeItemOffset($target);
			accumulatedScrollTop = relativeOffset.y;
			accumulatedScrollLeft = relativeOffset.x;
		}

        for(i=0, iLen=scrollParents.length; i<iLen; i+=1) {
          current = scrollParents[i];
          $current = jQuery(current);
          if($current.is(".panel"))
          	current = $current.find(".scrollable")[0];
          scrollTop = 0;
          scrollLeft = 0;
          /* vertical scroll */
          if(current.offsetHeight < current.scrollHeight && jimUtil.isScrollVisibleY($(current))) {
            scrollTop = accumulatedScrollTop;
            if(accumulatedScrollTop+current.clientHeight > current.scrollHeight) {
              accumulatedScrollTop= scrollTop+current.clientHeight-current.scrollHeight;
            } else {
              accumulatedScrollTop = 0;
            }
          }
          /* horizontal scroll */
          if(current.offsetWidth < current.scrollWidth && jimUtil.isScrollVisibleX($(current))) {
            scrollLeft = accumulatedScrollLeft;
            if(scrollLeft+current.clientWidth > current.scrollWidth) {
              accumulatedScrollLeft= scrollLeft+current.clientWidth-current.scrollWidth;
            } else {
              accumulatedScrollLeft = 0;
            }
          }
          /* do scroll */
          if(jimUtil.isMobileDevice() && current === document.body) {
            window.scrollTo(scrollLeft, scrollTop);
          } else {
        	var properties = {};
      		if(!settings || !settings.scroll || settings.scroll === "scrollxy") {
      		  jQuery.extend(properties, {"scrollTop": scrollTop, "scrollLeft": scrollLeft});
      		} else if(settings.scroll === "scrollx") {
      		  jQuery.extend(properties, {"scrollLeft":scrollLeft});
      		} else if(settings.scroll === "scrolly") {
      		  jQuery.extend(properties,{"scrollTop": scrollTop});
      		}

      		if(settings && settings.effect)
        		jQuery(current).animate(properties, settings.effect);
      		else
      			jQuery(current).animate(properties, undefined);

          }
          /* calculate current parent offset */
          if($current.is(".panel")){
            dynamicPanel = $current.parent()[0];
            offsetTop = dynamicPanel.offsetTop;
            offsetLeft = dynamicPanel.offsetLeft;
          }else{
            offsetTop = current.offsetTop;
            offsetLeft = current.offsetLeft;
          }
          accumulatedScrollTop += offsetTop;
          accumulatedScrollLeft += offsetLeft;
        }

      }
    },
	"isScrollVisibleX" : function(element){
		return (window.jimDevice.isMobile() && element.children(".horizontalScroll").length) || element.css('overflow-x') !== 'hidden';
	},
	"isScrollVisibleY" : function(element){
		return (window.jimDevice.isMobile() && element.children(".verticalScroll").length) || element.css('overflow-y') !== 'hidden';
	},
    "toHTML": function(value) {
      switch(typeof(value)) {
        case "string":
          value = value = value.toString();
          value = value.replace(/<br>/g, "\n");
          /* value = value.replace(/&/g, "&amp;"); */
          value = value.replace(/</g, "&lt;");
          value = value.replace(/>/g, "&gt;");
          value = value.replace(/" {2}"/g, " &nbsp;");
          value = value.replace(/\t/g, " &nbsp; &nbsp; &nbsp;");
          value = value.replace(/\r/g, "");
          value = value.replace(/\n/g, "<br />");
          break;
        case "boolean":
          value = value.toString();
          break;
      }
      return value;
    },
    "fromHTML": function(value) {
      if(typeof(value) === "string") {
        value = value.replace(/&lt;/g, "<");
        value = value.replace(/&gt;/g, ">");
        value = value.replace(/" &nbsp"/g, "  ");
        value = value.replace(/ &nbsp; &nbsp; &nbsp;/g, "   ");
        value = value.replace(/\<br\>/g, "\n");
      }
      return value;
    },
    "toJS": function(value) {
      if(typeof(value) === "string") {
        value = value.replace(/<br>/g, "\n");
      }
      return value;
    },
    "decodeURI": function(uri, force) {
      var components = uri.split("/"), c, cLen;
      for(c=0, cLen = components.length; c<cLen; c+=1) {
        components[c] = decodeURIComponent(components[c]);
      }
      return components.join("/");
    },
    "encodeURI": function(uri) {
      var components = uri.split("/"), c, cLen;
      for(c=0, cLen = components.length; c<cLen; c+=1) {
        components[c] = encodeURIComponent(components[c]);
      }
      return components.join("/");
    },
    "insertInto": function(args) {
      var $target, $parent, checkIntersect, positionIndex, position, event, $insert, $child, targetOffset, targetPosition, parentPosition, containment, point, positionType, displayType, x, y, index, insert, childOffset;
      $target = args.target;
      $parent = args.parent;
      position = args.position;
      positionIndex= args.positionIndex;
      checkIntersect = args.checkIntersect;
      event = args.event;
	  var oldParent = $target.parent();
      if(jimUtil.exists($target) && jimUtil.exists($parent)) {
        if($parent.children('#'+$target.attr("id")).length) { /*
																 * already
																 * contained
																 */
          if(jimUtil.exists(position)) {
            $target.css({"position": position.type, "top": position.top, "left": position.left});
          }
        } else {
          $layout = $parent.children("").children("");
          if ($layout.hasClass("ghostHLayout")) $layout = $layout.children(".layout");

          if($layout.length > 0 && $layout.hasClass("layout")) { /*
																	 * container
																	 * has
																	 * non-free
																	 * layout or
																	 * rounded
																	 * border
																	 */
            $insert = $layout.find("td.insertionpoint:first");
            if($insert.length) { /* container has non-free layout */
            positionType = "relative";
            displayType = "inline-block";
            if($insert.hasClass("vertical") || $insert.hasClass("verticalWrap")) {
              displayType = "block";
              if($target.hasClass("singleline"))
            	displayType = "table";
            }

              insert = "append";

              if(jimUtil.exists(positionIndex) || jimUtil.exists(position) || jimUtil.exists(event) && event.type === "dragend") {
                if(jimUtil.exists(position)) {
                  x = position.left;
                  y = position.top;
                  index = (!jimUtil.exists(position.index)) ? -1 : position.index;
                } else {
                  targetOffset = jimUtil.isRelative($target) ? jimUtil.getRelativeItemOffset($target) : $target.offset();  
                  x = jimUtil.isRelative($target) ? targetOffset.x : targetOffset.left;
                  y = jimUtil.isRelative($target) ? targetOffset.y : targetOffset.top;
                }
            	if(jimUtil.exists(positionIndex)){
            		index = positionIndex;
            	}

				var children = $insert.children();
				if (children.is(".verticalWrapper"))
					children = children.children();
				var isVertical = $insert.hasClass("vertical") || $insert.is(".horizontal.verticalWrap");
				
                children.each(function(i, child){
                  $child = jQuery(child);
				  var boundedChild = $child;
				  if ($child.is(".relativeLayoutWrapper"))
					boundedChild = $child.find(".masterinstance, .group").first();
				
                  if(index === i) {
                    insert = "before";
                  } else {
					var isChildRelative = jimUtil.isRelative(boundedChild);
                    childOffset = isChildRelative ? jimUtil.getRelativeItemOffset(boundedChild) : boundedChild.offset();
					var childWidth = isChildRelative ? childOffset.width : boundedChild.jimOuterWidth();
					var childHeight = isChildRelative ? childOffset.height : boundedChild.jimOuterHeight();
					
					if (isChildRelative) {
						childOffset.left = childOffset.x;
						childOffset.top = childOffset.y;
					}
					
                    if (isVertical) {
                      containment = {
                        "top": childOffset.top,
                        "bottom": childOffset.top + childHeight
                      };
                      if(y <= containment.top) {
                        insert = "before";
                      } else if(containment.top <= y && y <= containment.bottom) {
                        insert = (y-containment.top < containment.bottom-y) ? "before" : "after";
                      }
                    } else {
                      containment = {
                        "left": childOffset.left,
                        "right": childOffset.left + childWidth
                      };
                      if(x <= containment.left) {
                        insert = "before";
                      } else if(containment.left <= x && x <= containment.right) {
                        insert = (x-containment.left < containment.right-x) ? "before" : "after";
                      }
                    }
                  }
                  return (insert === "append");
                });
              }
			  
			  if ($target.is(".masterinstance, .group"))
				displayType = "contents";

              switch(insert) {
                case "before":
                  $target.insertBefore($child).css({"position": positionType, "top": "auto", "left": "auto", "display": displayType});
                  break;
                case "after":
                  $target.insertAfter($child).css({"position": positionType, "top": "auto", "left": "auto", "display": displayType});
                  break;
                case "append":
                  $target.appendTo($insert).css({"position": positionType, "top": "auto", "left": "auto", "display": displayType});
                  break;
              }
            } else { /* container has rounded border */
              $parent = $layout;
              if(jimUtil.intersect($target, $parent)) {
                parentPosition = $parent.jimPosition();
                targetPosition = $target.jimPosition();
                $target.appendTo($parent).css({"position": "absolute", "top": targetPosition.top - parentPosition.top + $parent.scrollTop() - parseInt($parent.css("border-top-width"),10), "left": targetPosition.left - parentPosition.left  + $parent.scrollLeft() - parseInt($parent.css("border-left-width"),10)});
              } else {
                $target.appendTo($parent).css({"position": "absolute", "top": "0px", "left": "0px"});
              }
            }
          } else { /* container has free layout */
            if(jimUtil.exists(position) && (jimUtil.exists(position.top) || jimUtil.exists(position.left))) {
              $target.appendTo($layout).css({"position": position.type, "top": position.top, "left": position.left});
            } else {
              var posType = "absolute";
              if(jimUtil.exists(position) && jimUtil.exists(position.type))
            	  posType = position.type;
              if(jimUtil.intersect($target, $parent) || (jimUtil.exists(checkIntersect) && !checkIntersect)) {
                parentPosition = $parent.jimPosition();
                targetPosition = $target.jimPosition();
                $target.appendTo($layout).css({"position": posType, "top": targetPosition.top - parentPosition.top + $parent.scrollTop() - parseInt($parent.css("border-top-width"),10), "left": targetPosition.left - parentPosition.left  + $parent.scrollLeft() - parseInt($parent.css("border-left-width"),10)});
				if (jimUtil.isRelative($target))
					jimUtil.moveRelativeItemChilds($target, {
						x : - parentPosition.left  + $parent.scrollLeft() - parseInt($parent.css("border-left-width"),10),
						y : - parentPosition.top + $parent.scrollTop() - parseInt($parent.css("border-top-width"),10)}
					);
              } else {
                $target.appendTo($layout).css({"position": posType, "top": "0px", "left": "0px"});
              }
            }
			
			if (jimUtil.isRelative($target))
			  $target.css("position", "");
          }
		  
		  if (jimUtil.isRelative($target) && oldParent.is(".relativeLayoutWrapperResponsive"))
			oldParent.parent().remove();
        }
      }
    },
    "intersect": function(src, $over) {
      var target, targetOffset, over, overOffset,cursorX,cursorY;
      if(jimUtil.exists(src) && jimUtil.exists($over)) {
        if(src instanceof jQuery) {
          switch($over.jimGetType()) {
            case itemType.dynamicpanel:
              $over = ($over.children("div:visible").length === 0) ? $over.children(".default") : $over.children("div:visible:first");
              break;
          }
          targetOffset = src.offset(), overOffset = $over.offset();
          target = {
            "top": targetOffset.top,
            "left": targetOffset.left,
            "bottom": targetOffset.top + src.jimOuterHeight(),
            "right": targetOffset.left + src.jimOuterWidth()
          };
          over = {
            "top": overOffset.top,
            "left": overOffset.left,
            "bottom": overOffset.top + $over.jimOuterHeight(),
            "right": overOffset.left + $over.jimOuterWidth()
          };
		  
		  if (jimUtil.isRelative(src)) {
			var relativeBounds = jimUtil.getRelativeItemOffset(src);
			target.top = relativeBounds.y;
			target.left = relativeBounds.x;
			target.right = relativeBounds.x + relativeBounds.width;
			target.bottom = relativeBounds.y + relativeBounds.height;
		  }
		  if (jimUtil.isRelative($over)) {
			var relativeBounds = jimUtil.getRelativeItemOffset($over);
			over.top = relativeBounds.y;
			over.left = relativeBounds.x;
			over.right = relativeBounds.x + relativeBounds.width;
			over.bottom = relativeBounds.y + relativeBounds.height;
		  }

          return !(target.left > over.right
				|| target.right < over.left
				|| target.top > over.bottom
				|| target.bottom < over.top);
        } else if (src instanceof jQuery.Event) {
            switch($over.jimGetType()) {
              case itemType.dynamicpanel:
                $over = ($over.children("div:visible").length === 0) ? $over.children(".default") : $over.children("div:visible:first");
                break;
            }
            var rotationAngle = jimUtil.getAdditiveRotationDegrees($over);
            var scroll = jimUtil.getScrollPosition(), simulationBounds = jQuery("#simulation")[0].getBoundingClientRect();
            over = $over.jimPosition();
			
            over.top = over.top*(jimUtil.getTotalScale()) - scroll.top + simulationBounds.top;
            over.left = over.left*(jimUtil.getTotalScale()) - scroll.left + simulationBounds.left;
            over.right = over.right*(jimUtil.getTotalScale()) - scroll.left + simulationBounds.left;
            over.bottom = over.bottom*(jimUtil.getTotalScale()) - scroll.top + simulationBounds.top;
			
            /* touch events has specific x,y position for each finger* */
            if(src.originalEvent.sourceEvent.changedTouches && src.originalEvent.sourceEvent.changedTouches.length==1){
              cursorX =src.originalEvent.sourceEvent.changedTouches[0].pageX;
              cursorY =src.originalEvent.sourceEvent.changedTouches[0].pageY;
            } else {
              cursorX =src.originalEvent.pageX;
              cursorY =src.originalEvent.pageY;
            }

            if(rotationAngle!=0){
              var rotatedCursor =jimUtil.calculateRotatedPoint(over,cursorX,cursorY,rotationAngle);
              cursorX = rotatedCursor.x;
              cursorY = rotatedCursor.y;
            }

            return (over.top <= cursorY && cursorY <= over.bottom) && (over.left <= cursorX && cursorX <= over.right);
          }
        }
        return false;
      },
      "polygonContains": function(polygon1, polygon2) {
    	  var i;
    	  for (i = 0; i < polygon1.length; i++) {
    		  if(!jimUtil.isPointInsidePolygon(polygon1[i], polygon2))return false;
    	  }
    	  return true;
        },
      "isPointInsidePolygon": function(point, polygon) {
          var i,j;
          var result = false;
          for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if ((polygon[i].y > point.y) != (polygon[j].y > point.y) &&
                (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y-polygon[i].y) + polygon[i].x)) {
              result = !result;
             }
          }
          return result;
       },
        /**
		 * Helper function to determine whether there is an intersection between
		 * the two polygons described by the lists of vertices. Uses the
		 * Separating Axis Theorem
		 * 
		 * @param a
		 *            an array of connected points [{x:, y:}, {x:, y:},...] that
		 *            form a closed polygon
		 * @param b
		 *            an array of connected points [{x:, y:}, {x:, y:},...] that
		 *            form a closed polygon
		 * @return true if there is any intersection between the 2 polygons,
		 *         false otherwise
		 */
        "incompleteIntersect" : function(a, b) {
            var polygons = [a, b];
            var minA, maxA, projected, i, i1, j, minB, maxB;

            for (i = 0; i < polygons.length; i++) {

                // for each polygon, look at each edge of the polygon, and
				// determine if it separates
                // the two shapes
                var polygon = polygons[i];
                for (i1 = 0; i1 < polygon.length; i1++) {

                    // grab 2 vertices to create an edge
                    var i2 = (i1 + 1) % polygon.length;
                    var p1 = polygon[i1];
                    var p2 = polygon[i2];

                    // find the line perpendicular to this edge
                    var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

                    minA = maxA = undefined;
                    // for each vertex in the first shape, project it onto the
					// line perpendicular to the edge
                    // and keep track of the min and max of these values
                    for (j = 0; j < a.length; j++) {
                        projected = normal.x * a[j].x + normal.y * a[j].y;
                        if (jimUtil.isUndefined(minA) || projected < minA) {
                            minA = projected;
                        }
                        if (jimUtil.isUndefined(maxA) || projected > maxA) {
                            maxA = projected;
                        }
                    }

                    // for each vertex in the second shape, project it onto the
					// line perpendicular to the edge
                    // and keep track of the min and max of these values
                    minB = maxB = undefined;
                    for (j = 0; j < b.length; j++) {
                        projected = normal.x * b[j].x + normal.y * b[j].y;
                        if (jimUtil.isUndefined(minB) || projected < minB) {
                            minB = projected;
                        }
                        if (jimUtil.isUndefined(maxB) || projected > maxB) {
                            maxB = projected;
                        }
                    }

                    // if there is no overlap between the projects, the edge we
					// are looking at separates the two
                    // polygons, and we know there is no overlap
                    if (maxA < minB || maxB < minA) {
                        return false;
                    }
                }
            }
            return true;
        },
	  "getScrollbarWidth" : function() {
		return $("#simulation").outerWidth() - $(".ui-page.ui-page-active").outerWidth();
	  },
	  "hasYScrollBar": function(obj) {
		return obj[0].scrollHeight > obj.height();
	  },
	  "hasXScrollBar": function(obj) {
		return obj[0].scrollWidth > obj.width();
	  },
      "getRotationDegrees": function($obj) {
    	var $target = $obj;
    	if($obj.jimGetType() == itemType.panel){
    		$target = $obj.closest(".dynamicpanel");
    	}
		if($target[0].rotationdeg!== undefined)
			return $target[0].rotationdeg;
        return $target.attr("rotationdeg") ?  $target.attr("rotationdeg"): 0;
      },
      "getAdditiveRotationDegrees": function($obj) {
      	var totalDegrees = 0;
  		var parents = $obj.parents(".firer").andSelf();
  		 for(i=0; i<parents.length; i++) {
  			$parent = jQuery(parents[i]);
  			if($parent.jimGetType()!=itemType.panel)
  				totalDegrees+=getRotationDegrees($parent);
  		 }
  		 return totalDegrees;
        },
      "calculateRotatedPoint": function(bounds,pointX, pointY, angle) {
        var rotatedX = pointX, rotatedY=pointY;
        if(angle!=0){
            var centerX = bounds.left + ((bounds.right-bounds.left)/2);
            var centerY = bounds.top + ((bounds.bottom-bounds.top)/2);
            var distanceX = pointX - centerX;
            var distanceY = pointY - centerY;
            var radiansAngle = angle * (Math.PI/180);

            rotatedX = parseInt((centerX + distanceX * Math.cos(radiansAngle) + distanceY * Math.sin(radiansAngle)));
            rotatedY = parseInt((centerY - distanceX * Math.sin(radiansAngle) + distanceY * Math.cos(radiansAngle)));
        }

        return {
        "x": rotatedX,
        "y": rotatedY
        };
      },
      "calculateRotationShift": function(angle,$target) {
        var shiftX, shiftY;
        var nonRotatedWidth = $target[0].clientWidth;
        var nonRotatedHeight = $target[0].clientHeight;

        if($target.is(".shape")){
            nonRotatedWidth = $target.closest(".shapewrapper")[0].clientWidth;
            nonRotatedHeight = $target.closest(".shapewrapper")[0].clientHeight;
        }

        var bounds = {
            "left":0,
            "top":0,
            "right":nonRotatedWidth,
            "bottom":nonRotatedHeight
        };

        var topLeft = jimUtil.calculateRotatedPoint(bounds, 0,0,angle);
        var topRight = jimUtil.calculateRotatedPoint(bounds, nonRotatedWidth,0,angle);
        var bottomLeft = jimUtil.calculateRotatedPoint(bounds, 0,nonRotatedHeight,angle);
        var bottomRight = jimUtil.calculateRotatedPoint(bounds, nonRotatedWidth,nonRotatedHeight,angle);

        var minX = Math.min(Math.min(Math.min(topLeft.x, topRight.x), bottomLeft.x), bottomRight.x);
        var minY = Math.min(Math.min(Math.min(topLeft.y, topRight.y), bottomLeft.y), bottomRight.y);
        var maxX = Math.max(Math.max(Math.max(topLeft.x, topRight.x), bottomLeft.x), bottomRight.x);
        var maxY = Math.max(Math.max(Math.max(topLeft.y, topRight.y), bottomLeft.y), bottomRight.y);

        var rotatedWidth = maxX -minX;
        var rotatedHeight = maxY -minY;

        shiftX =(nonRotatedWidth - rotatedWidth)/2;
        shiftY =(nonRotatedHeight - rotatedHeight)/2;
        return {
        "x": shiftX,
        "y": shiftY
        };
      },
      "getActivePanel": function($dynamicPanel) {
            if(jimUtil.exists($dynamicPanel) && $dynamicPanel.is(".dynamicpanel")){
                var $panels, $panel, i, iLen
                $panels = $dynamicPanel.children(".panel");
                for(i=0, iLen = $panels.length; i < iLen; i += 1) {
                    $panel = jQuery($panels[i]);
                    if($panel.css("display")!== "none")
                        return $panel;
                }
            }
      },
      "getScrollContainerSize":function($scrollableContainer) {
        var viewportHeight = parseInt($scrollableContainer.closest(".firer").css("height"),10),
        viewportWidth = parseInt($scrollableContainer.closest(".firer").css("width"),10);
        if($scrollableContainer.hasClass('ui-page')){
        	viewportHeight = viewportHeight * (1/jimUtil.getScale());
        	viewportWidth = viewportWidth * (1/jimUtil.getScale());
        }
        return { "width": viewportWidth, "height": viewportHeight }
      },
      "getScrollContentsSize":function($scrollableContainer) {
        var contentsWidth, contentsHeight;
        var viewportHeight = parseInt($scrollableContainer.closest(".firer").css("height"),10),
        viewportWidth = parseInt($scrollableContainer.closest(".firer").css("width"),10);

        var $deviceSimulatedVerticalScroll = $scrollableContainer.children(".verticalScroll"),
        $deviceSimulatedHorizontalScroll = $scrollableContainer.children(".horizontalScroll");

        if($deviceSimulatedVerticalScroll.length>0) {
          var scrollValue = parseFloat(jQuery($deviceSimulatedVerticalScroll[0]).css("height"));
          contentsHeight = parseInt(Math.round(viewportHeight * viewportHeight / scrollValue));
        }else if($scrollableContainer.css("overflow-y")!=="hidden"){
          contentsHeight = parseInt($scrollableContainer[0].scrollHeight,10);
        }else{
          contentsHeight = viewportHeight;
        }

        if($deviceSimulatedHorizontalScroll.length>0) {
          var scrollValue = parseFloat(jQuery($deviceSimulatedHorizontalScroll[0]).css("width"));
          contentsWidth = parseInt(Math.round(viewportWidth * viewportWidth / scrollValue));
        }else if($scrollableContainer.css("overflow-x")!=="hidden"){
          contentsWidth = parseInt($scrollableContainer[0].scrollWidth,10);
        }else{
          contentsWidth = viewportWidth;
        }

        return { "width": contentsWidth, "height": contentsHeight }
      },
      "getRotatedCallout" : function(x,y,points,width,height,angleDegrees){
		   var bb = {top:y,left:x,bottom:y+height,right:x+width};
		   var rectangleBounds =[];
		   var triangleBounds =[];
		   var foundVertex = false;

		   var vertexIndexStart =0;
		   var start,end,p;

		   // left side
		   start = 0;
		   end = 3;
		   var k;
		   for(k=start;k<end;k++){
			   if(k==end-1){
				   if(points[k].x < points[k-1].x){
					   // is vertex
					   foundVertex=true;
					   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees));
					   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[end+1].x, y+points[end+1].y, -angleDegrees));
					   vertexIndexStart = start+1;
					   start = start +4;
				   }
			   }
		   }
		   if(!foundVertex){
				p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
				rectangleBounds.push(p);
			   start = start +1;
		   }
		   end=start+3;

		   // bottom side
		   if(foundVertex){
				p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
				rectangleBounds.push(p);
			   start = start +1;
		   }
		   else{
			   for(k=start;k<end;k++){
				   if(k==end-1 && !foundVertex){
					   if(points[k].y > points[k-1].y){
						   // is vertex
						   foundVertex=true;
						   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees));
						   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[end+1].x, y+points[end+1].y, -angleDegrees));
						   vertexIndexStart = start+1;
						   start = start +4
					   }
				   }
			   }
			   if(!foundVertex){
			   		p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
					rectangleBounds.push(p);
				   start = start +1;
			   }
		   }
		   end=start+3;

		   // right side
		   if(foundVertex){
		   		p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
				rectangleBounds.push(p);
			   start = start +1;
		   }
		   else{
			   for(k=start;k<end;k++){
				   if(k==end-1 && !foundVertex){
					   if(points[k].x > points[k-1].x){
						   // is vertex
						   foundVertex=true;
						   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees));
						   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[end+1].x, y+points[end+1].y, -angleDegrees));
						   vertexIndexStart = start+1;
						   start = start +4
					   }
				   }
			   }
			   if(!foundVertex){
				   p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
				   rectangleBounds.push(p);
				   start = start +1;
			   }
		   }
		   end=start+3;

		 // top side
		   if(foundVertex){
				 p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
				 rectangleBounds.push(p);
			   start = start +1;
		   }
		   else{
			   for(k=start;k<end;k++){
				   if(k==end-1 && !foundVertex){
					   if(points[k].y < points[k-1].y){
						   // is vertex
						   foundVertex=true;
						   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees));
						   rectangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[end+1].x, y+points[end+1].y, -angleDegrees));
						   vertexIndexStart = start+1;
						   start = start +4
					   }
				   }
			   }
			   if(!foundVertex){
					p =  jimUtil.calculateRotatedPoint(bb,x+points[start].x, y+points[start].y, -angleDegrees);
					rectangleBounds.push(p);
				   start = start +1;
			   }
		   }

		   if(foundVertex){
			   triangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[vertexIndexStart].x, y+points[vertexIndexStart].y, -angleDegrees));
			   triangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[vertexIndexStart+1].x, y+points[vertexIndexStart+1].y, -angleDegrees));
			   triangleBounds.push(jimUtil.calculateRotatedPoint(bb,x+points[vertexIndexStart+2].x, y+points[vertexIndexStart+2].y, -angleDegrees));
		   }

		   return [new area(rectangleBounds),new area(triangleBounds)];
	   },
      "getRotatedTriangle" : function(x,y,vertex,width,height,angleDegrees){
		   var halfWidth = width/2;
		   var halfHeight = height/2;
		   var angle = angleDegrees * Math.PI / 180;
		   var bb = {top:y,left:x,bottom:y+height,right:x+width};
		   var vertexPoint =  jimUtil.calculateRotatedPoint(bb,x+vertex, y, -angleDegrees);
		   var bounds = [
		      // upper left
		   {x: vertexPoint.x, y: vertexPoint.y},
		      // upper left
		   {x: x + (halfWidth) * Math.cos(angle) - (halfHeight) * Math.sin(angle) + halfWidth, y: y + (halfHeight) * Math.cos(angle) + (halfWidth) * Math.sin(angle) + halfHeight},
		      // upper right
		   {x: x - (halfWidth) * Math.cos(angle) - (halfHeight) * Math.sin(angle) + halfWidth, y: y + (halfHeight) * Math.cos(angle) - (halfWidth) * Math.sin(angle) + halfHeight}
		   ];
		   return new area(bounds);
	   },
	   "getRotatedEllipse" : function(x,y,width,height,angleDegrees){
		   // polygonal approximation (8 points)
			   var halfWidth = width/2;
			   var halfHeight = height/2;
			   var bb = {top:y,left:x,bottom:y+height,right:x+width};
			   var bounds = [
			    // up
			   jimUtil.calculateRotatedPoint(bb,x+halfWidth, y, -angleDegrees),
			   // right up (315)
			   jimUtil.calculateRotatedPoint(bb,x+halfWidth+(halfWidth * Math.cos(315 * Math.PI/180.0)), y+halfHeight+(halfHeight * Math.sin(315 * Math.PI/180.0)), -angleDegrees),
			   // right
			   jimUtil.calculateRotatedPoint(bb,x+width, y+halfHeight, -angleDegrees),
			   // right down (45)
			   jimUtil.calculateRotatedPoint(bb,x+halfWidth+(halfWidth * Math.cos(45 * Math.PI/180.0)), y+halfHeight+(halfHeight * Math.sin(45 * Math.PI/180.0)), -angleDegrees),
			   // bottom
			   jimUtil.calculateRotatedPoint(bb,x+halfWidth, y+height, -angleDegrees),
			    // left down (135)
			   jimUtil.calculateRotatedPoint(bb,x+halfWidth+(halfWidth * Math.cos(135 * Math.PI/180.0)), y+halfHeight+(halfHeight * Math.sin(135 * Math.PI/180.0)), -angleDegrees),
			   // left
			   jimUtil.calculateRotatedPoint(bb,x, y+halfHeight, -angleDegrees),
			   // left up (225)
			   jimUtil.calculateRotatedPoint(bb,x+halfWidth+(halfWidth * Math.cos(225 * Math.PI/180.0)), y+halfHeight+(halfHeight * Math.sin(225 * Math.PI/180.0)), -angleDegrees)
			   ];
			   return new area(bounds);
	   },
      "getRotatedRectangle" : function(x,y,width,height,angleDegrees){
		   var halfWidth = width/2;
		   var halfHeight = height/2;
		   var angle = angleDegrees * Math.PI / 180;
		   var bounds = [
		      // upper left
		   {x: x + (halfWidth) * Math.cos(angle) - (halfHeight) * Math.sin(angle) + halfWidth, y: y + (halfHeight) * Math.cos(angle) + (halfWidth) * Math.sin(angle) + halfHeight},
		      // upper right
		   {x: x - (halfWidth) * Math.cos(angle) - (halfHeight) * Math.sin(angle) + halfWidth, y: y + (halfHeight) * Math.cos(angle) - (halfWidth) * Math.sin(angle) + halfHeight},
		      // bottom right
		   {x: x - (halfWidth) * Math.cos(angle) + (halfHeight) * Math.sin(angle) + halfWidth, y: y - (halfHeight) * Math.cos(angle) - (halfWidth) * Math.sin(angle) + halfHeight},
		      // bottom left
		   {x: x + (halfWidth) * Math.cos(angle) + (halfHeight) * Math.sin(angle) + halfWidth, y: y - (halfHeight) * Math.cos(angle) + (halfWidth) * Math.sin(angle) + halfHeight}
		   ];
		   return new area(bounds);
	   },
	   "getCanvasAlignmentBox" : function (elem){
			function getCanvasAlignmentBoxRecurse(e){
				var closest = e.closest("#alignmentBox > .freeLayout");
				if(closest.parent().parent().hasClass("master") && closest.closest(".masterinstance").size()>0)
					return getCanvasAlignmentBoxRecurse(closest.parent().parent());
				else
					return closest;
			}
			return getCanvasAlignmentBoxRecurse(elem);
		},
      "getPageMinSize": function($canvas) {
          var $child, $children,$alignmentBox, i, iLen, minX, minY, maxX, maxY, defaultMasterWidth=300, defaultMasterHeight=300;
          var $parentMaster = $canvas.parents(".master");
          if($parentMaster.size()>0){
        	$children =jQuery();
  			var $childrenTemp = $canvas.children(".firer, .shapewrapper");
	      	  for(var i=0, iLen = $childrenTemp.length; i < iLen; i += 1) {
	              $child = jQuery($childrenTemp[i]);
	              if($child.css('display')!='none')
	            	  $children.push($childrenTemp[i]);
	      	  }
	      	  defaultMasterWidth = $parentMaster.data("originalWidth") + $parentMaster.jimPosition().left;
	      	  defaultMasterHeight = $parentMaster.data("originalHeight") + $parentMaster.jimPosition().top;
          }
  		  else $children = $canvas.children(".firer, .shapewrapper");

          $jimContainer = jQuery("#jim-container");
          // mobile devices
          var deviceWidth =parseFloat($jimContainer.css("width"));
          var deviceHeight =parseFloat($jimContainer.css("height"));

          if(isNaN(deviceWidth) || isNaN(deviceHeight)){
        	  // web prototypes
        	  deviceWidth = $("#jim-body").outerWidth();
        	  deviceHeight = $("#jim-body").outerHeight();
          }

          var lockVerticalScroll = jQuery(".screen.growth-horizontal").length>0 || jQuery(".screen.growth-none").length>0;
          var lockHorizontalScroll = jQuery(".screen.growth-vertical").length>0 || jQuery(".screen.growth-none").length>0;
          if($canvas.parents(".screen").size()<=0 || isNaN(deviceWidth) || isNaN(deviceHeight)) {
        	  lockVerticalScroll = false;
        	  lockHorizontalScroll = false;
          }

          if(jimUtil.exists($children)) {
            for(i=0, iLen = $children.length; i < iLen; i += 1) {
                $child = jQuery($children[i]);
                $alignmentBox = jimUtil.getCanvasAlignmentBox($child);
                if($child.is(".dynamicpanel"))
                    $child = jimUtil.getActivePanel($child);
                if(jimUtil.exists($child) && jimUtil.exists($alignmentBox)) {
                    var position = $child.jimPosition(true);
                    var boxPosition = $alignmentBox.jimPosition();
                    position.left-= boxPosition.left;
                    position.right-= boxPosition.left;
                    position.top-= boxPosition.top;
                    position.bottom-= boxPosition.top;
                	var masterinstance = $child.closest(".masterinstance");
                    if ($canvas.is(".group") || (!lockVerticalScroll && !lockHorizontalScroll) || position.top >= 0 && position.top <= deviceHeight || (position.top < 0 && (position.bottom) >= 0)){
                    	minX = jimUtil.exists(minX) ? Math.min(minX, position.left) : position.left;
                    	if(masterinstance.length>0 && ($child.parent("#alignmentBox > .freeLayout") || $child.parents(".group").parent("#alignmentBox > .freeLayout"))) {
                    		if($child.data("widthUnit")==="%")
                    			maxX = jimUtil.exists(maxX) ? Math.max(maxX, position.left + ($(".ui-page").width()*($child.data("width")/100))) : position.left + ($(".ui-page").width()*($child.data("width")/100));
                    		else
                    			maxX = jimUtil.exists(maxX) ? Math.max(maxX, position.right) : position.right;

                    		if(jimPin.getHorizontalPin($child) !== "none"){
                    			var layoutElem = masterinstance.closest(".layout");
                    			if(layoutElem.length > 0 && (layoutElem.hasClass("horizontal") || layoutElem.hasClass("vertical"))){
                    				maxX = Math.max(maxX,defaultMasterWidth);

                    			}
                    		}
                    	}
                    	else {
                    		maxX = jimUtil.exists(maxX) ? Math.max(maxX, position.right) : position.right;
                    	}
                    }
                    if ($canvas.is(".group") || (!lockVerticalScroll && !lockHorizontalScroll) || position.left >= 0 && position.left <= deviceWidth || (position.left < 0 && (position.right) >= 0)){
                    	minY = jimUtil.exists(minY) ? Math.min(minY, position.top) : position.top;
                    	if(masterinstance.length>0 && ($child.parent("#alignmentBox > .freeLayout") || $child.parents(".group").parent("#alignmentBox > .freeLayout"))) {
                    		if($child.data("heightUnit")==="%")
                    			maxY = jimUtil.exists(maxY) ? Math.max(maxY, position.top + ($(".ui-page").height()*($child.data("height")/100))) : position.top + ($(".ui-page").height()*($child.data("height")/100));
                    		else
                    			maxY = jimUtil.exists(maxY) ? Math.max(maxY, position.bottom) : position.bottom;

                        	if(jimPin.getVerticalPin($child) !== "none"){
                        		var layoutElem = masterinstance.closest(".layout");
                        		if(layoutElem.length > 0 && (layoutElem.hasClass("horizontal") || layoutElem.hasClass("vertical")))
                        			maxY = Math.max(maxY,defaultMasterHeight);
                        	}
                    	}
                    	else {
                    		maxY = jimUtil.exists(maxY) ? Math.max(maxY, position.bottom) : position.bottom;
                    	}
                    }
                }
            }
         }

         minX =jimUtil.exists(minX) ? minX : 0;
 		 minY =jimUtil.exists(minY) ? minY : 0;
         maxX =jimUtil.exists(maxX) ? maxX : defaultMasterWidth;
         maxY =jimUtil.exists(maxY) ? maxY : defaultMasterHeight;
         return {
             "width": maxX,
             "height": maxY,
 			 "x": minX,
 			 "y": minY,
 			 "lockVerticalScroll":lockVerticalScroll,
 			 "lockHorizontalScroll":lockHorizontalScroll
 		 };
      },
      "refreshPageMinSizeWithTarget": function($target) {
    	 if(jimPin.getClosestContainerNoGroups($target).attr('id')=='alignmentBox')
    		  this.refreshPageMinSize();
      },
      "refreshPageMinSize": function() {
          var $screenBgBox = jQuery(".screen:last > #backgroundBox");
          var $templateBgBox = jQuery(".template:last > #backgroundBox");
          var $scenarioShadow = jQuery(".scenarioShadow");
          var $scenarioBg = jQuery("#scenarioBgBox");

          var $canvas = jQuery(".screen:last > #alignmentBox,.template:last > #alignmentBox");
          var $jimContainer = jQuery("#jim-container");
	      var deviceWidth = parseFloat($jimContainer.css("width"));
	      var deviceHeight = parseFloat($jimContainer.css("height"));

	      if(isNaN(deviceWidth) || isNaN(deviceHeight)){
	      	// web prototypes
	        deviceWidth = $("#jim-body").outerWidth();
	        deviceHeight = $("#jim-body").outerHeight();
	      }

	      var lockVerticalScroll = jQuery(".screen.growth-horizontal").length>0 || jQuery(".screen.growth-none").length>0;
	      var lockHorizontalScroll = jQuery(".screen.growth-vertical").length>0 || jQuery(".screen.growth-none").length>0;
	      if($canvas.parents(".screen").size()<=0 || isNaN(deviceWidth) || isNaN(deviceHeight)){
	        lockVerticalScroll = false;
	        lockHorizontalScroll = false;
	      }

          var scrollableElement;
	      if(jimUtil.isMobileDevice())
	      	scrollableElement = jQuery("#simulation")[0];
	      else if(window.jimDevice.isMobile())
	      	scrollableElement =  jQuery(".ui-page")[0];
	      else
	      	scrollableElement = jQuery("#simulation")[0];

	      // Don't use previous size of background boxes to calculate the
			// scrollableElement scroll size.
	      $screenBgBox.css("width",0 + "px");
          $templateBgBox.css("width", 0+ "px");
          $scenarioShadow.css("width", 0 + "px");
          $scenarioBg.css("width", 0 + "px");
          $screenBgBox.css("height", 0 + "px");
          $templateBgBox.css("height", 0 + "px");
          $scenarioShadow.css("height", 0 + "px");
          $scenarioBg.css("height", 0 + "px");

          var scrollWidth =scrollableElement.scrollWidth;
		  var scrollHeight = scrollableElement.scrollHeight;
		  if(window.jimDevice.isMobile()){
			scrollWidth = Math.max(scrollWidth,deviceWidth);
			scrollHeight = Math.max(scrollHeight,deviceHeight);
		 }
          var w = scrollWidth / jimUtil.getScale();
          var h = scrollHeight / jimUtil.getScale();

          $screenBgBox.css("width", w + "px");
          $templateBgBox.css("width", w + "px");
          $scenarioShadow.css("width", scrollWidth + "px");
          $scenarioBg.css("width", scrollWidth + "px");
          $screenBgBox.css("height", h + "px");
          $templateBgBox.css("height", h + "px");
          $scenarioShadow.css("height", scrollHeight + "px");
          $scenarioBg.css("height", scrollHeight + "px");
      },
	  "calculateGroupMinSize" : function($group){
		  /*var groupOldPosition = $group.jimPosition();
		  var $alignmentBox = jimUtil.getCanvasAlignmentBox($group);
		  var alignmentPos = $alignmentBox.jimPosition();
		  groupOldPosition.left -= alignmentPos.left;
		  groupOldPosition.top -= alignmentPos.top;

		  var newMinSize = jimUtil.getPageMinSize($group);

		  var width = newMinSize.width-newMinSize.x;
		  var height = newMinSize.height-newMinSize.y;

		  $group.css("width", width + "px");
		  $group.css("height", height + "px");

		var layoutElem = $group.closest(".layout");
		if(layoutElem.length > 0 && (layoutElem.hasClass("horizontal") || layoutElem.hasClass("vertical")))
			return;

		var scrollOffsetX = 0;
		var scrollOffsetY = 0;
		var $scrollable = $group.closest(".scrollable");
		var $container = jimPin.getClosestContainer($group);
		if($container.length>0){
			if($container.hasClass("scrollable")){
				scrollOffsetX = $scrollable.scrollLeft();
				scrollOffsetY = $scrollable.scrollTop();
			}
			// masters alignmentboxes or scrollables
			if(!$container.is($alignmentBox)){
				var containerTop = $container.jimPosition().top;
				var containerLeft = $container.jimPosition().left;

				newMinSize.y = newMinSize.y - containerTop;
				newMinSize.x = newMinSize.x - containerLeft;

				groupOldPosition.top = groupOldPosition.top - containerTop;
				groupOldPosition.left = groupOldPosition.left - containerLeft;
			}
		}

		var diffTop = newMinSize.y - groupOldPosition.top;
		var diffLeft = newMinSize.x - groupOldPosition.left;

		if(parseInt(diffTop)!=0){
			$group.css("top", newMinSize.y + scrollOffsetY + "px");
			$group[0].style.top = newMinSize.y + scrollOffsetY + "px";
		}
		if(parseInt(diffLeft)!=0){
			$group.css("left", newMinSize.x + scrollOffsetX + "px");
			$group[0].style.left = newMinSize.x + scrollOffsetX + "px";
		}

		// if position changed recalculate children position
		if(diffLeft != 0 || diffTop != 0){
  			var $childrenTemp = $group.children(".firer, .shapewrapper");
	      	  for(var i=0, iLen = $childrenTemp.length; i < iLen; i += 1) {
	              var $child = jQuery($childrenTemp[i]);
	              if($child.css('display')!='none' && $child.css('position')!='fixed'){
	            	  if(diffLeft != 0){
  		            	  var tempLeft = parseFloat($child.css("left"),10);
  		            	  if(tempLeft!==undefined)
  		            	  	$child.css("left",tempLeft - diffLeft + "px");
	            	  }
	            	  if(diffTop != 0){
  		            	  var tempTop = parseFloat($child.css("top"),10);
  		            	  if(tempTop!==undefined)
  		            	  	$child.css("top",tempTop - diffTop + "px");
	            	  }
	              }
	      	  }
		}*/
	  },
	  "calculateMinSize" : function($target){
		  if($target.parent().hasClass("group") && !$target.parent().is('[class*="animation-"]')){
			  return jimUtil.calculateGroupMinSize($target.parent());
		  }
		  else if($target.hasClass("group")){
			  return jimUtil.calculateGroupMinSize($target);
		  }
		  else if($target.parents(".masterinstance").size()>0 || $target.hasClass("masterinstance")) {
			  return jimUtil.calculateMasterMinSize($target);
		  }
	  },
	  "_calculateMasterMinSize" : function($master){
		  var $masterAlignBox = $master.find("#alignmentBox > .freeLayout"),
			masterOldPosition = $master.jimPosition(),
			newMinSize = jimUtil.getPageMinSize($masterAlignBox);

		  var $alignmentBox = jimUtil.getCanvasAlignmentBox($master);
		  var alignmentPos = $alignmentBox.jimPosition();
		  masterOldPosition.left -= alignmentPos.left;
		  masterOldPosition.top -= alignmentPos.top;

			var width = newMinSize.width-newMinSize.x;
			var height = newMinSize.height-newMinSize.y;
			$master.css("min-width", width + "px");
			$master.css("width", width + "px");
			$master.css("min-height", height + "px");
			$master.css("height", height + "px");

			var layoutElem = $master.closest(".layout");
			if(layoutElem.length > 0 && (layoutElem.hasClass("horizontal") || layoutElem.hasClass("vertical"))){
				// master inside layout and pin elements inside
				var pinnedElements = jimPin.getPinnedToAlignBox($masterAlignBox);
				if(pinnedElements.length > 0){
					var $parentMaster = $master.find(".master");
					var defaultMasterWidth = $parentMaster.data("originalWidth");
			      	var defaultMasterHeight = $parentMaster.data("originalHeight");

					for(i=0, iLen = pinnedElements.length; i < iLen; i += 1) {
						if(jimPin.getHorizontalPin(jQuery(pinnedElements[i])) !== "none")
							$master.css("width", Math.max(defaultMasterWidth,width) + "px");
						if(jimPin.getVerticalPin(jQuery(pinnedElements[i])) !== "none")
							$master.css("height", Math.max(defaultMasterHeight,height) + "px");
					}
				}
				return;
			}

			var offsetPos = $master.find(".offset").position();
			// fix for JP-10477
			offsetPos.top = offsetPos.top * (1/jimUtil.getScale());
			offsetPos.left = offsetPos.left * (1/jimUtil.getScale());

			var scrollOffsetX = 0;
			var scrollOffsetY = 0;

			var $container = jimPin.getClosestContainer($master);
			if($container.length>0){
				if($container.hasClass("scrollable")){
					scrollOffsetX = $container.scrollLeft();
					scrollOffsetY = $container.scrollTop();
				}
				if(!$container.is($alignmentBox)){
					var containerTop = $container.jimPosition().top;
					var containerLeft = $container.jimPosition().left;

					newMinSize.y = newMinSize.y - containerTop;
					newMinSize.x = newMinSize.x - containerLeft;

					masterOldPosition.top = masterOldPosition.top - containerTop;
					masterOldPosition.left = masterOldPosition.left - containerLeft;
				}
			}

			var diffTop = newMinSize.y - masterOldPosition.top;
			var diffLeft = newMinSize.x - masterOldPosition.left;

			if(parseInt(diffTop)!=0)
				$master.css("top", newMinSize.y + scrollOffsetY + "px");
			if(parseInt(diffLeft)!=0)
				$master.css("left", newMinSize.x + scrollOffsetX + "px");

			$master.find(".offset").css("top",offsetPos.top-diffTop);
			$master.find(".offset").css("left",offsetPos.left-diffLeft);
	  },
      "calculateMasterMinSize": function($target) {
      	/*var $masters;
    	if($target.parents(".masterinstance").size()>0) {
    		$masters = $target.parents(".masterinstance:first");
    	}
    	else if($target.hasClass("masterinstance")){
    		$masters = $target;
    	}
    	else if($target.is("#simulation")) {
			$masters = $target.find(".masterinstance");
    	}
    	else{
    		return;
    	}

		for(i=0, iLen = $masters.length; i < iLen; i += 1) {
			jimUtil._calculateMasterMinSize(jQuery($masters[i]));
		}*/
  	  },
      "resizeCell": function($cell, newCellWidth,newCellHeight,effect,updateTableFlag, callback) {
         var i,iLen,ownerIndex, $currentCell, $columnCells, $rowCells, $table,oldTableWidth, cellDeltaWidth, oldTableHeight,cellDeltaHeight;
         if(jimUtil.exists($cell) && ($cell.is(".cellcontainer") || $cell.is(".datacell") || $cell.is(".textcell") )){
             ownerIndex = $cell.index() +1;
             $table = $cell.closest("table").closest(".firer");
			 var $innerTable = $table.find("table:first");
             $columnCells = $table.find("table:first").children("tbody, thead").children("tr").children(":nth-child("+ownerIndex+")");
             $rowCells = $cell.closest("tr").children();
             var tableBorder = jimUtil.getItemBorderWidth($table);
			 
			 $cells = $innerTable.children("tbody, thead").children("tr").children(".cellcontainer, .datacell, .textcell");
             if($table.is(".datagrid") || $table.is(".datalist")) {
              	$cells = $innerTable.children("tbody, thead").children("tr").children("td");
             }
			 
			 var cellSizeMap = {};
			 for (var i = 0; i < $cells.length; ++i) {
				 var $currentCell = $($cells.get(i));
				cellSizeMap[$currentCell.attr("id")] = {"width": parseInt($currentCell.css("width"),10), "height" : parseInt($currentCell.css("height"),10)};
			 }
			 
			 var $parent = jimResponsive.getParentComponent($table);
        	 if($parent.hasClass("center"))
               $parent = $("#simulation");
        	 var parentBounds = jimResponsive.getParentBounds($table,$parent);
			 
			 var newTableWidth = $table.css("width");
			 var newTableHeight = $table.css("height");

             if(jimUtil.exists(newCellWidth)){
                 oldTableWidth = parseFloat(newTableWidth);
                 cellDeltaWidth = newCellWidth - parseInt($cell.css("width"),10);

                 var cellProperties = {"width":  Math.max(newCellWidth,1)};

                 if(effect){
                 	$cell.animate(cellProperties, effect);
                 }
           	  	 else{
           	  	   $cell.css(cellProperties);
           	  	 }
				 
				 cellSizeMap[$cell.attr("id")].width = cellProperties.width;
           	  	 if($cell.data('widthUnit') !== "%")
            	   jimResponsive.setNewWidth($cell, cellProperties.width,  "px");

           	     var cellSubs = jimEvent.fn.getCurrentStyle('padding-left', $cell) + jimEvent.fn.getCurrentStyle('padding-right', $cell);
           	  	 var newWidth = cellProperties.width + cellSubs;

                 for(i=0, iLen = $columnCells.length; i < iLen; i += 1) {
                   $currentCell = jQuery($columnCells[i]);

                   if ($currentCell.attr("id") != $cell.attr("id")) {
                     var substraction = jimEvent.fn.getCurrentStyle('padding-left', $currentCell) + jimEvent.fn.getCurrentStyle('padding-right', $currentCell);

                     cellProperties = {"width":  Math.max(newWidth - substraction,1)};
                     if(effect){
                	   $currentCell.animate(cellProperties, effect);
                     }
              	  	 else{
              	  	   $currentCell.css(cellProperties);
              	  	 }
					 
					 if (cellSizeMap[$currentCell.attr("id")] != undefined)
					   cellSizeMap[$currentCell.attr("id")].width = cellProperties.width;
              	  	 if($currentCell.data('widthUnit') !== "%")
               		   jimResponsive.setNewWidth($currentCell, cellProperties.width,  "px");
                   }
                 }

				 if(updateTableFlag=== undefined || updateTableFlag){
				     var tableProperties = {"width": ($table.data("widthUnit") === "%") ? (((oldTableWidth + cellDeltaWidth) / parentBounds.width) * 100) : oldTableWidth + cellDeltaWidth};
					 
					 if($table.data('widthUnit') !== "%")
                         jimResponsive.setNewWidth($table, tableProperties.width,  "px");
				     else
				    	 jimResponsive.setNewWidth($table, tableProperties.width, "%");
					 
					 tableProperties.width = $table.data("width") + $table.data("widthUnit");
					 
	                 if(effect){
	                  	if(callback)
	                  		jQuery.extend(effect, {"always": callback});
						 $table.animate(tableProperties, effect);
	                 }
					 else
						 $table.css(tableProperties);
					 
					 newTableWidth = tableProperties.width;
				 }
             }


             if(jimUtil.exists(newCellHeight)){
			   oldTableHeight = parseFloat(newTableHeight);
               cellDeltaHeight = newCellHeight - parseInt($cell.css("height"),10);

               var cellProperties = {"height":  Math.max(newCellHeight,1)};
               if(effect)
                 $cell.animate(cellProperties, effect);
           	   else
           	  	 $cell.css(cellProperties);

           	   if($cell.data('heightUnit') != "%")
            	   jimResponsive.setNewHeight($cell, cellProperties.height,  "px");

			   if (cellSizeMap[$currentCell.attr("id")] != undefined)
			     cellSizeMap[$cell.attr("id")].height = cellProperties.height;

           	   var cellSubs = jimEvent.fn.getCurrentStyle('padding-left', $cell) + jimEvent.fn.getCurrentStyle('padding-right', $cell);
           	   var newHeight = cellProperties.height + cellSubs;

               for(i=0, iLen = $rowCells.length; i < iLen; i += 1) {
                 $currentCell = jQuery($rowCells[i]);
                 if ($currentCell.attr("id") != $cell.attr("id")) {
                   var substraction = jimEvent.fn.getCurrentStyle('padding-top', $currentCell) + jimEvent.fn.getCurrentStyle('padding-bottom', $currentCell);

                   cellProperties = {"height":  Math.max(newHeight - substraction,1)};
                	if(effect)
                	  $currentCell.animate(cellProperties, effect);
              	    else
              	  	  $currentCell.css(cellProperties);

					cellSizeMap[$currentCell.attr("id")].height = cellProperties.height;
              	  	if($currentCell.data('heightUnit') !== "%")
                	  jimResponsive.setNewHeight($currentCell, cellProperties.height,  "px");
                    }
				}
				if(!$cell.closest("tr").hasClass("hidden")){
					if(updateTableFlag=== undefined || updateTableFlag){
						var tableProperties = {"height": ($table.data("heightUnit") === "%") ? (((oldTableHeight + cellDeltaHeight) / parentBounds.height) * 100) : oldTableHeight + cellDeltaHeight};
						
						if($table.data('heightUnit') !== "%")
						  jimResponsive.setNewHeight($table, tableProperties.height, "px");
					    else
					      jimResponsive.setNewHeight($table, tableProperties.height, "%");
						
						tableProperties.height = $table.data("height") + $table.data("heightUnit");
						
		                if(effect){
		                  	if(callback)
		                  		jQuery.extend(effect, {"always": callback});
							$table.animate(tableProperties, effect);
		                 }
						else
							$table.css(tableProperties);
					     
						newTableHeight = tableProperties.height;
					}
				}
             }
             jimUtil.adaptItemToNewSize($table);
             jimResponsive.resetOriginalTableSize($table, jimUtil.exists(newCellWidth), jimUtil.exists(newCellHeight), cellSizeMap, parseFloat(newTableWidth), parseFloat(newTableHeight));
			 
			 if (!jimUtil.exists(newCellWidth) && $table.data('widthUnit') == "%")
				newTableWidth = $table.data('width');
			
			 if (!jimUtil.exists(newCellHeight) && $table.data('heightUnit') == "%")
				newTableHeight = $table.data('height');
			 
			 jimUtil.resizeTable($table, parseFloat(newTableWidth), parseFloat(newTableHeight));
         }
      },
      "resizeRow": function($row, newRowWidth, newRowHeight, effect, callback) {
         var i,iLen,ownerIndex, $currentCell, $columnCells, $rowCells,newCellWidth, $table;
         if(jimUtil.exists($row) && ($row.is(".headerrow") || $row.is(".datarow"))){
              if(!jimUtil.exists(newRowWidth) || isNaN(parseInt(newRowWidth, 10)))
                newRowWidth = parseInt($row.css("width"),10);
              else
                newRowWidth= Math.max(newRowWidth,0);

              if(!jimUtil.exists(newRowHeight) || isNaN(parseInt(newRowHeight, 10)))
                newRowHeight = parseInt($row.css("height"),10)
              else
                newRowHeight= Math.max(newRowHeight,0);

              $rowCells = $row.children(".cellcontainer, .datacell, .textcell");
              var cellPercentages = jimUtil.getCellsPercentage($row.closest("table"),$rowCells);
              $table = $row.closest("table").closest(".datalist.firer, .table.firer").parent();

              var tableProperties = {"width": newRowWidth};
              if(effect){
               	if(callback)
               		jQuery.extend(effect, {"always": callback});
          		$table.animate(tableProperties, effect);
              }
        	  else{
        		$table.css(tableProperties);
        	  }
            if($table.data('widthUnit') !== "%")
             jimResponsive.setNewWidth($table, tableProperties.width,  "px");

              if(jimUtil.exists(newRowWidth)){
                for(i=0, iLen = $rowCells.length; i < iLen; i += 1) {
                    $currentCell = jQuery($rowCells[i]);
                    var cellBorderLeftWidth = isNaN(jimEvent.fn.getCurrentStyle('border-left-width', $currentCell)) ? 0 : jimEvent.fn.getCurrentStyle('border-left-width', $currentCell);
                    var cellBorderRightWidth = isNaN(jimEvent.fn.getCurrentStyle('border-right-width', $currentCell)) ? 0 : jimEvent.fn.getCurrentStyle('border-right-width', $currentCell);

                    newCellWidth =   Math.max(((newRowWidth /100) * cellPercentages.width[i])-cellBorderLeftWidth - cellBorderRightWidth,1);

                    jimUtil.resizeCell($currentCell,newCellWidth,undefined,effect);
                }
              }

              if(jimUtil.exists(newRowHeight)){
                 jimUtil.resizeCell(jQuery($rowCells[0]),undefined,newRowHeight,effect);
              }
         }
      },
      "resizeTable": function($table, newTableWidth, newTableHeight, effect, callback, modifyHeight) {
         var i,iLen, $cells ,$currentCell, tableWidth, tableHeight, cellWidth,cellHeight, newTableWidthNoBorders=0, newTableHeightNoBorders=0;
         if (modifyHeight == undefined)
         	modifyHeight = true;
         	
         if(jimUtil.exists($table) && ($table.is(".table") || $table.is(".datalist") || $table.is(".datagrid"))){
        	  var $innerTable = $table.find("table:first");
        	  var $borderLayer = $table.children(".borderLayer");
        	  var columns = $innerTable.children("tbody, thead").children("tr:first").children("td").length;
        	  var rows = $innerTable.children("tbody, thead").children("tr").length;
			  
			  var $parent = jimResponsive.getParentComponent($table);
        	  if($parent.hasClass("center"))
            	$parent = $("#simulation");
        	  var parentBounds = jimResponsive.getParentBounds($table,$parent);
			  
			  var trueTableWidth = ($table.data("widthUnit") === "%") ? (parentBounds.width * parseFloat(newTableWidth)/100) : newTableWidth;
			  var trueTableHeight = ($table.data("heightUnit") === "%") ? (parentBounds.height * parseFloat(newTableHeight)/100) : newTableHeight;

              if(!jimUtil.exists(trueTableWidth) || isNaN(parseInt(trueTableWidth, 10)))
              	trueTableWidth = $table[0].clientWidth;
              else
                trueTableWidth = Math.max(trueTableWidth,0) - jimEvent.fn.getCurrentStyle('border-left-width', $table) - jimEvent.fn.getCurrentStyle('border-right-width', $table);
              if(trueTableWidth>0)
              	newTableWidthNoBorders = trueTableWidth - jimEvent.fn.getCurrentStyle('border-left-width', $borderLayer) - jimEvent.fn.getCurrentStyle('border-right-width', $borderLayer) - ((columns + 1) * jimEvent.fn.getCurrentStyle('padding-left', $innerTable));

              if(!jimUtil.exists(trueTableHeight) || isNaN(parseInt(trueTableHeight, 10)))
                trueTableHeight = $table[0].clientHeight;
              else
                trueTableHeight= Math.max(trueTableHeight, 0) - jimEvent.fn.getCurrentStyle('border-top-width', $table) - jimEvent.fn.getCurrentStyle('border-bottom-width', $table);
              if(trueTableHeight>0)
                  newTableHeightNoBorders = trueTableHeight - jimEvent.fn.getCurrentStyle('border-top-width', $borderLayer) - jimEvent.fn.getCurrentStyle('border-bottom-width', $borderLayer) - ((rows + 1) * jimEvent.fn.getCurrentStyle('padding-top', $innerTable));

              $cells = $innerTable.children("tbody, thead").children("tr").children(".cellcontainer, .datacell, .textcell");
              if($table.is(".datagrid")) {
              	$cells = $innerTable.children("tbody, thead").children("tr").children("td");
              }

			 var originalTableWidth = $table.data("originalWidth") - ((columns + 1) * jimEvent.fn.getCurrentStyle('padding-left', $innerTable)) - jimEvent.fn.getCurrentStyle('border-left-width', $borderLayer) - jimEvent.fn.getCurrentStyle('border-right-width', $borderLayer);
			 var originalTableHeight = $table.data("originalHeight") - ((rows + 1) * jimEvent.fn.getCurrentStyle('padding-top', $innerTable)) - jimEvent.fn.getCurrentStyle('border-top-width', $table) - jimEvent.fn.getCurrentStyle('border-bottom-width', $table);
			 
              for(i=0, iLen = $cells.length; i < iLen; i += 1) {
                $currentCell = jQuery($cells[i])
                var cellBorderLeftWidth = 0, cellBorderRightWidth = 0, cellBorderTopWidth = 0, cellBorderBottomWidth = 0;
                
                if($table.is(".datalist") || $table.is(".datagrid")) {
                	var $cellBorderLayer = $currentCell.find(".borderLayer:first");
                	var borderLeftWidth = jimEvent.fn.getCurrentStyle('border-left-width', $cellBorderLayer);
                	cellBorderLeftWidth = isNaN(borderLeftWidth) ? 0 : borderLeftWidth;

                	var borderRightWidth = jimEvent.fn.getCurrentStyle('border-right-width', $cellBorderLayer);
                	cellBorderRightWidth = isNaN(borderRightWidth) ? 0 : borderRightWidth;

                	var borderTopWidth = jimEvent.fn.getCurrentStyle('border-top-width', $cellBorderLayer);
                	cellBorderTopWidth = isNaN(borderTopWidth) ? 0 : borderTopWidth;

                	var borderBottomWidth = jimEvent.fn.getCurrentStyle('border-bottom-width', $cellBorderLayer);
                	cellBorderBottomWidth = isNaN(borderBottomWidth) ? 0 : borderBottomWidth;
                }
                
                cellWidth = Math.max((($currentCell.data("originalWidth"))*newTableWidthNoBorders)/originalTableWidth ,1);
                cellHeight = Math.max((($currentCell.data("originalHeight"))*newTableHeightNoBorders)/originalTableHeight ,1);

                var cellProperties = {"width": cellWidth, "height": cellHeight};
                if (!modifyHeight)
                	cellProperties = {"width": cellWidth};
            	if(effect)
            		$currentCell.animate(cellProperties, effect);
          		else
          			$currentCell.css(cellProperties);

              }
			  
			  
              var tableProperties = {"width": ($table.data("widthUnit") === "%") ? (newTableWidth + "%") : trueTableWidth,"height":  ($table.data("heightUnit") === "%") ?  (newTableHeight + "%") : trueTableHeight};
			  
              if (!modifyHeight)
            	tableProperties = {"width": ($table.data("widthUnit") === "%") ?  (newTableWidth + "%") : trueTableWidth};
          	  if(effect){
          		if(callback)
          			jQuery.extend(effect, {"always": callback});
          		$table.animate(tableProperties, effect);
          	  }else {
        		$table.css(tableProperties);
          	  }

          	  jimUtil.adaptItemToNewSize($table);
          }
      },
      "getCellsPercentage": function($table, $cells){
        var i,iLen, $cell,cellWidth,cellHeight;
        var tableWidth = parseInt($table.css("width"),10);
        var tableHeight = parseInt($table.css("height"),10);
        var widthPerc = [];
        var heightPerc = [];
        for(i=0, iLen = $cells.length; i < iLen; i += 1) {
            $cell = jQuery($cells[i]);
            var borderLeftWidth = jimEvent.fn.getCurrentStyle('border-left-width', $cell);
            var cellBorderLeftWidth = isNaN(borderLeftWidth) ? 0 : borderLeftWidth;

            var borderRightWidth = jimEvent.fn.getCurrentStyle('border-right-width', $cell);
            var cellBorderRightWidth = isNaN(borderRightWidth) ? 0 : borderRightWidth;

            var borderTopWidth = jimEvent.fn.getCurrentStyle('border-top-width', $cell);
            var cellBorderTopWidth = isNaN(borderTopWidth) ? 0 : borderTopWidth;

            var borderBottomWidth = jimEvent.fn.getCurrentStyle('border-bottom-width', $cell);
            var cellBorderBottomWidth = isNaN(borderBottomWidth) ? 0 : borderBottomWidth;

            cellWidth= Math.max(parseInt($cell.css("width"),10) +cellBorderLeftWidth + cellBorderRightWidth,0);
            cellHeight= Math.max(parseInt($cell.css("height"),10) + cellBorderTopWidth + cellBorderBottomWidth,0);
            widthPerc[i]= (cellWidth / tableWidth)*100;
            heightPerc[i]= (cellHeight / tableHeight)*100;
        }
        return {
             "width": widthPerc,
             "height": heightPerc};
      },
	  "hexToRgb": function (hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	  },
	  "rgbToHex": function (rgb) {
		try {
			if(rgb.startsWith("rgb(")) {
				var colorInput = rgb.substring(4, rgb.length-1);
				colors = colorInput.split(",");
				var result = "#";
				for(i=0, iLen=colors.length; i<iLen; i+=1) {
				  result += jimUtil.toHex(parseInt(colors[i]));
				}

				return result;
			}
			else return rgb;

		} catch(error) {
			return rgb;
		}
	  },
	  "toHex": function (N) {
		 if (N==null) return "00";
		 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
		 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
		 return "0123456789ABCDEF".charAt((N-N%16)/16)
			  + "0123456789ABCDEF".charAt(N%16);
	  },
	  "getScale" : function(){
	      var scale=1;
	      if(window.jimUtil.scale != undefined && window.jimUtil.scale != 'none' && window.jimUtil.scale != 0){
	    	  scale = window.jimUtil.scale/100;
	      }
	      if(scale==0)
	    	  scale=1;

	      return scale;
	  },
	  "getZoom" : function(){
	      return window.jimDevice.getZoom();
	  },
      "getDivZoom" : function($obj) {
    	  var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/;
		  var zoomDiv = $("#zoomDiv");
    	  if (zoomDiv.length > 0) {
    	  	var matches = zoomDiv.css("-webkit-transform") ||
				    	    zoomDiv.css("-moz-transform")    ||
				    	    zoomDiv.css("-ms-transform")     ||
				    	    zoomDiv.css("-o-transform")      ||
				    	    zoomDiv.css("transform");
    	    matches = matches.match(matrixRegex);
    	  	return matches[1];
    	  }

		  return 1;
      },
	  "getTotalScale" : function(){
	      return (1/jimUtil.getZoom())*(jimUtil.getScale());
	  },
	  "getZoomedBBox" : function (p) {
		  var z = jimUtil.getZoom() * (1/jimUtil.getDivZoom());
		  return {"top": p.top*z, "left": p.left*z, "width": p.width*z, "height": p.height*z};
	  },
	  "isChrome" : function(){
		   	var expChrome = /Chrome\/([0-9]+).([0-9]+)/g ;
		   	var match = expChrome.exec(window.navigator.userAgent);
		   	return match ;
	  },
	  "isChromeLocal" : function(){
	   	var expChrome = /Chrome\/([0-9]+).([0-9]+)/g ;
	   	var match = expChrome.exec(window.navigator.userAgent);
	   	return match && Number(match[1]) >= 5 && window.location.href.indexOf('file://') >= 0;
	  },
	  "isFileProtocol" : function(){
		   	return (window.location.href.indexOf('file://') >= 0);
	  },
	  "getBaseID" : function(id){
		  var regExp = "^r[0-9]+_";
		  if(id.match(regExp)){
			return id.substring(id.indexOf("_")+1);
		  }
		  return id;
	  },
	  "isIE" : function () {
		  return jQuery.browser.msie || jimUtil.isIE11();
	  },
	  "isIE11" : function(){
		  return !!navigator.userAgent.match(/Trident\/7\./);
	  },
	  "isMobileDevice": function() {
			var userAgent = navigator.userAgent;
			var mobileTypes = {
			  android: userAgent.match(/Android/),
			  ios: userAgent.match(/(iPhone|iPad|iPod)/),
			  windows: userAgent.match(/Windows Phone/)
			};

			if(mobileTypes.android || mobileTypes.ios || mobileTypes.windows)
			  return true;
			else
			  return false;
	  },
	  "isAndroidDevice": function() {
			return navigator.userAgent.match(/Android/);
	  },
	  "isiOSDevice": function() {
				var userAgent = navigator.userAgent;
				var mobileTypes = {
				  ios: userAgent.match(/(iPhone|iPad|iPod)/)
				};

				if(mobileTypes.ios)
				  return true;
				else
				  return false;
	   },
	  "isOnScreen": function($element, x, y) {
		    if(x == null || typeof x == 'undefined') x = 1;
		    if(y == null || typeof y == 'undefined') y = 1;

		    var win = $(window);
		    var viewport = {
		        top : win.scrollTop(),
		        left : win.scrollLeft()
		    };
		    viewport.right = viewport.left + win.width();
		    viewport.bottom = viewport.top + win.height();

		    var height = $element.outerHeight();
		    var width = $element.outerWidth();

		    if(!width || !height){
		        return false;
		    }

		    var bounds = $element.offset();
		    bounds.right = bounds.left + width;
		    bounds.bottom = bounds.top + height;

		    var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

		    if(!visible){
		      return false;
		    }

		    var deltas = {
		      top : Math.min( 1, ( bounds.bottom - viewport.top ) / height),
		      bottom : Math.min(1, ( viewport.bottom - bounds.top ) / height),
		      left : Math.min(1, ( bounds.right - viewport.left ) / width),
		      right : Math.min(1, ( viewport.right - bounds.left ) / width)
		    };

		    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;

		},
		"isUndefined" : function(a) {
		    return a === undefined;
		},
		"changeSVGColor" : function(obj, color) {
		  var paths = obj.find("path, rect, circle, ellipse, line, polyline, polygon, use");
		  obj.closest("div").attr("overlay",color);
		  jQuery.each(paths, function (index, value) {
			var path = $(value);
		    var stroke = path.css("stroke");
		    var fill = path.css("fill");
		    var style = path.attr("style");
		    if (style == undefined) style = "";

		    style = style.replace(/(?:fill|stroke): *#[a-fA-F0-9]+ !important/g,"");

		    if (stroke != undefined && stroke != "none")
		      path.attr("style", "stroke:" + color + " !important;" + style);

		    if (fill != undefined && fill != "none")
			  path.attr("style", "fill:" + color + " !important;" + style);
		  });
		},
		"removeSVGColor" : function (obj) {
		  var paths = obj.find("path, rect, circle, ellipse, line, polyline, polygon, use");
		  obj.closest("div").attr("overlay","none");
		  jQuery.each(paths, function (index, value) {
			var path = $(value);
		    var style = path.attr("style");
			if (path.attr("jimofill")) 
			  path.attr("fill", path.attr("jimofill"));
		    if (style != undefined && style != "")
		      path.attr("style", style.replace(/(?:fill|stroke): *#[a-fA-F0-9]+ !important/g,""));
		  });
		  
		  jQuery.each(obj.find("style"), function (index, value) {
			var innerText= $(value).text();
			$(value).html(innerText.replace(/(?:fill|stroke): *#[a-fA-F0-9]+ !important/g,""));
		  });
		},
		"convertToManualFitText" : function ($textComponent) {
			if($textComponent.hasClass("autofit")){
				$textComponent.removeClass("autofit");
				$textComponent.addClass("manualfit");
			}
		},
		"wrapAllVerticalLayouts" : function () {
		  var cells = $(".verticalWrap");
		  jQuery.each(cells, function (index, value) {wrapVerticalLayoutObject(value)});
		},
		"wrapAllDataVerticalLayouts" : function () {
	      var cells = $(".datalist .verticalWrap, .datagrid .verticalWrap");
	      var dataChilds = $(".verticalWrap").filter(function (index, element) {
	    	  var obj = $(element);
	    	  var c = obj.children(".verticalWrapper");
	    	  for (var i = 0; i < c.length; ++i) if ($(c[i]).children(".datagrid,.datalist").length > 0) return true;
		  });
	      jQuery.merge(cells, dataChilds);
	      jQuery.each(cells, function (index, value) {wrapVerticalLayoutObject(value)});
		},
		"wrapVerticalLayout" : function (value, show) {
		  if (value != undefined) wrapVerticalLayoutObject(value, show);
		},
		"wrapAllHorizontalLayouts" : function () {
		  var cells = $(".horizontal:not(.verticalWrap)").filter(function (a,b) {return $(b).attr("hspacing") != undefined && ($(b).attr("hspacing") != 0 || $(b).attr("vspacing") != 0)});
		  jQuery.each(cells, function (index, value) {wrapHorizontalLayoutObject(value, false)});
		},
		"wrapAllDataHorizontalLayouts" : function () {
		  var cells = $(".datalist .horizontal:not(.verticalWrap), .datagrid .horizontal:not(.verticalWrap)").filter(function (a,b) {return $(b).attr("hspacing") != undefined && ($(b).attr("hspacing") != 0 || $(b).attr("vspacing") != 0)});
		  jQuery.each(cells, function (index, value) {wrapHorizontalLayoutObject(value, false)});
		},
		"wrapHorizontalLayout" : function (value) {
		  if (value != undefined) wrapHorizontalLayoutObject(value, true);
		},
		"wrapLayout" : function (value, show) {
		  if (value != undefined) {
			var wrapper = $(value).closest(".layout.horizontal");
			if (wrapper.hasClass("verticalWrap")) wrapVerticalLayoutObject(wrapper, show);
			else if (wrapper.attr("hspacing") != 0 || (wrapper.attr("vspacing") != 0 && wrapper.hasClass("wrap")))
			  wrapHorizontalLayoutObject(wrapper, true);
		  }
		},
		"bindDateWidgets" : function ($target) {
	      if(!jimDevice.isMobile() || (jimDevice.isMobile() && !jimDevice.isIOS())) {
		    $target.find(".date").each(function(){
		      var $date = jQuery(this);
		      $date.find("input").datepicker();
		      if($date.find("input").attr("readonly") != undefined){
		    	$.datepicker._disableDatepicker($date.find("input")[0]);
		      }
		    });

		    $target.find(".time").each(function(){
		      var $date = jQuery(this);
		      $date.find("input").timepicker();
		      if($date.find("input").attr("readonly") != undefined){
		    	$.datepicker._disableDatepicker($date.find("input")[0]);
		      }
		    });

		    $target.find(".datetime").each(function(){
		      var $date = jQuery(this);
		      $date.find("input").datetimepicker();
		      if($date.find("input").attr("readonly") != undefined){
		        $.datepicker._disableDatepicker($date.find("input")[0]);
		      }
		    });
	      }
		},
		"getItemMarginWidth" : function ($item) {
		  var left, top, bottom, right;
		  left = top = bottom = right = 0;
		  
		  var $borderLayer = $item;
		  if($borderLayer) {
		  	top = parseInt($borderLayer.css("border-top-width"));
			left = parseInt($borderLayer.css("border-left-width"));
			right = parseInt($borderLayer.css("border-right-width"));
			bottom = parseInt($borderLayer.css("border-bottom-width"));
		  }

		  return {"left": left, "top": top, "bottom": bottom, "right": right};
		},
		"getItemBorderWidth" : function ($item) {
		  var left, top, bottom, right;
		  left = top = bottom = right = 0;
		  var $borderLayer = $item.children(".borderLayer");
		  if($borderLayer) {
		  	top = parseInt($borderLayer.css("border-top-width"));
			left = parseInt($borderLayer.css("border-left-width"));
			right = parseInt($borderLayer.css("border-right-width"));
			bottom = parseInt($borderLayer.css("border-bottom-width"));
		  }

		  return {"left": left, "top": top, "bottom": bottom, "right": right};
		},
		"getItemBorderRadius" : function ($item) {
		  var topLeft, topRight, bottomLeft, bottomRight;
		  topLeft = topRight = bottomLeft = bottomRight = 0;

		  var $borderLayer = $item.children(".borderLayer");
		  if ($borderLayer) {
			topLeft = parseInt($borderLayer.css("border-top-left-radius"));
			topRight = parseInt($borderLayer.css("border-top-right-radius"));
			bottomLeft = parseInt($borderLayer.css("border-bottom-left-radius"));
			bottomRight = parseInt($borderLayer.css("border-bottom-right-radius"));
		  }

		  return {"topLeft": topLeft, "topRight": topRight, "bottomLeft": bottomLeft, "bottomRight": bottomRight};
		},
		"getItemPaddingWidth" : function ($item) {
		  var left, top, bottom, right;
		  left = top = bottom = right = 0;
		  var $paddingLayer = $item.find(".paddingLayer:first");
		  if($paddingLayer) {
		  	top = parseInt($paddingLayer.css("padding-top"));
			left = parseInt($paddingLayer.css("padding-left"));
			right = parseInt($paddingLayer.css("padding-right"));
			bottom = parseInt($paddingLayer.css("padding-bottom"));
		  }

		  return {"left": left, "top": top, "bottom": bottom, "right": right};
		},
		"updateBackgroundLayer" : function ($item) {},
		"adaptItemToNewSize" : function ($item, padding, border, isResizeEvent, trueItemHeight /*fix for autofit in layout*/) {
			/*if (padding == undefined) padding = jimUtil.getItemPaddingWidth($item);
			if (border == undefined) border = jimUtil.getItemBorderWidth($item);
			if (isResizeEvent == undefined) isResizeEvent = true;
			var borderRadius = jimUtil.getItemBorderRadius($item);

			var innerItem = obtainInnerSizedItem($item);
			if (innerItem != null) {
			  var paddingAndBorderH = $item.hasClass("cellcontainer") || $item.hasClass("textcell") ? 0 : border.left + border.right + padding.left + padding.right;
			  var paddingAndBorderV = $item.hasClass("cellcontainer") || $item.hasClass("textcell") ? 0 : border.top + border.bottom + padding.top + padding.bottom;

			  if (!$item.hasClass('image')) {
				  paddingAndBorderH += (borderRadius.topLeft / 2) + (borderRadius.topRight / 2);
				  paddingAndBorderV += (borderRadius.topLeft / 2) + (borderRadius.bottomLeft / 2);
			  }

			  if(!$item.hasClass("datalist") && !$item.hasClass("table")) {
			    if ($item.hasClass("manualfit") || $item.hasClass("autofit")){
			    	innerItem.css("width", "calc(100% - " +  paddingAndBorderH + "px)");
			    	// innerItem.css("height", "calc(100% - " +
					// paddingAndBorderV + "px)");
			    }else {
			      innerItem.css("width", parseInt($item.width()) - paddingAndBorderH);
			      if (!($item.hasClass("nativedropdown") ) ) {
			    	      if (trueItemHeight == undefined)
			    	    	 innerItem.css("height", parseInt($item.height()) - paddingAndBorderV);
			    	      else
			    	         innerItem.css("height", trueItemHeight - paddingAndBorderV);
			      }
			    }
			  }

			  var property = jimUtil.getItemPaddingPropertyName($item);
			  if (!$item.hasClass('panel') && !$item.hasClass('image')) {
			  	var cssText = {};
			  	cssText[property + "-top"] = padding.top + border.top + borderRadius.topLeft / 2;
			  	cssText[property + "-left"] = padding.left + border.left + borderRadius.topLeft / 2;
			  	cssText[property + "-right"] = padding.right + border.right + borderRadius.topRight / 2;
			  	cssText[property + "-bottom"] = padding.bottom + border.bottom + borderRadius.bottomLeft / 2;
			   	innerItem.css(cssText);
			  }
			}*/
		},
		"doBorderRadiusUpdate" : function($item) {
			var $borderLayer = $item.children(".borderLayer");

			if ($borderLayer) {
				var leftStyle = $borderLayer.css("border-left-style") == "none";
				var rightStyle = $borderLayer.css("border-right-style") == "none";
				var topStyle = $borderLayer.css("border-top-style") == "none";
				var bottomStyle = $borderLayer.css("border-bottom-style") == "none";

				if (topStyle || leftStyle) $borderLayer.css("border-top-left-radius", 0);
				if (topStyle || rightStyle) $borderLayer.css("border-top-right-radius", 0);
				if (bottomStyle || leftStyle) $borderLayer.css("border-bottom-left-radius", 0);
				if (bottomStyle || rightStyle) $borderLayer.css("border-bottom-right-radius", 0);
			}
		},
		"doBorderUpdate" : function($item) {
			var newBorder = jimUtil.getItemBorderWidth($item);
			jimUtil.doBorderRadiusUpdate($item);
			
			
			
			
			
			// var trueHeight = $item.height() - oldBorder.top - oldBorder.bottom + newBorder.top + newBorder.bottom;

      /* if($item.hasClass("autofit")){

      }else{
        $item.css("width", $item.width() - oldBorder.left - oldBorder.right + newBorder.left + newBorder.right);
        if ($item.hasClass("manualfit")) {
            // $item.css("min-height", trueHeight);
          } else {
            $item.css("height", trueHeight);
          }
      } */


        	// jimUtil.updateBackgroundLayer($item);
        	jimUtil.doBorderRadiusUpdate($item);
        	// jimUtil.adaptItemToNewSize($item, padding, newBorder, false, trueHeight);

        	// Item specific
        	/*if ($item.hasClass("panel")) {
        		var innerItem = obtainInnerSizedItem($item);
        		var margin = jimUtil.getItemMarginWidth($item);

        		if (innerItem.hasClass("layoutWrapper")) {
        			innerItem.css("left", newBorder.left + margin.left);
        			innerItem.css("top", newBorder.top + margin.top);
        		}
        	}*/
		},
		"doPaddingUpdate" : function($item) {
			var newPadding = {left: 0, top: 0, bottom: 0, right: 0};
			var innerItem = obtainInnerSizedItem($item);
			var property = jimUtil.getItemPaddingPropertyName($item);
			newPadding.top = parseInt(innerItem.css(property + "-top"));
			newPadding.left = parseInt(innerItem.css(property + "-left"));
			newPadding.right = parseInt(innerItem.css(property + "-right"));
			newPadding.bottom = parseInt(innerItem.css(property + "-bottom"))

        	jimUtil.adaptItemToNewSize($item, newPadding, border, false);
		},
		"doMarginUpdate" : function($item) {
			jimUtil.updateBackgroundLayer($item);
			var border = jimUtil.getItemBorderWidth($item);

			// Item specific
			if ($item.hasClass("panel") || $item.hasClass("checkbox")) {
        		// var innerItem = obtainInnerSizedItem($item);
        		// var margin = jimUtil.getItemMarginWidth($item);
        		// innerItem.css("left", border.left + margin.left);
        		// innerItem.css("top", border.top + margin.top);
			} else if ($item.hasClass("dropdown") || $item.hasClass("nativedropdown")) {
				var selectItem = $item.find(".dropdown-options");
				var margin = jimUtil.getItemMarginWidth($item);

				selectItem = selectItem.css("left", margin.left);
				selectItem = selectItem.css("top", margin.top);
				selectItem = selectItem.css("width", "calc(100% - " + (margin.left + margin.right) + "px)" );
				selectItem = selectItem.css("height", "calc(100% - " + (margin.top + margin.bottom) + "px)" );
			}
		},
		"getTransformTranslate" : function(elem) {
			var transform = elem.css("transform");
			
			if (transform == "none")
				return undefined;
			
			var values = transform.split('(')[1].split(')')[0].split(',');
			
			return {x : values[4], y : values[5]};
		},
		"setMasterPinTransforms" : function() {
		  $(".masterinstance .pin").each(function (index, item) {
			var pinnedItem = $(item);
			var transform = pinnedItem.css("transform");			
			if (transform == "none")
				return;
			
			var translate = jimUtil.getTransformTranslate(pinnedItem);			
			var angle = parseInt(jimUtil.getRotationDegrees(pinnedItem));
			
			if (jimPin.getHorizontalPin(pinnedItem) != "none")
				translate.x = (jimPin.getHorizontalPin(pinnedItem) == "center") ? "-50%" : "0px";
			else translate.x = translate.x + "px";
			if (jimPin.getVerticalPin(pinnedItem) != "none")
				translate.y = (jimPin.getVerticalPin(pinnedItem) == "center") ? "-50%" : "0px";
			else translate.y = translate.y + "px";
			
			pinnedItem.css("transform", "translate(" + translate.x + ", " + translate.y + ")  rotate(" + angle + "deg)");
		  });
		},
		"getTransformRotationDegrees" : function(obj) {
			var matrix = obj.css("-webkit-transform") ||
				obj.css("-moz-transform")    ||
				obj.css("-ms-transform")     ||
				obj.css("-o-transform")      ||
				obj.css("transform");
			if(matrix !== 'none') {
				var values = matrix.split('(')[1].split(')')[0].split(',');
				var a = values[0];
				var b = values[1];
				var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
			} else { var angle = 0; }
			return (angle < 0) ? angle + 360 : angle;
		},
		"initMasterRotation" : function() {
			$(".masterinstance").each(function (index, value) {
				var item = $(value);
				var angle = parseFloat(item.attr("dataAngle"));
				if (angle) {
					var bounds = jimUtil.getRelativeItemBounds(item);
					jimUtil.rotateRelativeItemChilds(item, angle, {x : bounds.x + bounds.width / 2, y : bounds.y + bounds.height / 2}, angle);
				}
			});
		},
		"rotatePointOnPivot" : function(point, pivot, angle) {
			var s = Math.sin(angle * Math.PI / 180.0);
			var c = Math.cos(angle * Math.PI / 180.0);
			
			var newPx = point.left - pivot.x;
			var newPy = point.top - pivot.y;
			
			newX = newPx * c - newPy * s;
			newY = newPx * s + newPy * c;
			
			newX += pivot.x;
			newY += pivot.y;
			
			return {x : newX, y: newY};
		},
		"rotateRelativeItemChilds" : function(item, angle, center, totalAngle) {
			var childs = [];
			var children = item.children();
			
			for (var i = 0; i < children.length; ++i) {
				var $child = $(children[i]);
				
				if ($child.is("link"))
					continue;
				
				if ($child.is(".masterinstance, .group"))
					jimUtil.rotateRelativeItemChilds($child, angle, pivot);
				else {
					var position = $child.position();
					childBounds = {
						left : position.left,
						top : position.top,
						width : $child[0].clientWidth,
						height: $child[0].clientHeight,
						right: position.left + $child[0].clientWidth,
						bottom: position.top + $child[0].clientHeight
					};
					
					var oldTranslate = jimUtil.getTransformTranslate($child);
					var tx = (oldTranslate) ? parseFloat(oldTranslate.x) : 0;
					var ty = (oldTranslate) ? parseFloat(oldTranslate.y) : 0;
					
					var properties = {};					
					
					/*var point = jimUtil.rotatePointOnPivot(childBounds, center, angle);*/					
					var childPivot = {x : center.x - (childBounds.left + childBounds.width/2), y : center.y - (childBounds.top + childBounds.height/2)};
					$child.css({"transform" : "translate(" + tx + "px, " + ty + "px) " + 
						"translate(" + childPivot.x + "px," + childPivot.y + "px) " +
						"rotate(" + angle + "deg) " + 
						"translate(" + -childPivot.x + "px," + -childPivot.y + "px)"});
					
					var translate = jimUtil.getTransformTranslate($child);
					var x = parseFloat(translate.x) + parseFloat($child.css("left"))/* - childBounds.width / 2*/;
					var y = parseFloat(translate.y) + parseFloat($child.css("top"))/* - childBounds.height / 2*/;
					
					var hpin = jimPin.getHorizontalPin($child);
					if (hpin == "center")
						tx = "-50%";
					else if (hpin == "none") {
						jQuery.extend(properties, {"left" : x + "px"});
						tx = tx + "px";
					} else tx = 0;
					
					var vpin = jimPin.getVerticalPin($child);
					if (vpin == "center")
						ty = "-50%";
					else if (vpin == "none") {
						jQuery.extend(properties, {"top" : y + "px"});
						ty = ty + "px";
					} else ty = 0;
					
					jQuery.extend(properties, {"transform" : "translate(" + tx + ", " + ty + ") rotate(" + totalAngle + "deg)"});
					$child.css(properties);
				}
			}
		},
		"moveRelativeItemChilds" : function (item, offset, effects) {
			var childs = [];
			var children = item.children();

			for (var i = 0; i < children.length; ++i) {
				var $child = $(children[i]);
				
				if ($child.is("link"))
					continue;
				
				if ($child.is(".masterinstance, .group"))
					jimUtil.moveRelativeItemChilds($child, offset, effects);
				else {
					var x = parseFloat($child.css("left"));
					var y = parseFloat($child.css("top"));
					
					if (isNaN(x))
						x = 0;
					if (isNaN(y))
						y = 0;
					
					properties = {};
					var hpin = jimPin.getHorizontalPin($child);
					if (hpin == "none")
						jQuery.extend(properties, {"left" : (x + offset.x) + "px"});
					
					var vpin = jimPin.getVerticalPin($child);
					if (vpin == "none")
						jQuery.extend(properties, {"top" : (y + offset.y) + "px"});

					if (effects)
						$child.animate(properties, effects);
					else
						$child.css(properties);
				}
			}
		},
		"getRelativeItemBounds" : function (item, parentBounds) {
			var minx, maxx, miny, maxy;
			minx = miny = Number.MAX_VALUE;
			maxx = maxy = Number.MIN_SAFE_INTEGER;
			
			var children = item.children();
			for (var i = 0; i < children.length; ++i) {
				var childBounds;
				var child = children[i];
				var $child = $(child);
				
				if ($child.is("link, .hidden, .highlightEffect") || $child.css("display") == "none")
					continue;
							
				if ($child.is(".masterinstance, .group"))
					childBounds = jimUtil.getRelativeItemBounds($child);
				else {
					var x = parseFloat($child.css("left"));
					var y = parseFloat($child.css("top"));
					childBounds = {
						x : x,
						y : y,
						width : child.clientWidth,
						height : child.clientHeight
					};
					
					if (parentBounds && $child.is(".percentage")) {
						var cWidth = $child.data('width');
						var cHeight = $child.data('height');
						
						if ($child.data('widthUnit') === "%")
							childBounds.width = parentBounds.width * parseFloat(cWidth)/100;
						
						if ($child.data('heightUnit') === "%")
							childBounds.height = parentBounds.height * parseFloat(cHeight)/100;
					}
				}
				
				minx = Math.min(childBounds.x, minx);
				miny = Math.min(childBounds.y, miny);
				maxx = Math.max(childBounds.x + childBounds.width, maxx);
				maxy = Math.max(childBounds.y + childBounds.height, maxy);
			}
			
			if (minx == Number.MAX_VALUE)
				minx = miny = maxx = maxy = 0;
			
			if (item.is(".masterinstance")) {
				var masterL = parseFloat(item.attr("dataX"));
				var masterT = parseFloat(item.attr("dataY"));
				minx += masterL;
				maxx += masterL;
				miny += masterT;
				maxy += masterT;
			}
				
			return {x : minx, y : miny, width : maxx - minx, height : maxy - miny};
		},
		"getRelativeItemOffset" : function (item, parentBounds) {
			var minx, maxx, miny, maxy;
			minx = miny = Number.MAX_VALUE;
			maxx = maxy = Number.MIN_VALUE;
			
			var children = item.children();
			for (var i = 0; i < children.length; ++i) {
				var childBounds;
				var child = children[i];
				var $child = $(child);
				
				if ($child.is("link, .hidden, .highlightEffect") || $child.css("display") == "none")
					continue;
							
				if ($child.is(".masterinstance, .group"))
					childBounds = jimUtil.getRelativeItemOffset($child);
				else {
					var bounds = child.getBoundingClientRect();
					childBounds = {
						x : bounds.left,
						y : bounds.top,
						width : bounds.right - bounds.left,
						height : bounds.bottom - bounds.top
					};
					
					if (parentBounds && $child.is(".percentage")) {
						var cWidth = $child.data('width');
						var cHeight = $child.data('height');
						
						if ($child.data('widthUnit') === "%")
							childBounds.width = parentBounds.width * parseFloat(cWidth)/100;
						
						if ($child.data('heightUnit') === "%")
							childBounds.height = parentBounds.height * parseFloat(cHeight)/100;
					}
				}
				
				minx = Math.min(childBounds.x, minx);
				miny = Math.min(childBounds.y, miny);
				maxx = Math.max(childBounds.x + childBounds.width, maxx);
				maxy = Math.max(childBounds.y + childBounds.height, maxy);
			}
			
			if (minx == Number.MAX_VALUE)
				minx = miny = maxx = maxy = 0;
			
			return {x : minx, y : miny, width : maxx - minx, height : maxy - miny};
		},
		"isRelative" : function(item) {
			return item.is(".group, .masterinstance");
		},
		"insertRelativeItemIntoLayout" : function($container, item, bounds) {
			if ($container.is("#alignmentBox") || $container.children().children().first().is(".freeLayout")) {
				var x = parseFloat(item.css("left")) - bounds.x;
				var y = parseFloat(item.css("top")) - bounds.y;
				var offset = { x : x , y : y};
				jimUtil.moveRelativeItemChilds(item, offset);
			} else {
				item.wrap("<div class='relativeLayoutWrapper " + item.attr("id").substring(2) + "'><div class='relativeLayoutWrapperResponsive'></div></div>");
				var wrapper = item.parent().parent();
				wrapper.css("transform", "translate(" + -bounds.x + "px, " + -bounds.y + "px)");
				wrapper.css("width", bounds.width + "px");
				wrapper.css("height", bounds.height + "px");
				
				if (item.is(".hidden"))
					wrapper.addClass("hidden");
			}
		},
		"refreshEventResponsiveLayoutItem" : function($target) {
			var id = $target.attr("id");
			if (($target.is(".relativeLayoutWrapperResponsive > .masterinstance #" + id) &&
				  !$target.is(".masterinstance .scrollable #" + id)) || 
				  ($target.is(".relativeLayoutWrapperResponsive > .group #" + id) &&
				  !$target.is(".group .scrollable #" + id)) ||
				  ($target.is(".relativeLayoutWrapperResponsive > #" + id + ".group, .relativeLayoutWrapperResponsive > #" + id + ".masterinstance"))) {
				$target.jimForceVisibility();
				var wrapper = $target.closest(".relativeLayoutWrapper");
				jimResponsive.refreshResponsiveRelativeItem(wrapper.children().children().first());
				$target.jimUndoVisibility();
			}					  
		},
		"refreshResponsiveLayoutItem" : function($target) {
			var id = $target.attr("id");
			if (($target.is(".relativeLayoutWrapperResponsive > .masterinstance #" + id) &&
				  !$target.is(".masterinstance .scrollable #" + id)) || 
				  ($target.is(".relativeLayoutWrapperResponsive > .group #" + id) &&
				  !$target.is(".group .scrollable #" + id)) ||
				  ($target.is(".relativeLayoutWrapperResponsive > #" + id + ".group, .relativeLayoutWrapperResponsive > #" + id + ".masterinstance"))) {
				var wrapper = $target.closest(".relativeLayoutWrapper");
				jimResponsive.refreshResponsiveRelativeItem(wrapper.children().children().first());
			}
		},
		"resetElemTransform" : function (elem) {
			var degrees = jimUtil.getTransformRotationDegrees(elem);
			elem.css("transform", "rotate(" + degrees + "deg)");
		},
		"borderColorsChanged" : function ($target, cssAttrArray){
			if($target.css("border-style") == 'none'){
				cssAttrArray.forEach(function(cssAttrName, i) {
					if(cssAttrName==="border-top-color")
						$target.css("border-top-style","solid");
					else if(cssAttrName==="border-right-color")
						$target.css("border-right-style","solid");
					else if(cssAttrName==="border-bottom-color")
						$target.css("border-bottom-style","solid");
					else if(cssAttrName==="border-left-color")
						$target.css("border-left-style","solid");
				});
			
			}
		},
		"borderColorChangedUndo" : function ($target, cssAttrName, undoAttrArray){
			if(cssAttrName==="border-top-color")
				undoAttrArray["border-top-style"] = $target.css("border-top-style");
			else if(cssAttrName==="border-right-color")	
				undoAttrArray["border-right-style"] = $target.css("border-right-style");
			else if(cssAttrName==="border-bottom-color")
				undoAttrArray["border-bottom-style"] = $target.css("border-bottom-style");
			else if(cssAttrName==="border-left-color")
				undoAttrArray["border-left-style"] = $target.css("border-left-style");
		},
		"fixBackgroundImageAttr" : function($target, cssAttrName, oldBackgroundImage) {
			if(cssAttrName==="background-color") {
				var backgroundImageText = $target.css("background-image");
				var array = backgroundImageText.split(', linear');
				var newArray = "";
				for (var i = 0; i < array.length; ++i) {
					var string = array[i];
					if(!string.startsWith("-gradient") && !string.startsWith("linear-gradient"))
						newArray = newArray + string;
				}
				if(newArray==="")
					newArray="none";
				$target.css("background-image", newArray);
			} else if (cssAttrName==="background-image") {
				var newBackgroundImage = $target.css("background-image");
				if (newBackgroundImage.startsWith("url") && oldBackgroundImage.indexOf("linear") !== -1) {
				  var linearGradients = oldBackgroundImage.match(/linear-gradient\([#a-zA-Z0-9, ()]+\)/);
				  var newArray = newBackgroundImage;

				  for (var i = 0; i < linearGradients.length; ++i)
					newArray = newBackgroundImage + ", " + linearGradients[i];

				  $target.css("background-image", newArray);
				}
			}
		},
		"refreshDynamicPanelResponsiveSize" : function (startNode) {
			var $panels = startNode.find(".panel.default");
      	    for(t=0, tLen=$panels.length; t<tLen; t+=1) {
				var panel = jQuery($panels[t]);
				if(panel.data('widthUnit') === "%") {
					var width = panel.data("width");
					if(width!==undefined) {
						var parent = panel.parent();
					
						if (!(parent.css("position") == "fixed"))
							parent.css("width", width + "%");
						panel.css("width", "100%")
					}
				}
				if(panel.data('heightUnit') === "%") {
					var height = panel.data("height");
					if(height!==undefined) {
						var parent = panel.parent();
						
						if (!(parent.css("position") == "fixed"))
							parent.css("height", height + "%");
						panel.css("height", "100%")
					}
				}
			}
		}
    };
  /* END UTILITY FUNCTIONS */

  /* START PRIVATE FUNCTIONS */

  function obtainInnerSizedItem($target) {
	if ($target.hasClass("dropdown") || $target.hasClass("file"))
		return $target.children(".paddingLayer");
    else if ($target.hasClass('panel') && $target.children(".layoutWrapper").length)
      	return $target.children(".layoutWrapper");
    else if ($target.hasClass('borderLayer') || $target.hasClass('colorLayer') || $target.hasClass('imageLayer'))
      	return $target.parent().parent().children("*:last-child");
	else
  		return $target.children("*:last-child");
  }

  function wrapHorizontalLayoutObject(value, update) {
	var obj = $(value);
	var childs = obj.children();
	var parent = obj.closest(".panel,.cellcontainer,.datacell,.gridcell");
	var hspacing = obj.attr("hspacing");
	var vspacing = obj.attr("vspacing");
	var wrap = obj.hasClass("wrap");
	hspacing = (hspacing != undefined) ? parseInt(hspacing) : 0;
	vspacing = (vspacing != undefined) ? parseInt(vspacing) : 0;

	// Obtain the max height between the parent container and the tallest
	// children
	var width = obj.closest(".panel,.cellcontainer,.datacell,.gridcell").width();
	if (width != undefined) {
	  var maxWidth = width;
	  maxWidth = maxWidth - parseInt(obj.css("padding-left"),10) - parseInt(obj.css("padding-right"),10);
	  maxWidth = Math.max(maxWidth, /* tallest children */ (childs.size() > 0) ? childs.map(function(index, x) {return $(x).jimOuterWidth();}).toArray().reduce(function(sum, value) {return Math.max(value, sum);}) : 0);

	  if (hspacing != 0 && wrap)
	    var ghost = parent.find(".ghostHLayout").first().css("width", width + hspacing);

      if (wrap || update) {
	    var colX = 0;
	    var lastRow = [];
	    for (var i = 0; i < childs.length; ++i) {
	      var c = $(childs[i]);
	      var width = c.outerWidth();

	      if (width + colX >= maxWidth && (wrap)) {
		    colX = 0;
		    lastRow = [];
	      }

	      if (wrap) c.css("margin-bottom","");
	      if (c.css("display") != "none")
		    colX += width + hspacing;
	      lastRow[lastRow.length] = c;
	    }
	  }
	  if (wrap && vspacing != 0) jQuery.each(lastRow, function (i, v) {$(v).css("margin-bottom",0);});
	}
  }

  function wrapVerticalLayoutObject(value, show) {
	var obj = $(value);
	if (show == undefined) show = false;

	// Remove previous wrapping
	obj.children(".verticalWrapper").each(function () {$(this).children().unwrap();}).remove();
	var childs = obj.children();

	// Obtain the max height between the parent container and the tallest
	// children
	var maxHeight = obj.closest(".panel,.cellcontainer,.datacell,.gridcell").height() - parseInt(obj.css("padding-top"),10) - parseInt(obj.css("padding-bottom"),10);
	maxHeight = Math.max(maxHeight, /* tallest children */ childs.map(function(index, x) {return $(x).jimOuterHeight();}).toArray().reduce(function(sum, value) {return Math.max(value, sum);}));

	var vspacing = obj.attr("vspacing");
	vspacing = (vspacing != undefined) ? parseInt(vspacing) : 0;

	var colY = 0;
	var colItems = [];
	for (var i = 0; i < childs.length; ++i) {
	  var c = $(childs[i]);
	  var height = c.outerHeight();

	  if (height + colY > maxHeight) {
	    // Wrap collected items
	    $(colItems).wrapAll("<div class='verticalWrapper'>");

	    // Init column
	    colY = 0;
	    colItems = [];
	  }

	  if (c.css("display") != "none" || (show && show[0].id == c[0].id))
	    colY += height + vspacing;
	  colItems[colItems.length] = c[0];
	}
	$(colItems).wrapAll("<div class='verticalWrapper'>");
  }

  /* END PRIVATE FUNCTIONS */

  /* expose utilities to the global object */
  window.itemType = itemType;
  window.jimUtil = jimUtil;
})(window);
