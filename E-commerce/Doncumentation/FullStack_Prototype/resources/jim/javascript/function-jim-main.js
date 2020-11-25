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
  var jimMain,
      $navigationTree = jQuery("#navigationtree"),
      defaults = {
        "canvasContainer": jQuery("#simulation"),
        "activePageClass": "ui-page-active"
      },
      path;

  /* START NAVIGATION */
  path = {
    "urlParseRE": /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,
    "parseUrl": function(url) {
      var matches;
      if(typeof(url) === "string") {
        /*
         * [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
         * [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
         * [2]: http://jblas:password@mycompany.com:8080/mail/inbox
         * [3]: http://jblas:password@mycompany.com:8080
         * [4]: http:
         * [5]: //
         * [6]: jblas:password@mycompany.com:8080
         * [7]: jblas:password
         * [8]: jblas
         * [9]: password
         * [10]: mycompany.com:8080
         * [11]: mycompany.com
         * [12]: 8080
         * [13]: /mail/inbox
         * [14]: /mail/
         * [15]: inbox
         * [16]: ?msg=1234&type=unread
         * [17]: #msg-content
         */
        matches = path.urlParseRE.exec(url ||"") || [];
        return {
          "href":         matches[0] || "",
          "hrefNoHash":   matches[1] || "",
          "hrefNoSearch": matches[2] || "",
          "domain":       matches[3] || "",
          "protocol":     matches[4] || "",
          "doubleSlash":  matches[5] || "",
          "authority":    matches[6] || "",
          "username":     matches[8] || "",
          "password":     matches[9] || "",
          "host":         matches[10] || "",
          "hostname":     matches[11] || "",
          "port":         matches[12] || "",
          "pathname":     matches[13] || "",
          "directory":    matches[14] || "",
          "filename":     matches[15] || "",
          "search":       matches[16] || "",
          "hash":         matches[17] || ""
        };
      }
    },
    "stripHash": function(url) {
      return url.replace(/^#\//, "");
    },
    "set": function(url) {
      location.hash = "#/" + path.stripHash(url);
    }
  };

  function getMainWindow(windowRef) {
    var w = windowRef || window;
    return (jimMain.isPopup(w)) ? jimMain.getMainWindow(w.opener) : w;
  }

  function isPopup(window) {
    try {
      return window && window.opener && window.opener.jim;
    } catch (error) {
      window.jim = true;
      return false;
    }
  }


  function stopTransition($page,settings){
	//avoid transitions between devices
	settings.transition="none";

	var $from = (jQuery("."+settings.activePageClass).length) ? jQuery("."+settings.activePageClass) : undefined;
	if($from !== undefined)
		$from.css({"visibility": "hidden"});
  }

  function scaleContent($page){
  	if((jimUtil.scale && jimUtil.scale!=100) || jimUtil.fitted){
        if($page.find('#zoomDiv').length<=0){
        	//if master ONLY
        	if($page.find('.template, .screen').length<=0){
        		$page.find('.master').wrapAll(jQuery('<div id="zoomDiv"/>'));
        	}
        	else{
        		$page.find('.template, .screen').wrapAll(jQuery('<div id="zoomDiv"/>'));
        	}
        }
	}
  }
  
  function loadJS(src, cb, ordered) {
		"use strict";
		var tmp;
		var ref = document.getElementsByTagName( "script" )[ 0 ];
		var script = document.createElement( "script" );

		if (typeof(cb) === 'boolean') {
			tmp = ordered;
			ordered = cb;
			cb = tmp;
		}

		script.src = src;
		script.async = !ordered;
		ref.parentNode.insertBefore( script, ref );

		if (cb && typeof(cb) === "function") {
			script.onload = cb;
		}
		return script;
  }

  function doneContent(html, settings) {
	  var deferred = jQuery.Deferred();
	  if(window.PIE && window.PIE.ib && window.PIE.ib.od){
    	  PIE.ib.od();
      }
      if(window.PIE && window.PIE.mb && window.PIE.mb.ld){
    	  PIE.mb.ld();
      }
      var $page = jQuery(html).children();
      if($page) {		  
    	setupDevice($page,settings);
    	scaleContent($page);
        settings.canvasContainer
          .append($page)
          .trigger("canvasload", {"$page": $page});
        deferred.resolve($page, settings);
      } else {
        deferred.reject("no data");
      }
      return deferred.promise();
  }

  function getContent(url, settings) {
	    var deferred = jQuery.Deferred();
	    settings.url = lookUpURL(url);
	    var doneMethod = function() {
	    	var promise = doneContent($("#chromeTransfer"), settings)
	    		.done(function(target, args) {
	    	        	 deferred.resolve(target, args);
	    	        	 document.getElementById('chromeTransfer').innerHTML="";
	    	    })
	    	    .fail(function(target, args) {
	    	    	deferred.reject("no data");
	    	    });
	   	}
	    
	    loadJS("./review/" + settings.url + ".js", doneMethod, true);
	    
	    return deferred.promise();
  }

  function handleNavigation(target, args) {
	if(target && typeof(target)==="string") {
	  if(target.indexOf("!")>0) {
		var suffix = target.substring(target.indexOf("!")+1);
		if (suffix.match("^reqID")) {//starts with req
			if(suffix.indexOf("&elemID")>0){
				jimRequirements.openRequirementByID = target.substring(target.indexOf("!reqID")+6,target.indexOf("&elemID="));
				jimRequirements.showComponentByID = target.substring(target.indexOf("&elemID=")+8);
				if(target.indexOf("screens/")>=0)
					jimRequirements.showScreen = "s-" +target.substring(target.indexOf("screens/")+8,target.indexOf("!reqID"));
				else if(target.indexOf("templates/")>=0)
					jimRequirements.showScreen = "t-" +target.substring(target.indexOf("templates/")+10,target.indexOf("!reqID"));
				else if(target.indexOf("masters/")>=0)
					jimRequirements.showScreen = "m-" +target.substring(target.indexOf("masters/")+8,target.indexOf("!reqID"));
				else if(target.indexOf("scenarios/")>=0)
					jimRequirements.showScreen = target.substring(target.indexOf("scenarios/")+10,target.indexOf("!reqID"));
			}
			else
				jimRequirements.openRequirementByID = target.substring(target.indexOf("!reqID")+6);
		}else{
			jimComments.openCommentByID = target.substring(target.indexOf("!")+1);
		}
		target = target.substring(0, target.indexOf("!"));
	  }

	  if(!target.match(/(screens|scenarios)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)) {
		jQuery("#sidepanel").find("#navigationtree").find("a").each(function(index) {
		  if( "/screens/".concat($(this).text())===target || "screens/".concat($(this).text())===target) {
		    target=$(this).attr("href");
		    return false;
		  }
	    });
	  }
	}

    if($.browser.msie && $.browser.version<=8 && target==="") {
      return;
    }

    var settings = jQuery.extend({}, defaults, args), triggerData = args, promise;

    /* clear pause stack on navigation: by action, timeouts, back button, etc. */
    if(jimEvent) {
      jimEvent.clearPauseStack();
    }

    /* If the caller passed us a url, call loadPage() to make sure it is loaded into the DOM. We'll listen to the promise object it returns so we know when it is done loading or if an error ocurred. */
    if(typeof(target) === "string") {
      /* If we are in the midst of a transition, queue the current request. We'll call changePage() once we're done with the current transition to service the request. */
      if(transition.isTransitioning) {
        transition.queue.unshift(arguments);
        return;
      }
      transition.isTransitioning = true;
      settings.canvasContainer.trigger("canvasunload", triggerData);
      promise = getContent(target, settings)
        .done(function(target, args) {
          transition.isTransitioning = false;
          handleNavigation(target, args);

          if(window.PIE){
        	  var $page = jQuery(".ui-page");
              $page.find('.pie:not(.shape)').each(function() {
                if( jQuery.browser.msie && (jQuery.browser.version<=8 || !(this instanceof SVGElement)) ){
                	PIE.attach(this);
                }
              });
            }

          //load integration tools
          var urlPath = "#/"+args.url;
          var title = args.url;
          if(window.externalTools){
        	  window.externalTools.load(urlPath,title);
          }
        })
        .fail(function(target, args) {
          /*jimUtil.debug(errorThrown);*/
          transition.releaseLock();
          window.location.replace("resources/jim/html/error.html");
        });
    } else {
      var url = settings.url || "",
          $from = (jQuery("."+settings.activePageClass).length) ? jQuery("."+settings.activePageClass) : undefined,
          historyDir = settings.historyDir || (settings.isbackward) ? -1 : (settings.isforward) ? 1 : 0;

      if (historyDir === -1 && jimScenarios.currentNode != -1)
      	if (!jimScenarios.isValidLink(url)) jimScenarios.deleteFilter();
      if (historyDir === 0) {
        urlHistory.addNew(url);
      } else if(settings.isbackward || settings.isforward) {
        urlHistory.ignoreNextHashChange = true;
        path.set(url);
        urlHistory.update({"currentUrl": url}); /* updates urlHistory.activeIndex */
      }
      promise = transition.start(target, $from, settings.transition, settings.reverse);
    }
    return promise;
  }

  /*
   *
   * @param {Object} target
   * @param {Object} args
   * @param {Object} forced
   * 	-1 : Event-triggered transition
   *     1 : Click on scenario triggered transition
   *     2 : Click on sidepanel triggered transition
   * @return {Object}
   */
  function navigate(target, args, forced) {
	forced = typeof forced !== 'undefined' ? forced : -1;
	var url, options, popup, deferred;

    if(typeof(target) === "string") { /* called as url with optional options */
      options = jQuery.extend({}, args);
    } else if (typeof(target) === "object") { /* called with action parameters or urlHistory stack entry */
      options = jQuery.extend({}, target, args);
      target = target.target || target.url;
    }
    if(target) {
      if (options.popup) {
        url = (options.isexternal) ? target : "index.html#/" + target;
        if(options.popup.iscentered) {
          options.popup.left = (screen.availWidth - options.popup.width) / 2;
          options.popup.top = (screen.availHeight - options.popup.height) / 2;
        }
        popup = window.open(url, "", "width=" + options.popup.width + ",height=" + options.popup.height + ",top=" + options.popup.top + ",left=" + options.popup.left + ",scrollbars=" + options.popup.hasscrollbars + ",resizable=" + options.popup.isresizable);
        window.jim = true;
        popup.focus();
        window.popups.push(popup);
      } else if (options.tab) {
        url = (options.isexternal) ? target : "index.html#/" + target;
        jQuery(".pageunload").trigger("pageunload");
        popup = window.open(url, "_blank");
        window.jim = true;
        popup.window.jimData = window.jimData;
        popup.focus();
      } else {
        if(options.isexternal) {
          window.location.href = target;
        } else {
          if (jimMain.isPopup(window)) {
            deferred = jimMain.getMainWindow().jimMain.handleNavigation(target, options);
            window.close();
          } else {
        	var valid = true;

        	if (jimScenarios.currentNode != -1 && forced == -1)
        	  valid = jimScenarios.isValidLink(target);
        	else if (forced == 2) {
        	  jimScenarios.currentNode = -1;
        	  $("#infoContent .filterText").css({"display": ""});
        	  $("#scenarioThumbnail #scenarioWrapper").remove();
        	}

        	if (valid) {
			  deferred = handleNavigation(target, options);
        	}
        	else jimHighlight.highLightAll();
          }
          return deferred; /* returns deferred object to attach third-party callbacks, e.g. highlight comment-related component */
        }
      }
    }
  }


  function setupDevice($page,settings){
	  var oldDeviceName = jimDevice.name;
	  var deviceName = $page.hasClass("ui-scenario") ? "scenario" : $page.attr("devicename").toLowerCase();
	  var deviceType = $page.hasClass("ui-scenario") ? "scenario" : $page.attr("devicetype").toLowerCase();

      var deviceWidth = $page.attr("devicewidth");
      var deviceHeight = $page.attr("deviceheight");
      var deviceSize = "s"+deviceWidth+"x"+deviceHeight;

	  var $body = $("body");
      var deviceClasses = $body.data("deviceClasses");

	  //Change device
	  if((deviceName !== oldDeviceName) || ((jimDevice.isAndroid() || jimDevice.isCustom()) &&($.inArray(deviceSize,deviceClasses))<0)){
		  if(!jimUtil.isMobileDevice())
		  	stopTransition($page,settings);
		  //unload old device simulator
		  jimDevice.unloadDeviceSimulator();

		  var $simulation = $("#simulation");
		  var $jimBody = $("#jim-body");
		  //remove old classes
		  $body.removeClass("devMobile devIOS devAndroid devCustom");
		  var cName;
		  if(deviceClasses){
			  for (var n = 0; n < deviceClasses.length; n++){
				  cName = deviceClasses[n];
				 $body.removeClass(cName);
			  }
		  }

		  //load new device simulator
		  jimDevice.name = deviceName;
		  jimDevice.type = deviceType;

		  if(jimUtil.isMobileDevice()){
			        if(!$simulation.parent().is("#jim-body")){
			          //inside mobile // move out
			          $simulation.appendTo($("#jim-body"));
			        }
			        jimWebDevice.hideWebdeviceOption();
		  }else{
			       //add classes to body
			       deviceClasses = [];
			       $body.addClass(deviceName);
			       deviceClasses.push(deviceName);
			       if(jimDevice.isMobile())
			         $body.addClass("devMobile");
			       if(jimDevice.isIOS())
			         $body.addClass("devIOS");
			       if(jimDevice.isAndroid() || jimDevice.isCustom()){
			         var deviceWidth = $page.attr("devicewidth");
			         var deviceHeight = $page.attr("deviceheight");
			         var deviceSize = "s"+deviceWidth+"x"+deviceHeight;
			         $body.addClass(deviceSize);
			         deviceClasses.push(deviceSize);
			         if(jimDevice.isCustom() || jimDevice.name.toLocaleLowerCase() === "androidtablet")
			           $body.addClass("devCustom");
			         else if(jimDevice.isAndroid())
			           $body.addClass("devAndroid");
			       }
			       $body.data("deviceClasses",deviceClasses);

			        /* change DOM Structure */
			        if(jimDevice.isMobile()){
			  			  //add simulation in jim-mobile - jim-container
			  			  if(!$simulation.parent().is("#jim-container .pin-transform-layer")){
			  				  //not inside mobile // insert
			  				  $simulation.appendTo($("#jim-container .pin-transform-layer"));
			  			  }
			  			  $jimBody.addClass("mobile");
			  			  jimWebDevice.hideWebdeviceOption();
			  		}
			  		else if($page.hasClass("ui-scenario")){
				         //remove from jim-mobile
				         if(!$simulation.parent().is("#jim-web .pin-transform-layer")){
				           //inside mobile // move out
				           $simulation.appendTo($("#jim-web .pin-transform-layer"));
				         }
				         $jimBody.addClass("scenario");
				         jimWebDevice.hideWebdeviceOption();
			        }else{
			  			  //remove from jim-mobile
			  			  if(!$simulation.parent().is("#jim-web .pin-transform-layer")){
			  				  //inside mobile // move out
			  				  $simulation.appendTo($("#jim-web .pin-transform-layer"));
			  			  }
			  			  $jimBody.addClass("web");

			          jimWebDevice.showWebdeviceOption();
			  		  }
		  }

	      jimLayout.resizeTopInfo($page);

	      //set cursors
		  jimDevice.isMobile() ? jimDevice.tool = "touch" : jimDevice.tool="cursor";
	  }
	  
	  //get rotation from original canvas
	  var landscape = $("#jim-mobile").hasClass("landscape");
	  var $canvas = $page.find(".screen");
	  if($canvas.length > 0){
	  	var toLandscape = $page.find(".screen").hasClass("LANDSCAPE");
		if(landscape != toLandscape){
			  if(!jimUtil.isMobileDevice() && jimDevice.isMobile()){
				stopTransition($page,settings);
				jimDevice.rotateDevice(true);
			  }
		 }
	  }

      if(!jimUtil.isMobileDevice()){
    	  if(jimDevice.isMobile())
    		  jQuery("body").css("display", "block");
        else if($page.hasClass("ui-scenario")){
		  $("#web-clip-left").css("display", "none");
		  $("#web-clip-right").css("display", "none");
		  $("#jim-web").css("width", "100%");
		  $("#jim-web").css("height", "100%");
        }
        else{
          jimWebDevice.updateCanvasWidth($page);
          jimWebDevice.setCurrentWebDeviceWidth($page);
        }
    }
  }
  /* END NAVIGATION */

  /*
   * HTML5 proposes native pickers for inputs. We must disable them to use the jQuery ones,
   * but mobile devices should use them to open the native widgets.
   */
  function changeInputType() {
	  $('#simulation').find('input[type="date"], input[type="time"], input[type="datetime-local"], input[type="email"], input[type="url"], input[type="number"]').each(function() {
		if(jQuery(this).attr("readonly"))
		  $("<input type='text' />").attr({ name: this.name, value: this.defaultValue, tabindex: this.tabIndex, placeholder: this.placeholder, readonly:"readonly" }).insertBefore(this);
		else $("<input type='text' />").attr({ name: this.name, value: this.defaultValue, tabindex: this.tabIndex, placeholder: this.placeholder }).insertBefore(this);
	  }).remove();
  }

  /* START MAIN */
  window.popups = [];
  jimMain = {
    "path": path,
    "defaults": defaults,
    "init": function(home) {
      if(window.location.hash === "") {
        jimData.clearData();
        if(!jQuery.browser.msie) { /* IE: event.load -> init, while standard browser: init -> event.load */
          urlHistory.ignoreNextHashChange = true;
        }
        path.set(home);
      }
    },
    "getMainWindow": getMainWindow,
    "isPopup": isPopup,
    "navigate": navigate,
    "handleNavigation": handleNavigation,
    "unload": function() {
      jQuery(".pageunload").trigger("pageunload");
      defaults.canvasContainer.attr("class", "firer");
    }
  };

  window.jimMain = jimMain; /* expose to the global object */
  /* END MAIN */

  /* START EVENTS */
  jQuery(window)
    .bind("load", function() {
      jimLayout.load();
      jimDevice.init();
      jimData.load(window);
      if(jimUtil.isMobileDevice()){
    	  jQuery("body").removeClass("showComments");
    	  var topBar = jQuery("#topBarInfo");
    	  topBar.css("display","none");
    	  topBar.addClass("close");
      }
      else{
    	  window.jimComments.load();
      }
      if(window.location.hash !== "") {
	    handleNavigation(path.stripHash(location.hash));
      }

    })
    .bind("unload", function() {
      for(var p=0, pLen=window.popups.length; p<pLen; p+=1) {
        window.popups[p].close();
      }
      jimMain.unload();
      jimData.unload(window);
    });

  defaults.canvasContainer
    /*.bind("pagebeforechange", function(event, data) {}).bind("pagechangefailed", function(event, data) {})*/
    .bind("canvasunload", function(event, data) {
       jimMain.unload();
       if(jimDevice.isMobile() && !jimUtil.isMobileDevice()) {
    	 jimDevice.unload();
       }
       if(typeof(annotation) !== "undefined") { annotation.unload(); }
    })
    .bind("canvasload", function(event, data) {
       if(!jimDevice.isMobile() || jimDevice.isMobile() && !jimUtil.isMobileDevice())
         changeInputType();
       //load specific details of iOS Safari browser
       if(jimUtil.isiOSDevice() && jQuery(".web, .mobilecustom").length>0) {
    	   var fileref=document.createElement("link");
    	   fileref.setAttribute("rel", "stylesheet");
    	   fileref.setAttribute("type", "text/css");
    	   fileref.setAttribute("href", "./resources/_jim/css/function-jim-common-ios.css");
    	   document.getElementsByTagName("head")[0].appendChild(fileref);
       }
    })
    .bind("aftertransition", function(event, data) {
      var $target = jQuery(event.target || event.srcElement);
	  $("#simulation").css("background-color", "");
	  $("#simulation").css("background-image", "");
	  
      if($target.is(".ui-page")) {
    	$target = defaults.canvasContainer;
    	defaults.canvasContainer.find(".ui-page:not(."+defaults.activePageClass+")").remove();
    	/* TODO ensure all resources are loaded and effective */
    	defaults.canvasContainer.addClass(jimUtil.getCanvases().join(" "));
      }
      setTimeout(function() {
	  	window.jimComments.updateComments();
    	if($target.is("#simulation")) {
		  jimUtil.setMasterPinTransforms();
		  jimUtil.initMasterRotation();
		  
		  $("#simulation").addClass("blockRefresh");
    	  $target.trigger("loadcomponent");
		  $("#simulation").removeClass("blockRefresh");
		  
		  jimUtil.refreshDynamicPanelResponsiveSize($("#simulation"));
    	  
    	  jimUtil.wrapAllDataVerticalLayouts(); // Wrap vertical layouts in datagrids/datalists
    	  jimUtil.wrapAllDataHorizontalLayouts();
       	  $navigationTree.trigger("load", [urlHistory.getActive().url]);
          jimDevice.loadDeviceSimulator();

    	  $target.find(".pageload").trigger("pageload");
    	  //jimUtil.calculateMasterMinSize($target);
      	  if(typeof(annotation) !== "undefined") { annotation.load(); }
      	  if(!jimUtil.isMobileDevice() && jimComments.openCommentByID.length > 0) {
			jimComments.showComments(jimComments.openCommentByID);
			jimComments.openCommentByID = "";
		  }
		  else if(!jimUtil.isMobileDevice() && jimRequirements.openRequirementByID.length > 0) {
			jimRequirements.showRequirement(jimRequirements.openRequirementByID,jimRequirements.showComponentByID,jimRequirements.showScreen);
			jimRequirements.openRequirementByID = "";
			jimRequirements.showComponentByID = "";
			jimRequirements.showScreen = "";
		  }
	      if (!jimUtil.isMobileDevice()) jimRequirements.filterRequirements();
	      if (jimUtil.isMobileDevice()) $("span").on("click", function(event){ event.preventDefault();});

	      jimResponsive.refreshResponsiveCanvas(undefined, false, false, undefined, false);
	      jimResponsive.refreshResponsiveComponents(undefined, undefined, false, undefined, true);
	      jimDevelopers.triggerNavigation();
    	}

    	var sidepanel = $("#sidepanel");
    	if (sidepanel.hasClass("toClose")) {
    	  $("#toggle-panel-btn > span").trigger('click');
          sidepanel.removeClass("toClose");
        }

        var sim = $("#simulation");
        var toHighlight = sim.attr("toHighlight");
        if (toHighlight != undefined && toHighlight != ""){
            jimUtil.showElementThroughParentPanes($("#"+toHighlight))
            jimHighlight.highlightElement($("#"+toHighlight));
        }
        sim.attr("toHighlight","");

      }, 100);

      jimScenarios.bindScreenEvents();
      jimScenarios.initializeScenarios();
    });
  /* END EVENTS */
})(window);
