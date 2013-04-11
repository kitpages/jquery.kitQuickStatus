/*!
 * Open source under the BSD License
 * Copyright (c) 2011, Philippe Le Van, Kitpages, http://www.kitpages.fr
 */
(function( $ ){
    
    var WidgetQuickStatus = (function() {
        // constructor
        function WidgetQuickStatus(boundingBox, options) {
            this._settings = {
                statusList: {
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
                        label: "label 1",
                        background_color: "#00FF00",
                        color: "#FFF"
                    }
                }, // list of status of the
                useDefaultStyle: true,
                postUrl: null, // URL where new key is posted
                menuWidth: null, // could be "200px" or "10%"
                // events
                open: null, // before menu opens
                close: null, // when the menu is closed (selected or canceled)
                closeAll: null, // when the menu is closed (selected or canceled)
                select: null, // after an item was selected and line value changed
                change: null // after an item was selected and line value changed
            };
            // settings
            if (options) {
                $.extend(this._settings, options);
            }
            
            // DOM Nodes
            this._boundingBox = boundingBox;
            this._boundingBox.addClass("kit-quick-status");
            this._menu = null;
            // memory
            this._boundingBox.data( "kitQuickStatus", this );

            this.init();
        };
        
        // methods
        WidgetQuickStatus.prototype = {
            init: function() {
                var self = this;
                
                var eventList = [ 'open', 'select', 'close', 'closeAll', 'change'];
                // init custom events according to settings callback values
                for (var i = 0 ; i < eventList.length ; i++ ) {
                    if (this._settings[eventList[i]]) {
                        this._boundingBox.bind(eventList[i]+"_kitQuickStatus", {self:self}, this._settings[eventList[i]]);
                    }
                }
                
                // init custom events according to settings callback values
                for (var i = 0 ; i < eventList.length ; i++ ) {
                    var callbackName = "_"+eventList[i]+"Callback";
                    this._boundingBox.bind(eventList[i]+"_kitQuickStatus", {self:self}, this[callbackName]);
                }

                // register styles :
                if (self._settings.useDefaultStyle) {
                    $.each(self._settings.statusList, function(key, val) {
                        var selection = $('*[data-key="'+key+'"]');
                        if (val.background_color) {
                            selection.css({"background-color": val.background_color})
                        } else {
                            selection.css({"background-color": "#666"})
                        }
                        if (val.color) {
                            selection.css({"color": val.color})
                        } else {
                            selection.css({"color": "#FFF"})
                        }
                        selection.css({
                            "display": "block",
                            "border-radius": "4px",
                            "font-weight": "bold",
                            "cursor": "pointer",
                            "padding": "2px 5px",
                            "text-decoration": "none"
                        });
                        selection.html(val.label);
                    });
                }


                // register native events
                $("html").keydown($.proxy(this.keydownCallback, this));
                $("html").click($.proxy(this.bodyClickCallback, this));
                this._boundingBox.on("click.quickStatus", $.proxy(this.clickCallback, this));
                
            },

            ////
            // native event callbacks
            ////
            keydownCallback: function (event) {
                // escape
                if (event.keyCode == '27') {
                    this.closeAll();
                    return;
                }
            },
            bodyClickCallback: function (event) {
                this.closeAll();
            },
            clickCallback: function (event) {
                event.stopPropagation();
                event.preventDefault();
                var offset = $(event.currentTarget).offset();
                var x = event.pageX - offset.left;
                var y = event.pageY - offset.top;
                if (this._menu) {
                    this.close();
                } else {
                    this.open(x,y);
                }
            },
            selectCallback: function (event) {
                event.stopPropagation();
                event.preventDefault();
                var aEl = $(event.currentTarget);
                this.select(aEl.attr("data-key"));
            },
            ajaxChangeCallback: function (data) {
                var key = data.key;
                this.change(key);
            },

            ////
            // methods
            ////
            close: function() {
                this._boundingBox.trigger("close_kitQuickStatus");
            },
            closeAll: function() {
                this._boundingBox.trigger("closeAll_kitQuickStatus");
            },
            open: function(x, y) {
                this._boundingBox.trigger("open_kitQuickStatus", {x:x, y:y});
            },
            select: function(key) {
                this._boundingBox.trigger("select_kitQuickStatus", {key: key});
            },
            change: function(key) {
                this._boundingBox.trigger("change_kitQuickStatus", {key: key});
            },

            ////
            // widget event callbacks
            ////
            _openCallback: function(event, data) {
                if (event.isDefaultPrevented()) {
                    return;
                }
                var self = $(this).data("kitQuickStatus");
                // remove old menus
                self.closeAll();
                // create new menu
                self._menu = $('<div class="kit-quick-status-menu"></div>');
                self._menu.append('<ul></ul>');

                $.each(self._settings.statusList, function(key, val) {
                    var liEl = $('<li></li>');
                    var aEl = $('<a data-key="'+key+'">'+val.label+'</a>');
                    if (val.background_color) {
                        aEl.css({"background-color": val.background_color})
                    } else {
                        aEl.css({"background-color": "#666"})
                    }
                    if (val.color) {
                        aEl.css({"color": val.color})
                    } else {
                        aEl.css({"color": "#FFF"})
                    }
                    liEl.append(aEl);
                    self._menu.find("ul").append(liEl);
                });
                self._menu.delegate("a", "click", $.proxy(self.selectCallback, self));

                if (self._settings.useDefaultStyle) {
                    $(this).css({
                        "display": "block",
                        "position": "relative"
                    });
                    var xPos = "10%";
                    if (data.x) {
                        xPos = data.x + "px";
                    }
                    self._menu.css({
                        "position": "absolute",
                        "top": ($(this).height() / 2)+"px",
                        "left": xPos,
                        "background-color": "#FFF",
                        "border": "1px solid #DDD",
                        "padding": "5px",
                        "z-index": "50"
                    });
                    if (self._settings.menuWidth) {
                        self._menu.css({ width: self._settings.menuWidth });
                    } else {
                        self._menu.css({ width: self._boundingBox.width()+"px" });
                    }
                    self._menu.find("ul").css({
                        "list-style": "none",
                        "padding": "0px",
                        "margin": "0px"
                    });
                    self._menu.find("ul > li").css({
                        "padding": "1px 4px",
                        "margin": "0px"
                    });
                    self._menu.find("ul > li > a").css({
                        "display": "block",
                        "border-radius": "4px",
                        "font-weight": "bold",
                        "cursor": "pointer",
                        "padding": "2px 5px",
                        "text-decoration": "none"
                    });
                }

                $(this).append(self._menu);
            },
            _closeCallback: function(event) {
                if (event.isDefaultPrevented()) {
                    return;
                }
                var self = $(this).data("kitQuickStatus");
                // remove old menus
                if (self._menu) {
                    self._menu.remove();
                    self._menu = null;
                }
            },
            _closeAllCallback: function(event) {
                if (event.isDefaultPrevented()) {
                    return;
                }
                var self = $(this).data("kitQuickStatus");
                // remove old menus
                $(".kit-quick-status").each(function() {
                    $(this).data("kitQuickStatus").close();
                });

            },
            _selectCallback: function(event, data) {
                if (event.isDefaultPrevented()) {
                    return;
                }
                var self = $(this).data("kitQuickStatus");
                self.close();
                self._boundingBox.css({
                    "background-color": "#666",
                    "color": "#FFF"
                });
                self._boundingBox.html("Chargement...");
                if (self._settings.postUrl) {
                    $.ajax({
                        url: self._settings.postUrl,
                        type: "POST",
                        data: {key: data.key},
                        dataType: "json",
                        success: $.proxy(self.ajaxChangeCallback, self)
                    });
                } else {
                    self.change(data.key);
                }
            },
            _changeCallback: function(event, data) {
                if (event.isDefaultPrevented()) {
                    return;
                }
                var self = $(this).data("kitQuickStatus");
                var val = self._settings.statusList[data.key];
                self._boundingBox.attr("data-key", data.key);
                self._boundingBox.html(val.label);
                if (val.background_color) {
                    self._boundingBox.css({"background-color": val.background_color})
                } else {
                    self._boundingBox.css({"background-color": "#666"})
                }
                if (val.color) {
                    self._boundingBox.css({"color": val.color})
                } else {
                    self._boundingBox.css({"color": "#FFF"})
                }

            }

        };
        return WidgetQuickStatus;
    })();

    var methods = {
        init : function ( options ) {
            var self = $(this);
            // chainability => foreach
            return this.each(function() {
                var widget = new WidgetQuickStatus($(this), options);
            });
        }
    }

    $.fn.kitQuickStatus = function( node ) {
        return methods.init.apply( this, arguments );
    };
})( jQuery );

