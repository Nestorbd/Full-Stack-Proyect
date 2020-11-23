/*!
 * @original-license
 * jQuery Mobile Framework 1.1.0 db342b1f315c282692791aa870455901fdb46a55
 * http://jquerymobile.com
 *
 * Copyright 2011 (c) jQuery Project
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function (window, undefined) {
  var queue = [], /* queue to hold simultaneous transitions */
      isTransitioning = false, /* indicates whether or not a transition is in progress */
      sequentialHandler = createHandler(),
      simultaneousHandler = createHandler(false),
      handlers = {
        "sequential": sequentialHandler,
        "slideup": simultaneousHandler,
        "slideright": simultaneousHandler,
        "slidedown": simultaneousHandler,
        "slideleft": simultaneousHandler
      },
      media,
      maxTransitionWidth = false,
      vendors = ["Webkit", "Moz", "O"];
  var fakeBody = $( "<body>" ).prependTo( "html" );

  function validStyle(prop, value, check_vend) {
    var div = document.createElement("div"),
    uc = function( txt ) {
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 );
	},
	vend_pref = function( vend ) {
		if( vend === "" ) {
			return "";
		} else {
			return  "-" + vend.charAt( 0 ).toLowerCase() + vend.substr( 1 ) + "-";
		}
	},
	check_style = function( vend ) {
		var vend_prop = vend_pref( vend ) + prop + ": " + value + ";",
			uc_vend = uc( vend ),
			propStyle = uc_vend + ( uc_vend === "" ? prop : uc( prop ) );

		div.setAttribute( "style", vend_prop );

		if ( !!div.style[ propStyle ] ) {
			ret = true;
		}
	},
	check_vends = check_vend ? check_vend : vendors,
	ret;

    for(i = 0; i < check_vends.length; i++) {
      check_style(check_vends[i]);
    }
    return !!ret;
  }

  media = (function() {
    /* TODO: use window.matchMedia once at least one UA implements it */
    var cache = {},
      testDiv = $("<div id='jquery-mediatest'></div>" ),
      fakeBody = $("<body>").append(testDiv),
      $html = jQuery("html");

    return function(query) {
      if (!(query in cache)) {
        var styleBlock = document.createElement( "style" ),
            cssrule = "@media " + query + " { #jquery-mediatest { position:absolute; } }";

        //must set type for IE!
        styleBlock.type = "text/css";

        if(styleBlock.styleSheet) {
          styleBlock.styleSheet.cssText = cssrule;
        } else {
          styleBlock.appendChild( document.createTextNode(cssrule) );
        }

        $html.prepend(fakeBody).prepend(styleBlock);
        cache[query] = testDiv.css("position") === "absolute";
        fakeBody.add(styleBlock).remove();
      }
      return cache[ query ];
    };
  })();

  /* Thanks to Modernizr src for this test idea. `perspective` check is limited to Moz to prevent a false positive for 3D transforms on Android. */
  function transform3dTest() {
	var mqProp = "transform-3d",
	ret = media( "(-" + vendors.join( "-" + mqProp + "),(-" ) + "-" + mqProp + "),(" + mqProp + ")" );

	if( ret ) {
		return !!ret;
	}

	var el = document.createElement( "div" ),
		transforms = {
			// We’re omitting Opera for the time being; MS uses unprefixed.
			'MozTransform':'-moz-transform',
			'transform':'transform'
		};

	fakeBody.append( el );

	for ( var t in transforms ) {
		if( el.style[ t ] !== undefined ){
			el.style[ t ] = 'translate3d( 100px, 1px, 1px )';
			ret = window.getComputedStyle( el ).getPropertyValue( transforms[ t ] );
		}
	}

	return validStyle('perspective', '10px', 'moz') || ( !!ret && ret !== "none" );
  }

  jQuery.extend(jQuery.support, {
	"cssTransitions": ("WebKitTransitionEvent" in window || validStyle( 'transition', 'height 100ms linear', [ "Webkit", "Moz", "" ] )) && !($.browser.msie && $.browser.version<=9),
    "cssTransform3d": transform3dTest()
  });


  /* animation complete callback */
  jQuery.fn.animationComplete = function(callback) {
    if(jQuery.support.cssTransitions) {
      var animationEndName = ($.browser.chrome || $.browser.webkit) ? "webkitAnimationEnd" : "animationend";
      return jQuery(this).one(animationEndName, callback);
    } else {
      /* defer execution for consistency between webkit/non webkit */
      setTimeout(callback, 0);
      return jQuery(this);
    }
  };



  function createHandler(sequential) {
    if(sequential === undefined) {
      sequential = true;
    }
    return function(transition, reverse, $to, $from) {
      var deferred = new jQuery.Deferred(),
        reverseClass = reverse ? " reverse" : "",
        active = urlHistory.getActive(),
        toScroll = active.lastScroll || 0, /* lastScroll not in history, but nice feature */
        maxTransitionOverride = maxTransitionWidth !== false && jQuery(window).width() > maxTransitionWidth,
        actualTransition = maybeDegradeTransition(transition),
        transitionDuration = transition ? (parseInt(transition.duration/2)+"ms") : "0ms";
        var none = !jQuery.support.cssTransitions || maxTransitionOverride || !actualTransition || actualTransition === "none",
        toggleViewportClass = function(remove){
          if($to.hasClass("ui-page")) {
            jimMain.defaults.canvasContainer.toggleClass("viewport-" + actualTransition);
          } else {
        	  if(remove)
        	  	  $to.parent(".dynamicpanel").removeClass("viewport-" + actualTransition);
        	  else
        		  $to.parent(".dynamicpanel").addClass("viewport-" + actualTransition);
            //set size to dynamic panel for transition in layouts
            if($to.parent(".dynamicpanel").hasClass("viewport-" + actualTransition)){
            	$to.parent(".dynamicpanel").css("width",$to.css("width"));
            	$to.parent(".dynamicpanel").css("height",$to.css("height"));
            }
            else{
            	$to.parent(".dynamicpanel").css("width",'');
            	$to.parent(".dynamicpanel").css("height",'');
            }
          }
        },
        scrollPage = function() {
          jQuery("#simulation").scrollTop(toScroll);
        },
        cleanFrom = function() {
          if($from.hasClass("ui-page")) {
            $from.removeClass(jimMain.defaults.activePageClass);
          } else {
            $from.addClass("hidden");
          }
          $from.removeClass("out in reverse " + actualTransition);
          applyTransitionDuration($from,"0ms");
        },
        startOut = function(){
          if(!sequential){
            doneOut();
          } else {
            $from.animationComplete(doneOut);
          }
		  
		  var targetScreenBG = $to.find(".screen > #backgroundBox");
		  var bg = targetScreenBG.css("background-color");
		  var gradient = targetScreenBG.css("background-image");
		  var bgRegexp = /[^,]+(?=\))/;
		  if ((!bg || bg == "none" || (bg.indexOf("rgba") == 0 && parseFloat(bgRegexp.exec(bg)) == 0)) && (!gradient || gradient == "none")) {
			  var targetTemplateBG = $to.find(".template > #backgroundBox");
			  bg = targetTemplateBG.css("background-color");
			  gradient = targetScreenBG.css("background-image");
			  
			  if (!bg || bg == "none" || (bg.indexOf("rgba") == 0 && parseFloat(bgRegexp.exec(bg)) == 0))
			    bg = "";
		  }
		  $("#simulation").css("background-color", bg);
		  $("#simulation").css("background-image", (!gradient) ? "" : gradient);
		  
          $from.addClass(actualTransition + " out" + reverseClass);
          applyTransitionDuration($from,transitionDuration);
        },
        doneOut = function() {
	      if($from && sequential) {
	       	cleanFrom();
	       	//fix: avoid blank page when navigating without effects + fix scrollbars recalculate effect
	       	if($to.hasClass("ui-page"))
	       		$from.css("display", "none");
	      }
          startIn();
        },
		preLoading = function(){
			 var page = $(".ui-page-active");
			 var simulation = jQuery("#simulation");

			simulation.trigger("preComponentLoading",[{transitionEffect:!none,target:$to}]);
		    jimUtil.refreshPageMinSize();
					
			var $panels = $to.find(".panel.default");
      	    for(t=0, tLen=$panels.length; t<tLen; t+=1) {
			var panel = jQuery($panels[t]);
      		if(panel.data('widthUnit') === "%") {
      			var width = panel.data("width");
      			if(width!==undefined) {
      				panel.parent().css("width", width + "%");
      				panel.css("width", "100%")
      			}
      		}
      		if(panel.data('heightUnit') === "%") {
      			var height = panel.data("height");
      			if(height!==undefined) {
      				panel.parent().css("height", height + "%");
      				panel.css("height", "100%")
      			}
      		}
      	    }
	        
	  		if (!page.hasClass("ui-scenario")) {
	  		 	//Change svg colors
	  			/*var svgs = $("#simulation div.image");
	  			jQuery.each(svgs, function (index, value) {
	  				var obj = $(value);
	  				var overlay = obj.attr("overlay");
	  				if (overlay != undefined && overlay!="") jimUtil.changeSVGColor(obj, overlay);
	  			});*/
	  		}
	  		
			$to.removeClass("invisible").addClass("visible");
	  		jimUtil.fitToScreen();
	  		if(!none){
	  			$to.animationComplete(doneIn);
	  		}{
	  			$to.addClass(actualTransition + " in" + reverseClass);
	  			applyTransitionDuration($to,transitionDuration);
	  		}
	  		if(none) {
	  			doneIn();
	  		};
		},
        startIn = function(){
            if($to.hasClass("ui-page")) {
				scrollPage();
            } else {
                if (actualTransition.substring(0,5) == "slide" && actualTransition != "slideandfade") {
                  $to.addClass("intransition").removeClass("hidden");
                }
                else{
                   $to.addClass("intransitionrelative").removeClass("hidden");
                 }
            }


	  		//render components before showing screen
		  	preLoading();
        },
        doneIn = function() {
          if($from && !sequential) {
            cleanFrom();
          }
          $to.removeClass("out in reverse " + actualTransition);
          if ($from)
            $from.removeClass("out in reverse " + actualTransition);
          applyTransitionDuration($to,"0ms");
          toggleViewportClass(true);
          $to.removeClass("intransition").removeClass("intransitionrelative");
          deferred.resolve(actualTransition, reverse, $to, $from);
        };

      toggleViewportClass(false);

      //load target first
		  var linkScreen, linkTemplate, linkMaster;
		  var waitCss=true;
        if($to.hasClass("ui-page")) {
          $to.removeClass("visible").addClass("invisible");
          $to.addClass(jimMain.defaults.activePageClass);
          if($.browser.msie && $.browser.version<=8){
            linkScreen = jQuery($to).find(".screen:last link:first").next()[0];
            linkTemplate = jQuery($to).find(".template:last link:first").next()[0];
            linkMaster = jQuery($to).find(".master:last link:first").next()[0];
          } else {
            linkScreen = jQuery($to).find(".screen:last link:first")[0];
            linkTemplate = jQuery($to).find(".template:last link:first")[0];
            linkMaster = jQuery($to).find(".master:last link:first")[0];
          }
          $to.css("display","none");
        } else {
          waitCss=false;
        }

        /*check if css of screen and template are loaded*/
		  (function(){

				if(waitCss && linkScreen){
				  if(!checkLoadMark(linkScreen,"screen")){
					  setTimeout(arguments.callee, 20);
	                  return;
				  }
				}
				if(waitCss && linkTemplate){
				  if(!checkLoadMark(linkTemplate,"template")){
					setTimeout(arguments.callee, 20);
	                return;
				  }
				}
				if(waitCss && linkMaster){
				  if(!checkLoadMark(linkMaster,"master")){
				    setTimeout(arguments.callee, 20);
	                return;
				  }
				}
			
			if($to.hasClass("ui-page"))
				$to.css("display","");

            if($from && !none) {
              startOut();
            } else {
              doneOut();
            }

		  })();

      return deferred.promise();
    };
  }

  function checkLoadMark(link,type){
	  try{
	  if($.browser.msie && $.browser.version<=8){
		  if(link.styleSheet && link.styleSheet.rules && link.styleSheet.rules.length!=0){
			  if(link.styleSheet.rules[link.styleSheet.rules.length-1].selectorText.match(/#loadMark$/)){
				  return true;
			  }
		  }
	  }else if(jimUtil.isFileProtocol()){
	      if(type=="screen")
	           return (jQuery(".screen:last > #loadMark").css('width') == '1px') && checkMasterInstanceLoadMark();
	      else if(type=="template")
	           return (jQuery(".template:last > #loadMark").css('width') == '1px') && checkMasterInstanceLoadMark();
	      else if(type="master")
	           return jQuery(".master:last > #loadMark").css('width') == '1px';
	  }else {
		  if(link.sheet){
			  if(link.sheet.cssRules){
				  if(link.sheet.cssRules.length!=0){
					  if(link.sheet.cssRules[link.sheet.cssRules.length-1].selectorText.match(/#loadMark$/)){
						  return true;
					  }
				  }
	  		  }
		  }
	  }
	  }
	  catch(e){};

	  return false;
  };
  
  function checkMasterInstanceLoadMark() {
	  var result = true;
	  jQuery(".screen:last > .masterInstanceLoadMark").each(function (i, el) {
		  result = result && ($(el).css('width') == '1px');
	  });
	  return result;
  };

  /* If transition is defined, check if css 3D transforms are supported, and if not, if a fallback is specified */
  function maybeDegradeTransition(transition) {
    return (transition && !jQuery.support.cssTransform3d) ? "fade" : (transition ? transition.type : transition);
  };

  function applyTransitionDuration($target,duration) {
    $target.css("animation-duration",duration);
    $target.css("-webkit-animation-duration",duration);
    $target.css("-moz-animation-duration",duration);
    $target.css("-ms-animation-duration",duration);
  };

  function releaseLock() {
    isTransitioning = false;
    if(queue.length > 0) {
      if(!$.browser.msie)
    	jimMain.handleNavigation("", queue.pop());
    }
  }

  function start($to, $from, transition, reverse) {
    var th, promise;
    if(transition)
      th = handlers[transition.type || "sequential"] || handlers["sequential"];
    else
      th = handlers["sequential"];

    $to.trigger("beforetransition");
    promise = th(transition, reverse, $to, $from).done(function() {
      releaseLock();
      $to.trigger("aftertransition");
    });
    return promise;
  }

  fakeBody.remove();


  window.transition = {
    "isTransitioning": isTransitioning,
    "queue" : queue,
    "releaseLock": releaseLock,
    "start": start
  };
})(window);
