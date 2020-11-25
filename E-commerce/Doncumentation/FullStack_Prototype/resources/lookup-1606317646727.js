(function(window, undefined) {
  var dictionary = {
    "252f04c5-aedd-4a24-b5ca-fdc57db8b3bb": "Fail_login",
    "b92eb704-6840-4feb-b512-57bdc5f3dcba": "Profile",
    "e162bb4d-7f4f-4d87-b699-39f1af4d8c83": "Inicio_loged",
    "4855fd9e-cc2e-49ac-a306-efff304ce590": "cart",
    "b331bd95-8e3d-4eb6-a74d-7ab2536cc949": "product_view",
    "489285b0-3ffc-409d-b31b-831329352d74": "Login",
    "3337638c-d631-47f8-b0eb-5bbfffd4f3f3": "Fail_update",
    "712d5962-7a1d-43ef-bb99-f24e5496ec88": "Update",
    "d12245cc-1680-458d-89dd-4f0d7fb22724": "Inicio",
    "f39803f7-df02-4169-93eb-7547fb8c961a": "Template 1",
    "bb8abf58-f55e-472d-af05-a7d1bb0cc014": "default"
  };

  var uriRE = /^(\/#)?(screens|templates|masters|scenarios)\/(.*)(\.html)?/;
  window.lookUpURL = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, url;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      url = folder + "/" + canvas;
    }
    return url;
  };

  window.lookUpName = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, canvasName;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      canvasName = dictionary[canvas];
    }
    return canvasName;
  };
})(window);