(function(window, undefined) {

	var hoverClass = "developer-hover-class",
		selectedClass = "developer-selected-class", 
		active = false, $selectedItem, 
		$currentHover,
		itemStack = new Array();
	
	var developersLayer = "<div id='developersLayer'></div>";

	// SMART GUIDES & SELECTION FUNCTIONS
	function findIndex(list, func) {
		for (var i = 0; i < list.length; ++i) {
			if (func(list[i]))
				return i;
		}
		return -1;
	}
	
	function getFirerParent($item) {
		if ($item.hasClass("panel"))
			$item = $item.closest(".dynamicpanel");
		
		return $item.parent().closest(".firer:not('.group')");
	}

	function getSelectableItem(event) {
		var self = this, $firer, myEvent;
		myEvent = event || self.event;
		$firer = jQuery(myEvent.target || myEvent.srcElement);
		if ($firer.hasClass("dateicon") || $firer.hasClass("timeicon")) {
			$firer = $firer.prev();
		} else if ($firer.parent().closest(".shapewrapper").length == 1) {
			$firer = $firer.parent().closest(".shapewrapper");
		} else if ($firer.hasClass("file-input") && $firer.is("input")) {
			$firer = $firer.closest("div.file.firer");
		} else {
			$firer = $firer.closest(".firer");
		}
		return $firer;
	}
	
	function getDistances(o, d, oSize, dSize) {
		var guides = new Array();
		var distance, p1;
		
		if (d + dSize < o) {
			guides.push({"distance" : o - (d + dSize),
						"start" : d + dSize});
		} else if (o > d) {
			guides.push({"distance" :  o - d,
				"start" : d});
		}
		
		if (o + oSize < d) {
			guides.push({"distance" :  d - (o + oSize),
				"start" : o + oSize});
		} else if (o + oSize < d + dSize) {
			guides.push({"distance" :  (d + dSize) - (o + oSize),
				"start" : o + oSize});
		}
		
		return guides;
	}
	
	function paintVerticalSmartGuide(oBox, dBox, $devLayer, devLayerBox) {
		var left = oBox.left + oBox.width / 2;
		var guides = getDistances(oBox.top, dBox.top, oBox.height, dBox.height);
		$.each(guides, function(index, metric) {
			$("<div class='developerSmartGuide vertical'></div>").
				css({"height": metric.distance + "px", 
					 "top" : (metric.start - devLayerBox.top) + "px",
					 "left" : (left - devLayerBox.left) + "px"}).
				appendTo($devLayer);
			
			var endTop = metric.start + ((metric.start < oBox.top) ? 0 : (metric.distance - 1)); 
			$("<div class='developerSmartGuideEnd vertical'></div>").
				css({"top": (endTop - devLayerBox.top) + "px",
					 "left": (left - devLayerBox.left - 3) + "px"}).
				appendTo($devLayer);
			
			var startTop = metric.start + metric.distance / 2 - 7;
			$("<div class='developerSmartGuideLabel'><span>" + Math.round(metric.distance) + "</span></div>").
				css({"left": (left - devLayerBox.left + 4) + "px",
					 "top": (startTop - devLayerBox.top) + "px"}).
				appendTo($devLayer);
		});
	}
	
	function paintHorizontalSmartGuide(oBox, dBox, $devLayer, devLayerBox) {
		var top = oBox.top + oBox.height / 2;
		var guides = getDistances(oBox.left, dBox.left, oBox.width, dBox.width);
		$.each(guides, function (index, metric) {
			$("<div class='developerSmartGuide horizontal'></div>").
				css({"width": metric.distance + "px", 
					 "top" : (top - devLayerBox.top) + "px",
					 "left" : (metric.start - devLayerBox.left) + "px"}).
				appendTo($devLayer);
			
			var endLeft = metric.start + ((metric.start < oBox.left) ? 0 : (metric.distance - 1)); 
			$("<div class='developerSmartGuideEnd horizontal'></div>").
				css({"top": (top - devLayerBox.top - 3) + "px",
					 "left": (endLeft - devLayerBox.left) + "px"}).
				appendTo($devLayer);
			
			var startLeft = metric.start + metric.distance / 2 - 15;
			$("<div class='developerSmartGuideLabel'><span>" + Math.round(metric.distance) + "</span></div>").
				css({"top": (top - devLayerBox.top - 5 - 15) + "px",
					 "left": (startLeft - devLayerBox.left) + "px"}).
				appendTo($devLayer);
		});
	}
	
	function deleteAllSmartGuides() {
		$("#developersLayer > .developerSmartGuide").remove();
		$("#developersLayer > .developerSmartGuideEnd").remove();
		$("#developersLayer > .developerSmartGuideLabel").remove();
	}
	
	function deleteAllHoveredGuides() {
		$("#developersLayer > .developerHoverGuide").remove();
	}
	
	function updateSmartGuides($origin, $dest) {
		var $devLayer = $("#developersLayer");
		if ($devLayer.length == 0)
			return;
		
		deleteAllSmartGuides();
		
		if ($origin && $dest) {
			var devLayerBox = $devLayer[0].getBoundingClientRect();
			var oBox = $origin[0].getBoundingClientRect();
			var dBox = $dest[0].getBoundingClientRect();
			
			paintVerticalSmartGuide(oBox, dBox, $devLayer, devLayerBox);
			paintHorizontalSmartGuide(oBox, dBox, $devLayer, devLayerBox);
		}
	}
	
	function paintHoveredItemGuides($item) {
		if ($item && !$item.hasClass("canvas")) {
			var $devLayer = $("#developersLayer");
			if ($devLayer.length > 0) {
				var bbox = $item[0].getBoundingClientRect();
				var devLayerBox = $devLayer[0].getBoundingClientRect();
				
				var guide = "<div class='developerHoverGuide'></div>";
				$(guide).addClass("horizontal").css("top", (bbox.top - devLayerBox.top) + "px").appendTo($devLayer);
				$(guide).addClass("horizontal").css("top", (bbox.top + bbox.height - devLayerBox.top) + "px").appendTo($devLayer);
				$(guide).addClass("vertical").css("left", (bbox.left - devLayerBox.left) + "px").appendTo($devLayer);
				$(guide).addClass("vertical").css("left", (bbox.left + bbox.width - devLayerBox.left) + "px").appendTo($devLayer);
			}
		}
	}
	
	function hoverItem($item) {
		if ($currentHover)
			$currentHover.removeClass(hoverClass);
		
		deleteAllHoveredGuides();
		
		if ($item && !$item.hasClass("canvas")) {
			$currentHover = $item;
			$currentHover.addClass(hoverClass);
			
			if (findIndex(itemStack, function($i) {return $currentHover.attr("id") == $i.attr("id")}) == -1)
				itemStack.push($currentHover);
			
			if ($selectedItem && $selectedItem.attr("id") != $currentHover.attr("id")) {
				var $dItem = ($currentHover) ? $currentHover : getFirerParent($selectedItem); 
				updateSmartGuides($selectedItem, $dItem);
				paintHoveredItemGuides($dItem);
			} else  
				updateSmartGuides($currentHover, getFirerParent($currentHover));
		} else if ($selectedItem)
			updateSmartGuides($selectedItem, getFirerParent($selectedItem));
		else
			deleteAllSmartGuides();
	}
	
	// END SMART GUIDES FUNCTIONS
	
	// ROTATION FUNCTIONS
	function getABValues(matrixString) {
	    var values = matrixString.split('(')[1].split(')')[0].split(',');
	    return {a : values[0], b : values[1]};
	}
	
	function isIdentity(matrixString) {
		if (matrixString == "none")
			return true;
		var values = getABValues(matrixString);
		return values.a == 1 && values.b == 0;
	}
	
	function matrixToAngle(matrixString) {
		var values = getABValues(matrixString);
		var angle = Math.round(Math.atan2(values.b, values.a) * (180/Math.PI));
		if (angle < 0) angle +=360;
		return "rotate(" + parseFloat(angle.toFixed(2)) + "deg)";
	}
	// END ROTATION FUNCTIONS
	
	// CSS FUNCTIONS
	
	function escapeHtml(unsafe) {
		return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
	}
	
	function getBareUserId(item) {
		var customid = item.attr("customid");
		if (customid)
			return escapeHtml(customid);
		
		var regexp = /((?:shapewrapper-){0,1}(?:[mst]-){1})/g;
		return item.attr("id").replace(regexp, "");
	}
	
	function getItemPosition(item) {
		if (item.jimGetType() == itemType.panel)
			item = item.parent();

		var left, top;

		if (item.hasClass("pin")) {
			left = item.data().offsetX;		
			top = item.data().offsetY;
		} else {
			$newTarget.jimForceVisibility();
			left =  item[0].offsetLeft;
			top =  item[0].offsetTop;
			$newTarget.jimUndoVisibility();
		}
		return  {"x":left, "y":top};
	}
	
	function getItemSize(item) {
		var w, h;
		
		$newTarget.jimForceVisibility();
		if (item.hasClass("percentage")) {
			var data = item.data();
			if (data.widthUnit == "%")
				w = parseFloat(data.width.toFixed(2)) + "%";
			if (data.heightUnit == "%")
				h = parseFloat(data.height.toFixed(2)) + "%";
		}
		
		if (w == undefined)
			w = item.outerWidth() + "px";
		if (h == undefined)
			h = item.outerHeight() + "px";
		$newTarget.jimUndoVisibility();
		
		return  { "w" : w, "h" : h };
	}
	
	function getItemFontStylesTarget(item) {
		var figures;
		
		if (item.hasClass("text")) {
			figures = $(item).find("input");
		} else if (item.hasClass("dropdown") || item.hasClass("selectionlist") ||
				item.hasClass("radiobuttonlist") || item.hasClass("checkboxlist") ||
				item.hasClass("multiselectionlist")) {
			figures = $(item);
		} else figures = getItemRichTextFigures(item);
		
		return figures;
	}
	
	function getItemRichTextFigures(item) {
		return $(item).find("span").filter(function(index) {
			if ($(this) && $(this).attr("id") && $(this).attr("id").startsWith("rtr-")) {
				var itemID = item.attr("id");
				var rtrID = $(this).attr("id");
				
				return itemID.includes(rtrID.match(/rtr-(.+)_\d+$/)[1]);
			}
			return false;
		});
	}
	
	function getItemValue(item) {
		var spans = getItemRichTextFigures(item);
		if (spans.length == 1) 
			return spans.html();
		return "";
	}
	
	function getImageContentFile(item) {
		if (item.jimGetType() == itemType.image) {
			var img = item.find("img");
			if (img.length)
				return img.attr("src");
			else if (item.find("svg").length) {
				return item.attr("systemname");
			}
			
			return "";
		}
	}
	
	function addCSSStyle(item, styleName, cssResult, defaultValue, process, resultName) {
		var value = item.css(styleName);
		
		if (!value || value == defaultValue || ((typeof defaultValue) == "function" && defaultValue(value)))
			return cssResult;
		
		return cssResult.concat((resultName ? resultName : styleName) + ": " +
				(process ? process(value) : item.css(styleName)) +
				";<br>");
	}
	
	function buildBackgroundURL(url) {
		url = url.replace(/url\("(.*)"\)/g, "$1");
		var fileName = url.substring(url.lastIndexOf("/") + 1);
		
		return "<a download='" + fileName + "' href='" + url + "'>" + fileName + "</a>";
	}
	
	function rgb2hex(rgb) {
	    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\.\d]+))?\)$/);
	    function hex(x) {
	        return ("0" + parseInt(x).toString(16)).slice(-2);
	    }
	    
	    if (!rgb)
	    	return "";
	    
	    var opacity = (rgb[4] && parseFloat(rgb[4]) != NaN) ? (parseFloat(rgb[4]) * 100) : undefined;
	    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]) + (opacity ? (" (" + parseFloat(opacity.toFixed(2)) + "%)") : "");
	}
	
	function replaceAllrgb(s) {
		return s.replace(/(rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\.\d]+)?\))/g, rgb2hex);
	}
	
	function isInvalidColor(colorString) {
		return !colorString || colorString == "transparent" || colorString == "rgba(0, 0, 0, 0)";
	}
	
	function getFirstWord(s) {
		var match = s.match(/^\s*([\S]+)\s*.*/m);
		return (match && match[1]) ? match[1] : "";
	}
	
	function roundResult(s) {
		var number = parseFloat(s);
		if (!isNaN(number))
			return s.replace(number + "", Math.round(number * 100) / 100.0);
		return s;
	}
	
	function getItemCSS(item) {
		var cssResult = "";
		
		var isValidColor = function (colorString) {
			return colorString
		}
		
		// font styles
		var rtr = getItemFontStylesTarget(item);
		if (rtr.length == 1) {
			cssResult = addCSSStyle(rtr, "font-family", cssResult);
			cssResult = addCSSStyle(rtr, "font-size", cssResult, undefined, roundResult);
			cssResult = addCSSStyle(rtr, "font-weight", cssResult);
			cssResult = addCSSStyle(rtr, "font-style", cssResult, "normal");
			var isInvalidDecoration = function (s) {
				var fw = getFirstWord(s);
				return !fw || fw == "none"; 
			}
			cssResult = addCSSStyle(rtr, "text-decoration", cssResult, isInvalidDecoration, getFirstWord);
			cssResult = addCSSStyle(rtr, "line-height", cssResult, "1");
			cssResult = addCSSStyle(rtr, "color", cssResult, undefined, rgb2hex);
		}
		
		//background
		var colorLayer = item.find(".colorLayer").first();
		if (colorLayer.length == 1) {
			var bgResult = addCSSStyle(colorLayer, "background-color", "", isInvalidColor, rgb2hex);
			if (bgResult)
				cssResult = cssResult.concat(bgResult);
			else { // may be gradient
				cssResult = addCSSStyle(colorLayer, "background-image", cssResult, "none", replaceAllrgb);
			}
		}
		
		// opacity
		cssResult = addCSSStyle(item, "opacity", cssResult, "1");
		
		// background image
		var imageLayer = item.find(".imageLayer").first();
		if (imageLayer.length == 1) {
			var imageR = addCSSStyle(imageLayer, "background-image", "", "none", buildBackgroundURL);
			if (imageR) {
				cssResult = cssResult.concat(imageR);
				cssResult = addCSSStyle(imageLayer, "background-size", cssResult, "auto");
				cssResult = addCSSStyle(imageLayer, "background-repeat", cssResult, "no-repeat");
				cssResult = addCSSStyle(imageLayer, "background-position", cssResult, "0% 0%");
				cssResult = addCSSStyle(imageLayer, "opacity", cssResult, "1", undefined, "background-image-opacity");
			}
		}
		
		// border
		var borderLayer = item.find(".borderLayer").first();
		if (borderLayer.length == 1) {
			var isInvalidBorder = function(value) {
				return value == false || value.length == 0 || value.includes("none");
			};
			
			var borderR = addCSSStyle(borderLayer, "border", "", isInvalidBorder, replaceAllrgb);
			if (borderR)
				cssResult = cssResult.concat(borderR);
			else {
				cssResult = addCSSStyle(borderLayer, "border-top", cssResult, isInvalidBorder, replaceAllrgb);
				cssResult = addCSSStyle(borderLayer, "border-right", cssResult, isInvalidBorder, replaceAllrgb);
				cssResult = addCSSStyle(borderLayer, "border-bottom", cssResult, isInvalidBorder, replaceAllrgb);
				cssResult = addCSSStyle(borderLayer, "border-left", cssResult, isInvalidBorder, replaceAllrgb);
			}
		}
		
		var backgroundLayer = item.find(".backgroundLayer").first();
		if (backgroundLayer.length == 1)
			cssResult = addCSSStyle(backgroundLayer, "border-radius", cssResult, "0px");
		
		// shape stroke
		if (item.hasClass("shapewrapper")) {
			var shape = item.find(".shape").first();
			if (shape) {
				var strokeR = addCSSStyle(shape, "stroke", "", "none", replaceAllrgb);
				if (strokeR) {
					cssResult = cssResult.concat(strokeR);
					cssResult = addCSSStyle(shape, "stroke-width", cssResult, "0px");
					cssResult = addCSSStyle(shape, "stroke-dasharray", cssResult, "none");
				}
			}
		}
		
		// padding
		var paddingLayer;
		if (item.hasClass("shapewrapper"))
			paddingLayer = item.find(".shape").first();
		else if (item.hasClass("panel"))
			paddingLayer = item.find("td.layout").first();
		else
			paddingLayer = item.find(".paddingLayer").first();
		
		if (paddingLayer.length == 1) {
			var paddingR = addCSSStyle(paddingLayer, "padding", "", "0px");
			if (paddingR)
				cssResult = cssResult.concat(paddingR);
		}
		
		// margin
		cssResult = addCSSStyle(item, "border-width", cssResult, "0px", undefined, "margin");
		
		// rotation
		cssResult = addCSSStyle(item, "transform", cssResult, isIdentity, matrixToAngle);
		
		// shadow
		cssResult = addCSSStyle(item, "filter", cssResult, "none", replaceAllrgb);
		cssResult = addCSSStyle(item, "text-shadow", cssResult, "none", replaceAllrgb);
		
		return cssResult;
	}
	
	function setPinString(item, vertical) {
		var pin = vertical ? jimPin.getVerticalPin(item) : jimPin.getHorizontalPin(item);
		var selector = "#developerPropertiesPalette #item" + (vertical ? "Y" : "X");
		if (pin != "none") {
			if (pin == "end") pin = "right";
			else if (pin == "beginning") pin = "left";
			
			$(selector + " .pinType").html("(Pin to " + pin + ")");
			$(selector).addClass("pinned");
			
		} else {
			$(selector + " .pinType").html("(Fixed)");
			$(selector).removeClass("pinned");
		}
	}
	
	function fillPropertiesPalette() {
		if ($selectedItem) {
			var itemID = getBareUserId($selectedItem);
			$("#itemUserId > span").html(itemID);

			// POSITION
			var position = getItemPosition($selectedItem);
			if ($selectedItem.hasClass("pin")) {
				$("#developerPropertiesPalette #itemPosition").addClass("pinned");
				setPinString($selectedItem, true);
				setPinString($selectedItem, false);
			} else {
				$("#developerPropertiesPalette #itemPosition").removeClass("pinned");
				$("#developerPropertiesPalette #itemX").removeClass("pinned");
				$("#developerPropertiesPalette #itemY").removeClass("pinned");
			}
			$("#developerPropertiesPalette #itemX > span.valueTag").html(position.x + "px");
			$("#developerPropertiesPalette #itemY > span.valueTag").html(position.y + "px");
			
			// SIZE
			var size = getItemSize($selectedItem);
			$("#developerPropertiesPalette #itemWidth > span:last-child").html(size.w);
			$("#developerPropertiesPalette #itemHeight > span:last-child").html(size.h);
			
			// VALUE
			var value = getItemValue($selectedItem);
			if (value) {
				$("#developerPropertiesPalette #devValue").show();
				$("#developerPropertiesPalette #devValueBox > span").html(value);
			} else
				$("#developerPropertiesPalette #devValue").hide();
			
			// FILE
			var imgFile = getImageContentFile($selectedItem);
			if (imgFile) {
				$("#developerPropertiesPalette #devFile").show();
				var fileName = imgFile.substring( imgFile.lastIndexOf("/") + 1);
				
				var fileFormat = $selectedItem.find("svg").length > 0 ? ".svg" : imgFile.substring(imgFile.lastIndexOf("."));
								
				$("#developerPropertiesPalette #devFileURL").html(itemID + fileFormat);
				$("#developerPropertiesPalette #devFile a").attr("href", imgFile);
				$("#developerPropertiesPalette #devFile a").attr("download", itemID + fileFormat);
				$("#devFileSeparator").show();
				
			} else {
				$("#developerPropertiesPalette #devFile").hide();
				$("#devFileSeparator").hide();
			}
			
			// CSS
			var css = getItemCSS($selectedItem);
			if (css.length == 0) {
				$("#devCSSBox").html("");
				$("#devCSS").css("display", "none");
			} else {
				$("#devCSSBox").html(css);
				$("#devCSS").css("display", "");
			}
		}
	}
	
	// END CSS FUNCTIONS
	
	// DECLARE LISTENERS
	var mouseEnterListener = function(event) {
		var $hoveredItem = getSelectableItem(event);
		if ($hoveredItem) {
			hoverItem($hoveredItem);
		}
	};
	
	var mouseLeaveListener = function(event) {
		var $hoveredItem = getSelectableItem(event);
		if ($hoveredItem) {
			$hoveredItem.removeClass(hoverClass);
			
			if (itemStack[itemStack.length - 1] && itemStack[itemStack.length - 1].attr("id") == $hoveredItem.attr("id")) {
				itemStack.pop();
				hoverItem(itemStack[itemStack.length - 1]);
			} else {
				var index = findIndex(itemStack, function($i) {return $hoveredItem.attr("id") == $i.attr("id")});
				if (index >= 0)
					itemStack.splice(index, 1);
			}
		}
	};
	
	var clickListener = function(event) {
		var $selectableItem = getSelectableItem(event);
		if ($selectableItem) {
			if ($selectedItem)
				$selectedItem.removeClass(selectedClass);

			deleteAllSmartGuides();
			deleteAllHoveredGuides();
			
			if (!$selectableItem.hasClass("canvas")) {
				$selectedItem = $selectableItem;
				$selectedItem.addClass(selectedClass);
				updateSmartGuides($selectedItem, getFirerParent($selectedItem));
			} else
				$selectedItem = undefined;
			
			// TODO trigger properties palette
			fillPropertiesPalette();
		}
		
		if (!$selectedItem) { 
			$("#sidepanel").removeClass("devProperties");
		    $("#navigationFolder").resizable({disabled : true});
		    $("#navigationFolder").attr("style", "");
		} else {
			$("#sidepanel").addClass("devProperties");
			$("#navigationFolder").resizable({disabled: false, handles : "s",
				minHeight : 150,
				stop : function () {$("#navigationFolder").css("width", "auto");}});
		}
		
		if ($selectableItem.hasClass("text") && $selectableItem.find("input").length) {
			$selectableItem.find("input").blur();
		}
		return false;
	};
	
	// END LISTENERS

	// TODO toggle this
	window.jimDevelopers = {
		"isActive" : function() {
			return Boolean(active);
		},
		"setActive" : function(activate) {
			active = activate;
			if (active && $("#developersLayer").length == 0) {
				$("#simulation").addClass("developersMode");
				$("#simulation > .ui-page > .canvas:last-child > #backgroundBox").prepend(developersLayer);
				$("#simulation").on("mouseleave", function (event) {$("#developersLayer").html("");})
								.on("mouseenter", ".firer", mouseEnterListener)
							   	.on("mouseleave", ".firer", mouseLeaveListener)
							   	.on("click", ".firer", clickListener); 
				if ($("#sidepanel").hasClass("close"))
					$("#sidepanel").trigger("openPane");
			} else {
				$("#simulation").removeClass("developersMode");
				$("#simulation > .ui-page > .canvas > #backgroundBox > #developersLayer").remove();
				$("#sidepanel").removeClass("devProperties");
				$(".developer-selected-class").removeClass("developer-selected-class");
				$("#simulation").off("mouseenter", mouseEnterListener)
			   					.off("mouseleave", mouseLeaveListener)
			   					.off("click", clickListener);
				$selectedItem = undefined;
				$currentHover = undefined;
				itemStack = new Array();
			}
		},
		"triggerNavigation" : function() {
			if (active) {
				$("#simulation > .ui-page > .canvas:last-child > #backgroundBox").prepend(developersLayer);
				$("#simulation").addClass("developersMode");
				itemStack = new Array();
				$currentHover = undefined;
				$selectedItem = undefined;
			}
		}
	};

})(window);