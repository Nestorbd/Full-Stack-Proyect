/*
 * Copyright 2018 Justinmind. All rights reserved.
 */

(function(window, undefined) {
	  var zoomLevels = [50, 75, 100, 150];

	    $('#gestureTool').customSelect();
		$('.gesturecontrol span.customSelect').html("GESTURES");

	  /* rotate */
	  jQuery("#rotateDevice").bind("click", function(event) {
	  	jimDevice.rotateDevice(false);
	  });

	  jQuery("#rotateDevice span, .gesturecontrol").hover(
	  					function() {
	  						if (!jimComments.commentsMode) $(this).css('opacity', 0.75);},
						function() {
							if (!jimComments.commentsMode) $(this).css('opacity', '');});

	  function rotateToLandscape(relayout) {
		  var jimMobile = jQuery('#jim-mobile');
		  jimMobile.addClass("landscape").removeClass("portrait");
		  jQuery('#jim-container').addClass("landscape").removeClass("portrait");
		  jQuery('#jim-case').addClass("landscape").removeClass("portrait");
		  
		  if(!relayout){
			  jQuery('.ui-page > .horizontalScroll').css("width", 0);
			  jQuery('.ui-page > .verticalScroll').css("height", 0);
			  jQuery('.ui-page > .horizontalScroll').css("margin-top", 0);
			  jQuery('.ui-page > .horizontalScroll').css("margin-left", 0);
			  jQuery('.ui-page > .verticalScroll').css("margin-top", 0);
			  jQuery('.ui-page > .verticalScroll').css("margin-left", 0);
			  switchMaxSize();
			  
			  jimUtil.fitToScreen();
			  jimMobile.jimForceVisibility();
			  jimResponsive.refreshResponsiveComponents();
			  jimMobile.jimUndoVisibility(); 
		  }
	  }

	  function rotateToPortrait(relayout) {
		  var jimMobile = jQuery('#jim-mobile');
		  jimMobile.addClass("portrait").removeClass("landscape");
		  jQuery('#jim-container').addClass("portrait").removeClass("landscape");
		  jQuery('#jim-case').addClass("portrait").removeClass("landscape");
		  
		  if(!relayout){
			  jQuery('.ui-page > .horizontalScroll').css("width", 0);
			  jQuery('.ui-page > .verticalScroll').css("height", 0);
			  jQuery('.ui-page > .horizontalScroll').css("margin-top", 0);
			  jQuery('.ui-page > .horizontalScroll').css("margin-left", 0);
			  jQuery('.ui-page > .verticalScroll').css("margin-top", 0);
			  jQuery('.ui-page > .verticalScroll').css("margin-left", 0);
			  switchMaxSize();
			  
			  jimUtil.fitToScreen();
			  jimMobile.jimForceVisibility();
			  jimResponsive.refreshResponsiveComponents();
			  jimMobile.jimUndoVisibility();  
		  }
	  }
	  
	  function switchMaxSize() {
		  var alignmentBoxes = $("#simulation #alignmentBox");
		  for (var i = 0; i  < alignmentBoxes.length; ++i) {
			var box = $(alignmentBoxes[i]);
			var maxWidth = box.css("max-width");
			box.css("max-width", box.css("max-height"));
			box.css("max-height", maxWidth);
		  }
	  }

	  /* gesture tool */
	  jQuery("#gestureTool").val(0);
	  if($.browser.msie) {
		$(document).ready(function() {
		  document.getElementById('gestureTool').selectedIndex=0;
		});
	  }

	  jQuery("#gestureTool").change(function(event) {
	    var tools = jQuery("#gestureTool").prop("selectedIndex");
	    jimDevice.disableTools();
		switch(tools) {
		  case 0:
			enableTouchTool();
			jimDevice.tool = "touch";
		    break;
		  case 1:
			enablePinchTool();
			jimDevice.tool = "pinch";
		    break;
		  case 2:
			enableRotateTool();
			jimDevice.tool = "rotate";
		    break;
		  default:
			break;
		}
	  });

	  function enableTouchTool() {
		  jQuery("#jim-container").addClass("touch");
	  };

	  function enablePinchTool() {
		  $page = jQuery("#jim-container");
		  var cursor1 = '<div id="cursor1" class="cursor"></div>';
		  var cursor2 = '<div id="cursor2" class="cursor"></div>';
		  var m1, m2, doPinch=false;
		  var Y, target;
		  var zoomLev = jimDevice.getZoom();

		  $page.bind("mousemove", function(e, data) {
			if(doPinch === false) {
				$("#cursor1").css({left:(e.pageX - $page.offset().left)*zoomLev-50, top:(e.pageY - $page.offset().top)*zoomLev+50});
				$("#cursor2").css({left:(e.pageX - $page.offset().left)*zoomLev+50, top:(e.pageY - $page.offset().top)*zoomLev-50});
		    }
			else {
				Y = ((e.pageY - $page.offset().top)*zoomLev - m2);
				if(Y<-35)
				Y=-35;
				else if(Y>35)
				Y=35;
				$("#cursor1").css({left:m1-50-Y, top:m2+50+Y});
				$("#cursor2").css({left:m1+50+Y, top:m2-50-Y});
			}
		  });

		  $page.bind("drag", function(e, data) {
			return true;
		  });

		  $page.bind("dragstart", function(e, data) {
			m1 = (e.pageX - $page.offset().left)*zoomLev; //pos actual del rat�n
			m2 = (e.pageY - $page.offset().top)*zoomLev;
			doPinch=true;
			target = e.target;
			return true;
		  });

		  $page.bind("mouseup", function(e, data) {
			  if(doPinch) {
				 doPinch=false;
			   if(m2-((e.pageY - $page.offset().top)*zoomLev)<0)
				 jQuery(target).closest(".firer").trigger("pinchopen");
			   else if(m2-((e.pageY - $page.offset().top)*zoomLev)>0)
				 jQuery(target).closest(".firer").trigger("pinchclose");
			  }
		  });

		  $page.bind("mouseenter", function(e, data) {
			if(doPinch===false) {
				$page.append(cursor1+cursor2);
				zoomLev = jimDevice.getZoom();
			}
		  });

		  $page.bind("mouseleave", function(e, data) {
			if(doPinch===false) {
				jQuery("#cursor1").remove();
				jQuery("#cursor2").remove();
			}
		  });
	  };

	  function enableRotateTool() {
		  $page = jQuery("#jim-container");
		  var cursor1 = '<div id="cursor1" class="cursor"></div>';
		  var cursor2 = '<div id="cursor2" class="cursor"></div>';
		  var m1, m2, doRotate=false;
		  var angleRad, target;
		  var distance = 142;
		  var zoomLev = jimDevice.getZoom();

		  $page.bind("mousemove", function(e, data) {
			if(doRotate === false) {
				$("#cursor1").css({left:(e.pageX - $page.offset().left)*zoomLev-50, top:(e.pageY - $page.offset().top)*zoomLev+50});
				$("#cursor2").css({left:(e.pageX - $page.offset().left)*zoomLev+50, top:(e.pageY - $page.offset().top)*zoomLev-50});
		    }
			else {
				var v1x=m1-50;
				var v1y=m2+50;
				var v2x=(e.pageX - $page.offset().left)*zoomLev;
				var v2y=(e.pageY - $page.offset().top)*zoomLev;
				var distX = v2x - v1x;
				var distY = v1y - v2y;
				angleRad = Math.atan(distY/distX);
				if(distX<0)
				  angleRad= angleRad + Math.PI;

				if(angleRad>(3*Math.PI/4))
				  angleRad=3*Math.PI/4;
				else if(angleRad<-(Math.PI/4))
				  angleRad=-Math.PI/4;

				var X = Math.round(distance * Math.cos( angleRad ) );
				var Y = Math.round(distance * Math.sin( angleRad ) );

				$("#cursor1").css({left:m1-50, top:m2+50});
				$("#cursor2").css({left:m1-50+X, top:m2+50-Y});
			}
		  });

		  $page.bind("drag", function(e, data) {
			return true;
		  });

		  $page.bind("dragstart", function(e, data) {
			m1 = (e.pageX - $page.offset().left)*zoomLev; //pos actual del rat�n
			m2 = (e.pageY - $page.offset().top)*zoomLev;
			doRotate=true;
			target = e.target;
			return true;
		  });

		  $page.bind("mouseup", function(e, data) {
			if(doRotate) {
			  doRotate=false;
			  if((angleRad*180/Math.PI)<45)
				jQuery(target).closest(".firer").trigger("rotateright");
			  else if((angleRad*180/Math.PI)>45)
				jQuery(target).closest(".firer").trigger("rotateleft");
			}
		  });

		  $page.bind("mouseenter", function(e, data) {
			if(doRotate===false) {
			  $page.append(cursor1+cursor2);
			  zoomLev = jimDevice.getZoom();
			}
		  });

		  $page.bind("mouseleave", function(e, data) {
			if(doRotate===false) {
				jQuery("#cursor1").remove();
				jQuery("#cursor2").remove();
			}
		  });
	  };

	  /* zoom */
	  if($.browser.msie && $.browser.version<9) {
		  if(jQuery("#zoomValue").attr("disabled")===undefined)
			  jQuery("#zoomValue").attr("disabled", "disabled");
		  jQuery(".zoomcontrol").attr("title", "Your browser doesn't support the zoom feature");
	  }
	  else {
		  jQuery("#zoomValue").change(function(event) {
		    var zoom = jQuery("#zoomValue").prop("selectedIndex");
			switch(zoom) {
			  case 0:
				jimDevice.setZoom(zoomLevels[0]/100);
			    break;
			  case 1:
				jimDevice.setZoom(zoomLevels[1]/100);
			    break;
			  case 2:
				jimDevice.setZoom(zoomLevels[2]/100);
			    break;
			  case 3:
				jimDevice.setZoom(zoomLevels[3]/100);
				break;
			  default:
				break;
			}
		  });
	  }

	  function indexOf(zoomLevels, currentLevel) {
		  var value = parseInt(currentLevel);
		  for (var i=0; i < zoomLevels.length; i++) {
			if (zoomLevels[i] == value)
			  return i;
		  }
		  return -1;
	  };

	  function userSelect(){
		  return false;
	  }
	  
	  function postRotate(relayout, eventTrigger){
		  if(!relayout){
			jimDevice.resetWidgets();
			jQuery('.' + eventTrigger).trigger(eventTrigger);
			jQuery(window).trigger("resize");
			jQuery(window).trigger("reloadScrollBars");
			$('#jim-mobile').css('display','');
		  }
	  }

	  var jimDevice = {
		 "controllers" : {
			 iphoneIOS11:undefined,
			 iphoneIOS8:undefined,
			 ipadIOS8:undefined,
			 iphoneIOS7:undefined,
			 custom:undefined
			 },
	     "namesList" :["iphonex","iphone6plus","iphone6","iphone5","iphone4","ipad","androidphone","androidtablet","mobilecustom"],
		 "name": "",
		 "type" : "",
		 "isMobile": function() {
			if(jimDevice.type === "mobile")
				return true;
			return false;
		 },
		 "isIOS" : function(){
			 if(jimDevice.name.toLowerCase().indexOf("iphone")>=0 || jimDevice.name.toLowerCase().indexOf("ipad")>=0)
				 return true;
			 return false;
		 },
		 "isAndroid" : function(){
			 if(jimDevice.name.toLowerCase().indexOf("android")>=0)
				 return true;
			 return false;
		 },
		 "isCustom" : function(){
			 if(jimDevice.name.toLowerCase() === "mobilecustom")
				 return true;
			 return false;
		 },
		 "orientation": function() {
		 	var width = parseInt(jQuery("#simulation").css("width"));
			var height = parseInt(jQuery("#simulation").css("height"));
			return (width<height) ? "portrait" : "landscape";
		 },
		 "tool": "cursor",
		 "init": function() {
			 if(jimUtil.isMobileDevice()) {
				if(jQuery("#jim-mobile").length) {
					var simulation = jQuery("#simulation");
					jQuery("#jim-body").addClass("non_jim_mobile");
					jQuery("#jim-mobile").detach();
					jQuery("#jim-body").append(simulation);
					$("body").addClass("mobileDevice");
				}
				jQuery("body").removeClass("showComments");
				jQuery("#toppanel").removeClass("open hidden").addClass("hidden");
				jQuery("#sidepanel").removeClass("open hidden").addClass("hidden");
				jQuery("#jim-body").removeClass("controlled full").addClass("full");
				jQuery("#topInfo").removeClass("hidden").addClass("hidden");
			 }
			 //if initial screen is mobile
			 if(jimDevice.isMobile()){

			 }
		},
		"loadDeviceSimulator": function() {
			if(jimDevice.isMobile() && !jimUtil.isMobileDevice()) {
			  if(jQuery(jimDevice.getController().keyboardKey).length===0) {
			      jimDevice.getController().loadSimulator();
			  }
		      jimUtil.loadScrollBars();
		    }
			if(jimDevice.isMobile()){
				jQuery("#jim-body")[0].addEventListener('selectstart',userSelect);
				if ($("#jim-container").hasClass("landscape"))
				  switchMaxSize();
			}
		 },
		 "unloadDeviceSimulator": function() {
			if(jimDevice.isMobile() && !jimUtil.isMobileDevice()) {
			  jimDevice.getController().unloadSimulator();
		    }
			if(jimDevice.isMobile()){
				jQuery("#jim-body")[0].removeEventListener('selectstart',userSelect);
			}
		 },
		 "setZoom": function(value) {
			 if(jimDevice.isMobile()){
			 var $mobile = jQuery('#jim-mobile');
			  $mobile.css('-webkit-transform-origin', '50% 0 0');
			  $mobile.css('-webkit-transform', "scale(" + value + ")");
			  $mobile.css('-moz-transform-origin', '50% 0 0');
			  $mobile.css('-moz-transform', "scale(" + value + ")");
			  $mobile.css('-o-transform-origin', '50% 0 0');
			  $mobile.css('-o-transform', "scale(" + value + ")");
			  $mobile.css('-ms-transform-origin', '50% 0'); //IE9
			  $mobile.css('-ms-transform', "scale(" + value + ")");
			  $mobile.css('transform-origin', '50% 0');
			  $mobile.css('transform', "scale(" + value + ")");

			  if($.browser.msie && $.browser.version<9) {
				  var $container = jQuery('#jim-container'),
				  oldZoom = 1/jimDevice.getZoom();
				  $mobile.css('zoom', value);
				  $container.css('top', parseInt(((parseInt($container.css("top"))/oldZoom) *value)));
				  $container.css('left', parseInt(((parseInt($container.css("left"))/oldZoom) *value)));
			  }

			  //TODO
			  //Change the cursor images if touch to give the "zoom" to mouse pointer.
			 }
			 else{

			 }
		 },
		 "getZoom": function() {
			if(jimDevice.isMobile()){
				var value = parseInt(jQuery('#zoom-slider-full').css("width"));
				var ret = 1/((value/2 + 50) / 100);
				if(ret==0)ret=1;
				return ret;
			}else{
				return 1;
			}
		 },
		  "restoreZoom" : function (zoomLev) {
			  var zoom = 1/zoomLev,
			  $container = jQuery('#jim-container'),
			  $mobile = jQuery('#jim-mobile'),
			  oldZoom = 1/jimDevice.getZoom();

			  $container.css("top", "");
			  $container.css("left", "");

			  var top = $container.css("top");
			  var left = $container.css("left");
			  $mobile.css("width", "");
			  $mobile.css("height", "");

			  if(oldZoom===1 && zoomLev===1) {}
			  else {
				  $container.css('top', parseInt(parseInt((parseInt(top)) *zoom)));
				  $container.css('left', parseInt(parseInt((parseInt(left)) *zoom)));
			  }
		  },
		  "getController" : function(){
			 if(jimDevice.name.toLowerCase() === "iphonex")
				 return jimDevice.controllers.iphoneIOS11;
			 else if(jimDevice.name.toLocaleLowerCase() === "iphone6plus" || jimDevice.name.toLocaleLowerCase() === "iphone6" || jimDevice.name.toLocaleLowerCase() === "iphone5")
				 return jimDevice.controllers.iphoneIOS8;
			 else if(jimDevice.name.toLocaleLowerCase() === "ipad")
				 return jimDevice.controllers.ipadIOS8;
			 else if(jimDevice.name.toLocaleLowerCase() === "iphone4")
				 return jimDevice.controllers.iphoneIOS7;
			 else if(jimDevice.name.toLocaleLowerCase().indexOf("android")>=0 || jimDevice.name.toLocaleLowerCase() === "mobilecustom")
				 return jimDevice.controllers.custom;
			 return {};
		   },
		  "unload" : function(){
			 jimDevice.getController().hideWidgets();
		     jimDevice.getController().resetWidgets();
		  },
		  "resetWidgets" : function(){
			  jimDevice.getController().resetWidgets();
		  },
		 "disableTools" : function() {
			$page = jQuery("#jim-container");
			$page.removeClass("touch");
			jQuery("#cursor1").remove();
			jQuery("#cursor2").remove();
			$page.unbind('mousemove');
			$page.unbind('drag');
			$page.unbind('dragstart');
			$page.unbind('mouseup');
			$page.unbind('mouseenter');
			$page.unbind('mouseleave');
			jimDevice.unload();
		 },
		 "bindContainer" : function(){
			 if(jimDevice.isMobile())
				 jimDevice.getController().bindContainer();
		 },
		 "rotateDevice" : function(relayout){
				if (!jimComments.commentsMode) {
				    var isPortrait = jQuery('#jim-container.portrait');
					if(isPortrait && isPortrait.length===1) {
					  if($.browser.msie) {
						  rotateToLandscape(relayout);
						  if($.browser.version<9)
							  jimDevice.restoreZoom(jimDevice.getZoom());
						  postRotate(relayout, "orientationlandscape");
					  }
					  else {
						  if(!relayout){
							  $('#jim-mobile').fadeOut('slow', function() {
								  rotateToLandscape(relayout);
								  $('#jim-mobile').fadeIn("slow", function() {
								  	postRotate(relayout, "orientationlandscape");
								  });
							  });
						  }
						  else{
							  rotateToLandscape(relayout);
							  postRotate(relayout, "orientationlandscape");
						  }
					  }
					}
					else {
					  if($.browser.msie) {
						  rotateToPortrait(relayout);
						  if($.browser.version<9)
							  jimDevice.restoreZoom(jimDevice.getZoom());
						  postRotate(relayout, "orientationportrait");
					  }
					  else {
						  if(!relayout){
							  $('#jim-mobile').fadeOut('slow', function() {
								  rotateToPortrait(relayout);
								  $('#jim-mobile').fadeIn("slow", function() {
								  	postRotate(relayout, "orientationportrait")
								  });
							  });
						  }
						  else{
							  rotateToPortrait(relayout);
							  postRotate(relayout, "orientationportrait");
						  }
					  }
					}
				}
		  },
		 "refreshOrientation" : function(){
//			 if(jimDevice.isMobile()){
//				 if(jQuery("#jim-mobile").is(".landscape"))
//				 	rotateToLandscape();
//				 else
//				 	rotateToPortrait();
//			 }
		 }
	  };
	  window.jimDevice = jimDevice; /* expose to the global object */

})(window);
