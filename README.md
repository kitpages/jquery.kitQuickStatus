kitQuickStatus jQuery plugin
============================

[![Build Status](https://travis-ci.org/kitpages/jquery.kitQuickStatus.png?branch=master)](https://travis-ci.org/kitpages/jquery.kitQuickStatus)

![Screenshot](https://raw.github.com/kitpages/jquery.kitQuickStatus/tree/master/doc/screenshot.png)

This plugins is a simple widget that allows you to quickly select a status in a list of predefined status.

How to use it ?
---------------

```html
<!-- creates the link that contains the initial value
<a data-key="new" class="status">changed by the plugin</a>

<!-- load jquery and plugin -->
<script src="../lib/jquery-1.9.1.min.js"></script>
<script src="../jquery.kitQuickStatus.js"></script>

<!-- instanciates the plugin -->
<script>
    $('.status').kitQuickStatus({
        statusList: {
            new: {
                label:"New",
                background_color:"#FFA800",
                color:"#333"
            },
            payed: {
                label:"Payed",
                background_color: "#80FF80",
                color:"#333"
            }
        },
        menuWidth: "160px", // width of the menu
        postUrl: "postAjax.php" // url where the post request is sent
    });
</script>
```

```php
<?php
$key = $_POST["key"];
// do something great
echo json_encode(array("key"=>$key));
```

Features
--------

* displays a menu
* calls an ajax POST request to update the value
* highly configurable with events

LICENSE
-------

BSD (see in this directory)

AUTHOR
------

Philippe Le Van, Kitpages, http://www.kitpages.fr
twitter : plv

History - versions
------------------

2013/04/10 : first version

Requirements
---------------

jquery 1.9.x (should work with older versions)

Configurations
--------------

List of the default options and the meaning of each option.

```javascript
$(".status-element").kitQuickStatus({
    statusList: {  // list of status. The key is the value exchanged with the server
        "initialized": {
            label: "Initialized",
            background_color: "#000080",
            color: "#FFF"
        },
        "key1": {
            label: "label 1",
            background_color: "#FF0000",
            color: "#FFF"
        },
        "key2": {
            label: "label 2",
            background_color: "#00FF00",
            color: "#FFF"
        }
    },
    useDefaultStyle: true, // use default style hardcoded in the javascript.
    postUrl: null, // URL where new key is posted. If null, no request is sent
    menuWidth: null, // width of the popup menu. Could be "200px" or "10%"
    // callback that can be used
    open: null, // triggered before menu opens
    close: null, // triggered before menu closes
    closeAll: null, // triggered before calling close events on all widget on the page
    select: null, // triggered before action on the click of the user on a new status
    change: null // triggered when the status is changed (after the ajax request if there is an ajax request)
});
```

Events
------

This javascript extracted from unit tests lists the events of this widget :

```javascript
var element = $('<a id="el" data-key="initialized"></a>');
element.kitQuickStatus({
    statusList: {
        initialized: {
            label: "Init",
            color: "#FFF",
            background_color: "#000080"
        },
        payed: {
            label: "Payed",
            color: "#333",
            background_color: "#00FF00"
        }
    }
});
var widget = element.data("kitQuickStatus");

var openCallback = function(event, data) {
    console.log("mouseX Position="+data.x);
    console.log("mouseY Position="+data.y);
    ok(true, "true callback");
};
var closeAllCallback = function(event) {
    ok(true, "close all callback");
};
var closeCallback = function(event) {
    ok(true, "close callback");
};
var selectCallback = function(event, data) {
    ok(true, "select callback");
    equal(data.key, "payed", "new value should be payed");
};
var changeCallback = function(event, data) {
    ok(true, "change callback");
    equal(data.key, "payed", "new value should be payed");
};
element.on("open_kitQuickStatus", openCallback);
element.on("close_kitQuickStatus", closeCallback);
element.on("closeAll_kitQuickStatus", closeAllCallback);
element.on("select_kitQuickStatus", selectCallback);
element.on("change_kitQuickStatus", changeCallback);
// open menu
element.click();
// select the "payed" item
element.find('.kit-quick-status-menu a[data-key="payed"]').click();

equal(element.attr("data-key"), "payed", "new data-key should be modified to payed value");
```

You can always prevent the widget to execute it's default code by using event.preventDefault().