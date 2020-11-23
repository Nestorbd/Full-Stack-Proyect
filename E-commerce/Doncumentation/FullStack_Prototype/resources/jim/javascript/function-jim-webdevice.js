(function (window, undefined) {
    'use strict';

    jQuery.fn.extend({
        customMenu: function (options) {
            var defaults = {
                    customClass: 'customMenu'
            },
            options = $.extend(defaults, options),
            prefix = options.customClass,
            $mainDiv = $(this),
            $menu = $mainDiv.children("ul");
            document.getElementById("topInfo").appendChild($menu[0]);
			      var $webdeviceOptions = $(this).closest(".webdevice-options");

			      $mainDiv.on("click",function(){
        				if (!jimComments.commentsMode && $(".ui-scenario").length <= 0) {
        					if(!$webdeviceOptions.hasClass("open")){
        						$webdeviceOptions.addClass("open");
        						$menu.css('left',$webdeviceOptions[0].offsetLeft);
        						$menu.show('slide',{direction:'up'},500);
        					}
        					else jimWebDevice.hideWebDeviceMenu($menu, $webdeviceOptions);
        				}
            });

           var $options = $menu.children("li");
           //$options.mouseup(function () {
			     $options.on("click",function(){
				        jimWebDevice.hideWebDeviceMenu($menu, $webdeviceOptions);
          			var $option = $(this);
          			var value = $option[0].attributes["value"].value;
                var text = $option[0].attributes["selectortext"].value;
                $('#webdevice-selector-text')[0].innerText = text;

                jimWebDevice.updateTextCanvasWidth($(".ui-page-active").attr("devicewidth"));
                jimWebDevice.setCurrentWebDeviceWidth();
               	if(!jimDevice.isMobile()) // Ghost scrollbars when using masters with pin
            		jimPin.relayout();
                jimLayout.relayoutContent(true);
      		  });
      			$("body").mousedown(function(event){
      				if($(event.target).closest(".webdevice-options").length || $(event.target).closest("#webdevice-selector-menu").length)return;
        				if($webdeviceOptions.hasClass("open")){
      					     jimWebDevice.hideWebDeviceMenu($menu, $webdeviceOptions);
      				  }
      			});

      			window.onresize = function(event){
      				if($webdeviceOptions.hasClass("open") && !$webdeviceOptions.hasClass("closing"))
      					jimWebDevice.hideWebDeviceMenu($menu, $webdeviceOptions);
      			};
        }
    });



    var jimWebDevice = {
    	"hideWebDeviceMenu": function($menu, $webdeviceOptions) {
        $webdeviceOptions.addClass("closing");
        $menu.hide('slide',{direction:'up',duration:500, complete: function () {
          $webdeviceOptions.removeClass("open");
          $webdeviceOptions.removeClass("closing");
        }});
    	},
      "hideWebdeviceOption": function() {
        $(".webdevice-options").css("display","none");
        $("#webdevice-selector").css("display","none");
        $(".rightcontrols .comments-separator").first().css("display","none");
    	},
      "showWebdeviceOption": function() {
        $(".webdevice-options").css("display","inline-block");
        $("#webdevice-selector").css("display","inline-block");
        $(".rightcontrols .comments-separator").first().css("display","inline-block");
      },
      "setCurrentWebDeviceWidth": function($page) {
        if($('#webdevice-selector-text')[0].innerText === "Full Browser Width"){
            $("#jim-web").css("width","100%");
        }else{
          if($page===undefined)
            $page = $(".ui-page-active");
          var deviceWidth = $page.attr("devicewidth");
          $("#jim-web").css("width",deviceWidth+"px");
        }
        $("#jim-web").css("height","100%");
      },
      "updateCanvasWidth": function($page) {
        var deviceWidth = $page.attr("devicewidth");
        $('#webdevice-selector-menu').children("li")[0].innerText = "Original screen's width ("+deviceWidth+")";
        jimWebDevice.updateTextCanvasWidth(deviceWidth);
      },
      "updateTextCanvasWidth": function(deviceWidth) {
          if($('#webdevice-selector-text')[0].innerText !== "Full Browser Width")
            $('#webdevice-selector-text')[0].innerText = "Original Width ("+deviceWidth+")";
      },
      "isOriginalWidthSelected": function() {
          if(jimUtil.isMobileDevice())
            return false;
          if($('#webdevice-selector-text')[0].innerText === "Full Browser Width")
            return false;
          return true;
      }
    };


    /* expose utilities to the global object */
    window.jimWebDevice = jimWebDevice;
  })(window);
