/*!
 * Copyright 2017 Justinmind. All rights reserved.
 */

(function (window, undefined) {
  var $simulation = jQuery("#simulation");
  $simulation
  .bind("renderresponsive", function(event, $element) {
  	var $components;
  	if($element!==undefined)
  		$components = jQuery("#" + $element.id + " .non-processed");
  	else $components = $("#simulation .non-processed");
  
	$components.each(function(){
		var newData = {};
		var newCSS = {};
		var hasCSS = false;
		var item = $(this);
		
		var dataSizeWidthAttr = item.attr("datasizewidth");
	 	if(dataSizeWidthAttr) {
			newData["width"] = parseFloat(dataSizeWidthAttr);
			newData["widthUnit"] =  (item.attr("datasizewidth").endsWith("%")) ? "%" : "px";
		 	if(newData["widthUnit"] === "%")
		 		item.removeAttr("datasizewidth");
	 	}
		
		var dataSizeHeightAttr = item.attr("datasizeheight");
	 	if(dataSizeHeightAttr){
			newData["height"] = parseFloat(dataSizeHeightAttr);
			newData["heightUnit"] = (item.attr("datasizeheight").endsWith("%")) ? "%" : "px";
		 	if(newData["heightUnit"] === "%")
		 		item.removeAttr("datasizeheight");
	 	}
		
		var dataXAttr = item.attr("dataX");
	 	if(dataXAttr){
			newData["offsetX"] = parseFloat(dataXAttr);
	 		if(!item.parent().is(".layout.horizontal, .layout.vertical")) {
				newCSS["left"] = newData["offsetX"] + "px";
				hasCSS = true;
			}
			if (!jimUtil.isRelative(item))
				item.removeAttr("dataX");
	 	}
		
		var dataYAttr = item.attr("dataY");
	 	if(dataYAttr){
			newData["offsetY"] = parseFloat(dataYAttr);
	 		if(!item.parent().is(".layout.horizontal, .layout.vertical")) {
				newCSS["top"] = newData["offsetY"] + "px";
				hasCSS = true;
			}
			if (!jimUtil.isRelative(item))
				item.removeAttr("dataY");
	 	}
		
		var originalWidthAttr = item.attr("originalwidth");
	 	if (originalWidthAttr){
			newData["originalWidth"] = parseFloat(originalWidthAttr);
		 	item.removeAttr("originalwidth");
	 	}
		
		var originalHeightAttr = item.attr("originalheight")
	 	if (originalHeightAttr){
			newData["originalHeight"] = parseFloat(originalHeightAttr);
		 	item.removeAttr("originalheight");
	 	}
		
		var aspectRatioAttr = item.attr("aspectRatio");
    	if (aspectRatioAttr){
      		newData["aspectRatio"] = parseFloat(aspectRatioAttr);
		 	item.removeAttr("aspectRatio");
    	}
		
		if (aspectRatioAttr || originalHeightAttr || dataYAttr || dataXAttr || dataSizeHeightAttr || dataSizeWidthAttr)
			item.data(newData);
		if (hasCSS && !jimUtil.isRelative(item))
			item.css(newCSS);
		
	 	item.removeClass("non-processed");
	 });
	 
	 // jimPin.pinElements($simulation.find(".non-processed-pin"), true);
  });

  var jimResponsive = {
  	"setNewWidth": function($target, width, unit) {
  		if($target && $target.data("width")) {
  			$target.data("width", width);
  			$target.data("widthUnit", unit);
  		}
  	},
  	"setNewHeight": function($target, height, unit) {
  		if($target && $target.data("height")) {
  			$target.data("height", height);
  			$target.data("heightUnit", unit);
  		}
  	},
	"resetOriginalTableSize" : function($table, resetWidth, resetHeight, cellSizeMap, newTableWidth, newTableHeight){
		if(resetHeight)
		  $table.data("originalHeight", newTableHeight ? newTableHeight : parseInt($table.css("height"),10));
		if(resetWidth)
		  $table.data("originalWidth", newTableWidth ? newTableWidth : parseInt($table.css("width"),10));

        var $cells = $table.find("table:first").children("tbody, thead").children("tr").children(".cellcontainer, .datacell, .textcell");
        if($table.is(".datagrid")) {
        	$cells = $table.find("table:first").children("tbody, thead").children("tr").children("td");
        }

        var $currentCell;
        for(var i=0, iLen = $cells.length; i < iLen; i += 1) {
          $currentCell = jQuery($cells[i]);
          if(resetHeight)
            $currentCell.data("originalHeight", cellSizeMap[$currentCell.attr("id")].height);
          if(resetWidth)
            $currentCell.data("originalWidth", cellSizeMap[$currentCell.attr("id")].width);
        }
	},
  	"getTextWidth": function($target) {
  		var oldStyle = $target.css('white-space');
      	$target.css('white-space', 'nowrap');

      	var w = 0;
      	$target.find("span").each(function( index ) {
      		var rect = $(this)[0].getBoundingClientRect();
  			w = Math.max(w, rect.width);
  			w = Math.max(w, $(this).width());
		});

		$target.css('white-space', oldStyle);
  		return w;
  	},
  	"redoWidthValue" : function($component) {
  		if($component.hasClass("autofit")) {
      		var cWidth = ($component.data("width") * jimResponsive.getParentComponent($component).width() / 100) - jimEvent.fn.getCurrentStyle("border-right-width", $component) - jimEvent.fn.getCurrentStyle("border-left-width", $component);
      		var textWidth = jimResponsive.getTextWidth($component);
      		if(cWidth > textWidth) {
      			$component.css("max-width", textWidth);
			}
			else {
				$component.css("max-width", "");
			}
      	}
  	},
  	"refreshResponsiveCanvas": function($component, onlySynced, sizeChange, updatePercentage, refreshResponsiveComponents) {
		if ($("#simulation").is(".blockRefresh"))
			return;
		
  		var $hidden = $("#simulation").find(".hidden");//.filter(function() { return jQuery(this).css('display') == 'none'; });
      	$("#simulation").data("hiddenElements", $hidden);
  		var t, tLen, $target;
      	for(t=0, tLen=(jimUtil.exists($hidden)) ? $hidden.length : 0; t<tLen; t+=1) {
      		$target = jQuery($hidden[t]);
      		if($target.jimGetType()=== itemType.panel || $target.jimGetType() === itemType.datarow || $target.jimGetType() === itemType.gridcell || $target.jimGetType() === itemType.gridrow){
            	$target.removeClass('hidden');
            }
  			else $target.removeClass('forceVisible').addClass('forceVisible');
  		}
  		
		if (refreshResponsiveComponents)
  		    jimResponsive.refreshResponsiveComponents($component, onlySynced, sizeChange, updatePercentage, true);
  		//$("#simulation").jimUndoVisibility();
  		
  		var $hidden = $("#simulation").data("hiddenElements");
      	var t, tLen, $target;
        for(t=0, tLen=$hidden.length; t<tLen; t+=1) {
             $target = jQuery($hidden[t]);
             if($target.jimGetType()=== itemType.panel || $target.jimGetType() === itemType.datarow || $target.jimGetType() === itemType.gridcell || $target.jimGetType() === itemType.gridrow){
                $target.addClass('hidden');
             }else{
                $target.removeClass('forceVisible');
             }
          }
        $("#simulation").data("hiddenElements", null);
        
        
        //refresh
  		jimUtil.forceReflow();
      	jimUtil.refreshPageMinSize();

      	jQuery(window).trigger("reloadScrollBars");
      	
      	jimPin.pinElements($simulation.find(".non-processed-pin"), true);
	    jimPin.notifySizeChange(undefined, true);

  	},
  	"refreshResponsiveComponents": function($component, onlySynced, sizeChange, updatePercentage, canvasLoad) {
  		var i, iLen, $t, $target = $newTarget = ($component===undefined) ? $("#simulation") : $component;
  		updatePercentage = (updatePercentage === undefined) ? true : updatePercentage;
		
		var relativePercentageSelector = ".relativeLayoutWrapper > .relativeLayoutWrapperResponsive > .masterinstance, .relativeLayoutWrapper > .relativeLayoutWrapperResponsive > .group";
		var imagePercentageSelector = ".image.lockV.percentage, .image.lockH.percentage";
		
  		if(canvasLoad)
  			$newTarget = $newTarget.find(".percentage.non-processed-percentage, " + imagePercentageSelector + ", " + relativePercentageSelector);
  		else $newTarget = $newTarget.find(".percentage.shapewrapper, " + imagePercentageSelector + ", " + relativePercentageSelector);
  		if($target.hasClass("percentage") && updatePercentage)
  			$newTarget = $newTarget.add($target);
		if ($target.is(imagePercentageSelector + ", " + relativePercentageSelector))
			$newTarget = $newTarget.add($target);
  		
  		for(i=0, iLen=$newTarget.length; i<iLen; i+=1) {
  			$t = jQuery($newTarget[i]);
  			var isHidden = false;
  			if(canvasLoad===undefined || jimUtil.isRelative($t)) {
  				isHidden = $t.hasClass("hidden");
  				$t.jimForceVisibility();
  			}
			
  			switch($t.jimGetType()) {
  				//case itemType.datalist:
  				//case itemType.datagrid:
  					/*if(onlySynced!==undefined && !onlySynced) {
  						break;
  					}
  					jimResponsive.refreshResponsiveTables($t);
  					$t.removeClass("non-processed-percentage");
  					break;*/
  				//case itemType.table:
  					/*jimResponsive.refreshResponsiveTables($t);
  					$t.removeClass("non-processed-percentage");
  					break;*/
  				//case itemType.panel:
  					/*if(canvasLoad!==undefined && $t.is(".default")) {
  						jimResponsive.refreshResponsivePanels($t);
  					}
  					else if(canvasLoad==undefined && !isHidden) {
  						jimResponsive.refreshResponsivePanels($t);
  					}
  					$t.removeClass("non-processed-percentage");*/
  				case itemType.shapewrapper:
  					jimResponsive.refreshResponsiveShapes($t);
  					$t.removeClass("non-processed-percentage");
  					break;
				case itemType.masterinstance:
				case itemType.group:
					jimResponsive.refreshResponsiveRelativeItem($t);
					break;
  				case itemType.image:
  					//jimResponsive.refreshResponsiveOther($t);
  					if($t.is(".lockH, .lockV"))
  						jimResponsive.refreshLockAspectImages($t);
  					//$t.removeClass("non-processed-percentage");
  					break;
  				default:
  					/*jimResponsive.refreshResponsiveOther($t);
  					if (!($t.jimGetType() == itemType.dynamicpanel))
  					  jimUtil.adaptItemToNewSize($t, undefined, undefined, !($t.hasClass("autofit")));
  					$t.removeClass("non-processed-percentage");*/
  					break;
  			}
  			if(canvasLoad===undefined || jimUtil.isRelative($t))
  				$t.jimUndoVisibility();
  		}

		var cells = $target.find(".horizontal.wrap:not(.verticalWrap)").filter(function (a,b) {return $(b).attr("hspacing") != undefined && ($(b).attr("hspacing") != 0 || $(b).attr("vspacing") != 0)});
        jQuery.each(cells, function (index, value) { jimUtil.wrapHorizontalLayout(value); });
        jQuery.each($target.find(".verticalWrap"), function (index, value) { jimUtil.wrapVerticalLayout(value); });
        
	    if(sizeChange!==undefined && !sizeChange) {
	    	jimPin.pinElements($target.find(".non-processed-pin"), canvasLoad);
	    }
	    else if (!canvasLoad && $component !== undefined){
	      	for(i=0, iLen=$component.length; i<iLen; i+=1) {
	      		$t = jQuery($component[i]);
	      		jimPin.notifySizeChange($t,true);
	      	}
	    }
	    else if(!canvasLoad) {
	    	jimPin.notifySizeChange(undefined,true);
	    }
      	
      	//masters and groups and wraps
        var listGroups = $target.find(".masterinstance, .group").reverse();
        listGroups.each(function(){
        var $group = jQuery($(this));
        if($group.hasClass("group"))
        	jimResponsive.refreshResponsiveGroups($group);
        if($group.hasClass("masterinstance"))
        	jimResponsive.refreshResponsiveMasters($group);
        });

  		//refresh
  		if(canvasLoad===undefined) {
  			jimUtil.forceReflow();
      		jimUtil.refreshPageMinSize();

      		jQuery(window).trigger("reloadScrollBars");
      	}
      },
	  "refreshResponsiveRelativeItem" : function(item) {
		var $parent = jimResponsive.getParentComponent(item);
		var parentBounds = jimResponsive.getParentBounds(item, $parent);
		
		var relativeWrapper = item.parent().parent();
		var currentSize = {x : relativeWrapper.css("width"), y : relativeWrapper.css("height")};
		var newSize = jimUtil.getRelativeItemBounds(item, parentBounds);

		relativeWrapper.css("width", (item.is(".hidden") ? 0 : newSize.width) + "px");
		relativeWrapper.css("height", (item.is(".hidden") ? 0 : newSize.height) + "px");		
		relativeWrapper.children().css("width", parentBounds.width + "px");
		relativeWrapper.children().css("height", parentBounds.height + "px");
	  },
	  "getParentBounds" : function($component, $parent){
		  if (($parent.hasClass("ui-page") && $parent.attr("devicetype") == "desktop") ||
				  ($parent.hasClass("screen") && $parent.hasClass("devWeb"))) {
			var simulation = $("#simulation");
		    var w = simulation[0].offsetWidth - (simulation.innerWidth() - simulation.children().first().innerWidth());
			var h = simulation[0].offsetHeight - (simulation.innerHeight() - simulation.children().first().innerHeight());
			return {"width": w, "height": h}; 
		  }
			 
		  var parentBounds = {"width":$parent[0].clientWidth, "height":$parent[0].clientHeight};
		  if ($parent.hasClass("panel") || $parent.hasClass("cellcontainer") || $parent.hasClass("gridcell") || $parent.hasClass("datacell"))
		    parentBounds = jimResponsive.removeContainerPaddingFromSize($parent, parentBounds);
		  else if($parent.hasClass("ui-page") || $parent.attr('id') == "simulation" || $parent.hasClass("canvas")){			  
			  parentBounds.width = parentBounds.width * jimUtil.getScale();
			  parentBounds.height = parentBounds.height * jimUtil.getScale();
		  }
		  return parentBounds;
	  },
	  "getValueAsPercentage" : function(value, $item, isWidth) {
		var parentBounds = jimResponsive.getParentBounds($item, jimResponsive.getParentComponent($item));
		
		return (100.0 * value) / (((isWidth) ? parentBounds.width : parentBounds.height));
	  },
      "refreshResponsiveShapes": function($shape) {
      	var $parent, cWidth, cHeight, shapeStyle;
      	cWidth = $shape.data('width');
      	cHeight = $shape.data('height');
      	if($shape.data('widthUnit') === "%" || $shape.data('heightUnit') === "%") {
      		$parent = jimResponsive.getParentComponent($shape);
        	if($parent.hasClass("center"))
            	$parent = $("#simulation");
        	var parentBounds = jimResponsive.getParentBounds($shape,$parent);
      		cWidth = ($shape.data('widthUnit') === "%") ? (parentBounds.width * parseFloat(cWidth)/100) - $shape.css("border-right-width").split("px")[0] -  $shape.css("border-left-width").split("px")[0]: cWidth;
      		cHeight = ($shape.data('heightUnit') === "%") ? (parentBounds.height * parseFloat(cHeight)/100) - $shape.css("border-top-width").split("px")[0] -  $shape.css("border-bottom-width").split("px")[0]: cHeight;
      		
      		shapeStyle = {};
            shapeStyle.attributes = {"width": cWidth, "height": cHeight, "min-height": cHeight};
            jimShapes.updateStyle($shape.find(".shape")[0], shapeStyle);
        }
      },
      "refreshResponsivePanels": function($panel) {
      	var $parent, cWidth, cHeight;
      	var border = jimUtil.getItemBorderWidth($panel); 
      	cWidth = $panel.data('width');
      	cHeight = $panel.data('height');
      	if($panel.data('widthUnit') === "%" || $panel.data('heightUnit') === "%") {
      		$parent = $panel.parent();
        	if($parent.hasClass("center"))
            	$parent = $("#simulation");
        	var parentBounds = jimResponsive.getParentBounds($panel,jimResponsive.getParentComponent($parent));
      		cWidth = ($panel.data('widthUnit') === "%") ? (parentBounds.width * parseFloat(cWidth)/100) - jimEvent.fn.getCurrentStyle("border-right-width", $panel) - jimEvent.fn.getCurrentStyle("border-left-width", $panel) : cWidth;
      		cHeight = ($panel.data('heightUnit') === "%") ? (parentBounds.height * parseFloat(cHeight)/100) - jimEvent.fn.getCurrentStyle("border-top-width", $panel) - jimEvent.fn.getCurrentStyle("border-bottom-width", $panel) : cHeight;

      		var $bgLayer = $panel.children(".backgroundLayer");
      		if($panel.data('widthUnit') === "%") {
      			$parent.width((parseInt(cWidth))+"px");
      			$panel.width("100%");
      			$panel.children(".layoutWrapper").width((parseInt(cWidth))+"px")
      		}
      		if($panel.data('heightUnit') === "%") {
      			$parent.height((parseInt(cHeight))+"px");
      			$panel.height("100%");
      			$panel.children(".layoutWrapper").height((parseInt(cHeight))+"px")
      		}
      	}
      },
      "refreshResponsiveTables": function($table) {
      	var $parent, cWidth, cHeight;
      	cWidth = $table.data('width');
      	cHeight = $table.data('height');
      	if($table.data('widthUnit') === "%" || $table.data('heightUnit') === "%") {
      		$parent = jimResponsive.getParentComponent($table);
      		var modifyHeight = true;
      		var borderWidth = jimUtil.getItemBorderWidth($table);
        	if($parent.hasClass("center"))
            	$parent = $("#simulation");
        	
        	var parentBounds = jimResponsive.getParentBounds($table,$parent);
      		cWidth = ($table.data('widthUnit') === "%") ? (parentBounds.width* parseFloat(cWidth)/100) : cWidth;
      		if ($table.data('heightUnit') === "%")
      		   	cHeight = parentBounds.height * parseFloat(cHeight)/100;
      		else if ($table.hasClass("datalist"))
      		   	modifyHeight = false;
      		
      		jimUtil.resizeTable($table, cWidth, cHeight, false, null, modifyHeight);
      	}
      },
      "refreshResponsiveOther": function($component) {
      	var cWidth, cHeight, $parent = jimResponsive.getParentComponent($component);
      	var border = jimUtil.getItemBorderWidth($component);
      	cWidth=undefined;
      	cHeight=undefined;
      	if($component.data('widthUnit') === "%") {
      		switch($component.jimGetType()) {
      			case itemType.file:
      				cWidth = ($parent.width()*(jimUtil.getScale()) * parseFloat($component.data("width")) / 100) - 71 - jimEvent.fn.getCurrentStyle("border-right-width", $component) - jimEvent.fn.getCurrentStyle("border-left-width", $component);
      				break;
      			case itemType.richtext:
      			case itemType.button:
      			case itemType.label:
      				jimResponsive.redoWidthValue($component);
      			default:
      			 	var parentBounds = jimResponsive.getParentBounds($component,$parent);
      			 	cWidth = (parentBounds.width * parseFloat($component.data("width") / 100)) - jimEvent.fn.getCurrentStyle("border-right-width", $component) - jimEvent.fn.getCurrentStyle("border-left-width", $component);
      				break;
      		}
            $component.css("width",cWidth);
       	}
        if($component.data('heightUnit') === "%") {
        	var parentBounds = jimResponsive.getParentBounds($component,$parent);
        	cHeight = (parentBounds.height * parseFloat($component.data("height") / 100)) - jimEvent.fn.getCurrentStyle("border-top-width", $component) - jimEvent.fn.getCurrentStyle("border-bottom-width", $component);
            $component.css("height",cHeight);
        }

        if($component.data('widthUnit') === "%") {
        	if($parent.hasClass("center")) {
            	cWidth = ($("#simulation").width() * (jimUtil.getScale()) * $component.data("width") / 100) - jimEvent.fn.getCurrentStyle("border-right-width", $component) - jimEvent.fn.getCurrentStyle("border-left-width", $component);
                $component.width(cWidth);
            }
            else if($parent.hasClass("horizontal")){
                cWidth = ($parent.width() * (jimUtil.getScale()) * $component.data("width") / 100) - jimEvent.fn.getCurrentStyle("border-right-width", $component) - jimEvent.fn.getCurrentStyle("border-left-width", $component);
              	$component.width(cWidth);
            }
        }
        if($component.data('heightUnit') === "%") {
        	if($parent.hasClass("center")) {
            	cHeight = ($("#simulation").height() * (jimUtil.getScale()) * $component.data("height") / 100) - jimEvent.fn.getCurrentStyle("border-top-width", $component) - jimEvent.fn.getCurrentStyle("border-bottom-width", $component);
                $component.height(cHeight);
            }
            else if($parent.is(".vertical, .horizontal")){
                cHeight = ($parent.height() * (jimUtil.getScale()) * $component.data("height") / 100) - jimEvent.fn.getCurrentStyle("border-top-width", $component) - jimEvent.fn.getCurrentStyle("border-bottom-width", $component);
              	$component.height(cHeight);
            }
        }

        if ($component.hasClass("image") && $component.children().length > 0)
        	jimUtil.adaptItemToNewSize($component);
      },
      "refreshResponsiveMasters": function($masterinstances) {
      	var $masterinstance, $parent;
      	for(var i=0, iLen = $masterinstances.length; i < iLen; i += 1) {
      		$masterinstance = jQuery($masterinstances[i]);
     			if(jimResponsive.getResponsiveChildren($masterinstance.find("#alignmentBox > .freeLayout")).length>0){
      				jimUtil.calculateMasterMinSize($masterinstance.find(".master"));
      			}
      	}
      },
       "refreshLockAspectImages": function($image) {
          var ratio = $image.data('aspectRatio');
          if($image.hasClass("lockV")) {
         	 $image.height($image.width()*ratio);
         	 $image.children("svg, img").height($image.width()*ratio);
          }
          else if($image.hasClass("lockH")) {
         	 $image.width($image.height()*ratio);
         	 $image.children("svg, img").width($image.height()*ratio);
          }
      },
      "refreshResponsiveGroups": function($groups) {
        	var $group, $parent, size;
  			$.each($groups, function () {
     			$group = jQuery($(this));
     			//$parent = $group.closest(".layout");
     			//if($parent!==undefined && ($parent.hasClass("horizontal") || $parent.hasClass("vertical"))) {
     			if(jimResponsive.getResponsiveChildren($group).length>0)
					jimUtil.calculateGroupMinSize($group);
     			//}
  			});
       },
	   "getResponsiveChildren" : function($container){
		   //get first level responsive children
		   var responsiveChildren = new Array();
		   var $current;
		   function getResponsiveChildrenRecurse(elem){
			   elem.children().each(function(){
				   $current = jQuery($(this));
				   if($current.hasClass("percentage") || $current.hasClass("pin"))
					   responsiveChildren.push($current);
				   else if($current.hasClass("group"))
					   getResponsiveChildrenRecurse($current);
				   else if($current.hasClass("masterinstance"))
					   getResponsiveChildrenRecurse($current.find("#alignmentBox > .freeLayout"));
			   });
		   }
		   getResponsiveChildrenRecurse($container);
		   return responsiveChildren;
	   },
       "getParentComponent": function($component) {
    	   var $closestContainer = jimPin.getClosestContainerNoGroups($component);
    	   var hasContainerMaster = $closestContainer.closest(".masterinstance").length > 0;
    	   var hasMaster = $component.closest(".masterinstance").length > 0;
    	   if($closestContainer.attr('id') == "simulation" && hasMaster){
       			//prototyper model restriction
       			return $component.closest(".ui-page");
       		} else if (hasMaster && !hasContainerMaster) {
				return $closestContainer;
			}

       		var $notGroup = $component.parents(".firer").not(".group").first();
       		if($notGroup)
       			return $notGroup;
       		else
       			return $component.parent();
       },
	   "removeContainerPaddingFromSize": function($container, bounds) {
		  var newBounds = {"width": bounds.width, "height": bounds.height};
		  var $layout = $container.find("td.layout");
		  var containerID = $container.attr('id');
		  containerID = containerID.substring(containerID.indexOf("-")+1,containerID.length);
		  if ($layout.length && $layout.hasClass(containerID)) {
			$layout = $($layout.get(0));
		  	if ($layout.hasClass("vertical") || $layout.hasClass("horizontal")) {
		  		newBounds.width -= parseInt($layout.css("padding-left")) + parseInt($layout.css("padding-right"));
		  		newBounds.height -= parseInt($layout.css("padding-top")) + parseInt($layout.css("padding-bottom"));
		  	}
		  }
		   
		  return newBounds;
	   },
	   "getTdLayoutFromContainer" : function($container) { // Possible optimization for removeContainerPaddingFromSize
	   	  if ($container.hasClass("cellcontainer") || $container.hasClass("gridcell") || $container.hasClass("datacell"))
	   	   	return $container.children("div:first").children("table:first").children("tbody:first").children("tr:first").children("td.layout");
	   	  else if ($container.hasClass("panel"))
	   		return $container.children("div.layoutWrapper").children("table:first").children("tbody:first").children("tr:first").children("td.layout");
	   }
  };

  /* expose utilities to the global object */
  window.jimResponsive = jimResponsive;
})(window);
