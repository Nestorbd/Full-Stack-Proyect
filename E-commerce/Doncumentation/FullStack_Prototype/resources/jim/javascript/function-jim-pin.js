/*!
 * Copyright 2017 Justinmind. All rights reserved.
 */

(function (window, undefined) { 
	/* START PINNING UTIL FUNCTIONS */
	  window.jimPin = {
	  		"pinAxisChange":true,
			"lastPositionY":0,
			"lastPositionX":0,
			"scrollDir":undefined,
			"oldScrollDir":undefined,
	  		"isJSPin":function(target,error){
	  			return target.closest(".scrollable").length>0;
	  		},
			"isScalated" : function(){
				return (jimUtil.scale && jimUtil.scale!=100) || jimUtil.fitted;
			},
	  		"getLayoutMarginTop":function(){
	  			//transform changes origin
	  			return document.body.clientHeight - $("#jim-body").innerHeight();
	  		},
	  		"getLayoutMarginRight":function(){
	  			if(window.jimWebDevice.isOriginalWidthSelected()){
	  				var bodyWidth = jQuery("#jim-body").outerWidth();
	  				var scrollWidth = jQuery("#simulation").innerWidth() - (jQuery("#simulation").prop("clientWidth"));
	  				return (Math.max(0,(bodyWidth - (jQuery("#simulation").innerWidth())))/2 + ((document.body.clientWidth) - bodyWidth)) + scrollWidth;
	  			}
	  			else{
		  			var $canvas = jQuery(".screen:last");
		  			if(!$canvas.length)
		  			 $canvas = jQuery(".template:last");
		  			if(!$canvas.length)
		  				$canvas = jQuery(".master:last");
		  			//transform changes origin
	  				return (document.body.clientWidth) - ($canvas.innerWidth());
	  			}
	  		},
	  		"getLayoutMarginLeft":function(){
	  			if(window.jimWebDevice.isOriginalWidthSelected()){
	  				var bodyWidth = jQuery("#jim-body").outerWidth();
	  				return Math.max(0,(bodyWidth - (jQuery("#jim-web").innerWidth()))/2);
	  			}
	  			else
	  				return 0;
	  		},
	  		"getLayoutMarginBottom":function(){
	  			var $canvas = jQuery(".screen:last");
	  			if(!$canvas.length)
	  			 $canvas = jQuery(".template:last");
	  			if(!$canvas.length)
	  				$canvas = jQuery(".master:last").parent();//master has no inner size
	  			//transform changes origin
	  			return (document.body.clientHeight - $canvas.innerHeight())-jimPin.getLayoutMarginTop();
	  		},
			"resetMargins":function(elem,error){
				elem[0].style.marginTop = "0px";
				elem[0].style.marginBottom = "0px";
				elem[0].style.marginLeft = "0px";
				elem[0].style.marginRight = "0px";
			},
			"getHorizontalPin" : function(elem){
				if(elem.hasClass("hpin-beginning"))
					return "beginning";
				else if(elem.hasClass("hpin-center"))
					return "center";
				else if(elem.hasClass("hpin-end"))
					return "end";
				else return "none";
			},
			"getVerticalPin" : function(elem){
				if(elem.hasClass("vpin-beginning"))
					return "beginning";
				else if(elem.hasClass("vpin-center"))
					return "center";
				else if(elem.hasClass("vpin-end"))
					return "end";
				else return "none";
			},
			"relayoutElement":function(elem, error){
				var marginTop =  0;
				var marginRight = $("#simulation").innerWidth() - $("#simulation").children().first().innerWidth();
				var marginBottom =  $("#simulation").innerHeight() - $("#simulation").children().first().innerHeight();
				var marginLeft = 0;
				
				var currentTop = parseInt(elem.css('margin-top'), 10);
			    var currentRight = parseInt(elem.css('margin-left'), 10);
			    
				if(elem.data("originPinTopOffset")===undefined)
					elem.data("originPinTopOffset",currentTop);
				if(elem.data("originPinRightOffset")===undefined)
					elem.data("originPinRightOffset",currentRight);
				
				currentTop = elem.data("originPinTopOffset");
				currentRight = elem.data("originPinRightOffset");
			    
				if(elem.hasClass("vpin-center"))
					elem.css("margin-top",currentTop + ((marginTop-marginBottom)/2) + "px");
				else if(elem.hasClass("vpin-end"))
					elem.css("margin-bottom",marginBottom+"px");
				else
					elem.css("margin-top",currentTop + marginTop + "px");

				if(elem.hasClass("hpin-beginning"))
					elem.css("margin-left",currentRight+marginLeft+"px");
				else if(elem.hasClass("hpin-end"))
					elem.css("margin-right",currentRight+marginRight+"px");
				else if(elem.hasClass("hpin-center"))
					elem.css("margin-left",currentRight-(marginRight/2) + (marginLeft/2)+"px");
			},
			"getRootAlignBoxes":function(){
				var listAlignBoxes = jQuery(".screen > #alignmentBox > .freeLayout,.template > #alignmentBox > .freeLayout");
				return listAlignBoxes;
			},
			"getPinnedToRoot":function(){
				var listAlignBoxes = jimPin.getRootAlignBoxes();
				return jimPin.getPinnedToAlignBox(listAlignBoxes);
			},
			"getPinnedToAlignBox" : function(listAlignBoxes){
				var listPinned = $([]);
				listAlignBoxes.each(function(index){
					function getPinnedToAlignBoxRecurse(elem){
						listPinned = listPinned.add(jQuery(elem.children(".pin")));
						jQuery(elem.children(".group, .masterinstance")).each(function(index){
							var container = $(this);
							getPinnedToAlignBoxRecurse(container);
						});
					}
					getPinnedToAlignBoxRecurse($(this));
				});
				return listPinned;
			},
			"getPinnedCenterToRoot":function(){
				if(window.jimDevice.isMobile() && !jimUtil.isMobileDevice()){
					return $([]);
				}
				else{
					var listPinned = $([]);
					var listAlignBoxes = jimPin.getRootAlignBoxes();
					listAlignBoxes.each(function(index){
						function getPinnedCenterToRootRecurse(elem){
							listPinned = listPinned.add(jQuery(elem.children(".pin.hpin-center, .pin.vpin-center")));
							jQuery(elem.children(".group, .masterinstance")).each(function(index){
								var container = $(this);
								if(container.hasClass("masterinstance"))
									container = container.find("#alignmentBox > .freeLayout");
								getPinnedCenterToRootRecurse(container);
							});
						}
						getPinnedCenterToRootRecurse($(this));
					});
					return listPinned;
				}
			},
			"getCenterBoxOffset" : function(elem){
				if((window.jimDevice.isMobile() && !jimUtil.isMobileDevice()))
					return 0;
				if(window.jimWebDevice.isOriginalWidthSelected())
					return undefined;
				var $alignBox = jimUtil.getCanvasAlignmentBox(elem);
				var $canvas = $alignBox.closest(".canvas");
				if($canvas.length && $canvas.attr("alignment")=="center")
					return $alignBox.offset().left - $(".scrollable-root").scrollLeft();
				else
					return undefined;
			},
		    "relayout": function(full,error) {
				var pinnedElements = false;
				
				if((window.jimDevice.isMobile() && !jimUtil.isMobileDevice()) || jimPin.isScalated())
					return pinnedElements;
				
				//pinned to screen
				jimPin.getPinnedToRoot().each(function(index){
					pinnedElements=true;
					var $canvas = jimUtil.getCanvasAlignmentBox($(this)).closest(".canvas");
					if(($canvas.length && $canvas.attr("alignment")=="center") || window.jimWebDevice.isOriginalWidthSelected() || full){
						//refreshCenteredComponents
						jimPin.refreshPinElement($(this));
					}
					else
						jimPin.relayoutElement($(this));
				});
				
				if(pinnedElements)
					jimPin.resetScrollDirection();
				
				return pinnedElements;
		    },
			"getParentGroups" : function (elem, groups){
				if(groups===undefined)
					groups = new Array();
				if(elem.parent().hasClass("group")){
					groups.push(elem.parent());
					return jimPin.getParentGroups(elem.parent(),groups);
				}
				else
					return groups;
			},
			"getClosestContainerOffset" : function (elem){
				var offset = {top:0,left:0};
				var $parent = elem.parent();
		  		if($parent.hasClass("group")){
		  			offset.left = parseInt($parent.position().left,10);
		  			offset.top = parseInt($parent.position().top,10);
		  		}
		  		else if($parent.hasClass("freeLayout") && $parent.parent().attr('id') == "alignmentBox" && $parent.parent().parent().hasClass("master")){
		  			var instance = elem.closest(".masterinstance");
					offset.left = jimPin.getMasterOffset(instance).left;
					offset.top = jimPin.getMasterOffset(instance).top;
		  		}
				return offset;
			},
			"getAllContainersOffset" : function ($container){
				var offset = {top:0,left:0};
				function getContainerOffsetRecurse(elem){
					var container = false,$parent;
			  		if(elem.hasClass("group")){
			  			var position = elem.position();
			  			offset.left = offset.left + (parseInt(position.left,10));
			  			offset.top = offset.top + (parseInt(position.top,10));
			  			container=true;
			  			$parent = elem.parent();
			  		}
			  		else if(elem.hasClass("freeLayout") && elem.parent().attr('id') == "alignmentBox" && elem.parent().parent().hasClass("master")){
			  			var $instance = elem.closest(".masterinstance");
			  			if($instance.length>0){
				  			var masterOffset = jimPin.getMasterOffset($instance);
							offset.left = offset.left + masterOffset.left;
							offset.top = offset.top + masterOffset.top;
							container=true;
							$parent = $instance.parent();
			  			}
			  		}
			  		if(container)
			  			getContainerOffsetRecurse($parent);
				}
				getContainerOffsetRecurse($container);
		  		return offset;
			},
			"getClosestContainer" : function(elem){
				function getClosestContainerRecurse(elem){
			  		if(elem.attr('id') !== "alignmentBox" && !elem.hasClass("scrollable") && !elem.hasClass("group"))
			  			return getClosestContainerRecurse(elem.parent());
			  		else
			  			return elem;
				}
				return getClosestContainerRecurse(elem.parent());
			},
			"getClosestContainerNoGroups" : function(elem){
				function getClosestContainerWithoutGroupsRecurse(elem){
			  		if(elem != undefined && elem.attr('id') !== "simulation" && !elem.hasClass("scrollable"))
			  			return getClosestContainerWithoutGroupsRecurse(elem.parent());
			  		else
			  			return elem;
				}
				return getClosestContainerWithoutGroupsRecurse(elem.parent());
			},
			"pinGroupElement" : function(elem,offsetX,offsetY,group,error){
				//pin elements inside groups/masters inside scrollables 
				if(!jimPin.isJSPin(elem))return;
				elem.addClass("pin");
				
				//elements pinned inside masters inside layouts
				var layoutElem = elem.closest(".layout");
				var insideLayoutMaster = false;
				if(layoutElem.hasClass("horizontal") || layoutElem.hasClass("vertical")){
					if(jimPin.getClosestContainer(elem).parent().hasClass("master")){
						if(jimPin.getHorizontalPin(elem) !== "none")
							elem.closest(".offset").css("left","0px");
						if(jimPin.getVerticalPin(elem) !== "none")
							elem.closest(".offset").css("top","0px");
						insideLayoutMaster=true;
					}
					else
						return;
				}

				var containerWidth, containerHeight, groupLeftOffset = 0, groupTopOffset = 0;
				var $scrollable;
				if(insideLayoutMaster)
					$scrollable = elem.closest(".masterinstance");
				else
					$scrollable = elem.closest(".scrollable");
			  	
			  	var scrollY = 0;
				var scrollX = 0;
				var $container = group;
				if(/*window.jimMobile && !jimUtil.isMobileDevice()*/(($scrollable.hasClass("ui-page") || (jimUtil.isMobileDevice() && $scrollable[0].id === "simulation")) && !insideLayoutMaster)){
				  	scrollY = $scrollable.scrollTop();
					scrollX = $scrollable.scrollLeft();
				}
				if($scrollable.attr('id') == "simulation" && jimPin.isScalated()){
					scrollY = scrollY *(1/jimUtil.getScale());
					scrollX = scrollX *(1/jimUtil.getScale());
				}
		  		
		  		//reset margins
		  		jimPin.resetMargins(elem);
		  		
		  		elem.css("right","");
		  		if(!insideLayoutMaster)
		  			groupLeftOffset = jimPin.getAllContainersOffset($container).left - scrollX;
		  		
		  		//horizontal pin
				if(elem.hasClass("hpin-beginning")){
					elem.css("left",offsetX - (groupLeftOffset*(1/jimUtil.getScale())) + "px");
				}
				else if(elem.hasClass("hpin-end")){
					containerWidth = $scrollable[0]['clientWidth'];
					elem.css("left",containerWidth - elem.jimOuterWidth() - offsetX - (groupLeftOffset*(1/jimUtil.getScale())) +"px");
				}
				else if(elem.hasClass("hpin-center")){
					containerWidth = $scrollable[0]['clientWidth'];
					var halfWidth = elem.jimOuterWidth()/2;
					elem.css("left",containerWidth/2 + offsetX - halfWidth - (groupLeftOffset*(1/jimUtil.getScale())) +"px");
				}
				
		  		elem.css("bottom","");
		  		if(!insideLayoutMaster)
		  			groupTopOffset = jimPin.getAllContainersOffset($container).top - scrollY;
				
				//vertical pin
				if(elem.hasClass("vpin-beginning")){
					elem.css("top",offsetY- groupTopOffset + "px");
				}
				else if(elem.hasClass("vpin-end")){
					containerHeight = $scrollable[0]['clientHeight'];
					elem.css("top",containerHeight - elem.jimOuterHeight() - offsetY - groupTopOffset* (1/jimUtil.getScale()) +"px");
				}
				else if(elem.hasClass("vpin-center")){
					containerHeight = $scrollable[0]['clientHeight'];
					var halfHeight = elem.jimOuterHeight()/2;
					elem.css("top",containerHeight/2 + offsetY - halfHeight - groupTopOffset* (1/jimUtil.getScale()) +"px");
				}
			},
		    "pinElement" : function(elem, offsetX, offsetY, canvasLoad) {
		    	elem.addClass("pin");
		    	elem.removeClass("non-processed-pin");
				elem.off('wheel',wheelScrollOnFixed);
		  		var scrollX=0,scrollY=0; 
		  		var groupOffsetX=0,groupOffsetY=0;
		  		var originalWidthDisplacement = 0;
		  		var jsPin = jimPin.isJSPin(elem);
		  		var scrollXSize = 0;
				var scrollYSize = 0;
				
		  		if(!jsPin){
						//manually control scroll bubbling
						elem.on('wheel',wheelScrollOnFixed);
						
		  				elem.css('position','fixed');
		  				elem.removeClass("pin-translated");
						
						if (elem.data("widthUnit") == "%") {
							scrollXSize = $("#simulation").innerWidth() - $("#simulation").children().first().innerWidth();
							elem.css("width", "calc(" + elem.data("width") + "% - " + scrollXSize + "px)");
						}
						
						if (elem.data("heightUnit") == "%") {
							scrollYSize = $("#simulation").innerHeight() - $("#simulation").children().first().innerHeight();
							elem.css("height", "calc(" + elem.data("height") + "% - " + scrollYSize + "px)");
							if (elem.css("min-height") != "0px")
								elem.css("min-height", "calc(" + elem.data("height") + "% - " + scrollYSize + "px)");
						}
						
		  				if(window.jimWebDevice.isOriginalWidthSelected()){
		  					//fix overflow displacement
			  				if(elem.hasClass("hpin-beginning")){
				  				originalWidthDisplacement = jQuery("#jim-body").scrollLeft();
			  				}
			  				else if(elem.hasClass("hpin-end")){
				  				originalWidthDisplacement = jimPin.getOriginalWidthOverflowDisplacement();
				  				originalWidthDisplacement = originalWidthDisplacement - jQuery("#jim-body").scrollLeft();
				  			}
				  			else if(elem.hasClass("hpin-center")){
				  				originalWidthDisplacement = jimPin.getOriginalWidthOverflowDisplacement()/2;
				  				originalWidthDisplacement = originalWidthDisplacement - jQuery("#jim-body").scrollLeft();
				  			}
		  				}
						
		  		}
		  		else{
					elem.css('position','absolute');
		  			/*pin to container*/
		  			var parent = elem.parent();
		  			if(parent.hasClass("freeLayout") && parent.parent().attr('id') == "alignmentBox" && parent.parent().parent().hasClass("master")){
		  				/*element inside master*/
		  				return jimPin.pinGroupElement(elem,offsetX,offsetY,parent);
		  			}

			  		/*element child of container*/
			  		if(canvasLoad) {
			  			scrollY = 0;
						scrollX = 0;
			  		}
			  		else {
			  			var $scrollable = elem.closest(".scrollable");
			  			scrollY = $scrollable.scrollTop();
						scrollX = $scrollable.scrollLeft();
					
						if($scrollable.attr('id') == "simulation" && jimPin.isScalated()){
							scrollY = scrollY *(1/jimUtil.getScale());
							scrollX = scrollX *(1/jimUtil.getScale());
						}
					}
		  		}
		  		
		  		//reset margins
		  		jimPin.resetMargins(elem);
				
		  		if(canvasLoad!==undefined && !canvasLoad)
		  			elem.jimForceVisibility();
		  		//horizontal pin
				if(elem.hasClass("hpin-beginning")){
					elem.css({"left":offsetX + scrollX - originalWidthDisplacement +  "px", "right":""});
				}
				else if(elem.hasClass("hpin-end")){		
					elem.css({"right":offsetX - scrollX - originalWidthDisplacement +"px", "left":""});
				}
				else if(elem.hasClass("hpin-center")){
					elem.css({"margin-left":offsetX + scrollX + originalWidthDisplacement +"px", "left":"50%", "right":""});
					elem.data("originPinRightOffset", offsetX + scrollX + originalWidthDisplacement);
				} else if(!jsPin) {
					//careful with centered content
					var centerOffset = jimPin.getCenterBoxOffset(elem);
					if(centerOffset === undefined)
						scrollX = -$(".scrollable-root").scrollLeft();
					else
						scrollX = centerOffset + $(".scrollable-root").scrollLeft();
						
					if(window.jimWebDevice.isOriginalWidthSelected()){
						scrollX = scrollX - jQuery("#jim-body").scrollLeft();
					}
					groupOffsetX = jimPin.getAllContainersOffset(elem.parent()).left;
					elem.css("left",offsetX + scrollX + groupOffsetX + "px");
				}
				
				//vertical pin
				if(elem.hasClass("vpin-beginning")){
					elem.css({"top":offsetY+scrollY+"px", "bottom":""});
				}
				else if(elem.hasClass("vpin-end")){
					elem.css({"bottom":offsetY-scrollY+"px", "top":""});
				}
				else if(elem.hasClass("vpin-center")){
					elem.css({"margin-top":offsetY + scrollY +"px", "top":"50%", "bottom":""});
					elem.data("originPinTopOffset", offsetY + scrollY);
				} else if(!jsPin) {
					scrollY = -$(".scrollable-root").scrollTop();
					groupOffsetY = jimPin.getAllContainersOffset(elem.parent()).top;
					elem.css("top",offsetY+scrollY+groupOffsetY+"px");
				}
				
				var translation = jimUtil.getTransformTranslate(elem);
				if (!translation)
					translation = {x : 0, y : 0};
				translation.x = jimPin.getHorizontalPin(elem) != "none" ? 0 : translation.x;
				translation.y = jimPin.getVerticalPin(elem) != "none" ? 0 : translation.y;
				
				if (elem.hasClass("vpin-center") || elem.hasClass("hpin-center")) {
					var transformString = "translate(" + (elem.hasClass("hpin-center") ? "-50%" : (translation.x + "px")) + "," + (elem.hasClass("vpin-center") ? "-50%" : (translation.y + "px")) + ")";
					var angle = parseInt(jimUtil.getRotationDegrees(elem));
					elem.css("transform", transformString + " rotate(" + angle + "deg)");
				} else {
					var angle = parseInt(jimUtil.getRotationDegrees(elem));
					elem.css("transform", "translate(" + translation.x + "px, " + translation.y + "px) rotate(" + angle + "deg)");
				}
				
				if(canvasLoad!==undefined && !canvasLoad)
					elem.jimUndoVisibility();
				if(!jsPin)
					jimPin.relayoutElement(elem);
			},
			"getMasterOffset" : function(masterinstance){
				var value = {top:0,left:0};
				var mOffset = masterinstance.children(".offset");
				var position = masterinstance.position();
				value.top = position.top + parseInt(mOffset.css("top"),10);
				value.left = position.left + parseInt(mOffset.css("left"),10);
				return value;
			},
			"refreshPinElement" : function(elem, canvasLoad){
				var offsetY = parseInt(elem.data('offsetY'), 10);
			    var offsetX = parseInt(elem.data('offsetX'), 10);
			    jimPin.pinElement(elem,offsetX,offsetY, canvasLoad);
			},
			"pinAllElementsDescending" : function($target){
				$target.find(".pin").each(function(index){
					jimPin.refreshPinElement($(this));
				});
			},
			"pinElements":function($elems, canvasLoad){
				$elems.each(function(index){
					jimPin.refreshPinElement($(this), canvasLoad);
				});
			},
			"pinAllElements" : function($page){
				//pin to screen
				if($page){
					jQuery(".pin").each(function(index){
						if($(this).closest(".ui-page")[0] == $page[0])
						jimPin.refreshPinElement($(this));
					});
				}
				else{
					jQuery(".pin").each(function(index){
						jimPin.refreshPinElement($(this));
					});
				}
			},
			"refreshCenteredComponents":function(){
				if(jQuery(".screen").attr("alignment")=="center" || jQuery(".template").attr("alignment")=="center"){
					jimPin.getPinnedToRoot().each(function(index){
						var $canvas = jimUtil.getCanvasAlignmentBox($(this)).closest(".canvas");
						if($canvas.length && $canvas.attr("alignment")=="center")
							jimPin.refreshPinElement($(this));
					});
				}
			},
			"refreshGroup" : function(group,error){
				var groupContainer = group;
				
				groupContainer.children(".pin").each(function(index){
					jimPin.refreshPinElement($(this));
					if($(this).hasClass("group") || $(this).hasClass("masterinstance"))
						jimPin.refreshGroup($(this));
				});
				
				//recursive call
				groupContainer.children(".group, .masterinstance").each(function(index){
					jimPin.refreshGroup($(this));
				});
			},
			"refreshContainer" : function(container,error){
				//pin elements inside container (manually pinned)
				if(container.is(".cellcontainer"))
					container = container.children(".layout:first-child");
				else if(container.is(".ui-page")){
					container = jimPin.getRootAlignBoxes();
				}
				container.children(".group, .masterinstance").each(function(index){
					jimPin.refreshGroup($(this));
				});
				container.children(".pin.hpin-center, .pin.vpin-center").each(function(index){
					jimPin.refreshPinElement($(this));
				});
				
			},
			"refreshAllContainers" : function(error){
				//TODO: more specific - only scrollables children of root
				//pin elements inside container (manually pinned)
				jQuery(".scrollable").each(function(index){
					if($(this).closest(".percentage").length || $(this).is(".ui-page")){
						jimPin.refreshContainer($(this));
					}
				});
			},
			"refreshDescendantContainers" : function(elem,error){
				//first level refresh
				if(elem.is(".scrollable"))
					jimPin.refreshContainer(elem);
				
				//second level refresh (optimize)
				elem.find(".scrollable").each(function(index){
					//if($(this).closest(".percentage").length){
						jimPin.refreshContainer($(this));
					//}
				});
			},
			"bodyScrolling":function(){
				//translate all pinned elements to absolute
				if(window.jimWebDevice.isOriginalWidthSelected() && jimPin.scrollDir!="outerHorizontal"){
					jimPin.scrollDir = "outerHorizontal";
					jimPin.oldScrollDir = jimPin.scrollDir;
					jimPin.scrollAxisChanged("horizontal",true);
				}
			},
			"scrolling":function(){
				 var $scrollable = $(this);
				 var scrollVertical = false;
		    	 var scrollHorizontal = false;
		    	 if(jimPin.lastPositionY!=$scrollable.scrollTop())
		    		 scrollVertical = true;
		    	 if(jimPin.lastPositionX!=$scrollable.scrollLeft())
		    		 scrollHorizontal = true;
				 
					if(scrollVertical && scrollHorizontal)
						jimPin.scrollDir=undefined;
					else if(scrollVertical)
						jimPin.scrollDir = "vertical";			
					else if(scrollHorizontal)
						jimPin.scrollDir = "horizontal";
					
					if(jimPin.oldScrollDir!=jimPin.scrollDir || jimPin.oldScrollDir==undefined || jimPin.scrollDir ==undefined || jimPin.pinAxisChange==true)
						jimPin.pinAxisChange=true;
					else
						jimPin.pinAxisChange=false;
					
					jimPin.lastPositionY=$scrollable.scrollTop();
					jimPin.lastPositionX=$scrollable.scrollLeft();
					
				  if (jimPin.pinAxisChange) {
					  jimPin.oldScrollDir = jimPin.scrollDir;

					if(scrollVertical && scrollHorizontal){
						jimPin.scrollDir=undefined;
					}
					else if(scrollVertical){
						jimPin.scrollDir = "vertical";
					}
					else if(scrollHorizontal){
						jimPin.scrollDir = "horizontal";
					}
					jimPin.scrollAxisChanged(jimPin.scrollDir);
				 }
			},
			"containerScrolling" : function(){
				var mobileSimulator=false;
				if(window.jimDevice.isMobile() && !jimUtil.isMobileDevice()){
					  mobileSimulator=true;
				}
				var $scrollable = $(this);
				if(($scrollable.hasClass("ui-page-active") && mobileSimulator) || $scrollable.attr('id') == "simulation"){
					jimPin.getPinnedToRoot().each(function(index){
				 		jimPin.refreshPinElement($(this));
					});
				}
				else{
					var scrollableChildren = $scrollable.children(".paddingLayer").children(".freeLayout");
					scrollableChildren.children(".pin").each( function (index) {
						 jimPin.refreshPinElement($(this));
					});
					scrollableChildren.children(".group").each( function (index) {
						 jimPin.refreshGroup($(this));
					});
					scrollableChildren.children(".masterinstance").each( function (index) {
						 jimPin.refreshGroup($(this));
					});
				}
			},
			"hoverScrolling" : function(event){
				if(jQuery(this).css("position")=="fixed"){
					var container = jQuery(this).closest(".scrollable-root");
			 	    container.scrollTop(container.scrollTop() - (event.originalEvent.wheelDelta || -event.originalEvent.detail*30));
				}
			},
			"addScrollListeners" : function($component){
				if($component == undefined){
				  //init
				  if(window.jimDevice.isMobile() && !jimUtil.isMobileDevice()){
					  jQuery(".ui-page-active").addClass("scrollable");
				  }else if(jimPin.isScalated()){
					  jQuery("#simulation").addClass("scrollable");
				  }else{
					  jQuery("#simulation").addClass("scrollable-root");
				  }
				  
				  jQuery(".scrollable-root").off("scroll",  jimPin.scrolling);
				  jQuery(".scrollable-root").on("scroll",  jimPin.scrolling);
				  
				  jQuery("#jim-body").off("scroll",jimPin.bodyScrolling);
				  jQuery("#jim-body").on("scroll",jimPin.bodyScrolling);
				  
				  $component = jQuery("#jim-body");
				}
				 
				//jsScroll
				$component.find(".scrollable").off("scroll",jimPin.containerScrolling);
				$component.find(".scrollable").on("scroll",jimPin.containerScrolling);
				
				$component.find(".pin").off('mousewheel DOMMouseScroll', jimPin.hoverScrolling);
				$component.find(".pin").on('mousewheel DOMMouseScroll', jimPin.hoverScrolling);
			
			},
			"scrollAxisChanged":function(scrollDir, webOuterScroll){
				 if(window.jimDevice.isMobile() && !jimUtil.isMobileDevice())return;
				 jimPin.getPinnedToRoot().each(function(index){
				 		var elem=$(this); 
				  		var oldPosition=elem.css("position");
				  		
						var hPin = jimPin.getHorizontalPin(elem);
						var vPin = jimPin.getVerticalPin(elem);
				  		if((scrollDir == "vertical" && vPin=="none") || (scrollDir == "horizontal" && hPin=="none") || webOuterScroll){
				  			//scrolling on "free" axis
					  		if(oldPosition=="fixed"){
					  				//scrolling on "free" axis
					  				//translate from fixed to absolute
					  				elem.css('position','absolute');
									
									if (elem.data("widthUnit") == "%")
										elem.css("width", elem.data("width") + "%");
									if (elem.data("heightUnit") == "%") {
										elem.css("height", elem.data("height") + "%");
										if (elem.css("min-height") != "0px")
											elem.css("min-height", elem.data("height") + "%");
									}
					  				
					  				//avoid scroll generated by this element
					  				var oldStyle = {};
					  				oldStyle['display'] = elem[0].style['display'];
					  				elem[0].style['display'] = 'none';
					  				
									var absPos = {top:0,left:0};
									if(hPin=="none")
										absPos.left = elem.data("offsetX");
									else
										absPos.left = jimPin.calculateAbsoluteLeft(elem,elem.data("offsetX"),hPin,"absolute");
									
									if(vPin=="none")
										absPos.top = elem.data("offsetY"); 
									else
										absPos.top = jimPin.calculateAbsoluteTop(elem,elem.data("offsetY"),vPin,"absolute");
									
									elem[0].style.top = absPos.top+"px";
									elem[0].style.left = absPos.left+"px";
									jimPin.resetMargins(elem);
									
									var angle = parseInt(jimUtil.getRotationDegrees(elem));
									elem.jimForceVisibility();
									var translationTransform = jimUtil.getTransformTranslate(elem);
									if (!translationTransform) 
										translationTransform = {x : 0, y : 0};
									translationTransform.x = elem.hasClass("hpin-center") ? "0px" : (translationTransform.x + "px");
									translationTransform.y = elem.hasClass("vpin-center") ? "0px" : (translationTransform.y + "px");
									elem.css("transform", "translate(" + translationTransform.x + ", " + translationTransform.y + ") rotate(" + angle + "deg)");
									elem.jimUndoVisibility();
									
									elem.addClass("pin-translated");

									elem[0].style['display'] = oldStyle['display'];

									//fix for phantom scrollbars on chrome
									jimUtil.forceReflow();
							      	jimUtil.refreshPageMinSize();
									return;
					  		}
				  		}else{
					  		elem.css('position','fixed');
					  		//recalculate size if defined by percentage (in fixed position)
					  		jimResponsive.refreshResponsiveComponents(elem,false);
					  		jimPin.refreshPinElement(elem);
				  		}

				 });
				 jimPin.pinAxisChange=false;
			},
			"init":function($page){
		  		jimPin.pinAxisChange=true;
		  		jimPin.lastPositionY=0;
		  		jimPin.lastPositionX=0;
		  		jimPin.scrollDir=undefined;
		  		jimPin.oldScrollDir=undefined;
			 	jimPin.addScrollListeners();
			 },
			"calculateAbsoluteTop": function(target, margin, pinType, position, error) {
				var height = target.jimOuterHeight();
				//bug in chrome?
				if(target.is("table"))
					height = target.height();
				var $scrollable = target.closest(".scrollable");
				var top = margin;
		    	
		    	var containerHeight = 0;
		    	var scrollY=0;
		    	var groupOffsetY=0;
		    	var outMargins = 0,topMargin=0;
		    	var jsPin = $scrollable.length>0;
		    	if(!jsPin){
		    		containerHeight = document.body.clientHeight;
		    		if(position=="absolute")
		    			scrollY = -$(".scrollable-root").scrollTop();
		    		
		    		//groups&masters offset
					groupOffsetY = jimPin.getAllContainersOffset(target.parent()).top;
		    	}
		    	else{
		    		//calculateoffset
		    		containerHeight = $scrollable.height();
		  			scrollY = -$scrollable.scrollTop();
		  			var offset = jimPin.getClosestContainerOffset(target);
		  			if(offset.top!=0){
			  			scrollY = offset.top;
						if(/*window.jimMobile && !jimUtil.isMobileDevice()*/$scrollable.hasClass("ui-page")){
							scrollY = scrollY - $scrollable.scrollTop();
						}
		  			}
		    	}
		    	
		    	if(!jsPin){
		    		if(position=="fixed"){
				    	if(pinType == "end")
				    		outMargins = jimPin.getLayoutMarginBottom();
						else if(pinType == "center"){
							outMargins = jimPin.getLayoutMarginTop() + jimPin.getLayoutMarginBottom();
							topMargin = jimPin.getLayoutMarginTop();
						}
						else if(pinType == "beginning")
							outMargins = jimPin.getLayoutMarginTop();
		    		}
		    		else{
		    			if(pinType == "end" || pinType == "center")
				    		outMargins = jimPin.getLayoutMarginBottom() + jimPin.getLayoutMarginTop();
		    		}
		    	}
		
		    	if(pinType == "end")
		    		top = containerHeight - height - margin - scrollY - outMargins - groupOffsetY;
				else if(pinType == "center")
					top = (containerHeight-outMargins)/2 - height/2 + margin - scrollY + topMargin - groupOffsetY;
				else if(pinType == "beginning")
					top = top + outMargins - scrollY - groupOffsetY;
		    	
		    	return top;
		    },
			"getOriginalWidthOverflowDisplacement": function(){
  				if(window.jimWebDevice.isOriginalWidthSelected()){
  					var bodyWidth = jQuery("#jim-body").width();
  					var webWidth = jQuery("#simulation").width();
  					if(bodyWidth < webWidth){
  						return (webWidth - bodyWidth);
  					}
  				}
  				return 0;
			},
			"calculateAbsoluteLeft": function(target, margin, pinType, position, error) {
				var width = target.jimOuterWidth();
				//bug in chrome?
				if(target.is("table"))
					width = target.width();
				var $scrollable = target.closest(".scrollable");
				var left = margin;
		    	
		    	var containerWidth = 0;
		    	var scrollX=0;
		    	var groupOffsetX=0;
		    	var outMargins = 0;
		    	var jsPin = $scrollable.length>0;
		    	if(!jsPin){
		    		if(window.jimWebDevice.isOriginalWidthSelected()){
	  					//fix overflow displacement
			    		if(pinType == "end")
			    			scrollX = scrollX - jimPin.getOriginalWidthOverflowDisplacement();
			    		else if(pinType == "center")
			    			scrollX = scrollX - (jimPin.getOriginalWidthOverflowDisplacement()/2);
		    		}
		    		containerWidth = document.body.clientWidth-(jimPin.getLayoutMarginLeft()+jimPin.getLayoutMarginRight());
		    		if(position=="absolute"){
		    			scrollX = scrollX -$(".scrollable-root").scrollLeft();
		    			var centerOffset = jimPin.getCenterBoxOffset(target);
			    		if(centerOffset !== undefined)
			    			scrollX = centerOffset - scrollX;
			    		
			    		//groups&masters offset
						groupOffsetX = jimPin.getAllContainersOffset(target.parent()).left;
		    		}
		    		else{
		    			var simulationBoxOffset = jimPin.getLayoutMarginLeft();
		    			scrollX = scrollX - simulationBoxOffset;
		    		}
		    	}
		    	else{
		    		//calculateoffset
		    		containerWidth = $scrollable.width();
		  			scrollX = -$scrollable.scrollLeft();
		  			var offset = jimPin.getClosestContainerOffset(target);
		  			if(offset.left!=0){
			  			scrollX = offset.left;
						if(/*window.jimMobile && !jimUtil.isMobileDevice()*/$scrollable.hasClass("ui-page")){
							scrollX = scrollX - $scrollable.scrollLeft();
						}
		  			}
		    	}
		
		    	if(pinType == "end")
		    		left = containerWidth - width - scrollX - margin - outMargins - groupOffsetX;
				else if(pinType == "center")
					left = (containerWidth-outMargins)/2 - width/2 + margin - scrollX - groupOffsetX;	
				else if(pinType == "beginning")
					left = left - scrollX - groupOffsetX + outMargins;
		    	
		    	return left;
		    },
			"getHorizontalMargin" : function(elem, offsetToAdd, pinType){
				/*return corresponding margin given the offset to add*/
				var margin = elem.data("offsetX");

				if(pinType == "beginning" || pinType == "center")
					margin = margin + offsetToAdd;
				else if(pinType == "end")
					margin = margin - offsetToAdd;
				return margin;	
			},
			"getVerticalMargin" : function(elem, offsetToAdd, pinType){
				/*return corresponding margin given the offset to add*/
				var margin = elem.data("offsetY");

				if(pinType == "beginning" || pinType == "center")
					margin = margin + offsetToAdd;
				else if(pinType == "end")
					margin = margin - offsetToAdd;
				return margin;	
			},
			"calculateHorizontalMargin" : function(elem, fixedLeft, pinType){
				/*return corresponding margin given left fixed position*/
				var margin = fixedLeft;
				var $scrollable = elem.closest(".scrollable");
				var containerWidth=0;
				var outMargins = 0;
				var groupOffsetX = 0;
				var jsPin = jimPin.isJSPin(elem);
		    	if(!jsPin){
		    		containerWidth = document.body.clientWidth;
		    	}
		    	else{
		    		containerWidth = $scrollable.width();
		  			scrollX = -$scrollable.scrollLeft();
		  			//groupOffsetX = jimPin.getAllContainersOffset(elem.parent()).left;
		    	}
		    	
		    	if(!jsPin){
			    	if(pinType == "end")
			    		outMargins = jimPin.getLayoutMarginRight();
					else if(pinType == "center")
						outMargins = jimPin.getLayoutMarginRight()/2;
		    	}
				
				if(pinType == "beginning")
					margin = margin + scrollX + groupOffsetX;
				else if(pinType == "center")
					margin = margin - (containerWidth/2 - elem.jimOuterWidth()/2 - outMargins) + scrollX + groupOffsetX;
				else if(pinType == "end")
					margin = containerWidth - margin - elem.jimOuterWidth() - outMargins - scrollX + groupOffsetX;
				return margin;	
			},
			"calculateVerticalMargin" : function(elem, fixedTop, pinType){
				/*return corresponding margin given top fixed position*/
				var margin = fixedTop;
				var $scrollable = elem.closest(".scrollable");
				var containerHeight = 0;
				var outMargins=0;
				var groupOffsetY = 0;
				var scrollY=0;
				var jsPin = jimPin.isJSPin(elem);
		    	if(!jsPin){
		    		containerHeight = document.body.clientHeight;
		    	}
		    	else{
		    		containerHeight = $scrollable.height();
		    		scrollY = -$scrollable.scrollTop();
		    		//groupOffsetY = jimPin.getContainerOffset(elem.parent()).top;
		    	}
		    	
		    	if(!jsPin){
			    	if(pinType == "beginning")
			    		outMargins = jimPin.getLayoutMarginTop();
					else if(pinType == "center")
						outMargins = jimPin.getLayoutMarginTop()/2;
					else if(pinType == "end")
						outMargins = jimPin.getLayoutMarginBottom();
		    	}
		    	
				if(pinType == "beginning")
					margin = margin - outMargins + scrollY + groupOffsetY;
				else if(pinType == "center")
					margin = margin - (containerHeight/2 - elem.jimOuterHeight()/2 + outMargins) + scrollY + groupOffsetY;
				else if(pinType == "end")
					margin = containerHeight - margin - elem.jimOuterHeight() - outMargins - scrollY + groupOffsetY;
				return margin;	
			},
			"removeHorizontalClass":function(elem,error){
				if(elem.hasClass("hpin-beginning"))
					elem.removeClass("hpin-beginning");
				else if(elem.hasClass("hpin-center"))
					elem.removeClass("hpin-center");
				else if(elem.hasClass("hpin-end"))
					elem.removeClass("hpin-end");
			},
			"removeVerticalClass":function(elem,error){
				if(elem.hasClass("vpin-beginning"))
					elem.removeClass("vpin-beginning");
				else if(elem.hasClass("vpin-center"))
					elem.removeClass("vpin-center");
				else if(elem.hasClass("vpin-end"))
					elem.removeClass("vpin-end");
			},
			"translateFixedToAbsolute":function(elem,top,left,error){
				var fixedPos = {top:top,left:left};
				var $container = jimUtil.getCanvasAlignmentBox(elem);
				var offset = jimPin.getAllContainersOffset(elem.parent());
				
				var containerPosition = $container.offset();
				var absPos = {top:0,left:0};
				absPos.top = fixedPos.top - containerPosition.top - offset.top;
				absPos.left = fixedPos.left - containerPosition.left - offset.left;
				return absPos;
			},
			"translateAbsoluteToFixed":function(elem,top,left,error){
				var absPos = {top:top,left:left};
				var fixedPos = {top:0,left:0};
				var $container = jimUtil.getCanvasAlignmentBox(elem);
				var offset = jimPin.getAllContainersOffset(elem.parent());

				var containerPosition = $container.offset();
				var layerPosition = $container.closest(".pin-transform-layer").offset();
				fixedPos.top = absPos.top + containerPosition.top - layerPosition.top + offset.top;
				fixedPos.left = absPos.left + containerPosition.left - layerPosition.left + offset.left;
				return fixedPos;
			},
			"unpinElement":function(elem,error){
				elem.removeClass("pin");
				jimPin.removeHorizontalClass(elem);
				jimPin.removeVerticalClass(elem);
				jimUtil.resetElemTransform(elem);
				var absPos = elem.position();
				if(!jimPin.isJSPin(elem)){
					absPos.top = absPos.top + parseInt(elem.css("margin-top"),10);
					absPos.left = absPos.left + parseInt(elem.css("margin-left"),10);
					absPos = jimPin.translateFixedToAbsolute(elem,absPos.top,absPos.left);
					
					if (elem.data("widthUnit") == "%")
						elem.css("width", elem.data("width") + "%");
					if (elem.data("heightUnit") == "%")
						elem.css("height", elem.data("height") + "%");
				}
				else{
					var scrollable = jimPin.getClosestContainer(elem);
					absPos.left = absPos.left + scrollable.scrollLeft();
					absPos.top = absPos.top + scrollable.scrollTop();
				}
				elem.css("top",absPos.top);
				elem.css("left",absPos.left);
				elem.css("right","");
				elem.css("bottom","");
				elem.css("position","");
				jimPin.resetMargins(elem);			
			},
			"translateElementFixedToAbsolute" : function(elem){
				if(elem.css("position")=="fixed"){
					var absPos = elem.position();
					absPos.top = absPos.top + parseInt(elem.css("margin-top"),10);
					absPos.left = absPos.left + parseInt(elem.css("margin-left"),10);
					absPos = jimPin.translateFixedToAbsolute(elem,absPos.top,absPos.left);
					
					elem.css("top",absPos.top);
					elem.css("left",absPos.left);
					elem.css("right","");
					elem.css("bottom","");
					elem.css("position","");
					jimPin.resetMargins(elem);
				}
			},
			"translateAllFixedToAbsolute" : function($page){
				var pinnedElements = new Array();
				if($page === undefined){
					$(".pin").each(function(index){
						jimPin.translateElementFixedToAbsolute($(this));
						pinnedElements.push($(this));
					});
				}
				else{
					$page.find(".pin").each(function(index){
						jimPin.translateElementFixedToAbsolute($(this));
						pinnedElements.push($(this));
					});
				}
				return pinnedElements;
			},
			"addHorizontalClass":function(elem,hclass){
				var fullClass = "hpin-"+hclass;
				jimPin.removeHorizontalClass(elem);
				elem.addClass(fullClass);
			},
			"addVerticalClass":function(elem,vclass){
				var fullClass = "vpin-"+vclass;
				jimPin.removeVerticalClass(elem);
				elem.addClass(fullClass);
			},
			"refreshPinnedCenterComponents":function(){
				jimPin.getPinnedCenterToRoot().each(function(index){
			 		if($(this).hasClass("percentage"))
			 			jimPin.refreshPinElement($(this));
				});
			},
			"notifySizeChange":function(elem,deepRefresh,error){
		      	if(elem === undefined || elem.hasClass("ui-page")){
		      		jQuery(".pin-translated").each(function(index){
		      			jimPin.refreshPinElement($(this));
		      			jimPin.resetScrollDirection();
		      		});
		      		if(deepRefresh){
		      			//relocate centered elements with variable (%) size
		      			jimPin.refreshPinnedCenterComponents();
		      			jimPin.refreshAllContainers();
		      		}
		      		jimUtil.refreshPageMinSize();
		      	}
		      	else{
		      		//manually pinned elements
		      		var pintranslated = false;
		      		if(elem.hasClass("panel"))
		      			elem = elem.parent();
		      		if(elem.hasClass("pin") && ((jimPin.getHorizontalPin(elem)==="center" || jimPin.getHorizontalPin(elem)==="end") || (jimPin.getVerticalPin(elem)==="center" || jimPin.getVerticalPin(elem)==="end"))){ /*only resize center and end*/
		      		  if(elem.hasClass("pin-translated"))
		      			pintranslated=true;
		      		  jimPin.refreshPinElement(elem);
		      		  if(pintranslated)
		      		  	jimPin.resetScrollDirection();
		      		}
		      		jimPin.refreshDescendantContainers(elem); 
		      	}
			},
			"resetScrollDirection":function(){
				jimPin.pinAxisChange=true;
//				jimPin.lastPositionY=0;
//				jimPin.lastPositionX=0;
				jimPin.scrollDir=undefined;
				jimPin.oldScrollDir=undefined;
			}
	   };
	function wheelScrollOnFixed(event){
		$(".scrollable-root")[0].scrollTo({top: $(".scrollable-root")[0].scrollTop + event.originalEvent.deltaY});
		event.stopPropagation();
	}	
})(window);
