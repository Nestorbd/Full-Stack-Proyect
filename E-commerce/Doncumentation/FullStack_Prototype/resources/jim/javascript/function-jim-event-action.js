/*!
 * Copyright 2013 Justinmind. All rights reserved.
 */

(function(window, undefined) {
  var $simulation = jQuery("#simulation"), dragZIndex = 3;

  function parseSVG(svg, $target, args){
	  $target = $("#" + $target.attr('id'));
      var id = $target.prop("id");
	    var overlay = $target.attr("overlay");
	    if (args.aspectratio == undefined || !args.aspectratio == "true") svg = svg.replace("<svg", "<svg preserveAspectRatio='none'");
	    svg = svg.replace(/(\.[a-z0-9A-Z\-_]+\s*\{)/g, "#" + id + " " + "$1");

	    if ($target.prop("tagName") == "IMG") {
		  $target.parent().append("<div id='"+ id +"' class='" + $target.prop("class") +
								"' alt='" + $target.prop("alt") + "' style='" +
								$target.attr("style") + "' overlay='"+ ((overlay != undefined) ? overlay : "none") + "'>");
		  $target.remove();
		  $target = $("#"+ id);
	    }

	    $target.html("<div class=\"backgroundLayer\"></div>" + svg);
	    $target.data(data);
	    // $target.attr("systemname", value);

	    if (overlay != undefined && overlay != "none" && overlay != "") jimUtil.changeSVGColor($target, overlay);
  }
  
  jQuery.extend(jimEvent.fn, {
    "jimNavigation": function(args) {
      var historyEntry;
      if(args.isbackward) {
        historyEntry = urlHistory.getPrev() || jimMain.getMainWindow().urlHistory.getActive();
        args.target = historyEntry.url;
        jimMain.navigate(args);
      } else if(args.forward) {
        historyEntry = urlHistory.getNext() || jimMain.getMainWindow().urlHistory.getActive();
        args.target = historyEntry.url;
        jimMain.navigate(args);
      } else if(args.target) {
        jimMain.navigate(args);
      }
      if(args.isscenario && !args.tab){
    	  $("#scenarioTab").trigger("click");
    	  if(jimScenarios.currentNode != -1){
    		  jimScenarios.deleteFilter();
    	  }
      }
    },
    "jimCreateDrag": function(drag, $target, args) {
      var self = this, $drag, $master, position, dragData, dragTargets;

      if($target.jimGetType() === itemType.panel) {
        $target = $target.parent();
      }
      if($target.jimGetType() === itemType.ellipse ||
    		  $target.jimGetType() === itemType.triangle ||
    		  $target.jimGetType() === itemType.callout) {
          $target = $target.closest("svg");
        }
		
	  var isRelative = jimUtil.isRelative($target);
	  var relativeBounds = isRelative ? jimUtil.getRelativeItemBounds($target) : undefined;

      var posType = $target.css("position");
      var posTop = isRelative ? relativeBounds.y : $target.css("top");
      var posLeft = isRelative ? relativeBounds.x : $target.css("left");
      var isContainedInCC = false;

      $master = $target.parents(".master");
      if($master.length !== 0) {
        $target.wrap("<div id='" + $master.attr("id") + "' class='" + $master.attr("class").split(" ")[0] + "' />");
        $target = $target.parent();
        isContainedInCC=true;
      }

      var parent = $target.parent();
      if (parent.hasClass("verticalWrapper")) parent = parent.parent();

      position = $target.jimPosition();
      dragData = {
        "parent": parent,
        "isContained": args.containment,
        "top": position.top,
        "left": position.left,
        "containedInCC" : isContainedInCC,
        "startposition": {
          "type": posType,
          "top": posTop,
          "left": posLeft,
          "index": $target.index()
        }
      };

      var wrapper = $target.closest(".layout.horizontal");
	  var oldParent = $target.parent();
      $target.appendTo($target.parents(".template, .screen"))
             .css({"position": "absolute", "top": dragData.top, "left": dragData.left, "z-index": dragZIndex++})
             .data("jimDrag", dragData);
			 
	  if (oldParent.is(".relativeLayoutWrapperResponsive"))
	    oldParent.parent().remove();
			 
	  if (isRelative)
		jimUtil.moveRelativeItemChilds($target, {x : dragData.left - posLeft, y : dragData.top - posTop});

	  if (wrapper.hasClass(".verticalWrap")) jimUtil.wrapVerticalLayout(wrapper);
	  else if (wrapper.attr("hspacing") != 0 || wrapper.attr("vspacing") != 0) jimUtil.wrapHorizontalLayout(wrapper);

      $drag = jQuery(drag); /* $drag and $target might not be the same (multidrag) */
      dragTargets = jimUtil.exists($drag.data("jimDragTargets")) ? $drag.data("jimDragTargets") : [];
      dragTargets.push($target);
      $drag.data("jimDragTargets", dragTargets);

      return dragData;
    },
    "jimRestoreDrag": function($drag) {
      var dragTargets, $target, dragData, i, iLen;
      dragTargets = $drag.data("jimDragTargets");
      if(dragTargets) {
	    for(i=0, iLen=dragTargets.length; i<iLen; i+=1) {
	      $target = jQuery(dragTargets[i]);
	      dragData = $target.data("jimDrag");
	      if(dragData.isContained) {
			var $parent =  $(dragData.parent).closest(".firer");
			if (!$parent.is(".canvas")) $parent = $parent.find(".layoutWrapper.scrollable, .layout.scrollable").first();
	        jimUtil.insertInto({"target": $target, "parent": $parent});
	      }
	    }
      }
    },
    "jimDestroyDrag": function($drag) {
      var dragTargets, i, iLen;
      dragTargets = $drag.data("jimDragTargets");
      if(dragTargets) {
        for(i=0, iLen=dragTargets.length; i<iLen; i+=1) {
          jQuery(dragTargets[i]).removeData("jimDrag");
        }
        $drag.removeData("jimDragTargets");
      }
    },
    "jimMove": function(args, callback) {
      if(jimUtil.exists(args)) {
        var self = this, $targets, t, tLen, $target, eventData, dragData, position, newTopPosition, newLeftPosition, $parent, containment, $svg, effect, top, left, topPinOffset, leftPinOffset;
        var CCWrapper=true;
        var properties = {};
        $targets = self.getEventTargets(args.target);
        for(t=0, tLen=$targets.length; t<tLen; t+=1) {
          $target = jQuery($targets[t]);
          if($target.length) {
            var topType = args.top.type;
            var leftType = args.left.type;

            //exception for drag and drop (find another way)
            $master = $target.parents(".master");
            if($master.length !== 0 && (topType=="movewithcursor" || leftType=="movewithcursor")) {
              $target = $master;
            }
            $parent = $target.parent();

            eventData = self.event.data;
            effect = jimUtil.createAnimationOptions(args.effect, callback);

            if(topType=="movewithcursor" || leftType=="movewithcursor") {
              dragData = $target.data("jimDrag");
	          if(!jimUtil.exists(dragData)) {
	            dragData = self.jimCreateDrag(eventData.target, $target, args);
	          }
	          if (args.containment)
	            $parent = dragData.parent;
            }
            if(topType=="movetodragstart" || leftType=="movetodragstart") {
          	  dragData = $target.data("jimDrag");
              if(jimUtil.exists(dragData)) {
                if(dragData.containedInCC && CCWrapper) {
            	  /*destroy wrapper*/
            	  $target = $target.children();
            	  $target.unwrap();
            	  /*get target again with a different selector*/
            	  $target = self.getEventTarget(args.target);
            	  $parent = $target.parent();
            	  CCWrapper=false;
                }

                jQuery.extend(properties, {"index": dragData.startposition.index});
                jQuery.extend(properties, {"type": dragData.startposition.type});
                jimUtil.insertInto({"target": $target, "parent": dragData.parent, "position":properties, "checkIntersect":false});
              }
            }

            var leftPinned = leftType.indexOf("pin")>=0;
            var topPinned = topType.indexOf("pin")>=0;
            var currentLeftPinned = jimPin.getHorizontalPin($target)!=="none";
            var currentTopPinned = jimPin.getVerticalPin($target)!=="none";
            var currentPinned = currentTopPinned || currentLeftPinned;
            if(topType == "nomove" && currentTopPinned)
            	topPinned = true;
            if(leftType == "nomove" && currentLeftPinned)
            	leftPinned = true;
            var pinned = topPinned || leftPinned;

            if(currentPinned && $target.hasClass("pin-translated")){
            	//return to fixed
            	jimPin.refreshPinElement($target);
            }

            position = $target.position();
            position.top = position.top + parseInt($target.css("margin-top"),10);
            position.left = position.left + parseInt($target.css("margin-left"),10);
			
			var relativeBounds = {};
			if ($target.is('.masterinstance, .group')) {
				relativeBounds = jimUtil.getRelativeItemBounds($target);
				position.left = relativeBounds.x;
				position.top = relativeBounds.y;
			}

            if(!currentPinned && pinned && !jimPin.isJSPin($target) && args.effect){
	            //not pinned element going to be pinned
	            //pin in origin to animate
		    	var transPos = jimPin.translateAbsoluteToFixed($target,position.top,position.left);
		    	transPos.top = transPos.top - jimPin.getLayoutMarginTop();
		    	transPos.left = transPos.left - jimPin.getLayoutMarginLeft();
		    	jimPin.addHorizontalClass($target,"beginning");
		    	jimPin.addVerticalClass($target,"beginning");
		    	jimPin.pinElement($target,transPos.left,transPos.top);
		    	position = transPos;
            }

            /*position TOP*/
            switch(topType) {
	          case "movewithcursor":
		        position = {
		     	  "top": dragData.top
		        };
		        if(dragData.insertInto){
		    	  position.top -= dragData.insertInto.jimPosition().top;
		        }
	            newTopPosition = position.top + (eventData.deltaY*(1/jimUtil.getTotalScale()));
	            break;
	          case "movetodragstart":
	            newTopPosition = dragData.startposition.top;
	            break;
	          case "movebyoffset":
	            position.top += $target.parent().scrollTop();
	            position.top = position.top *(1/jimUtil.getTotalScale());

			    newTopPosition = position.top + parseInt(self.evaluateExpression(args.top.value),10);
	            break;
	          case "movetoposition":
	          case "exprvalue":
	            newTopPosition = parseInt(self.evaluateExpression(args.top.value),10);
	            break;
	          case "pinbeginning":
	          case "pincenter":
	          case "pinend":
	            newTopPosition = parseInt(self.evaluateExpression(args.top.value),10);
	            topPinOffset = newTopPosition;

	            //calculate position for animation
            	var topPinClass = topType.substring(3);
            	newTopPosition = jimPin.calculateAbsoluteTop($target,newTopPosition,topPinClass,"fixed");
            	jimPin.addVerticalClass($target,topPinClass);

	        	break;
	          case "nomove":
	        	break;
            }
						
            if(jimUtil.exists(newTopPosition) && !isNaN(parseInt(newTopPosition, 10))) {
	          if (args.containment) {
	            var parentPositionTop = 0;
	            /*move with cursor*/
	            if($parent.get(0) !== $target.parent().get(0))
	        	  parentPositionTop = $parent.jimPosition().top;
	            containment = {
	              "top": parentPositionTop + parseInt($parent.css("border-top-width"),10) + parseInt($parent.css("padding-top"),10),
	              "bottom": parentPositionTop + $parent.innerHeight() - $target.jimOuterHeight() + parseInt($parent.css("border-top-width"),10),
	            };
	            newTopPosition = Math.min(containment.bottom, Math.max(containment.top, newTopPosition));
	          }

	          //pin conversions
	          if(!topPinned && (currentPinned || pinned)){
	          		if(topType == "movebyoffset"){
	          			if(!currentTopPinned){
	          				topPinOffset = jimPin.translateFixedToAbsolute($target,newTopPosition,0).top;
	          			}
	          			else{
	          				//calculate corresponding pin margin
	          				topPinOffset = jimPin.getVerticalMargin($target, parseInt(self.evaluateExpression(args.top.value),10), jimPin.getVerticalPin($target));
	          				pinned=true;
	          				topPinned=true;
	          			}
	          		}
	          		else if(topType == "movetoposition" || topType == "exprvalue"){
		          		topPinOffset = newTopPosition;
		          		if(!jimPin.isJSPin($target))
		          			newTopPosition = jimPin.translateAbsoluteToFixed($target,newTopPosition,0).top;
	          		}
	          	}
		        if((pinned || currentPinned) && topType !== "nomove"){
		        	jQuery.extend(properties, {"margin-top": 0,"margin-bottom":0});
		        }
		        if(!topPinned){
	            	jimPin.removeVerticalClass($target);
	            }

	          jQuery.extend(properties, {"top": newTopPosition});
            }
            else{
            	if(!currentPinned)
            		jimPin.removeVerticalClass($target);
            }

            /*position LEFT*/
            switch(leftType) {
	          case "movewithcursor":
	            position = {
	              "left": dragData.left
	            };
		        if(dragData.insertInto){
		    	  position.left -= dragData.insertInto.jimPosition().left;
		        }
	            newLeftPosition = position.left + (eventData.deltaX*(1/jimUtil.getTotalScale()));
	            break;
	          case "movetodragstart":
	            newLeftPosition = dragData.startposition.left;
	            break;
	          case "movebyoffset":
			    position.left += $target.parent().scrollLeft();
			    position.left = position.left *(1/jimUtil.getTotalScale());

			    newLeftPosition = position.left + parseInt(self.evaluateExpression(args.left.value),10);
	            break;
	          case "movetoposition":
	          case "exprvalue":
	            newLeftPosition = parseInt(self.evaluateExpression(args.left.value), 10);
	            break;
	          case "pinbeginning":
	          case "pincenter":
	          case "pinend":
	          	newLeftPosition = parseInt(self.evaluateExpression(args.left.value), 10);
	            leftPinOffset = newLeftPosition;

            	var leftPinClass = leftType.substring(3);
            	newLeftPosition = jimPin.calculateAbsoluteLeft($target,newLeftPosition,leftPinClass,"fixed");
            	jimPin.addHorizontalClass($target,leftPinClass);

	        	break;
	          case "nomove":
	        	break;
            }

            if(jimUtil.exists(newLeftPosition) && !isNaN(parseInt(newLeftPosition, 10))) {
	          if (args.containment) {
	            var parentPositionLeft = 0;
	            /*move with cursor*/
	            if($parent.get(0) !== $target.parent().get(0))
	        	  parentPositionLeft = $parent.jimPosition().left;
	            containment = {
	              "left": parentPositionLeft + parseInt($parent.css("border-left-width"),10) + parseInt($parent.css("padding-left"),10),
		          "right": parentPositionLeft + $parent.innerWidth() - $target.jimOuterWidth() + parseInt($parent.css("border-left-width"),10)
	            };
	            newLeftPosition = Math.min(containment.right, Math.max(containment.left, newLeftPosition));
	          }

	          if(!leftPinned && (currentPinned || pinned)){
	          		if(leftType == "movebyoffset"){
	          			if(!currentLeftPinned)
	          				leftPinOffset = jimPin.translateFixedToAbsolute($target,0,newLeftPosition).left;
	          			else{
	    	            	//calculate corresponding pin margin
	    	            	leftPinOffset = jimPin.getHorizontalMargin($target, parseInt(self.evaluateExpression(args.left.value),10), jimPin.getHorizontalPin($target));
	    			    	pinned=true;
	    			    	leftPinned=true;
	          			}
	          		}
	          		else if(leftType == "movetoposition" || leftType == "exprvalue"){
		          		leftPinOffset = newLeftPosition;
		          		if(!jimPin.isJSPin($target))
		          			newLeftPosition = jimPin.translateAbsoluteToFixed($target,0,newLeftPosition).left;
	          		}
	          	}
	            if((pinned || currentPinned) && leftType !== "nomove"){
		        	jQuery.extend(properties, {"margin-right":0,"margin-left":0});
		        }
	            if(!leftPinned){
	            	jimPin.removeHorizontalClass($target);
	            }

	          jQuery.extend(properties, {"left": newLeftPosition});
	        }
            else{
            	if(!currentPinned)
            		jimPin.removeHorizontalClass($target);
            }
			
	        if(args.effect){
	        	effect.complete = function(){
	        			if(pinned){
			 	       	   jimPin.pinElement($target,leftPinOffset,topPinOffset);
			 	       	   jimPin.resetScrollDirection();
	        			}
	        			else if(currentPinned){
				 	    	jimPin.unpinElement($target);
	        			}

		 			    jimUtil.calculateMinSize($target);
		 			    jimUtil.refreshPageMinSizeWithTarget($target);
						jimUtil.refreshEventResponsiveLayoutItem($target);

		 	    	   callback();
		 	       }
	        	if($target.hasClass("group") || $target.hasClass("masterinstance")){
	        		effect.progress = function(){
	        			jimPin.refreshGroup($target);
	        			jimPin.resetScrollDirection();
	        		}
	        	}
	        }

	        //apply pin
	        if(leftPinOffset!==undefined){
	        	$target.data("offsetX",leftPinOffset);
	        	$target.removeData("originPinRightOffset");
	        }
	        else if(properties.left!==undefined){
	        	$target.data("offsetX",properties.left);
	        	$target.removeData("originPinRightOffset");
	        }

	        leftPinOffset = $target.data('offsetX');

	        if(topPinOffset!==undefined){
	        	$target.data("offsetY",topPinOffset);
	        	$target.removeData("originPinTopOffset");
	        }
	        else if(properties.top!==undefined){
	        	$target.data("offsetY",properties.top);
	        	$target.removeData("originPinTopOffset");
	        }

	        topPinOffset = $target.data('offsetY');

	        if(args.effect)
			  if ($target.is(".masterinstance, .group")) {
				var offset = {x : newLeftPosition - relativeBounds.x, y : newTopPosition - relativeBounds.y};
				offset.x = isNaN(offset.x) ? 0 : offset.x;
				offset.y = isNaN(offset.y) ? 0 : offset.y;
				jimUtil.moveRelativeItemChilds($target, offset, effect);
			  } else 
			    $target.animate(properties, effect);
		    else {
			  if ($target.is(".masterinstance, .group")) {
				var offset = {x : newLeftPosition - relativeBounds.x, y : newTopPosition - relativeBounds.y};
				offset.x = isNaN(offset.x) ? 0 : offset.x;
				offset.y = isNaN(offset.y) ? 0 : offset.y;
				jimUtil.moveRelativeItemChilds($target, offset);
			  } else 
			    $target.css(properties);
			}

	        if(!args.effect && !jQuery.isEmptyObject(properties)){
	        	if(pinned){
					jimPin.pinElement($target,leftPinOffset,topPinOffset);
	        	}
	        	else if(currentPinned)
	        		jimPin.unpinElement($target);
	        	else{
		        	if($target.hasClass("group") || $target.hasClass("masterinstance")){
		        		jimPin.refreshGroup($target);
	        		}
	        	}
	        	jimPin.resetScrollDirection();
	        }

		    if(topType=="movewithcursor" || leftType=="movewithcursor")
		      self.triggerDragOver($target);

		    var vWrap = $target.closest(".layout.horizontal");
		    if(vWrap.length > 0 && (topType=="movetodragstart" || leftType=="movetodragstart")) {
			  $target.css({"position": "", "top": "", "left": "", "display" : ""});
			  jimUtil.wrapLayout($target);
		    }

		    if(!args.effect){
			    jimUtil.calculateMinSize($target);
				jimUtil.refreshEventResponsiveLayoutItem($target);
			    jimUtil.refreshPageMinSizeWithTarget($target);
		    }
		  }
		}
		if(callback && !args.effect) { callback(); }
	  }
    },
    "jimInsert": function(args, callback) {
      if(jimUtil.exists(args) && jimUtil.exists(args.target)) {
        var self = this, $target, $parent, dragData, t, $targets, tLen;
        $targets = self.getEventTargets(args.target);
        for(t=0, tLen=$targets.length; t<tLen; t+=1) {
          $target = jQuery($targets[t]);
          $parent = self.getEventTarget(args.parent);
		  
          if($parent.hasClass("screen"))
        	  $parent = $parent.find("#alignmentBox:first");

          if ($parent.length > 1) {
        	  var dataParent = $target.parent().closest(".datarow, .gridcell");
        	  if (dataParent.length) {
        	  	var trueParent = null;
        	  	for (var p = 0; p < $parent.length; p += 1) {
        	  	  var parentParent = $($parent.get(p)).parent().closest(".datarow, .gridcell");
        	  	  if (parentParent.attr("id") == dataParent.attr("id"))
        	  		trueParent = $($parent.get(p));
        	  	}
        	  	if (trueParent != null)
        	  	  $parent = trueParent;
        	  }
          }

          if($parent.hasClass("panel"))
        	  $parent = $parent.find(".layoutWrapper:first");
          dragData = $target.data("jimDrag");
          if(dragData && (!dragData.insertInto || dragData.insertInto.get(0) != $parent.get(0))){
	        dragData.insertInto = $parent;
          }

         if($parent.hasClass("scrollable")){
	          jimPin.translateAllFixedToAbsolute($target);
          }

          if(jimUtil.exists($target) && jimUtil.exists($parent)) {
            switch(self.event.type) {
              case "dragend":
                jimUtil.insertInto({"target": $target, "parent": $parent, "event": self.event});
                break;
              default:
                jimUtil.insertInto({"target": $target, "parent": $parent});
                break;
            }
          }
          var vWrap = $target.closest(".layout.horizontal");
          if (vWrap.length > 0) {
            if (dragData && vWrap.hasClass("verticalWrap")) $target.css({"position": "", "top": "", "left": "", "display" : ""});
              jimUtil.wrapLayout($target);
          }


          if($target.hasClass("pin"))
          	jimPin.refreshPinElement($target);
          else if($target.hasClass("group") || $target.hasClass("masterinstance")) {
			jimUtil.insertRelativeItemIntoLayout($parent, $target, jimUtil.getRelativeItemBounds($target));
	      }

	      if($parent.attr('id') == "alignmentBox"){
	    	  jimPin.resetScrollDirection();
	      }

          jimResponsive.refreshResponsiveComponents($target);
          jimUtil.refreshPageMinSizeWithTarget($target);
        }
        if(callback) { callback(); }
      }
    },
    "jimShow": function(args, callback) {
      var self = this, t, $targets, tLen, options;
      if(jimUtil.exists(args) && jimUtil.exists(args.target)) {
      	$targets = self.getEventTargets(args.target);
        for(t=0, tLen=$targets.length; t<tLen; t+=1) {
    	  /*exception: groups have no z-index*/
    	  var $target = jQuery($targets[t]);
    	  /*if panel is target and already visible, transitions won't work as promises don't fire back.*/
    	  var samePanel = false;
		  switch($target.jimGetType()) {
            case itemType.panel:
			  var activePanel = $target.parent().find(":visible");
			  if($(activePanel).is($target)) {
			    samePanel = true;
			    if(callback) { callback(); }
			  }
			  break;
		  }

		  if(!samePanel) {
    	    if($target.hasClass("group")) {
    		  $target.css("z-index","2");
            }
            switch($target.jimGetType()) {
              case itemType.panel:
                $target.trigger("panelactive");
                break;
            }
			
			if (jimUtil.isRelative($target) && $target.parent().is(".relativeLayoutWrapperResponsive")) {
				$target.parent().parent().removeClass("hidden");
				$target.parent().parent().show();
			}

            if(args.effect){
            	if(t==tLen-1)
                	options = jimUtil.createUIEffectOptions(args.effect,callback);
                else
                	options = jimUtil.createUIEffectOptions(args.effect);

            	var isHidden = $target.hasClass("hidden"); // Fix for show animations on horizontal layouts
            	$target.removeClass("hidden");

            	$target.show();
	            jimUtil.calculateMinSize($target);
				jimUtil.refreshEventResponsiveLayoutItem($target);
	            var pinnedElements = jimPin.translateAllFixedToAbsolute($target);
				var isWrapped = $target.closest(".ui-effects-wrapper").length != 0;
				
				if (!isWrapped)
	              $target.hide();
	            if(pinnedElements.length>0)
	          	  jimPin.resetScrollDirection();

				if (!isWrapped)
	              $target.hide().show(options);
			    else
				  $target.show(options);
            }
            else{
				if(!args.transition)
					$target.removeClass("hidden");
				
            	jimUtil.show($target, args).done(function() {
            		if($target.hasClass("group")){
            			$target.css("z-index","");
            		}
            		jimUtil.refreshPageMinSizeWithTarget($target);
					jimUtil.refreshEventResponsiveLayoutItem($target);
					
					if (callback && args.transition)
						callback();
            	});
            	jimUtil.wrapLayout($target, $target);
            }
		  }
        }
        if(callback && !args.effect && !args.transition) { callback(); }
      }
    },
    "jimHide": function(args, callback) {
      if(jimUtil.exists(args) && jimUtil.exists(args.target)) {
        var self = this, $targets, $target, t, tLen, $tree, options;

        $targets = self.getEventTargets(args.target);
        if(jimUtil.exists($targets)) {
          for(t=0, tLen=$targets.length; t<tLen; t+=1) {
            $target = jQuery($targets[t]);

            if($target.jimGetType() === itemType.panel) {
              break;
            }
            if(args.effect) {
              /* TODO: add .stop() to interrupt animation */
               if(t==tLen-1)
            	options = jimUtil.createUIEffectOptions(args.effect,callback);
               else
            	options = jimUtil.createUIEffectOptions(args.effect);

              var layoutComplete = function () {
				  jimUtil.wrapLayout($target);
				  if (jimUtil.isRelative($target) && $target.parent().is(".relativeLayoutWrapperResponsive"))
					$target.parent().parent().hide();
			  };
              if (!options.hasOwnProperty("complete")) jQuery.extend(options, {"complete": layoutComplete});
              else setTimeout(layoutComplete, options["duration"] + 100);

              jimUtil.calculateMinSize($target);
              var pinnedElements = jimPin.translateAllFixedToAbsolute($target);
              if(pinnedElements.length>0)
            	  jimPin.resetScrollDirection();		  

              $target.show().hide(options);
            } else {
			  if (jimUtil.isRelative($target) && $target.parent().is(".relativeLayoutWrapperResponsive"))
				  $target.parent().parent().hide();
              $target.hide();
            }
            /* start special component behavior */
            jQuery($target + "-submenu").hide();
            $tree = ($target.hasClass("tree")) ? $target : $target.parents(".tree");
            if($tree.length) {
              jQuery.fn.jimTree.update($tree);
            }
            /* end special component behavior */
          }
        }

        jimUtil.refreshPageMinSizeWithTarget($target);
		jimUtil.refreshEventResponsiveLayoutItem($target);
        if (!args.effect) jimUtil.wrapLayout($target);
        if(callback && !args.effect) { callback(); }
      }
    },
    "jimChangeStyle": function(args, callback) {
      if(args) {
        var self = this, s, sLen, style, target, $target, expression, bShape, shapeStyle, calculatedValue;
        for(s=0, sLen=args.length; s<sLen; s+=1) {
          style = args[s];
          shapeStyle = args[s];
          for(target in style) {
            if(style.hasOwnProperty(target)) {
              $target = self.getEventTarget(target);
              if($target) {
            	bShape=false;
                if($target.jimGetType() === itemType.shapewrapper) {
                  if(target.startsWith("#shapewrapper")) {
                  	bShape=true;
                  } else {
                  	$target = jQuery(target);
                  }
                }
                if(typeof shapeStyle[target].attributes == 'undefined') {
                  shapeStyle[target].attributes = {};
                }
                if(typeof shapeStyle[target].expressions == 'undefined') {
                  shapeStyle[target].expressions = {};
                }

                if(style[target].attributes) {
                  var borderColorsChanged = [];
                  var borderStylesChanged;
                  for(attribute in style[target].attributes) {
                    if(style[target].attributes.hasOwnProperty(attribute)) {
                      calculatedValue = style[target].attributes[attribute];
                      if(attribute==="width" || attribute==="height" || attribute==="stroke-dasharray") {
                        calculatedValue = (isNaN(parseInt(style[target].attributes[attribute], 10))) ? eval(style[target].attributes[attribute]) : style[target].attributes[attribute];
                      }
                      shapeStyle[target].attributes[attribute] = calculatedValue;
                      try {
                    	var i=attribute.indexOf('#');
                    	var cssAttrName=attribute;
                    	if(i!=-1) {
                    	  cssAttrName=attribute.substring(0,i);
                    	}

                    	if($target.closest(".firer").is(".datagrid") && (cssAttrName==="padding-left" || cssAttrName==="padding-top") && target.endsWith("> table")) {
                    	  var $datagrid = $target.closest(".firer");
                    	  $target.css(cssAttrName, calculatedValue);

                    	  if(cssAttrName==="padding-left"){
                    		  $datagrid.attr("hSpacing", calculatedValue);
                    	  }
                    	  if(cssAttrName==="padding-top"){
                    		  $datagrid.attr("vSpacing", calculatedValue);
                    	  }
                    	  $datagrid.dataview("updateDataGridBounds");
                    	} else {
	                      var domObject=$target.get(0);
	                      if(domObject.css2svg && domObject.css2svg[attribute]) {
	                        domObject.css2svg[attribute]=calculatedValue;
	                      } else {
	                    	if (cssAttrName == "overlay") {
	                    	  if (calculatedValue != "none" && calculatedValue != "")
	                    	    jimUtil.changeSVGColor($target, calculatedValue);
	                    	  else jimUtil.removeSVGColor($target);
	                    	}
	                    	else {
	                    	  var oldBackgroundImage = $target.css("background-image");
	                      	  $target.css(cssAttrName, calculatedValue);
	                      	  if(cssAttrName==="background-color" || cssAttrName==="background-image") {
                    	  		jimUtil.fixBackgroundImageAttr($target, cssAttrName, oldBackgroundImage);
                    	  	  }
                              if (cssAttrName.indexOf("border") !== -1){
                               if(cssAttrName.indexOf("color") !== -1)
                                 borderColorsChanged.push(cssAttrName);
                               else if(cssAttrName.indexOf("style") !== -1)
                                 borderStylesChanged =true;
							  }
                    	  	}
	                      }
                    	}
                      } catch (error) {
                        jimUtil.debug(error);
                      }
                    }
                  } 

                  if(borderColorsChanged && !borderStylesChanged)
                    jimUtil.borderColorsChanged($target,borderColorsChanged);

                  
                  if($target.is(".borderLayer") && ($target.closest(".firer").is(".table") || $target.closest(".firer").is(".datalist") || $target.closest(".firer").is(".datagrid")))
                	jimUtil.resizeTable($target.closest(".firer"));
                  

                  // if (isBorderChangeStyle && $target.hasClass("borderLayer") || $target.parent().hasClass('image')))
                  //	jimUtil.doBorderUpdate($target);
                  // if (isPaddingChangeStyle && isContentLayer)
                  //	jimUtil.doPaddingUpdate($target);
                  // if (isMarginChangeStyle)
                  //	jimUtil.doMarginUpdate($target);
                  /*if (isBorderChangeStyle && ($target.hasClass("textcell") || $target.hasClass("cellcontainer"))) {
                	var $table = $target.closest("table");

                	var newWidth = parseInt($table.css("width")) + parseInt($table.css("margin-left")) + parseInt($table.css("margin-right"));
                	var newHeight = parseInt($table.css("height")) + parseInt($table.css("margin-top")) + parseInt($table.css("margin-bottom"));

                	if ($table.parent().data("widthUnit") !== '%')
                	  $table.parent().css("width", newWidth);
                	if ($table.parent().data("heightUnit") !== '%')
                	  $table.parent().css("height", newHeight)
                  }*/

                  if (style[target].hasOwnProperty("html")) {
                	$target.closest("div").html(style[target]["html"]);
                  }

                }
                try {
                  for(expression in style[target].expressions) {
                    if(style[target].expressions.hasOwnProperty(expression)) {
                      try {
                        calculatedValue = (isNaN(parseInt(style[target].expressions[expression], 10))) ? eval(style[target].expressions[expression]) : style[target].expressions[expression];
                        $target.css(expression, calculatedValue);
                        shapeStyle[target].attributes[expression] = calculatedValue;
                      } catch (error) {
                        jimUtil.debug(error);
                      }
                    }
                  }
                } catch(e) {
                  jimUtil.debug(e); /* IE has problems with gradient expression, expects "url" attribute */
                }
                if(jQuery.browser.msie) {
                  if(style[target]["attributes-ie"]) {
            	    for(attribute in style[target]["attributes-ie"]) {
                      if(style[target]["attributes-ie"].hasOwnProperty(attribute)) {
                        shapeStyle[target].attributes[attribute] = style[target]["attributes-ie"][attribute];
                        try {
                          var domObject=$target.get(0);
                          if(domObject.css2svg && domObject.css2svg[attribute]){
                        	  domObject.css2svg[attribute]=style[target]["attributes-ie"][attribute];
                          } else {
                        	  $target.css(attribute, style[target]["attributes-ie"][attribute]);
                          }
                          //TODO: sólo pie-background y bordes redondeados
                          if(window.PIE) {
                            $target.each(function() {
                              var reattachPIE = true;

                              if($.browser.msie && $.browser.version == 9) {
    							var backgroundColor = args[0][target]["attributes"]["background-color"],
    								hasBorderRadius = parseInt($target.css("border-top-left-radius"))>0 || parseInt($target.css("border-top-right-radius"))>0 || parseInt($target.css("border-bottom-left-radius"))>0 || parseInt($target.css("border-bottom-right-radius"))>0;
    								pieBackground = style[target]["attributes-ie"]["-pie-background"];

    							if(backgroundColor!==undefined) {
    							  var argColor = jimUtil.rgbToHex(backgroundColor);
    							  if((pieBackground.toLowerCase() === argColor.toLowerCase() || pieBackground.toLowerCase() === backgroundColor.toLowerCase()) && !hasBorderRadius) {
    								reattachPIE=false;
    								PIE.detach();
    							  }
    							}
							  }
							  if(reattachPIE && !$target.hasClass("shape")) {
								PIE.detach(this);
								PIE.attach(this);
							  }
                            });
                          }
                        } catch (error) {
                          jimUtil.debug(error);
                        }
                      }
                    }
                  }
                  try {
                    for(expression in style[target]["expressions-ie"]) {
                      if(style[target]["expressions-ie"].hasOwnProperty(expression)) {
                        calculatedValue = (isNaN(parseInt(style[target]["expressions-ie"][expression], 10))) ? eval(style[target]["expressions-ie"][expression]) : style[target]["expressions-ie"][expression];
                        $target.css(expression, calculatedValue);
                        shapeStyle[target].attributes[expression] = calculatedValue;
                      }
                    }
                  } catch (e) {
                    jimUtil.debug(e);
                  }

                  if(jQuery.browser.version<=8) {
                    if(style[target]["attributes-ie8lte"]) {
                      for(attribute in style[target]["attributes-ie8lte"]) {
                        if(style[target]["attributes-ie8lte"].hasOwnProperty(attribute)) {
                          shapeStyle[target].attributes[attribute] = style[target]["attributes-ie8lte"][attribute];
                          $target.css(attribute, style[target]["attributes-ie8lte"][attribute]);
                        }
                      }
                    }
                    try {
                      for(expression in style[target]["expressions-ie8lte"]) {
                        if(style[target]["expressions-ie8lte"].hasOwnProperty(expression)) {
                          calculatedValue = (isNaN(parseInt(style[target]["expressions-ie8lte"][expression], 10))) ? eval(style[target]["expressions-ie8lte"][expression]) : style[target]["expressions-ie8lte"][expression];
                          $target.css(expression, calculatedValue);
                          shapeStyle[target].attributes[expression] = calculatedValue;
                        }
                      }
                    } catch (e) {
                      jimUtil.debug(e);
                    }
                  }
                }
                if($target.is(".datagrid")) {
                  $target.dataview("updateDataGridBounds");
                }
                jimUtil.forceReflow();
                if(bShape || $target.closest(".shapewrapper").length > 0) {
                  if(!bShape)
                  	$target = $target.closest(".shapewrapper").find(".shape");
                  $target.each(function() {
                	var shapeSVG = this;
                	var styles = shapeStyle[target];
                    if($(this).jimGetType() === itemType.shapewrapper) {
                      shapeSVG = $(this).find(".shape")[0];
                      styles = {"attributes" : {}, "expressions" : {}};
                    }
                	jimShapes.updateStyle(shapeSVG, styles);
                  });
                }
              }
            }
          }
        }
        if(callback) { callback(); }
      }
    },
    "jimEnable": function(args, callback) {
      if(jimUtil.exists(args) && jimUtil.exists(args.target)) {
        var self = this, $targets, $target, $icon;
        $targets = self.getEventTargets(args.target);
        if(jimUtil.exists($targets) && $targets.length) {
          for (var i = 0; i < $targets.length; ++i) {
            $target = jQuery($targets[i]);
            switch($target.jimGetType()) {
              case itemType.text:
              case itemType.password:
                $target.find("input").removeAttr("readonly");
                break;
              case itemType.file:
                $target.find(".icon").removeAttr("readonly").next("input[type='file']").removeAttr("disabled").removeClass("hidden");
                break;
              case itemType.textarea:
                  $target.find("textarea").removeAttr("readonly");
                  break;
              case itemType.date:
              case itemType.time:
              case itemType.datetime:
            	$target.find("input").removeAttr("readonly");
                $target.find(".icon").removeAttr("readonly");
                if(!jimDevice.isMobile() || (jimDevice.isMobile() && !jimDevice.isIOS())) {
           	     $target.find("input").each(function(){
           	    	 var $date = jQuery(this);
           	          $.datepicker._enableDatepicker($date[0]);
           	          $date.removeAttr("disabled");
           	     });
                }
                break;
              case itemType.radiobuttonlist:
              case itemType.checkboxlist:
                if(jimEvent.isInDataDataRow($target)) {
                  $target.find("tr.disabled").hide().end().find("tr.enabled").show().find("input").removeAttr("disabled");
                } else {
                  $target.removeAttr("readonly").find("input").removeAttr("disabled");
                }
                break;
              case itemType.checkbox:
              case itemType.radiobutton:
                $target.find("input").removeAttr("disabled");
                break;
              case itemType.dropdown:
              case itemType.nativedropdown:
                $target.removeAttr("readonly");
                $target.find("select").removeAttr("disabled");
                break;
              case itemType.selectionlist:
              case itemType.multiselectionlist:
                $target.removeAttr("readonly");
                if(jimEvent.isInDataDataRow($target)) {
                  $target.find("td.disabled").hide().prev("td.enabled").show();
                }
                break;
              default:
                $target.removeAttr("readonly");
                break;
            }
          }

          if(callback) { callback(); }
        }
      }
    },
    "jimDisable": function(args, callback) {
      if(jimUtil.exists(args) && jimUtil.exists(args.target)) {
        var self = this, $targets, $target, $icon;
        $targets = self.getEventTargets(args.target);
        if(jimUtil.exists($targets) && $targets.length) {
          for (var i = 0; i < $targets.length; ++i) {
            $target = jQuery($targets[i]);
            switch($target.jimGetType()) {
              case itemType.text:
              case itemType.password:
                $target.find("input").attr("readonly", "readonly");
                break;
              case itemType.file:
                $target.find(".icon").attr("readonly", "readonly").next("input[type='file']").attr("disabled", "disabled").removeClass("hidden").addClass("hidden");
                break;
              case itemType.textarea:
                  $target.find("textarea").attr("readonly", "readonly");
                  break;
              case itemType.date:
              case itemType.time:
              case itemType.datetime:
            	$target.find("input").attr("readonly", "readonly");
                $target.find(".icon").attr("readonly", "readonly");
                if(!jimDevice.isMobile() || (jimDevice.isMobile() && !jimDevice.isIOS())) {
              	     $target.find("input").each(function(){
              	    	 var $date = jQuery(this);
              	          $.datepicker._disableDatepicker($date[0]);
              	     });
                }
                break;
              case itemType.radiobuttonlist:
              case itemType.checkboxlist:
                if(jimEvent.isInDataDataRow($target)) {
                  $target.find("tr.disabled").show().end().find("tr.enabled").hide().find("input").attr("disabled", "disabled");
                } else {
                  $target.attr("readonly", "readonly").find("input").attr("disabled", "disabled");
                }
                break;
              case itemType.checkbox:
              case itemType.radiobutton:
                $target.find("input").attr("disabled", "disabled");
                break;
              case itemType.dropdown:
              case itemType.nativedropdown:
                $target.attr("readonly", "readonly");
                $target.find("select").attr("disabled", "disabled");
                break;
              case itemType.selectionlist:
              case itemType.multiselectionlist:
                $target.attr("readonly", "readonly");
                if(jimEvent.isInDataDataRow($target)) {
                  $target.find("td.disabled").show().prev("td.enabled").hide();
                }
                break;
              default:
                $target.attr("readonly", "readonly");
              break;
            }
          }

          if(callback) { callback(); }
        }
      }
    },
    "jimFocusOn": function(args, callback) {
    	 var self = this;
         if(args && args.target) {
           jimUtil.jimFocusOn(self.getEventTarget(args.target[0]));
           if(callback) { callback(); }
         }
    },
    "jimScrollTo": function(args, callback) {
        var self = this, settings = {};
        if(args && args.target) {
          if(args.effect) {
        	jQuery.extend(settings, {"effect": jimUtil.createAnimationOptions(args.effect, callback)});
          }
          if(args.axis){
        	jQuery.extend(settings, {"scroll": args.axis});
          }
          jimUtil.jimPointTo(self.getEventTarget(args.target[0]), settings);
          if(callback && !args.effect) { callback(); }
        }
      },
    "jimSetValue": function(args, instance, callback) {
      if(jimUtil.exists(args)) {
        var self = this, $targets, $target, type, i, iLen, value, $options = [];
		var bShape =false;
        value = self.evaluateExpression(args.value, instance);
        if(jimUtil.exists(value)) {
          if(args.variable) {
        	 $targets = self.getEventTargets(args.variable);
             if($targets) {
                for(i=0, iLen = $targets.length; i < iLen; i += 1) {
                  var triggerVariableChange = jimData.get($targets[i]) != value;
                  jimData.set($targets[i], value);
                  if(triggerVariableChange)
                  	jQuery("html").trigger("variablechange", [{"variableTarget": $targets[i]}]);
                }
             }
          } else if(args.target) {
            $targets = self.getEventTargets(args.target);
            if($targets) {
              for(i=0, iLen = $targets.length; i < iLen; i += 1) {
                $target = jQuery($targets[i]);
                bShape=false;
                type = $target.jimGetType();
                switch(type) {
                  case itemType.shapewrapper:
                	bShape=true;
                  case itemType.richtext:
                  case itemType.textcell:
                  case itemType.rectangle:
                  case itemType.button:
                  case itemType.label:
                    $target.find(".valign span:first").html(jimUtil.toHTML(value));
                    $target.find(".valign span").slice(1).remove();
                    jimUtil.wrapLayout($target);
                    if($target.is(".percentage.autofit")) {
                    	jimResponsive.redoWidthValue($target);
                    }
                    break;
                  case itemType.index:
                  case itemType.summary:
                    /* ignore */
                    break;
                  case itemType.image:
                    /* $target.attr("src", jimUtil.encodeURI(value)); */
                    try {
						
					  var $img = $target.find("img");
					  $img.css({
						"width" : "100%",
						"height" : "100%",
						"left" : "0px",
						"top" : "0px",
					  });
                      var data = $target.data();
                      if (value.indexOf('<svg')>=0 /*&& !value.endsWith("cross.svg")*/) {
                          var svg = JSON.parse(JSON.stringify(value));
                          args.data = data;
                          parseSVG(svg, $target, args);
                      } else {
                    	$target = $("#" + $target.attr('id'));
                        if ($target.find("svg").length) {
                     	  $target.append("<img>");
                		  $target.find("svg").remove();
                        }
                        value = value.replace("%", "%25");
                        value = value.replace("#", "%23");
                        $target.find("img").attr("src", value);
                        $target.data(data);
                      }
                    } catch (e) {}
                    break;
                  case itemType.text:
                  case itemType.password:
                  case itemType.date:
                  case itemType.time:
                  case itemType.datetime:
                    $target.find("input").val(jimUtil.fromHTML(value));
                    break;
                  case itemType.file:
                    try {
                      $target.find("input").val(jimUtil.fromHTML(value));
                    } catch(error) {
                      switch(error.name) {
                        case "NS_ERROR_DOM_SECURITY_ERR":
                            /* silent ignore */
                          break;
                        default:
                          break;
                      }
                    }
                    break;
                  case itemType.textarea:
                    $target.find("textarea").val(jimUtil.fromHTML(value));
                    break;
                  case itemType.checkbox:
                  case itemType.radiobutton:
                  	if(jimDevice.isMobile() && jimDevice.isIOS() && type==itemType.radiobutton) {
                      $target.trigger("mousedown", value);
                      $target.trigger("mouseup", value);
                      $target.trigger("click", value);
                  	}else{
                  		if(value.toString() === "false") {
                  			if($target.children("input").length !== 0) $target.children("input").attr("checked", false);
                  			else $target.attr("checked", false);
                  		} else if (value.toString() === "true") {
                  			if($target.children("input").length !== 0) $target.children("input").attr("checked", true);
                  			else $target.attr("checked", true);
                  		}
                    }
                    break;
                  case itemType.dropdown:
                  case itemType.nativedropdown:
                    $target.children(".dropdown-options").html(jimEvent.getHtml(type, jimUtil.toArray(value)));
                    self.jimSetSelection({"target": $target, "value": $target.children(".dropdown-options").children(".option:first").text()});
                    break;
                  case itemType.selectionlist:
                  case itemType.multiselectionlist:
                    if(jimEvent.isInDataDataRow($target)) {
                      $target.find("td.disabled").html(jimUtil.toHTML(value));
                    } else {
                      $target.find("td").html(jimEvent.getHtml(type, jimUtil.toArray(value)));
                    }
                    break;
                  case itemType.radiobuttonlist:
                  case itemType.checkboxlist:
                    if(jimEvent.isInDataDataRow($target)) {
                      $target.find("tr.disabled td").html(jimUtil.toHTML(value));
                    } else {
                      $target.find("tbody").html(jimEvent.getHtml(type, jimUtil.toArray(value), $target));
                    }
                    break;
                  case itemType.datalist:
                  case itemType.datagrid:
                    $target.dataview("update", value, self.event);
                    jimResponsive.refreshResponsiveComponents($target);
                    jimPin.pinAllElementsDescending($target);
                    jimUtil.wrapLayout($target);
                    break;
                }
                 if(bShape){
					 shapeStyle = {};
					 shapeStyle.attributes = {};
					 jimShapes.updateStyle($target.find(".shape")[0],shapeStyle);
                 }
              }
            }
          }
        }
        if(callback) { callback(); }
      }
    },
    "jimSetSelection": function(args, instance, callback) {
      if(jimUtil.exists(args) && jimUtil.exists(args.value) && jimUtil.exists(args.target)) {
        var self = this, $targets, $target, type, value = "", $options, $option, option, t, tLen, o, oLen, v, vLen;
        if (args.value.datamaster) {
          jimData.set(args.target, jimGetDataInstanceIds(args.value.source));
        } else {
          value = self.evaluateExpression(args.value, instance);
          $targets = self.getEventTargets(args.target);
          if(jimUtil.exists($targets)) {
            for(t=0, tLen=$targets.length; t<tLen; t+=1) {
              $target = jQuery($targets[t]);
              type = $target.jimGetType();
              switch(type) {
                case itemType.dropdown:
                case itemType.nativedropdown:
                  $options = $target.children(".dropdown-options").children(".option").removeClass("selected");
                  for(o=0, oLen=$options.length; o<oLen; o+=1) {
                    option = $options[o];
                    if(option.textContent === value || option.innerText === value || (option.textContent != undefined && option.textContent.replace(/\s/g, '&nbsp;') === value.replace(/\s/g, '&nbsp;')) || (option.innerText != undefined && option.innerText.replace(/\s/g, '&nbsp;') === value.replace(/\s/g, '&nbsp;'))) {
                      jQuery(option).attr("selected","selected");
                      $target.find(".value").html(jimUtil.toHTML(value));
                      break;
                    }
                  }
                  break;
                case itemType.selectionlist:
                  $options = $target.find(".option").removeClass("selected");
                  for(o=0, oLen=$options.length; o<oLen; o+=1) {
                    $option = jQuery($options[o]);
                    if($option.text() === value || $option.text().replace(/\s/g, '&nbsp;') === value.replace(/\s/g, '&nbsp;')) {
                      $option.addClass("selected");
                      if(jimEvent.isInDataDataRow($target)) {
                        $target.find("td.disabled").html(jimUtil.toHTML(value));
                      }
                      break;
                    }
                  }
                  break;
                case itemType.multiselectionlist:
                  value = jimUtil.toArray(value);
                  $options = $target.find(".option").removeClass("selected");
                  for(o=0, oLen=$options.length; o<oLen; o+=1) {
                    $option = jQuery($options[o]);
                    for(v=0, vLen=value.length; v<vLen; v+=1) {
                      if($option.text() === value[v] || $option.text().replace(/\s/g, '&nbsp;') === value[v].replace(/\s/g, '&nbsp;')) {
                        $option.addClass("selected");
                        if(jimEvent.isInDataDataRow($target)) {
                            $target.find("td.disabled").html(jimUtil.toHTML(value));
                        }
                        break;
                      }
                    }
                  }
                  break;
                case itemType.radiobuttonlist:
                  var search = "input";
                  if(jimDevice.isMobile() && jimDevice.isIOS()) {
                	  search = "div";
                  }
                  $options = $target.find(search).removeAttr("checked").end().find(".option");
                  for(o=0, oLen=$options.length; o<oLen; o+=1) {
                    $option = jQuery($options[o]);
                    if($option.text() === value || $option.text().replace(/\s/g, '&nbsp;') === value.replace(/\s/g, '&nbsp;')) {
                      if(jimDevice.isMobile() && jimDevice.isIOS())
                        jQuery($option.prev(search)[0]).attr("checked", true);
                      else $option.prev(search)[0].checked = true;
                      //disabled inside data grid
                      if(jimEvent.isInDataDataRow($target)) {
                        $target.find("tr.disabled td").html(jimUtil.toHTML(value));
                      }
                      break;
                    }
                  }
                  break;
                case itemType.checkboxlist:
                  value = jimUtil.toArray(value);
                  var search = "input";
                  if(jimDevice.isMobile() && jimDevice.isIOS()) {
                	  search = "div";
                  }
                  $options = $target.find(search).removeAttr("checked").end().find(".option");
                  for(o=0, oLen=$options.length; o<oLen; o+=1) {
                    $option = jQuery($options[o]);
                    for(v=0, vLen=value.length; v<vLen; v+=1) {
                      if($option.text() === value[v] || $option.text().replace(/\s/g, '&nbsp;') === value[v].replace(/\s/g, '&nbsp;')) {
                    	if(jimDevice.isMobile() && jimDevice.isIOS())
                    	  jQuery($option.prev(search)[0]).attr("checked", true);
                    	else $option.prev(search)[0].checked = true;
                    	//disabled inside data grid
                        if(jimEvent.isInDataDataRow($target)) {
                            $target.find("tr.disabled td").html(jimUtil.toHTML(value));
                        }
                        break;
                      }
                    }
                  }
                  break;
              }
            }
          }
        }
        if(callback) { callback(); }
      }
    },
    "jimPause": function(args, callback) {
      var self = this, $firer, undoPauseStack;
      if(jimUtil.exists(args)) {
        if(self.event.backupState) {
          $firer = self.getEventFirer();
          undoPauseStack = $firer.data("jimUndoPauseStack");
          if(!jimUtil.exists(undoPauseStack)) {
            undoPauseStack = [];
          }
          undoPauseStack.push(setTimeout(callback, args.pause));
          $firer.data("jimUndoPauseStack", undoPauseStack);
         } else {
          jimEvent.pauseStack.push(setTimeout(callback, args.pause));
         }
      }
    },
    "jimPlayAudio": function(args, callback) {
        var self = this;
        if(args.target) {
             for(t=0, tLen=args.target.length; t<tLen; t+=1) {
	               var targetAudio = "./audio/"+args.target[t];
	               var audio = document.createElement("audio");
	               audio.setAttribute("id",args.target[t]);
	               var source = document.createElement("source");
	               source.setAttribute("src",targetAudio);
	               audio.appendChild(source);

	               var simulation = document.getElementById("simulation");
	               simulation.appendChild(audio);
	               audio.addEventListener('ended', function(){
	            	   simulation.removeChild(audio);
	            	   if(callback) { callback(); }
	               });
	               audio.play();
             }
        }
      },
    "jimResize": function(args, callback) {
      if(jimUtil.exists(args)) {
        var self = this, $targets, $parent, type, i, iLen, width, height, bShape, shapeStyle, percentageWidth, percentageHeight, parentWidth, parentHeight;
        if(args.target) {
          $targets = self.getEventTargets(args.target, undefined, "jimResize");
          if($targets) {
        	// For each is needed for progress scoping on shapes
        	$targets.forEach(function(target, i) {
              var $target = jQuery(target);
              var vWrap = $target.closest(".layout.wrap");
              if ($target.is(".table, .datagrid, .datalist, .panel")) vWrap = $target.find("."+$target.attr('id').replace(/\br[0-9]*_/,"").substring(2)+".wrap");
              else if ($target.is(".cellcontainer") || $target.is(".gridcell") || $target.is(".datacell")) {
            	var parent = $target.closest(".table, .datagrid, .datalist");
            	vWrap = parent.find("."+parent.attr('id').replace(/\br[0-9]*_/,"").substring(2)+".wrap");
              }

              bShape=false;
              if($target.jimGetType() === itemType.panel)
                $parent = $target.closest(".dynamicpanel").parent();
              else if($target.is(".cellcontainer") || $target.is(".datacell") || $target.is(".textcell") )
                $parent = $target.closest(".table, .datalist");
              else
                $parent = $target.parent();

              if($target.jimGetType() === itemType.shapewrapper) {
                bShape=true;
              }

              if($parent.closest(".firer").is(".screen, .template"))
                $parent = $parent.closest(".ui-page");

              if(args.width && args.width.type!=="noresize") {
                width = self.evaluateExpression(args.width.value);
                if(args.width.type==="percentage" && jimUtil.exists($parent)) {
                  percentageWidth = width;
                  parentWidth = jimUtil.getScrollContainerSize($parent).width;
                  if($target.is(".shape") && jimUtil.exists(percentageWidth) && !isNaN(parseInt(percentageWidth, 10)))
                    width = parentWidth / 100 * percentageWidth;
                }

                if(jimUtil.exists(width) && !isNaN(parseInt(width, 10))) {
                  var substraction = jimEvent.fn.getCurrentStyle('border-left-width', $target) + jimEvent.fn.getCurrentStyle('border-right-width', $target);

//                  if ($target.hasClass("textcell") || $target.hasClass("cellcontainer") || $target.hasClass("datacell") || $target.hasClass("gridcell"))
//                    substraction += jimEvent.fn.getCurrentStyle('border-left-width', $target) + jimEvent.fn.getCurrentStyle('border-right-width', $target);

                  if ($target.is(".table") || $target.is(".datalist") || $target.is(".datagrid") || ((args.width.type==="percentage") && !$target.is(".shape"))) substraction = 0;

                  width = Math.max(width - substraction, 0);
                  jimResponsive.setNewWidth($target, (args.width.type==="percentage") ? percentageWidth : width, (args.width.type==="percentage") ? "%" : "px");
                }

                if($target.hasClass("lockH") && args.width.type!=="noresize"){
                  $target.removeClass("lockH");
                }

              }
              if(args.height && args.height.type!=="noresize") {
                height = self.evaluateExpression(args.height.value);
                if(args.height.type==="percentage" && jimUtil.exists($parent)) {
                  percentageHeight = height;
                  parentHeight = jimUtil.getScrollContainerSize($parent).height;
                  if($target.is(".shape") && jimUtil.exists(percentageHeight) && !isNaN(parseInt(percentageHeight, 10)))
                    height = parentHeight / 100 * percentageHeight;
                }

                if(jimUtil.exists(height) && !isNaN(parseInt(height, 10))) {
                  var substraction = jimEvent.fn.getCurrentStyle('border-top-width', $target) + jimEvent.fn.getCurrentStyle('border-bottom-width', $target);

                  if ($target.hasClass("textcell") || $target.hasClass("cellcontainer") || $target.hasClass("datacell") || $target.hasClass("gridcell"))
                    substraction += jimEvent.fn.getCurrentStyle('border-top-width', $target) + jimEvent.fn.getCurrentStyle('border-bottom-width', $target);

                  if ($target.is(".table") || $target.is(".datalist") || $target.is(".datagrid") || ((args.height.type==="percentage") && !$target.is(".shape")))  substraction = 0;

                  height = Math.max(height - substraction, 0);
                  jimResponsive.setNewHeight($target, (args.height.type==="percentage") ? percentageHeight : height, (args.height.type==="percentage") ? "%" : "px");
                }

                if($target.hasClass("lockV") && args.height.type!=="noresize"){
                  $target.removeClass("lockV");
                }
              }


              if(percentageWidth || percentageHeight) {
              	$target.removeClass("percentage").addClass("percentage");
				
				if (!percentageHeight  && $target.hasClass("panel") && $target.parent().hasClass("dynamicpanel"))
					$target.parent().css("height", "");
				if (!percentageWidth && $target.hasClass("panel") && $target.parent().hasClass("dynamicpanel"))
					$target.parent().css("width", "");				
              }
              else {
            	  $target.removeClass("percentage");
                  if (args.height && args.height.type!=="noresize" && $target.hasClass("panel") && $target.parent().hasClass("dynamicpanel"))
                	  $target.parent().css("height", "");
                  if (args.width && args.width.type!=="noresize" && $target.hasClass("panel") && $target.parent().hasClass("dynamicpanel"))
                  	  $target.parent().css("width", "");
              }
              $target.removeAttr("datasizewidth");
              $target.removeAttr("datasizeheight");

              var effect;
              if(args.effect){
                effect = jimUtil.createResizeAnimationOptions(args.effect, vWrap);
                var responsiveProgress = function(){
              	  jimResponsive.refreshResponsiveComponents($target, undefined, undefined, false);
                }
                var progress = function(){
              	  if(responsiveProgress!==undefined)
              		  responsiveProgress();
              	  if (!bShape)
              	  	jimUtil.adaptItemToNewSize($target);
                };
                var complete = function() {
                  jimResponsive.refreshResponsiveComponents($target, undefined, undefined, true);
                  if (!bShape)
                  	jimUtil.adaptItemToNewSize($target);
              	};
                jQuery.extend(effect,{"progress": progress});
                jQuery.extend(effect,{"complete": complete});
              }

              if($target.is(".table") || $target.is(".datalist") || $target.is(".datagrid")) {
                jimUtil.resizeTable($target, width, height, effect, callback);
                jimUtil.adaptItemToNewSize($target);
              }
              else if($target.is(".cellcontainer") || $target.is(".datacell") || $target.is(".textcell")) {
                jimUtil.resizeCell($target, width, height, effect, true, callback);
              }
              else if($target.is(".headerrow") || $target.is(".datarow")) {
                jimUtil.resizeRow($target, width, height, effect, callback);
              }
              else if($target.is(".gridcell")) {
              	var $dataGrid = $target.closest(".datagrid");
               	if(jimUtil.exists(width) && !isNaN(parseInt(width, 10)))
                  $dataGrid.attr("childwidth", width);
                if(jimUtil.exists(height) && !isNaN(parseInt(height, 10)))
                  $dataGrid.attr("childheight",height);
                  $dataGrid.dataview("updateDataGridBounds");
              }
			  else {
                if(args.width && args.width.type==="percentage" && jimUtil.exists($parent)) {
                  width = width + "%";
                }
                if(args.height && args.height.type==="percentage" && jimUtil.exists($parent)) {
                  height = height + "%";
                }

                effect = jimUtil.createResizeAnimationOptions(args.effect, vWrap, callback);
                var properties = {};

                if((jimUtil.exists(width) && !isNaN(parseInt(width, 10))) || (jimUtil.exists(height)  && !isNaN(parseInt(height, 10)))){
                  jimUtil.convertToManualFitText($target);
                }

                if(jimUtil.exists(width) && !isNaN(parseInt(width, 10))){
                  jQuery.extend(properties, {"width": width});
                }
                if(jimUtil.exists(height)  && !isNaN(parseInt(height, 10))){
                  if($target.hasClass("manualfit"))
                    jQuery.extend(properties, {"min-height": height});
                  else
                    jQuery.extend(properties, {"height": height});
                }

                if(args.effect) {
                  if(bShape) {
                    var shapeProgress = function() {
                      var $shapewrapper = $(target);
                      shapeStyle = {};
                      shapeStyle.attributes = {"width":$shapewrapper.css("width"), "height":$shapewrapper.css("height"),"min-height":$shapewrapper.css("min-height")};
                      jimShapes.updateStyle($shapewrapper.find(".shape")[0],shapeStyle);
                    }
                  }

                  var progress2 = function(){
                	  if(shapeProgress!==undefined)
                		  shapeProgress();
                	  progress();
                  };

                  var complete2 = function() {
                	  progress2();
                	  complete();
                  }

                  jQuery.extend(effect,{"progress": progress2});
                  jQuery.extend(effect,{"complete": complete2});


                  $target.animate(properties, effect);

                  if ($target.hasClass("image") && $target.children().length > 0) {
                	$target.children().animate(properties, effect);
                  }
                } else {
                  $target.css(properties);

                  if(bShape) {
                    shapeStyle = {};
                    shapeStyle.attributes = {"width":width, "height":height,"min-height":height};
                    jimShapes.updateStyle($target.find(".shape")[0],shapeStyle);
                  } else jimUtil.adaptItemToNewSize($target);
                }
              }


              jimUtil.forceReflow();
			  jimUtil.refreshEventResponsiveLayoutItem($target);
              jimUtil.refreshPageMinSizeWithTarget($target);

              if(!args.effect || $target.is(".gridcell")) jQuery.each(vWrap, function (index, value) {jimUtil.wrapLayout(value);});

              if(!args.effect){
                  jimResponsive.refreshResponsiveComponents($target);
              }
            });

            jQuery(window).trigger("reloadScrollBars");
          }
        }

        if(callback && !args.effect) { callback(); }
      }
    },
	"jimRotate": function(args, callback) {
	      if(jimUtil.exists(args)) {
	        var self = this, $targets, $target, type, i, iLen, angle,  bShape, shapeStyle;
	        if(args.target) {
	          $targets = self.getEventTargets(args.target,undefined,"jimRotate");
	          if($targets) {
	            for(i=0, iLen = $targets.length; i < iLen; i += 1) {
	              $target = jQuery($targets[i]);
				  $target.jimForceVisibility();
	              bShape=false;

	              if($target.jimGetType() === itemType.shapewrapper) {
	                bShape=true;
	              }

				  var isRelative = $target.is(".masterinstance, .group");
	              var currentAngle = parseInt(jimUtil.getRotationDegrees($target));
	              if(args.angle) {
	                angle = self.evaluateExpression(args.angle.value);
	                if(args.angle.type==="rotateby" && !isRelative)
	                	angle= parseInt(angle) + currentAngle;
					else if (isRelative && args.angle.type!="rotateby")
						angle = parseInt(angle) - currentAngle;
	              }

	              var effect;
	              if(args.effect)
	                effect = jimUtil.createAnimationOptions(args.effect, callback);

				  var translate = jimUtil.getTransformTranslate($target);
				  if (translate == undefined)
					  translate = {x:0, y:0};

	              var target = $target[0];
	              if(target.rotationdeg=== undefined)
	            	  target["rotationdeg"] = currentAngle;

   				  $target.jimUndoVisibility();
	              if(args.effect) {
	            	var properties = {};
		            if(jimUtil.exists(angle) && !isNaN(parseInt(angle, 10)))
		               jQuery.extend(properties, {rotationdeg: angle});

	              	var stepFunction =  function(now, x) {
	              		// in the step-callback (that is fired each step of the animation),
                        // you can use the `now` paramter which contains the current
                        // animation-position (`0` up to `angle`)
                        var item = $(x.elem);
                        item.css({
                            transform: 'translate(' + translate.x + 'px, ' + translate.y + 'px) rotate(' + now + 'deg)'
                        });
                    	if(bShape) {
    	                    shapeStyle = {};
    	                    shapeStyle.attributes = {"-webkit-transform":now};
    	                    jimShapes.updateStyle(item.find(".shape")[0],shapeStyle);
    	                }
                    };
	                jQuery.extend(effect, {"step": stepFunction});
	                $target.animate(properties, effect);

	              } else {
					if (isRelative) {
						var bounds = jimUtil.getRelativeItemBounds($target);
						if (angle != 0) {
						  jimUtil.rotateRelativeItemChilds($target, angle, {x : bounds.x + bounds.width / 2, y : bounds.y + bounds.height / 2}, parseInt(angle) + parseInt(currentAngle));
						  target["rotationdeg"] = parseInt(angle) + parseInt(currentAngle);
						}
					} else {
						$target.css({
							transform: 'translate(' + translate.x + 'px, ' + translate.y + 'px) rotate(' + angle + 'deg)'
						});
						target["rotationdeg"] = angle;
					}
	                
	                if(bShape) {
	                    shapeStyle = {};
	                    shapeStyle.attributes = {"-webkit-transform":angle};
	                    jimShapes.updateStyle($target.find(".shape")[0],shapeStyle);
	                 }
	             }

	            jimUtil.forceReflow();
				jimUtil.refreshEventResponsiveLayoutItem($target);
	            jimUtil.refreshPageMinSizeWithTarget($target);
	            }
	          }
	        }

	        if(callback && !args.effect) { callback(); }
	      }
	    }
  });

})(window);
