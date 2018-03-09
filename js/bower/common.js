M.define("InputListener", function (c, b, d) {
    var a = {
        listen: function (f, e) {
            f = $(f);
            f.each($.proxy(function (g, h) {
                h = $(h);
                if (!h.is("input") && !h.is("textarea")) {
                    throw new Error("input listener only apply to input or textarea")
                }
                this.initListen(h, e)
            }, this))
        }, unlisten: function (e) {
            e = $(e);
            e.each($.proxy(function (h, k) {
                k = $(k);
                if (!k.is("input") && !k.is("textarea")) {
                    throw new Error("input listener only apply to input or textarea")
                }
                if (arguments.length == 1) {
                    k.unbind("focus", this.getStartListenFunc());
                    k.unbind("blur", this.getStopListenFunc());
                    k.removeData("__input_listener_handlers")
                } else {
                    if (typeof arguments[1] == "function") {
                        var j = arguments[1], g = k.data("__input_listener_listeninterval");
                        for (var h = 0, f = g.length; h < f; h++) {
                            if (g[h] == j) {
                                g.splice(h, 1);
                                h--
                            }
                        }
                    }
                }
            }, this))
        }, initListen: function (f, e) {
            f.data("__input_listener_currentval", f.val());
            if (!f.data("__input_listener_handlers")) {
                this.bindListenEvent(f)
            }
            this.addListenHandler(f, e)
        }, bindListenEvent: function (e) {
            e.data("__input_listener_handlers", []);
            e.focus(this.getStartListenFunc());
            e.blur(this.getStopListenFunc())
        }, getStartListenFunc: function () {
            if (!this.bindStartListenFunc) {
                this.bindStartListenFunc = $.proxy(this.startListen, this)
            }
            return this.bindStartListenFunc
        }, getStopListenFunc: function () {
            if (!this.bindStopListenFunc) {
                this.bindStopListenFunc = $.proxy(this.stopListen, this)
            }
            return this.bindStopListenFunc
        }, startListen: function (e) {
            var f = $(e.target);
            f.data("__input_listener_currentval", f.val());
            f.data("__input_listener_listeninterval", setInterval($.proxy(function () {
                var h = f.data("__input_listener_currentval"), g = f.val();
                if (h != g) {
                    f.data("__input_listener_currentval", g);
                    this.triggerListenHandler(f)
                }
            }, this), 100))
        }, stopListen: function (e) {
            var f = $(e.target);
            clearInterval(f.data("__input_listener_listeninterval"))
        }, addListenHandler: function (f, e) {
            if (typeof e == "function") {
                f.data("__input_listener_handlers").push(e)
            }
        }, triggerListenHandler: function (h) {
            var f = h.data("__input_listener_handlers");
            for (var g = 0, e = f.length; g < e; g++) {
                f[g].call(null, {target: h.get(0)})
            }
        }
    };
    return a
});
M.define("dialog/Layer", function (a) {
    var g = 0, f = 550, d = (function () {
        return $.browser.msie && parseInt($.browser.version, 10) == 7
    }()), c = (function () {
        return $.browser.msie && parseInt($.browser.version, 10) < 7
    }());

    function b() {
        return g++
    }

    function e(h) {
        this.opacity = 0.8;
        this.background = "#fff";
        this.impl = "Dialog";
        this.fixed = true;
        M.mix(this, h);
        this.id = "_j_layer_" + b();
        this.stacks = [];
        this.activeStackId = null;
        this.overflow = false;
        this.changeFixed = false;
        e.instances[this.id] = this;
        if (!e[this.impl]) {
            e[this.impl] = []
        }
        e[this.impl].push(this.id);
        this.init()
    }

    e.prototype = {
        init: function () {
            this._createPanel()
        }, _createPanel: function () {
            f++;
            var h = {
                position: (!c && this.fixed) ? "fixed" : "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0
            }, j = M.mix({}, h, {"z-index": f, display: "none"}), k = M.mix({}, h, {
                position: !c ? "fixed" : "absolute",
                background: this.background,
                opacity: this.opacity,
                "z-index": -1
            }), i = M.mix({}, h, {"z-index": 0}, (!c && this.fixed) ? {
                "overflow-x": "hidden",
                "overflow-y": "hidden"
            } : {overflow: "visible"});
            this._panel = $('<div id="' + this.id + '" class="layer _j_layer">                                <div class="layer_mask _j_mask"></div>                                <div class="layer_content _j_content"></div>                            </div>').css(j).appendTo("body");
            this._mask = this._panel.children("._j_mask").css(k);
            this._content = this._panel.children("._j_content").css(i)
        }, setZIndex: function (h) {
            f = h;
            this._panel.css("z-index", f)
        }, toFront: function () {
            this.setZIndex(f + 1)
        }, setFixed: function (h) {
            h = !!h;
            if (this.fixed != h) {
                this.changeFixed = true;
                this.fixed = h;
                if (!c && this.fixed) {
                    this._panel.css("position", "fixed");
                    this._content.css({position: "fixed", "overflow-x": "hidden", "overflow-y": "hidden"})
                } else {
                    this._panel.css("position", "absolute");
                    this._content.css({position: "absolute", "overflow-x": "", "overflow-y": "", overflow: "visible"})
                }
            } else {
                this.changeFixed = false
            }
        }, newStack: function (i) {
            var h = $(i).appendTo(this._content);
            this.stacks.push(h);
            return this.stacks.length - 1
        }, getStack: function (h) {
            return this.stacks[h]
        }, getActiveStack: function () {
            return this.stacks[this.activeStackId]
        }, setActiveStack: function (h) {
            this.activeStackId = h
        }, getPanel: function () {
            return this._panel
        }, getMask: function () {
            return this._mask
        }, show: function (j) {
            var i = this;
            if (this.visible) {
                typeof j === "function" && j();
                return
            }
            e.activeId = this.id;
            this.visible = true;
            if (c) {
                var h = document.documentElement && document.documentElement.scrollHeight || document.body.scrollHeight;
                this._panel.css("height", h);
                this._mask.css("height", h)
            }
            this._panel.fadeIn(200, function () {
                typeof j === "function" && j()
            })
        }, hide: function (i) {
            var h = this;
            if (!this.visible) {
                typeof i === "function" && i();
                return
            }
            this.visible = false;
            if (c) {
                this._panel.css("height", "");
                this._mask.css("height", "")
            }
            this._panel.fadeOut(200, function () {
                typeof i === "function" && i();
                h._recoverTopScroller()
            })
        }, setOverFlow: function (h) {
            this.overflow = h;
            if (h) {
                if (!c && this.fixed) {
                    this._hideTopScroller();
                    this._content.css("overflow-y", "auto")
                }
            } else {
                if (!c && this.fixed) {
                    this._content.css("overflow-y", "hidden")
                }
            }
        }, _hideTopScroller: function () {
            if (d) {
                $("html").css("overflow", "hidden")
            } else {
                if (!c) {
                    $("body").css("overflow", "hidden")
                } else {
                    $("body").css("overflow-x", "hidden");
                    this._panel.height($(document).height() + 20)
                }
            }
        }, _recoverTopScroller: function () {
            if (d) {
                $("html").css("overflow", "")
            } else {
                if (!c) {
                    $("body").css("overflow", "")
                } else {
                    $("body").css("overflow-x", "")
                }
            }
        }, destroy: function () {
            this.hide($.proxy(function () {
                this._panel && this._panel.remove();
                this._panel = null;
                if (M.indexOf(e[this.impl], this.id) != -1) {
                    e[this.impl].splice(M.indexOf(e[this.impl], this.id), 1)
                }
                delete e.instances[this.id]
            }, this))
        }, clear: function () {
            this._content.empty();
            this.stacks = [];
            this.activeStackId = null
        }
    };
    e.instances = {};
    e.activeId = null;
    e.getInstance = function (h) {
        return e.instances[h]
    };
    e.getActive = function (h) {
        var i = e.getInstance(e.activeId);
        if (h && i) {
            i = i.impl === h ? i : null
        }
        return i
    };
    e.getImplInstance = function (i) {
        var h = e.getActive(i);
        if (!h && M.is(e[i], "Array") && e[i].length) {
            h = e.getInstance(e[i][e[i].length - 1])
        }
        return h
    };
    e.closeActive = function () {
        var h = e.getActive();
        if (h && h.getActiveStack()) {
            h.getActiveStack().trigger("close")
        }
    };
    $(document).keyup(function (h) {
        if (h.keyCode == 27) {
            e.closeActive()
        }
    });
    $(document).unload(function () {
        M.forEach(e.instances, function () {
            e.destroy()
        })
    });
    return e
});
M.define("dialog/DialogBase", function (b) {
    var e = b("dialog/Layer"), a = M.Event, d = (function () {
        return $.browser.msie && parseInt($.browser.version, 10) < 7
    }());

    function c(f) {
        this.newLayer = false;
        this.width = "";
        this.height = "";
        this.background = "#000";
        this.panelBackground = "#fff";
        this.bgOpacity = 0.7;
        this.stackable = true;
        this.fixed = true;
        this.reposition = false;
        this.autoPosition = true;
        this.minTopOffset = 20;
        this.layerZIndex = -1;
        this.impl = "Dialog";
        M.mix(this, f);
        this.visible = false;
        this.destroyed = false;
        this.positioned = false;
        this.resizeTimer = 0;
        this.init()
    }

    c.prototype = {
        tpl: "<div />", init: function () {
            this._createDialog();
            this._bindEvents()
        }, _createDialog: function () {
            this._panel = $(this.tpl).css({
                position: "absolute",
                opacity: 0,
                display: "none",
                background: this.panelBackground,
                "z-index": 0
            });
            this.setRect({width: this.width, height: this.height});
            this._layer = !this.newLayer && e.getImplInstance(this.impl) || new e({impl: this.impl});
            if (this.layerZIndex >= 0) {
                this._layer.setZIndex(this.layerZIndex)
            }
            this._layer.setFixed(this.fixed);
            this._layer.getMask().css({background: this.background, opacity: this.bgOpacity});
            this._stackId = this._layer.newStack(this._panel);
            this.setPanelContent()
        }, _bindEvents: function () {
            var f = this;
            $(window).resize($.proxy(this.resizePosition, this));
            M.Event(this).on("resize", $.proxy(this.resizePosition, this));
            this._panel.delegate("._j_close, a[data-dialog-button]", "click", function (g) {
                var h = $(g.currentTarget).attr("data-dialog-button");
                if (h == "hide") {
                    f.hide()
                } else {
                    f.close()
                }
                g.preventDefault()
            });
            this._panel.bind("close", function (g, h) {
                f.close(h)
            })
        }, resizePosition: function () {
            var f = this;
            clearTimeout(this.resizeTimer);
            if (f.visible && f.autoPosition) {
                this.resizeTimer = setTimeout(function () {
                    f.setPosition()
                }, 100)
            }
        }, addClass: function (f) {
            this._panel.addClass(f)
        }, removeClass: function (f) {
            this._panel.removeClass(f)
        }, setRect: function (f) {
            if (f.width) {
                this._panel.css("width", f.width);
                this.width = f.width
            }
            if (f.height) {
                this._panel.css("height", f.height);
                this.height = f.height
            }
        }, getPanel: function () {
            return this._panel
        }, getLayer: function () {
            return this._layer
        }, getMask: function () {
            return this._layer && this._layer.getMask()
        }, setPanelContent: function () {
        }, _getPanelRect: function () {
            var f = this.getPanel().clone().css({
                position: "absolute",
                visibility: "hidden",
                display: "block"
            }).appendTo("body"), g = f.outerHeight(), h = f.outerWidth();
            f.remove();
            return {height: g, width: h}
        }, _getNumric: function (f) {
            f = parseInt(f, 10);
            return isNaN(f) ? 0 : f
        }, setPosition: function (f) {
            var g = this._getPanelRect(), h = {width: $(window).width(), height: $(window).height()};
            var k = (h.width - (this._getNumric(this.width) > 0 ? this._getNumric(this.width) : g.width)) / 2, j = (h.height - (this._getNumric(this.height) > 0 ? this._getNumric(this.height) : g.height)) * 2 / 5;
            j = j < this.minTopOffset ? this.minTopOffset : j;
            if (d || !this.fixed) {
                var i = $(window).scrollTop();
                if (i > 0) {
                    j += i
                }
            }
            f = {left: (f && f.left) || k, top: (f && f.top) || j};
            if (!d && this.fixed) {
                if (h.height - g.height <= f.top) {
                    this.getPanel().addClass("dialog_overflow");
                    this._layer.setOverFlow(true)
                } else {
                    this.getPanel().removeClass("dialog_overflow");
                    this._layer.setOverFlow(false)
                }
            }
            var l = this.positioned ? "animate" : "css";
            $.fn[l].call(this.getPanel(), f, 200);
            this.positioned = true;
            this.position = f
        }, setFixed: function (f) {
            this.fixed = !!f;
            this._layer.setFixed(this.fixed)
        }, getPosition: function () {
            return this.position
        }, show: function (f) {
            if (this.visible) {
                return
            }
            var h = this;
            a(this).fire("beforeshow");
            var g;
            if (this._layer.getActiveStack()) {
                g = this._layer.getActiveStack();
                if (!this.reposition && !f && !this._layer.changeFixed) {
                    f = this._layer.getActiveStack().position()
                }
            }
            this._layer.show();
            this.getPanel().css({display: "", "z-index": 1});
            this.setPosition(f);
            g && g.trigger("close", [true]);
            this.visible = true;
            this._layer.setActiveStack(this._stackId);
            this.getPanel().animate({opacity: 1}, {
                queue: false, duration: 200, complete: function () {
                    a(h).fire("aftershow")
                }
            })
        }, close: function () {
            var f = this.stackable ? "hide" : "destroy";
            this[f].apply(this, Array.prototype.slice.call(arguments))
        }, hide: function (g, f) {
            if (typeof g == "function") {
                f = g;
                g = undefined
            }
            if (!this.visible) {
                typeof f == "function" && f();
                return
            }
            a(this).fire("beforeclose");
            a(this).fire("beforehide");
            this._layer.setActiveStack(null);
            this.visible = false;
            if (!g) {
                this._layer.hide()
            }
            this.getPanel().animate({opacity: 0}, {
                queue: false, duration: 200, complete: $.proxy(function () {
                    this.getPanel().css({display: "none", "z-index": 0});
                    a(this).fire("afterhide");
                    a(this).fire("afterclose");
                    typeof f == "function" && f()
                }, this)
            })
        }, destroy: function (g, f) {
            if (typeof g == "function") {
                f = g;
                g = undefined
            }
            if (this.destroyed) {
                M.error("Dialog already destroyed!");
                typeof f == "function" && f();
                return
            }
            a(this).fire("beforeclose");
            a(this).fire("beforedestroy");
            this.destroyed = true;
            this.hide(g, $.proxy(function () {
                if (this._panel.length) {
                    this._panel.undelegate();
                    this._panel.unbind();
                    this._panel.remove();
                    this._panel = null
                }
                this._layer = null;
                a(this).fire("afterdestroy");
                a(this).fire("afterclose");
                typeof f == "function" && f()
            }, this))
        }
    };
    return c
});
M.define("dialog/Dialog", function (c) {
    var d = c("dialog/DialogBase"), a = '<div class="popup-box layer_dialog _j_dialog pop_no_margin">                    <div class="dialog_title" style="display:none"><div class="_j_title title"></div></div>                    <div class="dialog_body _j_content"></div>                    <a id="popup_close" class="close-btn _j_close"><i></i></a>                </div>';
    var b = M.extend(function (e) {
        this.content = "";
        this.title = "";
        this.PANEL_CLASS = "";
        this.MASK_CLASS = "";
        b.$parent.call(this, e)
    }, d);
    M.mix(b.prototype, {
        tpl: a, setPanelContent: function () {
            this._dialogTitle = this._panel.find("._j_title");
            this._dialogContent = this._panel.find("._j_content");
            this.setTitle(this.title);
            this.setContent(this.content);
            this.addClass(this.PANEL_CLASS);
            this.getMask().addClass(this.MASK_CLASS)
        }, setTitle: function (e) {
            if (e) {
                this._dialogTitle.html(e).parent().css("display", "")
            } else {
                this._dialogTitle.parent().css("display", "none")
            }
            this.title = e
        }, getTitle: function () {
            return this.title
        }, setContent: function (e) {
            this._dialogContent.empty().append(e)
        }
    });
    return b
});
M.define("StarRating", function (c, b, d) {
    function a(f) {
        var e = $(f.context || "body"), g = f.starClassPrefix || "star";
        if (!f.blockSelector || !f.starCountSelector || !f.starItemSelector) {
            M.log("blockSelect, starCountSelector, starItemSelector must be defined");
            return false
        }
        e.delegate(f.starItemSelector, "mouseenter", $.proxy(function (i) {
            var j = $(i.currentTarget), k = j.closest(f.blockSelector), h = j.index();
            j.closest(f.blockSelector).find(f.starCountSelector).removeClass(function () {
                var n = this.className.split(/\s+/);
                for (var l = 0, m = n.length; l < m; l++) {
                    if (n[l].indexOf(g) === 0) {
                        return n[l]
                    }
                }
            }).addClass(g + (h + 1));
            M.Event(this).fire("enterrating", {star: h + 1, block: k, starItem: j})
        }, this));
        e.delegate(f.blockSelector, "mouseleave", $.proxy(function (h) {
            var j = $(h.currentTarget), k = j.closest(f.blockSelector), i = j.data("star") || 0;
            j.find(f.starCountSelector).removeClass(function () {
                var n = this.className.split(/\s+/);
                for (var l = 0, m = n.length; l < m; l++) {
                    if (n[l].indexOf(g) === 0) {
                        return n[l]
                    }
                }
            }).addClass(g + i);
            M.Event(this).fire("leaverating", {star: i, block: k, starItem: j})
        }, this));
        e.delegate(f.starItemSelector, "click", $.proxy(function (i) {
            var j = $(i.currentTarget), k = j.closest(f.blockSelector), h = j.index();
            k.data("star", h + 1);
            M.Event(this).fire("onrating", {star: h + 1, block: k, starItem: j});
            i.preventDefault()
        }, this))
    }

    d.exports = a
});
M.define("KeyListener", function (c, b) {
    var f = {
        backspace: 8,
        tab: 9,
        enter: 13,
        shift: 16,
        ctrl: 17,
        alt: 18,
        capslock: 20,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    };
    b.listen = function (l, j, h, m, g) {
        var k, g = g || window, i = a(h);
        if ((i.holdKey || i.keyCode) && (j === "keydown" || j === "keyup") && (typeof m === "function")) {
            $(l).bind(j, function (n) {
                if (d(n, i.holdKey)) {
                    if (e(n, i.holdKey, i.keyCode)) {
                        m.apply(g, arguments)
                    }
                }
            })
        }
    };
    function a(h) {
        var i = {}, g, k, j;
        if (M.is(h, "String")) {
            g = h.split("+");
            if (g.length === 1) {
                j = $.trim(g[0])
            } else {
                if (g.length === 2) {
                    k = $.trim(g[0]);
                    j = $.trim(g[1])
                }
            }
            if (k) {
                i.holdKey = [];
                g = k.split(",");
                M.forEach(g, function (m, l) {
                    m = $.trim(m);
                    if (M.indexOf(["ctrl", "alt", "shift"], m) !== -1 && M.indexOf(i.holdKey, m) === -1) {
                        i.holdKey = i.holdKey.concat(m)
                    }
                });
                if (i.holdKey.length === 0) {
                    delete i.holdKey
                }
            }
            if (j) {
                i.keyCode = isNaN(j) ? f[j] : parseInt(j, 10)
            }
        }
        return i
    }

    function d(l, j) {
        var g = true, h;
        if (M.isArray(j)) {
            for (h = 0; h < j.length; h++) {
                var k = j[h] == "ctrl" ? (l.ctrlKey || l.metaKey) : l[j[h] + "Key"];
                if (!k) {
                    g = false;
                    break
                }
            }
        }
        return g
    }

    function e(l, j, m) {
        var k = true, h, g;
        if (M.isArray(j)) {
            for (h = 0; h < j.length; h++) {
                if (f[j[h]] === l.keyCode) {
                    k = false;
                    break
                }
            }
            k = k && (!m || (m && l.keyCode === m))
        } else {
            k = m && l.keyCode === m
        }
        return k
    }
});
M.define("Toggle", function (b, a, c) {
    function d(e) {
        this.context = "body";
        this.trigger = null;
        this.board = null;
        this.handler = $.noop;
        this.triggerHandler = $.noop;
        this.boardHandler = $.noop;
        M.mix(this, e);
        this.inner = false;
        this.init()
    }

    d.prototype = {
        init: function () {
            if (typeof this.trigger === "string") {
                $(this.context).delegate(this.trigger, "click", $.proxy(function (e) {
                    this.triggerHandler(e);
                    this.inner = true
                }, this))
            } else {
                $(this.trigger).click($.proxy(function (e) {
                    this.triggerHandler(e);
                    this.inner = true
                }, this))
            }
            if (typeof this.board === "string") {
                $(this.context).delegate(this.board, "click", $.proxy(function (e) {
                    this.inner = true
                }, this))
            } else {
                $(this.board).click($.proxy(function (e) {
                    this.inner = true
                }, this))
            }
            $(this.context).click($.proxy(function (e) {
                if (!this.inner) {
                    this.handler()
                } else {
                    this.inner = false
                }
            }, this))
        }
    };
    c.exports = d
});
M.define("Select", function (a) {
    var b = a("KeyListener"),
        d = a("Toggle");

    function c(f) {
        this.valueBox = null;
        this.dropTrigger = null;
        this.dropListCnt = null;
        this.optionSelector = "._j_option";
        this.selectedClass = "_j_selected";
        this.disabledClass = "disabled";
        M.mix(this, f);
        this.valueBox = $(this.valueBox);
        this.dropTrigger = $(this.dropTrigger);
        this.dropListCnt = $(this.dropListCnt);
        this.dropListInnerCnt = this.dropListInnerCnt ? $(this.dropListInnerCnt) : this.dropListCnt;
        this.value = this.valueBox.data("value") || "";
        this.input = $('<input type="hidden" name="' + this.valueBox.attr("name") + '" value="' + this.value + '" />').insertAfter(this.valueBox);
        if (!this.value) {
            this.valueBox.addClass("default")
        } else {
            this.valueBox.removeClass("default");
            var e = this.dropListCnt.find('[data-value="' + this.value + '"]'), g = typeof e.data("text") != "undefined" ? e.data("text") : e.text();
            this.setValueBox({value: this.value, text: g})
        }
        this.init()
    }

    c.prototype = {
        init: function () {
            this.setFocusItem();
            this.bindEvents()
        }, setFocusItem: function () {
            var e = this.dropListCnt.find(this.optionSelector), f = e.filter('[data-value="' + this.value + '"]');
            if (!f.length) {
                f = e.first()
            }
            if (!f.hasClass(this.selectedClass)) {
                f.siblings().removeClass(this.selectedClass);
                f.addClass(this.selectedClass);
                this.focusItem = f
            }
        }, bindEvents: function () {
            var f = this;
            this.dropTrigger.click($.proxy(this.dropClick, this));
            this.valueBox.click($.proxy(function () {
                setTimeout($.proxy(function () {
                    this.dropTrigger.trigger("click")
                }, this), 1)
            }, this));
            b.listen(this.dropTrigger, "keydown", "up", $.proxy(function (g) {
                if (!$(g.currentTarget).hasClass(this.disabledClass)) {
                    this.moveSelect(-1)
                }
                g.preventDefault()
            }, this));
            b.listen(this.dropTrigger, "keydown", "down", $.proxy(function (g) {
                if (!$(g.currentTarget).hasClass(this.disabledClass)) {
                    this.moveSelect(1)
                }
                g.preventDefault()
            }, this));
            b.listen(this.dropTrigger, "keydown", "enter", $.proxy(function (g) {
                if (!$(g.currentTarget).hasClass(this.disabledClass)) {
                    this.selectItem(this.focusItem)
                }
                g.preventDefault()
            }, this));
            this.dropListCnt.delegate(this.optionSelector, "mouseenter", $.proxy(this.hoverItem, this)).delegate(this.optionSelector, "click", $.proxy(function (g) {
                this.selectItem($(g.currentTarget));
                g.preventDefault()
            }, this));
            var e = new d({
                trigger: this.dropTrigger, board: this.dropListCnt, handler: function () {
                    this.board.hide();
                    M.Event(this).fire("hide")
                }
            })
        }, dropClick: function (e) {
            if (!$(e.currentTarget).hasClass(this.disabledClass)) {
                this.dropTrigger.focus();
                this.drop()
            }
            e.preventDefault()
        }, disable: function () {
            this.dropTrigger.addClass(this.disabledClass)
        }, enable: function () {
            this.dropTrigger.removeClass(this.disabledClass)
        }, selectItem: function (e) {
            this.setSelect(e);
            this.dropListCnt.hide();
            this.dropTrigger.focus();
            this.valueBox.removeClass("default")
        }, moveSelect: function (g) {
            var f = this.dropListCnt.find(this.optionSelector), h = this.focusItem || f.first(), e = h;
            if (g === -1) {
                e = h.prev(this.optionSelector);
                if (!e.length) {
                    e = f.last()
                }
            } else {
                if (g === 1) {
                    e = h.next(this.optionSelector);
                    if (!e.length) {
                        e = f.first()
                    }
                }
            }
            this.setSelect(e)
        }, setSelect: function (f) {
            var e = f.data("value"), g = typeof f.data("text") != "undefined" ? f.data("text") : f.text();
            this.focusItem && this.focusItem.removeClass(this.selectedClass);
            f.addClass(this.selectedClass);
            this.focusItem = f;
            this.value = e;
            this.input.val(e);
            this.setValueBox({value: e, text: g});
            M.Event(this).fire("change", {data: {value: e}});
            this.viewFocusItem()
        }, setValueBox: function (e) {
            if (this.valueBox.is("input")) {
                this.valueBox.val(e.text)
            } else {
                this.valueBox.text(e.text)
            }
            this.valueBox.data("value", e.value)
        }, hoverItem: function (e) {
            var f = $(e.currentTarget);
            this.focusItem.removeClass(this.selectedClass);
            f.addClass(this.selectedClass);
            this.focusItem = f
        }, drop: function () {
            if (this.dropListCnt.css("display") === "none") {
                this.dropListCnt.show();
                this.setFocusItem();
                this.viewFocusItem();
                M.Event(this).fire("show")
            } else {
                this.dropListCnt.hide();
                M.Event(this).fire("hide")
            }
        }, viewFocusItem: function () {
            if (!this.focusItem.length) {
                return
            }
            var g = this.dropListInnerCnt[0], h = g.scrollTop, i = g.clientHeight, e = this.focusItem[0].offsetTop, f = e + this.focusItem.height();
            if (e < h) {
                this.scroll(e)
            } else {
                if (f > (h + i)) {
                    this.scroll(f - i)
                }
            }
        }, scroll: function (e) {
            this.dropListInnerCnt.scrollTop(e)
        }
    };
    return c
});

M.define("dialog/alert", function (e, d) {
    var b = e("dialog/Dialog"),
        a = '<div id="popup_container" class="popup-box"><a class="close-btn _j_close"><i></i></a><div class="pop-ico" id="_j_alertpopicon"><i class="i1"></i></div><div class="pop-ctn"><p class="hd _j_content" id="popup_title"></p><p class="bd" id="popup_message"></p></div><div class="pop-btn" id="popup_btn"><input type="button" class="btn-sub _j_close" value="&nbsp;确定&nbsp;"></div></div>', f = M.extend(function (j) {
            var i = {
                width: 380,
                content: "请输入内容",
                background: "#000",
                bgOpacity: 0.7,
                PANEL_CLASS: "pop_no_margin",
                reposition: true,
                impl: "Alert",
                layerZIndex: 10000
            };
            j = M.mix(i, j);
            f.$parent.call(this, j)
        }, b), g = null, h = $.noop;
    M.mix(f.prototype, {
        tpl: a, setPaneltext: function (i) {
            this.setContent(i);
            this.show()
        }
    });
    var c = function (i, k, j) {
        if (!g) {
            g = new f();
            M.Event(g).on("afterhide", function () {
                if (typeof h == "function") {
                    h.call(g, g.getPanel())
                }
            })
        }
        g.getLayer().toFront();
        g.setPaneltext(i);
        if (typeof k == "function") {
            h = k
        } else {
            h = $.noop
        }
        if (j) {
            $("#_j_alertpopicon").children("i").attr("class", "i" + j)
        } else {
            $("#_j_alertpopicon").children("i").attr("class", "i" + 1)
        }
        return g
    };
    d.pop = c;
    d.warning = function (i, j) {
        c(i, j, 1)
    };
    d.tip = function (i, j) {
        c(i, j, 3)
    }
});

M.define("dialog/confirm", function (c, e) {
    var g = c("dialog/Dialog"),
        a = '<div id="popup_container" class="popup-box"><a class="close-btn _j_close _j_false"><i></i></a><div class="pop-ico" id="popup_icon"><i class="i2"></i></div><div class="pop-ctn"><p class="bd _j_content" id="popup_message"></p></div><div class="pop-btn" id="popup_btn"><input type="button" class="btn-sub _j_close _j_true" value="&nbsp;确定&nbsp;"><input type="button" class="btn-esc _j_close _j_false" value="&nbsp;取消&nbsp;"></div></div>', h = M.extend(function (k) {
            var j = {
                width: 380,
                content: "请输入内容",
                background: "#000",
                bgOpacity: 0.7,
                PANEL_CLASS: "pop_no_margin",
                reposition: true,
                impl: "Confirm",
                layerZIndex: 10000
            };
            k = M.mix(j, k);
            h.$parent.call(this, k);
            this.bindEvents()
        }, g), d = null, b = $.noop, i = $.noop, f = false;
    M.mix(h.prototype, {
        tpl: a, setPaneltext: function (j) {
            this.setContent(j);
            this.show()
        }, bindEvents: function () {
            this.getPanel().on("click", "._j_false", function () {
                f = false
            }).on("click", "._j_true", function () {
                f = true
            })
        }
    });
    e.pop = function (k, j, l) {
        if (!d) {
            d = new h();
            M.Event(d).on("afterhide", function () {
                if (f) {
                    b()
                } else {
                    i()
                }
            })
        }
        d.getLayer().toFront();
        d.setPaneltext(k);
        if (typeof j == "function") {
            b = j
        } else {
            b = $.noop
        }
        if (typeof l == "function") {
            i = l
        } else {
            i = $.noop
        }
    }
});

(function (b, g) {
    var d = {};

    function c(m, n) {
        var l, j = [];
        for (var k = 0; k < m.length; ++k) {
            l = d[m[k]] || e(m[k]);
            if (!l) {
                throw"module definition dependecy not found: " + m[k]
            }
            j.push(l)
        }
        n.apply(null, j)
    }

    function h(k, j, i) {
        if (typeof k !== "string") {
            throw"invalid module definition, module id must be defined and be a string"
        }
        if (j === g) {
            throw"invalid module definition, dependencies must be specified"
        }
        if (i === g) {
            throw"invalid module definition, definition function must be specified"
        }
        c(j, function () {
            d[k] = i.apply(null, arguments)
        })
    }

    function f(i) {
        return !!d[i]
    }

    function e(l) {
        var j = b;
        var i = l.split(/[.\/]/);
        for (var k = 0; k < i.length; ++k) {
            if (!j[i[k]]) {
                return
            }
            j = j[i[k]]
        }
        return j
    }

    function a(l) {
        for (var k = 0; k < l.length; k++) {
            var m = b;
            var o = l[k];
            var j = o.split(/[.\/]/);
            for (var n = 0; n < j.length - 1; ++n) {
                if (m[j[n]] === g) {
                    m[j[n]] = {}
                }
                m = m[j[n]]
            }
            m[j[j.length - 1]] = d[o]
        }
    }

    h("moxie/core/utils/Basic", [], function () {
        var r = function (w) {
            var v;
            if (w === v) {
                return "undefined"
            } else {
                if (w === null) {
                    return "null"
                } else {
                    if (w.nodeType) {
                        return "node"
                    }
                }
            }
            return ({}).toString.call(w).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
        };
        var n = function (w) {
            var v;
            p(arguments, function (x, y) {
                if (y > 0) {
                    p(x, function (A, z) {
                        if (A !== v) {
                            if (r(w[z]) === r(A) && !!~u(r(A), ["array", "object"])) {
                                n(w[z], A)
                            } else {
                                w[z] = A
                            }
                        }
                    })
                }
            });
            return w
        };
        var p = function (A, B) {
            var z, x, w, y;
            if (A) {
                try {
                    z = A.length
                } catch (v) {
                    z = y
                }
                if (z === y) {
                    for (x in A) {
                        if (A.hasOwnProperty(x)) {
                            if (B(A[x], x) === false) {
                                return
                            }
                        }
                    }
                } else {
                    for (w = 0; w < z; w++) {
                        if (B(A[w], w) === false) {
                            return
                        }
                    }
                }
            }
        };
        var s = function (v) {
            var w;
            if (!v || r(v) !== "object") {
                return true
            }
            for (w in v) {
                return false
            }
            return true
        };
        var l = function (w, v) {
            var x = 0, y = w.length;
            if (r(v) !== "function") {
                v = function () {
                }
            }
            if (!w || !w.length) {
                v()
            }
            function z(A) {
                if (r(w[A]) === "function") {
                    w[A](function (B) {
                        ++A < y && !B ? z(A) : v(B)
                    })
                }
            }

            z(x)
        };
        var i = function (w, v) {
            var y = 0, x = w.length, z = new Array(x);
            p(w, function (B, A) {
                B(function (D) {
                    if (D) {
                        return v(D)
                    }
                    var C = [].slice.call(arguments);
                    C.shift();
                    z[A] = C;
                    y++;
                    if (y === x) {
                        z.unshift(null);
                        v.apply(this, z)
                    }
                })
            })
        };
        var u = function (x, y) {
            if (y) {
                if (Array.prototype.indexOf) {
                    return Array.prototype.indexOf.call(y, x)
                }
                for (var v = 0, w = y.length; v < w; v++) {
                    if (y[v] === x) {
                        return v
                    }
                }
            }
            return -1
        };
        var q = function (w, y) {
            var x = [];
            if (r(w) !== "array") {
                w = [w]
            }
            if (r(y) !== "array") {
                y = [y]
            }
            for (var v in w) {
                if (u(w[v], y) === -1) {
                    x.push(w[v])
                }
            }
            return x.length ? x : false
        };
        var t = function (x, w) {
            var v = [];
            p(x, function (y) {
                if (u(y, w) !== -1) {
                    v.push(y)
                }
            });
            return v.length ? v : null
        };
        var m = function (x) {
            var w, v = [];
            for (w = 0; w < x.length; w++) {
                v[w] = x[w]
            }
            return v
        };
        var o = (function () {
            var v = 0;
            return function (y) {
                var w = new Date().getTime().toString(32), x;
                for (x = 0; x < 5; x++) {
                    w += Math.floor(Math.random() * 65535).toString(32)
                }
                return (y || "o_") + w + (v++).toString(32)
            }
        }());
        var j = function (v) {
            if (!v) {
                return v
            }
            return String.prototype.trim ? String.prototype.trim.call(v) : v.toString().replace(/^\s*/, "").replace(/\s*$/, "")
        };
        var k = function (v) {
            if (typeof(v) !== "string") {
                return v
            }
            var x = {t: 1099511627776, g: 1073741824, m: 1048576, k: 1024}, w;
            v = /^([0-9]+)([mgk]?)$/.exec(v.toLowerCase().replace(/[^0-9mkg]/g, ""));
            w = v[2];
            v = +v[1];
            if (x.hasOwnProperty(w)) {
                v *= x[w]
            }
            return v
        };
        return {
            guid: o,
            typeOf: r,
            extend: n,
            each: p,
            isEmptyObj: s,
            inSeries: l,
            inParallel: i,
            inArray: u,
            arrayDiff: q,
            arrayIntersect: t,
            toArray: m,
            trim: j,
            parseSizeStr: k
        }
    });
    h("moxie/core/I18n", ["moxie/core/utils/Basic"], function (j) {
        var i = {};
        return {
            addI18n: function (k) {
                return j.extend(i, k)
            }, translate: function (k) {
                return i[k] || k
            }, _: function (k) {
                return this.translate(k)
            }, sprintf: function (l) {
                var k = [].slice.call(arguments, 1);
                return l.replace(/%[a-z]/g, function () {
                    var m = k.shift();
                    return j.typeOf(m) !== "undefined" ? m : ""
                })
            }
        }
    });
    h("moxie/core/utils/Mime", ["moxie/core/utils/Basic", "moxie/core/I18n"], function (l, k) {
        var i = "application/msword,doc dot,application/pdf,pdf,application/pgp-signature,pgp,application/postscript,ps ai eps,application/rtf,rtf,application/vnd.ms-excel,xls xlb,application/vnd.ms-powerpoint,ppt pps pot,application/zip,zip,application/x-shockwave-flash,swf swfl,application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx,application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx,application/vnd.openxmlformats-officedocument.presentationml.template,potx,application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx,application/x-javascript,js,application/json,json,audio/mpeg,mp3 mpga mpega mp2,audio/x-wav,wav,audio/x-m4a,m4a,audio/ogg,oga ogg,audio/aiff,aiff aif,audio/flac,flac,audio/aac,aac,audio/ac3,ac3,audio/x-ms-wma,wma,image/bmp,bmp,image/gif,gif,image/jpeg,jpg jpeg jpe,image/photoshop,psd,image/png,png,image/svg+xml,svg svgz,image/tiff,tiff tif,text/plain,asc txt text diff log,text/html,htm html xhtml,text/css,css,text/csv,csv,text/rtf,rtf,video/mpeg,mpeg mpg mpe m2v,video/quicktime,qt mov,video/mp4,mp4,video/x-m4v,m4v,video/x-flv,flv,video/x-ms-wmv,wmv,video/avi,avi,video/webm,webm,video/3gpp,3gpp 3gp,video/3gpp2,3g2,video/vnd.rn-realvideo,rv,video/ogg,ogv,video/x-matroska,mkv,application/vnd.oasis.opendocument.formula-template,otf,application/octet-stream,exe";
        var j = {
            mimes: {}, extensions: {}, addMimeType: function (m) {
                var n = m.split(/,/), o, q, p;
                for (o = 0; o < n.length; o += 2) {
                    p = n[o + 1].split(/ /);
                    for (q = 0; q < p.length; q++) {
                        this.mimes[p[q]] = n[o]
                    }
                    this.extensions[n[o]] = p
                }
            }, extList2mimes: function (s, t) {
                var n = this, r, o, q, p, m = [];
                for (o = 0; o < s.length; o++) {
                    r = s[o].extensions.split(/\s*,\s*/);
                    for (q = 0; q < r.length; q++) {
                        if (r[q] === "*") {
                            return []
                        }
                        p = n.mimes[r[q]];
                        if (!p) {
                            if (t && /^\w+$/.test(r[q])) {
                                m.push("." + r[q])
                            } else {
                                return []
                            }
                        } else {
                            if (l.inArray(p, m) === -1) {
                                m.push(p)
                            }
                        }
                    }
                }
                return m
            }, mimes2exts: function (m) {
                var n = this, o = [];
                l.each(m, function (q) {
                    if (q === "*") {
                        o = [];
                        return false
                    }
                    var p = q.match(/^(\w+)\/(\*|\w+)$/);
                    if (p) {
                        if (p[2] === "*") {
                            l.each(n.extensions, function (r, s) {
                                if ((new RegExp("^" + p[1] + "/")).test(s)) {
                                    [].push.apply(o, n.extensions[s])
                                }
                            })
                        } else {
                            if (n.extensions[q]) {
                                [].push.apply(o, n.extensions[q])
                            }
                        }
                    }
                });
                return o
            }, mimes2extList: function (m) {
                var o = [], n = [];
                if (l.typeOf(m) === "string") {
                    m = l.trim(m).split(/\s*,\s*/)
                }
                n = this.mimes2exts(m);
                o.push({title: k.translate("Files"), extensions: n.length ? n.join(",") : "*"});
                o.mimes = m;
                return o
            }, getFileExtension: function (n) {
                var m = n && n.match(/\.([^.]+)$/);
                if (m) {
                    return m[1].toLowerCase()
                }
                return ""
            }, getFileMime: function (m) {
                return this.mimes[this.getFileExtension(m)] || ""
            }
        };
        j.addMimeType(i);
        return j
    });
    h("moxie/core/utils/Env", ["moxie/core/utils/Basic"], function (m) {
        var k = (function (r) {
            var H = "", G = "?", B = "function", t = "undefined", p = "object", q = "major", C = "model", s = "name", y = "type", w = "vendor", E = "version", n = "architecture", u = "console", A = "mobile", F = "tablet";
            var o = {
                has: function (J, I) {
                    return I.toLowerCase().indexOf(J.toLowerCase()) !== -1
                }, lowerize: function (I) {
                    return I.toLowerCase()
                }
            };
            var D = {
                rgx: function () {
                    for (var T, N = 0, L, K, J, I, O, P, Q = arguments; N < Q.length; N += 2) {
                        var S = Q[N], R = Q[N + 1];
                        if (typeof(T) === t) {
                            T = {};
                            for (J in R) {
                                I = R[J];
                                if (typeof(I) === p) {
                                    T[I[0]] = r
                                } else {
                                    T[I] = r
                                }
                            }
                        }
                        for (L = K = 0; L < S.length; L++) {
                            O = S[L].exec(this.getUA());
                            if (!!O) {
                                for (J = 0; J < R.length; J++) {
                                    P = O[++K];
                                    I = R[J];
                                    if (typeof(I) === p && I.length > 0) {
                                        if (I.length == 2) {
                                            if (typeof(I[1]) == B) {
                                                T[I[0]] = I[1].call(this, P)
                                            } else {
                                                T[I[0]] = I[1]
                                            }
                                        } else {
                                            if (I.length == 3) {
                                                if (typeof(I[1]) === B && !(I[1].exec && I[1].test)) {
                                                    T[I[0]] = P ? I[1].call(this, P, I[2]) : r
                                                } else {
                                                    T[I[0]] = P ? P.replace(I[1], I[2]) : r
                                                }
                                            } else {
                                                if (I.length == 4) {
                                                    T[I[0]] = P ? I[3].call(this, P.replace(I[1], I[2])) : r
                                                }
                                            }
                                        }
                                    } else {
                                        T[I] = P ? P : r
                                    }
                                }
                                break
                            }
                        }
                        if (!!O) {
                            break
                        }
                    }
                    return T
                }, str: function (L, K) {
                    for (var J in K) {
                        if (typeof(K[J]) === p && K[J].length > 0) {
                            for (var I = 0; I < K[J].length; I++) {
                                if (o.has(K[J][I], L)) {
                                    return (J === G) ? r : J
                                }
                            }
                        } else {
                            if (o.has(K[J], L)) {
                                return (J === G) ? r : J
                            }
                        }
                    }
                    return L
                }
            };
            var z = {
                browser: {
                    oldsafari: {
                        major: {"1": ["/8", "/1", "/3"], "2": "/4", "?": "/"},
                        version: {
                            "1.0": "/8",
                            "1.2": "/1",
                            "1.3": "/3",
                            "2.0": "/412",
                            "2.0.2": "/416",
                            "2.0.3": "/417",
                            "2.0.4": "/419",
                            "?": "/"
                        }
                    }
                },
                device: {sprint: {model: {"Evo Shift 4G": "7373KT"}, vendor: {HTC: "APA", Sprint: "Sprint"}}},
                os: {
                    windows: {
                        version: {
                            ME: "4.90",
                            "NT 3.11": "NT3.51",
                            "NT 4.0": "NT4.0",
                            "2000": "NT 5.0",
                            XP: ["NT 5.1", "NT 5.2"],
                            Vista: "NT 6.0",
                            "7": "NT 6.1",
                            "8": "NT 6.2",
                            "8.1": "NT 6.3",
                            RT: "ARM"
                        }
                    }
                }
            };
            var x = {
                browser: [[/(opera\smini)\/((\d+)?[\w\.-]+)/i, /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i, /(opera).+version\/((\d+)?[\w\.]+)/i, /(opera)[\/\s]+((\d+)?[\w\.]+)/i], [s, E, q], [/\s(opr)\/((\d+)?[\w\.]+)/i], [[s, "Opera"], E, q], [/(kindle)\/((\d+)?[\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i, /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i, /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i, /(rekonq)((?:\/)[\w\.]+)*/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i], [s, E, q], [/(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i], [[s, "IE"], E, q], [/(yabrowser)\/((\d+)?[\w\.]+)/i], [[s, "Yandex"], E, q], [/(comodo_dragon)\/((\d+)?[\w\.]+)/i], [[s, /_/g, " "], E, q], [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i], [s, E, q], [/(dolfin)\/((\d+)?[\w\.]+)/i], [[s, "Dolphin"], E, q], [/((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i], [[s, "Chrome"], E, q], [/((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i], [[s, "Android Browser"], E, q], [/version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i], [E, q, [s, "Mobile Safari"]], [/version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i], [E, q, s], [/webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i], [s, [q, D.str, z.browser.oldsafari.major], [E, D.str, z.browser.oldsafari.version]], [/(konqueror)\/((\d+)?[\w\.]+)/i, /(webkit|khtml)\/((\d+)?[\w\.]+)/i], [s, E, q], [/(navigator|netscape)\/((\d+)?[\w\.-]+)/i], [[s, "Netscape"], E, q], [/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i, /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i, /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i, /(links)\s\(((\d+)?[\w\.]+)/i, /(gobrowser)\/?((\d+)?[\w\.]+)*/i, /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i, /(mosaic)[\/\s]((\d+)?[\w\.]+)/i], [s, E, q]],
                engine: [[/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, /(icab)[\/\s]([23]\.[\d\.]+)/i], [s, E], [/rv\:([\w\.]+).*(gecko)/i], [E, s]],
                os: [[/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i], [s, [E, D.str, z.os.windows.version]], [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i], [[s, "Windows"], [E, D.str, z.os.windows.version]], [/\((bb)(10);/i], [[s, "BlackBerry"], E], [/(blackberry)\w*\/?([\w\.]+)*/i, /(tizen)\/([\w\.]+)/i, /(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i], [s, E], [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i], [[s, "Symbian"], E], [/mozilla.+\(mobile;.+gecko.+firefox/i], [[s, "Firefox OS"], E], [/(nintendo|playstation)\s([wids3portablevu]+)/i, /(mint)[\/\s\(]?(\w+)*/i, /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i, /(hurd|linux)\s?([\w\.]+)*/i, /(gnu)\s?([\w\.]+)*/i], [s, E], [/(cros)\s[\w]+\s([\w\.]+\w)/i], [[s, "Chromium OS"], E], [/(sunos)\s?([\w\.]+\d)*/i], [[s, "Solaris"], E], [/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i], [s, E], [/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i], [[s, "iOS"], [E, /_/g, "."]], [/(mac\sos\sx)\s?([\w\s\.]+\w)*/i], [s, [E, /_/g, "."]], [/(haiku)\s(\w+)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, /(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i, /(unix)\s?([\w\.]+)*/i], [s, E]]
            };
            var v = function (I) {
                var J = I || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : H);
                this.getBrowser = function () {
                    return D.rgx.apply(this, x.browser)
                };
                this.getEngine = function () {
                    return D.rgx.apply(this, x.engine)
                };
                this.getOS = function () {
                    return D.rgx.apply(this, x.os)
                };
                this.getResult = function () {
                    return {ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS()}
                };
                this.getUA = function () {
                    return J
                };
                this.setUA = function (K) {
                    J = K;
                    return this
                };
                this.setUA(J)
            };
            return new v().getResult()
        })();

        function j(v, t, o) {
            var s = 0, u = 0, n = 0, p = {
                dev: -6,
                alpha: -5,
                a: -5,
                beta: -4,
                b: -4,
                RC: -3,
                rc: -3,
                "#": -2,
                p: 1,
                pl: 1
            }, q = function (w) {
                w = ("" + w).replace(/[_\-+]/g, ".");
                w = w.replace(/([^.\d]+)/g, ".$1.").replace(/\.{2,}/g, ".");
                return (!w.length ? [-8] : w.split("."))
            }, r = function (w) {
                return !w ? 0 : (isNaN(w) ? p[w] || -7 : parseInt(w, 10))
            };
            v = q(v);
            t = q(t);
            u = Math.max(v.length, t.length);
            for (s = 0; s < u; s++) {
                if (v[s] == t[s]) {
                    continue
                }
                v[s] = r(v[s]);
                t[s] = r(t[s]);
                if (v[s] < t[s]) {
                    n = -1;
                    break
                } else {
                    if (v[s] > t[s]) {
                        n = 1;
                        break
                    }
                }
            }
            if (!o) {
                return n
            }
            switch (o) {
                case">":
                case"gt":
                    return (n > 0);
                case">=":
                case"ge":
                    return (n >= 0);
                case"<=":
                case"le":
                    return (n <= 0);
                case"==":
                case"=":
                case"eq":
                    return (n === 0);
                case"<>":
                case"!=":
                case"ne":
                    return (n !== 0);
                case"":
                case"<":
                case"lt":
                    return (n < 0);
                default:
                    return null
            }
        }

        var l = (function () {
            var n = {
                define_property: (function () {
                    return false
                }()), create_canvas: (function () {
                    var o = document.createElement("canvas");
                    return !!(o.getContext && o.getContext("2d"))
                }()), return_response_type: function (o) {
                    try {
                        if (m.inArray(o, ["", "text", "document"]) !== -1) {
                            return true
                        } else {
                            if (window.XMLHttpRequest) {
                                var q = new XMLHttpRequest();
                                q.open("get", "/");
                                if ("responseType" in q) {
                                    q.responseType = o;
                                    if (q.responseType !== o) {
                                        return false
                                    }
                                    return true
                                }
                            }
                        }
                    } catch (p) {
                    }
                    return false
                }, use_data_uri: (function () {
                    var o = new Image();
                    o.onload = function () {
                        n.use_data_uri = (o.width === 1 && o.height === 1)
                    };
                    setTimeout(function () {
                        o.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP8AAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                    }, 1);
                    return false
                }()), use_data_uri_over32kb: function () {
                    return n.use_data_uri && (i.browser !== "IE" || i.version >= 9)
                }, use_data_uri_of: function (o) {
                    return (n.use_data_uri && o < 33000 || n.use_data_uri_over32kb())
                }, use_fileinput: function () {
                    var o = document.createElement("input");
                    o.setAttribute("type", "file");
                    return !o.disabled
                }
            };
            return function (p) {
                var o = [].slice.call(arguments);
                o.shift();
                return m.typeOf(n[p]) === "function" ? n[p].apply(this, o) : !!n[p]
            }
        }());
        var i = {
            can: l,
            browser: k.browser.name,
            version: parseFloat(k.browser.major),
            os: k.os.name,
            osVersion: k.os.version,
            verComp: j,
            swf_url: "../flash/Moxie.swf",
            xap_url: "../silverlight/Moxie.xap",
            global_event_dispatcher: "moxie.core.EventTarget.instance.dispatchEvent"
        };
        i.OS = i.os;
        return i
    });
    h("moxie/core/utils/Dom", ["moxie/core/utils/Env"], function (j) {
        var k = function (q) {
            if (typeof q !== "string") {
                return q
            }
            return document.getElementById(q)
        };
        var l = function (s, r) {
            if (!s.className) {
                return false
            }
            var q = new RegExp("(^|\\s+)" + r + "(\\s+|$)");
            return q.test(s.className)
        };
        var m = function (r, q) {
            if (!l(r, q)) {
                r.className = !r.className ? q : r.className.replace(/\s+$/, "") + " " + q
            }
        };
        var p = function (s, r) {
            if (s.className) {
                var q = new RegExp("(^|\\s+)" + r + "(\\s+|$)");
                s.className = s.className.replace(q, function (u, t, v) {
                    return t === " " && v === " " ? " " : ""
                })
            }
        };
        var i = function (r, q) {
            if (r.currentStyle) {
                return r.currentStyle[q]
            } else {
                if (window.getComputedStyle) {
                    return window.getComputedStyle(r, null)[q]
                }
            }
        };
        var o = function (r, v) {
            var w = 0, u = 0, A, z = document, s, t;
            r = r;
            v = v || z.body;
            function q(E) {
                var C, D, B = 0, F = 0;
                if (E) {
                    D = E.getBoundingClientRect();
                    C = z.compatMode === "CSS1Compat" ? z.documentElement : z.body;
                    B = D.left + C.scrollLeft;
                    F = D.top + C.scrollTop
                }
                return {x: B, y: F}
            }

            if (r && r.getBoundingClientRect && j.browser === "IE" && (!z.documentMode || z.documentMode < 8)) {
                s = q(r);
                t = q(v);
                return {x: s.x - t.x, y: s.y - t.y}
            }
            A = r;
            while (A && A != v && A.nodeType) {
                w += A.offsetLeft || 0;
                u += A.offsetTop || 0;
                A = A.offsetParent
            }
            A = r.parentNode;
            while (A && A != v && A.nodeType) {
                w -= A.scrollLeft || 0;
                u -= A.scrollTop || 0;
                A = A.parentNode
            }
            return {x: w, y: u}
        };
        var n = function (q) {
            return {w: q.offsetWidth || q.clientWidth, h: q.offsetHeight || q.clientHeight}
        };
        return {get: k, hasClass: l, addClass: m, removeClass: p, getStyle: i, getPos: o, getSize: n}
    });
    h("moxie/core/Exceptions", ["moxie/core/utils/Basic"], function (j) {
        function i(m, l) {
            var k;
            for (k in m) {
                if (m[k] === l) {
                    return k
                }
            }
            return null
        }

        return {
            RuntimeError: (function () {
                var k = {NOT_INIT_ERR: 1, NOT_SUPPORTED_ERR: 9, JS_ERR: 4};

                function l(m) {
                    this.code = m;
                    this.name = i(k, m);
                    this.message = this.name + ": RuntimeError " + this.code
                }

                j.extend(l, k);
                l.prototype = Error.prototype;
                return l
            }()), OperationNotAllowedException: (function () {
                function k(l) {
                    this.code = l;
                    this.name = "OperationNotAllowedException"
                }

                j.extend(k, {NOT_ALLOWED_ERR: 1});
                k.prototype = Error.prototype;
                return k
            }()), ImageError: (function () {
                var k = {WRONG_FORMAT: 1, MAX_RESOLUTION_ERR: 2};

                function l(m) {
                    this.code = m;
                    this.name = i(k, m);
                    this.message = this.name + ": ImageError " + this.code
                }

                j.extend(l, k);
                l.prototype = Error.prototype;
                return l
            }()), FileException: (function () {
                var k = {
                    NOT_FOUND_ERR: 1,
                    SECURITY_ERR: 2,
                    ABORT_ERR: 3,
                    NOT_READABLE_ERR: 4,
                    ENCODING_ERR: 5,
                    NO_MODIFICATION_ALLOWED_ERR: 6,
                    INVALID_STATE_ERR: 7,
                    SYNTAX_ERR: 8
                };

                function l(m) {
                    this.code = m;
                    this.name = i(k, m);
                    this.message = this.name + ": FileException " + this.code
                }

                j.extend(l, k);
                l.prototype = Error.prototype;
                return l
            }()), DOMException: (function () {
                var k = {
                    INDEX_SIZE_ERR: 1,
                    DOMSTRING_SIZE_ERR: 2,
                    HIERARCHY_REQUEST_ERR: 3,
                    WRONG_DOCUMENT_ERR: 4,
                    INVALID_CHARACTER_ERR: 5,
                    NO_DATA_ALLOWED_ERR: 6,
                    NO_MODIFICATION_ALLOWED_ERR: 7,
                    NOT_FOUND_ERR: 8,
                    NOT_SUPPORTED_ERR: 9,
                    INUSE_ATTRIBUTE_ERR: 10,
                    INVALID_STATE_ERR: 11,
                    SYNTAX_ERR: 12,
                    INVALID_MODIFICATION_ERR: 13,
                    NAMESPACE_ERR: 14,
                    INVALID_ACCESS_ERR: 15,
                    VALIDATION_ERR: 16,
                    TYPE_MISMATCH_ERR: 17,
                    SECURITY_ERR: 18,
                    NETWORK_ERR: 19,
                    ABORT_ERR: 20,
                    URL_MISMATCH_ERR: 21,
                    QUOTA_EXCEEDED_ERR: 22,
                    TIMEOUT_ERR: 23,
                    INVALID_NODE_TYPE_ERR: 24,
                    DATA_CLONE_ERR: 25
                };

                function l(m) {
                    this.code = m;
                    this.name = i(k, m);
                    this.message = this.name + ": DOMException " + this.code
                }

                j.extend(l, k);
                l.prototype = Error.prototype;
                return l
            }()), EventException: (function () {
                function k(l) {
                    this.code = l;
                    this.name = "EventException"
                }

                j.extend(k, {UNSPECIFIED_EVENT_TYPE_ERR: 0});
                k.prototype = Error.prototype;
                return k
            }())
        }
    });
    h("moxie/core/EventTarget", ["moxie/core/Exceptions", "moxie/core/utils/Basic"], function (i, j) {
        function k() {
            var l = {};
            j.extend(this, {
                uid: null, init: function () {
                    if (!this.uid) {
                        this.uid = j.guid("uid_")
                    }
                }, addEventListener: function (q, p, n, o) {
                    var m = this, r;
                    q = j.trim(q);
                    if (/\s/.test(q)) {
                        j.each(q.split(/\s+/), function (s) {
                            m.addEventListener(s, p, n, o)
                        });
                        return
                    }
                    q = q.toLowerCase();
                    n = parseInt(n, 10) || 0;
                    r = l[this.uid] && l[this.uid][q] || [];
                    r.push({fn: p, priority: n, scope: o || this});
                    if (!l[this.uid]) {
                        l[this.uid] = {}
                    }
                    l[this.uid][q] = r
                }, hasEventListener: function (m) {
                    return m ? !!(l[this.uid] && l[this.uid][m]) : !!l[this.uid]
                }, removeEventListener: function (o, n) {
                    o = o.toLowerCase();
                    var p = l[this.uid] && l[this.uid][o], m;
                    if (p) {
                        if (n) {
                            for (m = p.length - 1; m >= 0; m--) {
                                if (p[m].fn === n) {
                                    p.splice(m, 1);
                                    break
                                }
                            }
                        } else {
                            p = []
                        }
                        if (!p.length) {
                            delete l[this.uid][o];
                            if (j.isEmptyObj(l[this.uid])) {
                                delete l[this.uid]
                            }
                        }
                    }
                }, removeAllEventListeners: function () {
                    if (l[this.uid]) {
                        delete l[this.uid]
                    }
                }, dispatchEvent: function (r) {
                    var o, p, q, s, t = {}, u = true, m;
                    if (j.typeOf(r) !== "string") {
                        s = r;
                        if (j.typeOf(s.type) === "string") {
                            r = s.type;
                            if (s.total !== m && s.loaded !== m) {
                                t.total = s.total;
                                t.loaded = s.loaded
                            }
                            t.async = s.async || false
                        } else {
                            throw new i.EventException(i.EventException.UNSPECIFIED_EVENT_TYPE_ERR)
                        }
                    }
                    if (r.indexOf("::") !== -1) {
                        (function (v) {
                            o = v[0];
                            r = v[1]
                        }(r.split("::")))
                    } else {
                        o = this.uid
                    }
                    r = r.toLowerCase();
                    p = l[o] && l[o][r];
                    if (p) {
                        p.sort(function (w, v) {
                            return v.priority - w.priority
                        });
                        q = [].slice.call(arguments);
                        q.shift();
                        t.type = r;
                        q.unshift(t);
                        var n = [];
                        j.each(p, function (v) {
                            q[0].target = v.scope;
                            if (t.async) {
                                n.push(function (w) {
                                    setTimeout(function () {
                                        w(v.fn.apply(v.scope, q) === false)
                                    }, 1)
                                })
                            } else {
                                n.push(function (w) {
                                    w(v.fn.apply(v.scope, q) === false)
                                })
                            }
                        });
                        if (n.length) {
                            j.inSeries(n, function (v) {
                                u = !v
                            })
                        }
                    }
                    return u
                }, bind: function () {
                    this.addEventListener.apply(this, arguments)
                }, unbind: function () {
                    this.removeEventListener.apply(this, arguments)
                }, unbindAll: function () {
                    this.removeAllEventListeners.apply(this, arguments)
                }, trigger: function () {
                    return this.dispatchEvent.apply(this, arguments)
                }, convertEventPropsToHandlers: function (m) {
                    var o;
                    if (j.typeOf(m) !== "array") {
                        m = [m]
                    }
                    for (var n = 0; n < m.length; n++) {
                        o = "on" + m[n];
                        if (j.typeOf(this[o]) === "function") {
                            this.addEventListener(m[n], this[o])
                        } else {
                            if (j.typeOf(this[o]) === "undefined") {
                                this[o] = null
                            }
                        }
                    }
                }
            })
        }

        k.instance = new k();
        return k
    });
    h("moxie/core/utils/Encode", [], function () {
        var k = function (m) {
            return unescape(encodeURIComponent(m))
        };
        var l = function (m) {
            return decodeURIComponent(escape(m))
        };
        var j = function (t, y) {
            if (typeof(window.atob) === "function") {
                return y ? l(window.atob(t)) : window.atob(t)
            }
            var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var o, n, m, x, w, v, u, z, s = 0, A = 0, q = "", r = [];
            if (!t) {
                return t
            }
            t += "";
            do {
                x = p.indexOf(t.charAt(s++));
                w = p.indexOf(t.charAt(s++));
                v = p.indexOf(t.charAt(s++));
                u = p.indexOf(t.charAt(s++));
                z = x << 18 | w << 12 | v << 6 | u;
                o = z >> 16 & 255;
                n = z >> 8 & 255;
                m = z & 255;
                if (v == 64) {
                    r[A++] = String.fromCharCode(o)
                } else {
                    if (u == 64) {
                        r[A++] = String.fromCharCode(o, n)
                    } else {
                        r[A++] = String.fromCharCode(o, n, m)
                    }
                }
            } while (s < t.length);
            q = r.join("");
            return y ? l(q) : q
        };
        var i = function (v, A) {
            if (A) {
                k(v)
            }
            if (typeof(window.btoa) === "function") {
                return window.btoa(v)
            }
            var q = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var p, o, n, z, y, x, w, B, u = 0, C = 0, t = "", s = [];
            if (!v) {
                return v
            }
            do {
                p = v.charCodeAt(u++);
                o = v.charCodeAt(u++);
                n = v.charCodeAt(u++);
                B = p << 16 | o << 8 | n;
                z = B >> 18 & 63;
                y = B >> 12 & 63;
                x = B >> 6 & 63;
                w = B & 63;
                s[C++] = q.charAt(z) + q.charAt(y) + q.charAt(x) + q.charAt(w)
            } while (u < v.length);
            t = s.join("");
            var m = v.length % 3;
            return (m ? t.slice(0, m - 3) : t) + "===".slice(m || 3)
        };
        return {utf8_encode: k, utf8_decode: l, atob: j, btoa: i}
    });
    h("moxie/runtime/Runtime", ["moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/EventTarget"], function (m, l, n) {
        var i = {}, j = {};

        function k(w, t, r, q, p) {
            var v = this, o, u = m.guid(t + "_"), s = p || "browser";
            w = w || {};
            j[u] = this;
            r = m.extend({
                access_binary: false,
                access_image_binary: false,
                display_media: false,
                do_cors: false,
                drag_and_drop: false,
                filter_by_extension: true,
                resize_image: false,
                report_upload_progress: false,
                return_response_headers: false,
                return_response_type: false,
                return_status_code: true,
                send_custom_headers: false,
                select_file: false,
                select_folder: false,
                select_multiple: true,
                send_binary_string: false,
                send_browser_cookies: true,
                send_multipart: true,
                slice_blob: false,
                stream_upload: false,
                summon_file_dialog: false,
                upload_filesize: true,
                use_http_method: true
            }, r);
            if (w.preferred_caps) {
                s = k.getMode(q, w.preferred_caps, s)
            }
            o = (function () {
                var x = {};
                return {
                    exec: function (A, y, B, z) {
                        if (o[y]) {
                            if (!x[A]) {
                                x[A] = {context: this, instance: new o[y]()}
                            }
                            if (x[A].instance[B]) {
                                return x[A].instance[B].apply(this, z)
                            }
                        }
                    }, removeInstance: function (y) {
                        delete x[y]
                    }, removeAllInstances: function () {
                        var y = this;
                        m.each(x, function (A, z) {
                            if (m.typeOf(A.instance.destroy) === "function") {
                                A.instance.destroy.call(A.context)
                            }
                            y.removeInstance(z)
                        })
                    }
                }
            }());
            m.extend(this, {
                initialized: false,
                uid: u,
                type: t,
                mode: k.getMode(q, (w.required_caps), s),
                shimid: u + "_container",
                clients: 0,
                options: w,
                can: function (z, A) {
                    var x = arguments[2] || r;
                    if (m.typeOf(z) === "string" && m.typeOf(A) === "undefined") {
                        z = k.parseCaps(z)
                    }
                    if (m.typeOf(z) === "object") {
                        for (var y in z) {
                            if (!this.can(y, z[y], x)) {
                                return false
                            }
                        }
                        return true
                    }
                    if (m.typeOf(x[z]) === "function") {
                        return x[z].call(this, A)
                    } else {
                        return (A === x[z])
                    }
                },
                getShimContainer: function () {
                    var x, y = l.get(this.shimid);
                    if (!y) {
                        x = this.options.container ? l.get(this.options.container) : document.body;
                        y = document.createElement("div");
                        y.id = this.shimid;
                        y.className = "moxie-shim moxie-shim-" + this.type;
                        m.extend(y.style, {
                            position: "absolute",
                            top: "0px",
                            left: "0px",
                            width: "1px",
                            height: "1px",
                            overflow: "hidden"
                        });
                        x.appendChild(y);
                        x = null
                    }
                    return y
                },
                getShim: function () {
                    return o
                },
                shimExec: function (y, z) {
                    var x = [].slice.call(arguments, 2);
                    return v.getShim().exec.call(this, this.uid, y, z, x)
                },
                exec: function (y, z) {
                    var x = [].slice.call(arguments, 2);
                    if (v[y] && v[y][z]) {
                        return v[y][z].apply(this, x)
                    }
                    return v.shimExec.apply(this, arguments)
                },
                destroy: function () {
                    if (!v) {
                        return
                    }
                    var x = l.get(this.shimid);
                    if (x) {
                        x.parentNode.removeChild(x)
                    }
                    if (o) {
                        o.removeAllInstances()
                    }
                    this.unbindAll();
                    delete j[this.uid];
                    this.uid = null;
                    u = v = o = x = null
                }
            });
            if (this.mode && w.required_caps && !this.can(w.required_caps)) {
                this.mode = false
            }
        }

        k.order = "html5,flash,silverlight,html4";
        k.getRuntime = function (o) {
            return j[o] ? j[o] : false
        };
        k.addConstructor = function (p, o) {
            o.prototype = n.instance;
            i[p] = o
        };
        k.getConstructor = function (o) {
            return i[o] || null
        };
        k.getInfo = function (o) {
            var p = k.getRuntime(o);
            if (p) {
                return {
                    uid: p.uid, type: p.type, mode: p.mode, can: function () {
                        return p.can.apply(p, arguments)
                    }
                }
            }
            return null
        };
        k.parseCaps = function (o) {
            var p = {};
            if (m.typeOf(o) !== "string") {
                return o || {}
            }
            m.each(o.split(","), function (q) {
                p[q] = true
            });
            return p
        };
        k.can = function (p, r) {
            var q, o = k.getConstructor(p), s;
            if (o) {
                q = new o({required_caps: r});
                s = q.mode;
                q.destroy();
                return !!s
            }
            return false
        };
        k.thatCan = function (q, r) {
            var p = (r || k.order).split(/\s*,\s*/);
            for (var o in p) {
                if (k.can(p[o], q)) {
                    return p[o]
                }
            }
            return null
        };
        k.getMode = function (o, r, p) {
            var q = null;
            if (m.typeOf(p) === "undefined") {
                p = "browser"
            }
            if (r && !m.isEmptyObj(o)) {
                m.each(r, function (u, s) {
                    if (o.hasOwnProperty(s)) {
                        var t = o[s](u);
                        if (typeof(t) === "string") {
                            t = [t]
                        }
                        if (!q) {
                            q = t
                        } else {
                            if (!(q = m.arrayIntersect(q, t))) {
                                return (q = false)
                            }
                        }
                    }
                });
                if (q) {
                    return m.inArray(p, q) !== -1 ? p : q[0]
                } else {
                    if (q === false) {
                        return false
                    }
                }
            }
            return p
        };
        k.capTrue = function () {
            return true
        };
        k.capFalse = function () {
            return false
        };
        k.capTest = function (o) {
            return function () {
                return !!o
            }
        };
        return k
    });
    h("moxie/runtime/RuntimeClient", ["moxie/core/Exceptions", "moxie/core/utils/Basic", "moxie/runtime/Runtime"], function (i, l, k) {
        return function j() {
            var m;
            l.extend(this, {
                connectRuntime: function (q) {
                    var o = this, p;

                    function n(r) {
                        var t, s;
                        if (!r.length) {
                            o.trigger("RuntimeError", new i.RuntimeError(i.RuntimeError.NOT_INIT_ERR));
                            m = null;
                            return
                        }
                        t = r.shift();
                        s = k.getConstructor(t);
                        if (!s) {
                            n(r);
                            return
                        }
                        m = new s(q);
                        m.bind("Init", function () {
                            m.initialized = true;
                            setTimeout(function () {
                                m.clients++;
                                o.trigger("RuntimeInit", m)
                            }, 1)
                        });
                        m.bind("Error", function () {
                            m.destroy();
                            n(r)
                        });
                        if (!m.mode) {
                            m.trigger("Error");
                            return
                        }
                        m.init()
                    }

                    if (l.typeOf(q) === "string") {
                        p = q
                    } else {
                        if (l.typeOf(q.ruid) === "string") {
                            p = q.ruid
                        }
                    }
                    if (p) {
                        m = k.getRuntime(p);
                        if (m) {
                            m.clients++;
                            return m
                        } else {
                            throw new i.RuntimeError(i.RuntimeError.NOT_INIT_ERR)
                        }
                    }
                    n((q.runtime_order || k.order).split(/\s*,\s*/))
                }, getRuntime: function () {
                    if (m && m.uid) {
                        return m
                    }
                    m = null;
                    return null
                }, disconnectRuntime: function () {
                    if (m && --m.clients <= 0) {
                        m.destroy();
                        m = null
                    }
                }
            })
        }
    });
    h("moxie/file/Blob", ["moxie/core/utils/Basic", "moxie/core/utils/Encode", "moxie/runtime/RuntimeClient"], function (l, j, k) {
        var i = {};

        function m(p, o) {
            function n(u, q, s) {
                var r, t = i[this.uid];
                if (l.typeOf(t) !== "string" || !t.length) {
                    return null
                }
                r = new m(null, {type: s, size: q - u});
                r.detach(t.substr(u, r.size));
                return r
            }

            k.call(this);
            if (p) {
                this.connectRuntime(p)
            }
            if (!o) {
                o = {}
            } else {
                if (l.typeOf(o) === "string") {
                    o = {data: o}
                }
            }
            l.extend(this, {
                uid: o.uid || l.guid("uid_"),
                ruid: p,
                size: o.size || 0,
                type: o.type || "",
                slice: function (s, q, r) {
                    if (this.isDetached()) {
                        return n.apply(this, arguments)
                    }
                    return this.getRuntime().exec.call(this, "Blob", "slice", this.getSource(), s, q, r)
                },
                getSource: function () {
                    if (!i[this.uid]) {
                        return null
                    }
                    return i[this.uid]
                },
                detach: function (r) {
                    if (this.ruid) {
                        this.getRuntime().exec.call(this, "Blob", "destroy");
                        this.disconnectRuntime();
                        this.ruid = null
                    }
                    r = r || "";
                    var q = r.match(/^data:([^;]*);base64,/);
                    if (q) {
                        this.type = q[1];
                        r = j.atob(r.substring(r.indexOf("base64,") + 7))
                    }
                    this.size = r.length;
                    i[this.uid] = r
                },
                isDetached: function () {
                    return !this.ruid && l.typeOf(i[this.uid]) === "string"
                },
                destroy: function () {
                    this.detach();
                    delete i[this.uid]
                }
            });
            if (o.data) {
                this.detach(o.data)
            } else {
                i[this.uid] = o
            }
        }

        return m
    });
    h("moxie/file/File", ["moxie/core/utils/Basic", "moxie/core/utils/Mime", "moxie/file/Blob"], function (k, j, l) {
        function i(n, o) {
            var m, p;
            if (!o) {
                o = {}
            }
            if (o.type && o.type !== "") {
                p = o.type
            } else {
                p = j.getFileMime(o.name)
            }
            if (o.name) {
                m = o.name.replace(/\\/g, "/");
                m = m.substr(m.lastIndexOf("/") + 1)
            } else {
                var q = p.split("/")[0];
                m = k.guid((q !== "" ? q : "file") + "_");
                if (j.extensions[p]) {
                    m += "." + j.extensions[p][0]
                }
            }
            l.apply(this, arguments);
            k.extend(this, {
                type: p || "",
                name: m || k.guid("file_"),
                lastModifiedDate: o.lastModifiedDate || (new Date()).toLocaleString()
            })
        }

        i.prototype = l.prototype;
        return i
    });
    h("moxie/file/FileInput", ["moxie/core/utils/Basic", "moxie/core/utils/Mime", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/core/I18n", "moxie/file/File", "moxie/runtime/Runtime", "moxie/runtime/RuntimeClient"], function (j, m, l, q, s, k, o, i, p) {
        var r = ["ready", "change", "cancel", "mouseenter", "mouseleave", "mousedown", "mouseup"];

        function n(w) {
            var u = this, t, v, x;
            if (j.inArray(j.typeOf(w), ["string", "node"]) !== -1) {
                w = {browse_button: w}
            }
            v = l.get(w.browse_button);
            if (!v) {
                throw new q.DOMException(q.DOMException.NOT_FOUND_ERR)
            }
            x = {
                accept: [{title: k.translate("All Files"), extensions: "*"}],
                name: "file",
                multiple: false,
                required_caps: false,
                container: v.parentNode || document.body
            };
            w = j.extend({}, x, w);
            if (typeof(w.required_caps) === "string") {
                w.required_caps = i.parseCaps(w.required_caps)
            }
            if (typeof(w.accept) === "string") {
                w.accept = m.mimes2extList(w.accept)
            }
            t = l.get(w.container);
            if (!t) {
                t = document.body
            }
            if (l.getStyle(t, "position") === "static") {
                t.style.position = "relative"
            }
            t = v = null;
            p.call(u);
            j.extend(u, {
                uid: j.guid("uid_"), ruid: null, shimid: null, files: null, init: function () {
                    u.convertEventPropsToHandlers(r);
                    u.bind("RuntimeInit", function (z, y) {
                        u.ruid = y.uid;
                        u.shimid = y.shimid;
                        u.bind("Ready", function () {
                            u.trigger("Refresh")
                        }, 999);
                        u.bind("Change", function () {
                            var A = y.exec.call(u, "FileInput", "getFiles");
                            u.files = [];
                            j.each(A, function (B) {
                                if (B.size === 0) {
                                    return true
                                }
                                u.files.push(new o(u.ruid, B))
                            })
                        }, 999);
                        u.bind("Refresh", function () {
                            var D, C, B, A;
                            B = l.get(w.browse_button);
                            A = l.get(y.shimid);
                            if (B) {
                                D = l.getPos(B, l.get(w.container));
                                C = l.getSize(B);
                                if (A) {
                                    j.extend(A.style, {
                                        top: D.y + "px",
                                        left: D.x + "px",
                                        width: C.w + "px",
                                        height: C.h + "px"
                                    })
                                }
                            }
                            A = B = null
                        });
                        y.exec.call(u, "FileInput", "init", w)
                    });
                    u.connectRuntime(j.extend({}, w, {required_caps: {select_file: true}}))
                }, disable: function (z) {
                    var y = this.getRuntime();
                    if (y) {
                        y.exec.call(this, "FileInput", "disable", j.typeOf(z) === "undefined" ? true : z)
                    }
                }, refresh: function () {
                    u.trigger("Refresh")
                }, destroy: function () {
                    var y = this.getRuntime();
                    if (y) {
                        y.exec.call(this, "FileInput", "destroy");
                        this.disconnectRuntime()
                    }
                    if (j.typeOf(this.files) === "array") {
                        j.each(this.files, function (z) {
                            z.destroy()
                        })
                    }
                    this.files = null
                }
            })
        }

        n.prototype = s.instance;
        return n
    });
    h("moxie/file/FileDrop", ["moxie/core/I18n", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/core/utils/Basic", "moxie/file/File", "moxie/runtime/RuntimeClient", "moxie/core/EventTarget", "moxie/core/utils/Mime"], function (k, l, p, i, n, o, r, m) {
        var q = ["ready", "dragenter", "dragleave", "drop", "error"];

        function j(t) {
            var s = this, u;
            if (typeof(t) === "string") {
                t = {drop_zone: t}
            }
            u = {accept: [{title: k.translate("All Files"), extensions: "*"}], required_caps: {drag_and_drop: true}};
            t = typeof(t) === "object" ? i.extend({}, u, t) : u;
            t.container = l.get(t.drop_zone) || document.body;
            if (l.getStyle(t.container, "position") === "static") {
                t.container.style.position = "relative"
            }
            if (typeof(t.accept) === "string") {
                t.accept = m.mimes2extList(t.accept)
            }
            o.call(s);
            i.extend(s, {
                uid: i.guid("uid_"), ruid: null, files: null, init: function () {
                    s.convertEventPropsToHandlers(q);
                    s.bind("RuntimeInit", function (w, v) {
                        s.ruid = v.uid;
                        s.bind("Drop", function () {
                            var x = v.exec.call(s, "FileDrop", "getFiles");
                            s.files = [];
                            i.each(x, function (y) {
                                s.files.push(new n(s.ruid, y))
                            })
                        }, 999);
                        v.exec.call(s, "FileDrop", "init", t);
                        s.dispatchEvent("ready")
                    });
                    s.connectRuntime(t)
                }, destroy: function () {
                    var v = this.getRuntime();
                    if (v) {
                        v.exec.call(this, "FileDrop", "destroy");
                        this.disconnectRuntime()
                    }
                    this.files = null
                }
            })
        }

        j.prototype = r.instance;
        return j
    });
    h("moxie/runtime/RuntimeTarget", ["moxie/core/utils/Basic", "moxie/runtime/RuntimeClient", "moxie/core/EventTarget"], function (k, j, l) {
        function i() {
            this.uid = k.guid("uid_");
            j.call(this);
            this.destroy = function () {
                this.disconnectRuntime();
                this.unbindAll()
            }
        }

        i.prototype = l.instance;
        return i
    });
    h("moxie/file/FileReader", ["moxie/core/utils/Basic", "moxie/core/utils/Encode", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/file/Blob", "moxie/file/File", "moxie/runtime/RuntimeTarget"], function (i, m, o, q, l, n, k) {
        var p = ["loadstart", "progress", "load", "abort", "error", "loadend"];

        function j() {
            var r = this, t;
            i.extend(this, {
                uid: i.guid("uid_"),
                readyState: j.EMPTY,
                result: null,
                error: null,
                readAsBinaryString: function (u) {
                    s.call(this, "readAsBinaryString", u)
                },
                readAsDataURL: function (u) {
                    s.call(this, "readAsDataURL", u)
                },
                readAsText: function (u) {
                    s.call(this, "readAsText", u)
                },
                abort: function () {
                    this.result = null;
                    if (i.inArray(this.readyState, [j.EMPTY, j.DONE]) !== -1) {
                        return
                    } else {
                        if (this.readyState === j.LOADING) {
                            this.readyState = j.DONE
                        }
                    }
                    if (t) {
                        t.getRuntime().exec.call(this, "FileReader", "abort")
                    }
                    this.trigger("abort");
                    this.trigger("loadend")
                },
                destroy: function () {
                    this.abort();
                    if (t) {
                        t.getRuntime().exec.call(this, "FileReader", "destroy");
                        t.disconnectRuntime()
                    }
                    r = t = null
                }
            });
            function s(z, v) {
                t = new k();
                function x(A) {
                    r.readyState = j.DONE;
                    r.error = A;
                    r.trigger("error");
                    w()
                }

                function w() {
                    t.destroy();
                    t = null;
                    r.trigger("loadend")
                }

                function u(A) {
                    t.bind("Error", function (C, B) {
                        x(B)
                    });
                    t.bind("Progress", function (B) {
                        r.result = A.exec.call(t, "FileReader", "getResult");
                        r.trigger(B)
                    });
                    t.bind("Load", function (B) {
                        r.readyState = j.DONE;
                        r.result = A.exec.call(t, "FileReader", "getResult");
                        r.trigger(B);
                        w()
                    });
                    A.exec.call(t, "FileReader", "read", z, v)
                }

                this.convertEventPropsToHandlers(p);
                if (this.readyState === j.LOADING) {
                    return x(new o.DOMException(o.DOMException.INVALID_STATE_ERR))
                }
                this.readyState = j.LOADING;
                this.trigger("loadstart");
                if (v instanceof l) {
                    if (v.isDetached()) {
                        var y = v.getSource();
                        switch (z) {
                            case"readAsText":
                            case"readAsBinaryString":
                                this.result = y;
                                break;
                            case"readAsDataURL":
                                this.result = "data:" + v.type + ";base64," + m.btoa(y);
                                break
                        }
                        this.readyState = j.DONE;
                        this.trigger("load");
                        w()
                    } else {
                        u(t.connectRuntime(v.ruid))
                    }
                } else {
                    x(new o.DOMException(o.DOMException.NOT_FOUND_ERR))
                }
            }
        }

        j.EMPTY = 0;
        j.LOADING = 1;
        j.DONE = 2;
        j.prototype = q.instance;
        return j
    });
    h("moxie/core/utils/Url", [], function () {
        var i = function (l, t) {
            var s = ["source", "scheme", "authority", "userInfo", "user", "pass", "host", "port", "relative", "path", "directory", "file", "query", "fragment"], p = s.length, q = {
                http: 80,
                https: 443
            }, n = {}, r = /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\\?([^#]*))?(?:#(.*))?)/, o = r.exec(l || "");
            while (p--) {
                if (o[p]) {
                    n[s[p]] = o[p]
                }
            }
            if (!n.scheme) {
                if (!t || typeof(t) === "string") {
                    t = i(t || document.location.href)
                }
                n.scheme = t.scheme;
                n.host = t.host;
                n.port = t.port;
                var u = "";
                if (/^[^\/]/.test(n.path)) {
                    u = t.path;
                    if (!/(\/|\/[^\.]+)$/.test(u)) {
                        u = u.replace(/\/[^\/]+$/, "/")
                    } else {
                        u += "/"
                    }
                }
                n.path = u + (n.path || "")
            }
            if (!n.port) {
                n.port = q[n.scheme] || 80
            }
            n.port = parseInt(n.port, 10);
            if (!n.path) {
                n.path = "/"
            }
            delete n.source;
            return n
        };
        var k = function (m) {
            var n = {http: 80, https: 443}, l = i(m);
            return l.scheme + "://" + l.host + (l.port !== n[l.scheme] ? ":" + l.port : "") + l.path + (l.query ? l.query : "")
        };
        var j = function (m) {
            function l(n) {
                return [n.scheme, n.host, n.port].join("/")
            }

            if (typeof m === "string") {
                m = i(m)
            }
            return l(i()) === l(m)
        };
        return {parseUrl: i, resolveUrl: k, hasSameOrigin: j}
    });
    h("moxie/file/FileReaderSync", ["moxie/core/utils/Basic", "moxie/runtime/RuntimeClient", "moxie/core/utils/Encode"], function (k, j, i) {
        return function () {
            j.call(this);
            k.extend(this, {
                uid: k.guid("uid_"), readAsBinaryString: function (m) {
                    return l.call(this, "readAsBinaryString", m)
                }, readAsDataURL: function (m) {
                    return l.call(this, "readAsDataURL", m)
                }, readAsText: function (m) {
                    return l.call(this, "readAsText", m)
                }
            });
            function l(s, o) {
                if (o.isDetached()) {
                    var r = o.getSource();
                    switch (s) {
                        case"readAsBinaryString":
                            return r;
                        case"readAsDataURL":
                            return "data:" + o.type + ";base64," + i.btoa(r);
                        case"readAsText":
                            var n = "";
                            for (var p = 0, q = r.length; p < q; p++) {
                                n += String.fromCharCode(r[p])
                            }
                            return n
                    }
                } else {
                    var m = this.connectRuntime(o.ruid).exec.call(this, "FileReaderSync", "read", s, o);
                    this.disconnectRuntime();
                    return m
                }
            }
        }
    });
    h("moxie/xhr/FormData", ["moxie/core/Exceptions", "moxie/core/utils/Basic", "moxie/file/Blob"], function (i, j, l) {
        function k() {
            var m, n = [];
            j.extend(this, {
                append: function (p, q) {
                    var o = this, r = j.typeOf(q);
                    if (q instanceof l) {
                        m = {name: p, value: q}
                    } else {
                        if ("array" === r) {
                            p += "[]";
                            j.each(q, function (s) {
                                o.append(p, s)
                            })
                        } else {
                            if ("object" === r) {
                                j.each(q, function (t, s) {
                                    o.append(p + "[" + s + "]", t)
                                })
                            } else {
                                if ("null" === r || "undefined" === r || "number" === r && isNaN(q)) {
                                    o.append(p, "false")
                                } else {
                                    n.push({name: p, value: q.toString()})
                                }
                            }
                        }
                    }
                }, hasBlob: function () {
                    return !!this.getBlob()
                }, getBlob: function () {
                    return m && m.value || null
                }, getBlobName: function () {
                    return m && m.name || null
                }, each: function (o) {
                    j.each(n, function (p) {
                        o(p.value, p.name)
                    });
                    if (m) {
                        o(m.value, m.name)
                    }
                }, destroy: function () {
                    m = null;
                    n = []
                }
            })
        }

        return k
    });
    h("moxie/xhr/XMLHttpRequest", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/core/utils/Encode", "moxie/core/utils/Url", "moxie/runtime/Runtime", "moxie/runtime/RuntimeTarget", "moxie/file/Blob", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/core/utils/Env", "moxie/core/utils/Mime"], function (q, r, p, y, u, o, s, n, w, z, i, t) {
        var j = {
            100: "Continue",
            101: "Switching Protocols",
            102: "Processing",
            200: "OK",
            201: "Created",
            202: "Accepted",
            203: "Non-Authoritative Information",
            204: "No Content",
            205: "Reset Content",
            206: "Partial Content",
            207: "Multi-Status",
            226: "IM Used",
            300: "Multiple Choices",
            301: "Moved Permanently",
            302: "Found",
            303: "See Other",
            304: "Not Modified",
            305: "Use Proxy",
            306: "Reserved",
            307: "Temporary Redirect",
            400: "Bad Request",
            401: "Unauthorized",
            402: "Payment Required",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            406: "Not Acceptable",
            407: "Proxy Authentication Required",
            408: "Request Timeout",
            409: "Conflict",
            410: "Gone",
            411: "Length Required",
            412: "Precondition Failed",
            413: "Request Entity Too Large",
            414: "Request-URI Too Long",
            415: "Unsupported Media Type",
            416: "Requested Range Not Satisfiable",
            417: "Expectation Failed",
            422: "Unprocessable Entity",
            423: "Locked",
            424: "Failed Dependency",
            426: "Upgrade Required",
            500: "Internal Server Error",
            501: "Not Implemented",
            502: "Bad Gateway",
            503: "Service Unavailable",
            504: "Gateway Timeout",
            505: "HTTP Version Not Supported",
            506: "Variant Also Negotiates",
            507: "Insufficient Storage",
            510: "Not Extended"
        };

        function m() {
            this.uid = q.guid("uid_")
        }

        m.prototype = p.instance;
        var l = ["loadstart", "progress", "abort", "error", "load", "timeout", "loadend"];
        var k = 1, A = 2;

        function v() {
            var S = this, E = {
                timeout: 0,
                readyState: v.UNSENT,
                withCredentials: false,
                status: 0,
                statusText: "",
                responseType: "",
                responseXML: null,
                responseText: null,
                response: null
            }, Y = true, J, Q, R = {}, T, G, I = null, K = null, ab = false, B = false, x = false, L = false, D = false, H = false, O, X, W = null, Z = null, U = {}, P, V = "", C;
            q.extend(this, E, {
                uid: q.guid("uid_"), upload: new m(), open: function (ah, af, ag, ad, ae) {
                    var ac;
                    if (!ah || !af) {
                        throw new r.DOMException(r.DOMException.SYNTAX_ERR)
                    }
                    if (/[\u0100-\uffff]/.test(ah) || y.utf8_encode(ah) !== ah) {
                        throw new r.DOMException(r.DOMException.SYNTAX_ERR)
                    }
                    if (!!~q.inArray(ah.toUpperCase(), ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT", "TRACE", "TRACK"])) {
                        Q = ah.toUpperCase()
                    }
                    if (!!~q.inArray(Q, ["CONNECT", "TRACE", "TRACK"])) {
                        throw new r.DOMException(r.DOMException.SECURITY_ERR)
                    }
                    af = y.utf8_encode(af);
                    ac = u.parseUrl(af);
                    H = u.hasSameOrigin(ac);
                    J = u.resolveUrl(af);
                    if ((ad || ae) && !H) {
                        throw new r.DOMException(r.DOMException.INVALID_ACCESS_ERR)
                    }
                    T = ad || ac.user;
                    G = ae || ac.pass;
                    Y = ag || true;
                    if (Y === false && (aa("timeout") || aa("withCredentials") || aa("responseType") !== "")) {
                        throw new r.DOMException(r.DOMException.INVALID_ACCESS_ERR)
                    }
                    ab = !Y;
                    B = false;
                    R = {};
                    N.call(this);
                    aa("readyState", v.OPENED);
                    this.convertEventPropsToHandlers(["readystatechange"]);
                    this.dispatchEvent("readystatechange")
                }, setRequestHeader: function (ae, ad) {
                    var ac = ["accept-charset", "accept-encoding", "access-control-request-headers", "access-control-request-method", "connection", "content-length", "cookie", "cookie2", "content-transfer-encoding", "date", "expect", "host", "keep-alive", "origin", "referer", "te", "trailer", "transfer-encoding", "upgrade", "user-agent", "via"];
                    if (aa("readyState") !== v.OPENED || B) {
                        throw new r.DOMException(r.DOMException.INVALID_STATE_ERR)
                    }
                    if (/[\u0100-\uffff]/.test(ae) || y.utf8_encode(ae) !== ae) {
                        throw new r.DOMException(r.DOMException.SYNTAX_ERR)
                    }
                    ae = q.trim(ae).toLowerCase();
                    if (!!~q.inArray(ae, ac) || /^(proxy\-|sec\-)/.test(ae)) {
                        return false
                    }
                    if (!R[ae]) {
                        R[ae] = ad
                    } else {
                        R[ae] += ", " + ad
                    }
                    return true
                }, getAllResponseHeaders: function () {
                    return V || ""
                }, getResponseHeader: function (ac) {
                    ac = ac.toLowerCase();
                    if (D || !!~q.inArray(ac, ["set-cookie", "set-cookie2"])) {
                        return null
                    }
                    if (V && V !== "") {
                        if (!C) {
                            C = {};
                            q.each(V.split(/\r\n/), function (ad) {
                                var ae = ad.split(/:\s+/);
                                if (ae.length === 2) {
                                    ae[0] = q.trim(ae[0]);
                                    C[ae[0].toLowerCase()] = {header: ae[0], value: q.trim(ae[1])}
                                }
                            })
                        }
                        if (C.hasOwnProperty(ac)) {
                            return C[ac].header + ": " + C[ac].value
                        }
                    }
                    return null
                }, overrideMimeType: function (ad) {
                    var ac, ae;
                    if (!!~q.inArray(aa("readyState"), [v.LOADING, v.DONE])) {
                        throw new r.DOMException(r.DOMException.INVALID_STATE_ERR)
                    }
                    ad = q.trim(ad.toLowerCase());
                    if (/;/.test(ad) && (ac = ad.match(/^([^;]+)(?:;\scharset\=)?(.*)$/))) {
                        ad = ac[1];
                        if (ac[2]) {
                            ae = ac[2]
                        }
                    }
                    if (!t.mimes[ad]) {
                        throw new r.DOMException(r.DOMException.SYNTAX_ERR)
                    }
                    W = ad;
                    Z = ae
                }, send: function (ae, ad) {
                    if (q.typeOf(ad) === "string") {
                        U = {ruid: ad}
                    } else {
                        if (!ad) {
                            U = {}
                        } else {
                            U = ad
                        }
                    }
                    this.convertEventPropsToHandlers(l);
                    this.upload.convertEventPropsToHandlers(l);
                    if (this.readyState !== v.OPENED || B) {
                        throw new r.DOMException(r.DOMException.INVALID_STATE_ERR)
                    }
                    if (ae instanceof n) {
                        U.ruid = ae.ruid;
                        K = ae.type || "application/octet-stream"
                    } else {
                        if (ae instanceof z) {
                            if (ae.hasBlob()) {
                                var ac = ae.getBlob();
                                U.ruid = ac.ruid;
                                K = ac.type || "application/octet-stream"
                            }
                        } else {
                            if (typeof ae === "string") {
                                I = "UTF-8";
                                K = "text/plain;charset=UTF-8";
                                ae = y.utf8_encode(ae)
                            }
                        }
                    }
                    if (!this.withCredentials) {
                        this.withCredentials = (U.required_caps && U.required_caps.send_browser_cookies) && !H
                    }
                    x = (!ab && this.upload.hasEventListener());
                    D = false;
                    L = !ae;
                    if (!ab) {
                        B = true
                    }
                    F.call(this, ae)
                }, abort: function () {
                    D = true;
                    ab = false;
                    if (!~q.inArray(aa("readyState"), [v.UNSENT, v.OPENED, v.DONE])) {
                        aa("readyState", v.DONE);
                        B = false;
                        if (P) {
                            P.getRuntime().exec.call(P, "XMLHttpRequest", "abort", L)
                        } else {
                            throw new r.DOMException(r.DOMException.INVALID_STATE_ERR)
                        }
                        L = true
                    } else {
                        aa("readyState", v.UNSENT)
                    }
                }, destroy: function () {
                    if (P) {
                        if (q.typeOf(P.destroy) === "function") {
                            P.destroy()
                        }
                        P = null
                    }
                    this.unbindAll();
                    if (this.upload) {
                        this.upload.unbindAll();
                        this.upload = null
                    }
                }
            });
            function aa(ad, ac) {
                if (!E.hasOwnProperty(ad)) {
                    return
                }
                if (arguments.length === 1) {
                    return i.can("define_property") ? E[ad] : S[ad]
                } else {
                    if (i.can("define_property")) {
                        E[ad] = ac
                    } else {
                        S[ad] = ac
                    }
                }
            }

            function F(af) {
                var ad = this;
                O = new Date().getTime();
                P = new s();
                function ae() {
                    if (P) {
                        P.destroy();
                        P = null
                    }
                    ad.dispatchEvent("loadend");
                    ad = null
                }

                function ac(ag) {
                    P.bind("LoadStart", function (ah) {
                        aa("readyState", v.LOADING);
                        ad.dispatchEvent("readystatechange");
                        ad.dispatchEvent(ah);
                        if (x) {
                            ad.upload.dispatchEvent(ah)
                        }
                    });
                    P.bind("Progress", function (ah) {
                        if (aa("readyState") !== v.LOADING) {
                            aa("readyState", v.LOADING);
                            ad.dispatchEvent("readystatechange")
                        }
                        ad.dispatchEvent(ah)
                    });
                    P.bind("UploadProgress", function (ah) {
                        if (x) {
                            ad.upload.dispatchEvent({
                                type: "progress",
                                lengthComputable: false,
                                total: ah.total,
                                loaded: ah.loaded
                            })
                        }
                    });
                    P.bind("Load", function (ah) {
                        aa("readyState", v.DONE);
                        aa("status", Number(ag.exec.call(P, "XMLHttpRequest", "getStatus") || 0));
                        aa("statusText", j[aa("status")] || "");
                        aa("response", ag.exec.call(P, "XMLHttpRequest", "getResponse", aa("responseType")));
                        if (!!~q.inArray(aa("responseType"), ["text", ""])) {
                            aa("responseText", aa("response"))
                        } else {
                            if (aa("responseType") === "document") {
                                aa("responseXML", aa("response"))
                            }
                        }
                        V = ag.exec.call(P, "XMLHttpRequest", "getAllResponseHeaders");
                        ad.dispatchEvent("readystatechange");
                        if (aa("status") > 0) {
                            if (x) {
                                ad.upload.dispatchEvent(ah)
                            }
                            ad.dispatchEvent(ah)
                        } else {
                            D = true;
                            ad.dispatchEvent("error")
                        }
                        ae()
                    });
                    P.bind("Abort", function (ah) {
                        ad.dispatchEvent(ah);
                        ae()
                    });
                    P.bind("Error", function (ah) {
                        D = true;
                        aa("readyState", v.DONE);
                        ad.dispatchEvent("readystatechange");
                        L = true;
                        ad.dispatchEvent(ah);
                        ae()
                    });
                    ag.exec.call(P, "XMLHttpRequest", "send", {
                        url: J,
                        method: Q,
                        async: Y,
                        user: T,
                        password: G,
                        headers: R,
                        mimeType: K,
                        encoding: I,
                        responseType: ad.responseType,
                        withCredentials: ad.withCredentials,
                        options: U
                    }, af)
                }

                if (typeof(U.required_caps) === "string") {
                    U.required_caps = o.parseCaps(U.required_caps)
                }
                U.required_caps = q.extend({}, U.required_caps, {return_response_type: ad.responseType});
                if (af instanceof z) {
                    U.required_caps.send_multipart = true
                }
                if (!H) {
                    U.required_caps.do_cors = true
                }
                if (U.ruid) {
                    ac(P.connectRuntime(U))
                } else {
                    P.bind("RuntimeInit", function (ah, ag) {
                        ac(ag)
                    });
                    P.bind("RuntimeError", function (ah, ag) {
                        ad.dispatchEvent("RuntimeError", ag)
                    });
                    P.connectRuntime(U)
                }
            }

            function N() {
                aa("responseText", "");
                aa("responseXML", null);
                aa("response", null);
                aa("status", 0);
                aa("statusText", "");
                O = X = null
            }
        }

        v.UNSENT = 0;
        v.OPENED = 1;
        v.HEADERS_RECEIVED = 2;
        v.LOADING = 3;
        v.DONE = 4;
        v.prototype = p.instance;
        return v
    });
    h("moxie/runtime/Transporter", ["moxie/core/utils/Basic", "moxie/core/utils/Encode", "moxie/runtime/RuntimeClient", "moxie/core/EventTarget"], function (l, i, j, m) {
        function k() {
            var r, p, n, s, v, u;
            j.call(this);
            l.extend(this, {
                uid: l.guid("uid_"), state: k.IDLE, result: null, transport: function (A, z, y) {
                    var x = this;
                    y = l.extend({chunk_size: 204798}, y);
                    if ((r = y.chunk_size % 3)) {
                        y.chunk_size += 3 - r
                    }
                    u = y.chunk_size;
                    t.call(this);
                    n = A;
                    s = A.length;
                    if (l.typeOf(y) === "string" || y.ruid) {
                        q.call(x, z, this.connectRuntime(y))
                    } else {
                        var w = function (C, B) {
                            x.unbind("RuntimeInit", w);
                            q.call(x, z, B)
                        };
                        this.bind("RuntimeInit", w);
                        this.connectRuntime(y)
                    }
                }, abort: function () {
                    var w = this;
                    w.state = k.IDLE;
                    if (p) {
                        p.exec.call(w, "Transporter", "clear");
                        w.trigger("TransportingAborted")
                    }
                    t.call(w)
                }, destroy: function () {
                    this.unbindAll();
                    p = null;
                    this.disconnectRuntime();
                    t.call(this)
                }
            });
            function t() {
                s = v = 0;
                n = this.result = null
            }

            function q(x, y) {
                var w = this;
                p = y;
                w.bind("TransportingProgress", function (z) {
                    v = z.loaded;
                    if (v < s && l.inArray(w.state, [k.IDLE, k.DONE]) === -1) {
                        o.call(w)
                    }
                }, 999);
                w.bind("TransportingComplete", function () {
                    v = s;
                    w.state = k.DONE;
                    n = null;
                    w.result = p.exec.call(w, "Transporter", "getAsBlob", x || "")
                }, 999);
                w.state = k.BUSY;
                w.trigger("TransportingStarted");
                o.call(w)
            }

            function o() {
                var w = this, x, y = s - v;
                if (u > y) {
                    u = y
                }
                x = i.btoa(n.substr(v, u));
                p.exec.call(w, "Transporter", "receive", x, s)
            }
        }

        k.IDLE = 0;
        k.BUSY = 1;
        k.DONE = 2;
        k.prototype = m.instance;
        return k
    });
    h("moxie/image/Image", ["moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/file/FileReaderSync", "moxie/xhr/XMLHttpRequest", "moxie/runtime/Runtime", "moxie/runtime/RuntimeClient", "moxie/runtime/Transporter", "moxie/core/utils/Env", "moxie/core/EventTarget", "moxie/file/Blob", "moxie/file/File", "moxie/core/utils/Encode"], function (k, n, t, r, u, j, s, m, q, w, l, p, o) {
        var v = ["progress", "load", "error", "resize", "embedded"];

        function i() {
            s.call(this);
            k.extend(this, {
                uid: k.guid("uid_"),
                ruid: null,
                name: "",
                size: 0,
                width: 0,
                height: 0,
                type: "",
                meta: {},
                clone: function () {
                    this.load.apply(this, arguments)
                },
                load: function () {
                    this.bind("Load Resize", function () {
                        y.call(this)
                    }, 999);
                    this.convertEventPropsToHandlers(v);
                    z.apply(this, arguments)
                },
                downsize: function (D) {
                    var E = {width: this.width, height: this.height, crop: false, preserveHeaders: true};
                    if (typeof(D) === "object") {
                        D = k.extend(E, D)
                    } else {
                        D = k.extend(E, {
                            width: arguments[0],
                            height: arguments[1],
                            crop: arguments[2],
                            preserveHeaders: arguments[3]
                        })
                    }
                    try {
                        if (!this.size) {
                            throw new t.DOMException(t.DOMException.INVALID_STATE_ERR)
                        }
                        if (this.width > i.MAX_RESIZE_WIDTH || this.height > i.MAX_RESIZE_HEIGHT) {
                            throw new t.ImageError(t.ImageError.MAX_RESOLUTION_ERR)
                        }
                        this.getRuntime().exec.call(this, "Image", "downsize", D.width, D.height, D.crop, D.preserveHeaders)
                    } catch (C) {
                        this.trigger("error", C.code)
                    }
                },
                crop: function (E, C, D) {
                    this.downsize(E, C, true, D)
                },
                getAsCanvas: function () {
                    if (!q.can("create_canvas")) {
                        throw new t.RuntimeError(t.RuntimeError.NOT_SUPPORTED_ERR)
                    }
                    var C = this.connectRuntime(this.ruid);
                    return C.exec.call(this, "Image", "getAsCanvas")
                },
                getAsBlob: function (C, D) {
                    if (!this.size) {
                        throw new t.DOMException(t.DOMException.INVALID_STATE_ERR)
                    }
                    if (!C) {
                        C = "image/jpeg"
                    }
                    if (C === "image/jpeg" && !D) {
                        D = 90
                    }
                    return this.getRuntime().exec.call(this, "Image", "getAsBlob", C, D)
                },
                getAsDataURL: function (C, D) {
                    if (!this.size) {
                        throw new t.DOMException(t.DOMException.INVALID_STATE_ERR)
                    }
                    return this.getRuntime().exec.call(this, "Image", "getAsDataURL", C, D)
                },
                getAsBinaryString: function (C, E) {
                    var D = this.getAsDataURL(C, E);
                    return o.atob(D.substring(D.indexOf("base64,") + 7))
                },
                embed: function (F) {
                    var O = this, K, J, L, H, P = arguments[1] || {}, E = this.width, N = this.height, G;

                    function D() {
                        if (q.can("create_canvas")) {
                            var Q = K.getAsCanvas();
                            if (Q) {
                                F.appendChild(Q);
                                Q = null;
                                K.destroy();
                                O.trigger("embedded");
                                return
                            }
                        }
                        var S = K.getAsDataURL(J, L);
                        if (!S) {
                            throw new t.ImageError(t.ImageError.WRONG_FORMAT)
                        }
                        if (q.can("use_data_uri_of", S.length)) {
                            F.innerHTML = '<img src="' + S + '" width="' + K.width + '" height="' + K.height + '" />';
                            K.destroy();
                            O.trigger("embedded")
                        } else {
                            var R = new m();
                            R.bind("TransportingComplete", function () {
                                G = O.connectRuntime(this.result.ruid);
                                O.bind("Embedded", function () {
                                    k.extend(G.getShimContainer().style, {
                                        top: "0px",
                                        left: "0px",
                                        width: K.width + "px",
                                        height: K.height + "px"
                                    });
                                    G = null
                                }, 999);
                                G.exec.call(O, "ImageView", "display", this.result.uid, E, N);
                                K.destroy()
                            });
                            R.transport(o.atob(S.substring(S.indexOf("base64,") + 7)), J, k.extend({}, P, {
                                required_caps: {display_media: true},
                                runtime_order: "flash,silverlight",
                                container: F
                            }))
                        }
                    }

                    try {
                        if (!(F = n.get(F))) {
                            throw new t.DOMException(t.DOMException.INVALID_NODE_TYPE_ERR)
                        }
                        if (!this.size) {
                            throw new t.DOMException(t.DOMException.INVALID_STATE_ERR)
                        }
                        if (this.width > i.MAX_RESIZE_WIDTH || this.height > i.MAX_RESIZE_HEIGHT) {
                            throw new t.ImageError(t.ImageError.MAX_RESOLUTION_ERR)
                        }
                        J = P.type || this.type || "image/jpeg";
                        L = P.quality || 90;
                        H = k.typeOf(P.crop) !== "undefined" ? P.crop : false;
                        if (P.width) {
                            E = P.width;
                            N = P.height || E
                        } else {
                            var C = n.getSize(F);
                            if (C.w && C.h) {
                                E = C.w;
                                N = C.h
                            }
                        }
                        K = new i();
                        K.bind("Resize", function () {
                            D.call(O)
                        });
                        K.bind("Load", function () {
                            K.downsize(E, N, H, false)
                        });
                        K.clone(this, false);
                        return K
                    } catch (I) {
                        this.trigger("error", I.code)
                    }
                },
                destroy: function () {
                    if (this.ruid) {
                        this.getRuntime().exec.call(this, "Image", "destroy");
                        this.disconnectRuntime()
                    }
                    this.unbindAll()
                }
            });
            function y(C) {
                if (!C) {
                    C = this.getRuntime().exec.call(this, "Image", "getInfo")
                }
                this.size = C.size;
                this.width = C.width;
                this.height = C.height;
                this.type = C.type;
                this.meta = C.meta;
                if (this.name === "") {
                    this.name = C.name
                }
            }

            function z(E) {
                var D = k.typeOf(E);
                try {
                    if (E instanceof i) {
                        if (!E.size) {
                            throw new t.DOMException(t.DOMException.INVALID_STATE_ERR)
                        }
                        x.apply(this, arguments)
                    } else {
                        if (E instanceof l) {
                            if (!~k.inArray(E.type, ["image/jpeg", "image/png"])) {
                                throw new t.ImageError(t.ImageError.WRONG_FORMAT)
                            }
                            A.apply(this, arguments)
                        } else {
                            if (k.inArray(D, ["blob", "file"]) !== -1) {
                                z.call(this, new p(null, E), arguments[1])
                            } else {
                                if (D === "string") {
                                    if (/^data:[^;]*;base64,/.test(E)) {
                                        z.call(this, new l(null, {data: E}), arguments[1])
                                    } else {
                                        B.apply(this, arguments)
                                    }
                                } else {
                                    if (D === "node" && E.nodeName.toLowerCase() === "img") {
                                        z.call(this, E.src, arguments[1])
                                    } else {
                                        throw new t.DOMException(t.DOMException.TYPE_MISMATCH_ERR)
                                    }
                                }
                            }
                        }
                    }
                } catch (C) {
                    this.trigger("error", C.code)
                }
            }

            function x(C, D) {
                var E = this.connectRuntime(C.ruid);
                this.ruid = E.uid;
                E.exec.call(this, "Image", "loadFromImage", C, (k.typeOf(D) === "undefined" ? true : D))
            }

            function A(E, F) {
                var D = this;
                D.name = E.name || "";
                function C(G) {
                    D.ruid = G.uid;
                    G.exec.call(D, "Image", "loadFromBlob", E)
                }

                if (E.isDetached()) {
                    this.bind("RuntimeInit", function (H, G) {
                        C(G)
                    });
                    if (F && typeof(F.required_caps) === "string") {
                        F.required_caps = j.parseCaps(F.required_caps)
                    }
                    this.connectRuntime(k.extend({required_caps: {access_image_binary: true, resize_image: true}}, F))
                } else {
                    C(this.connectRuntime(E.ruid))
                }
            }

            function B(E, D) {
                var C = this, F;
                F = new u();
                F.open("get", E);
                F.responseType = "blob";
                F.onprogress = function (G) {
                    C.trigger(G)
                };
                F.onload = function () {
                    A.call(C, F.response, true)
                };
                F.onerror = function (G) {
                    C.trigger(G)
                };
                F.onloadend = function () {
                    F.destroy()
                };
                F.bind("RuntimeError", function (H, G) {
                    C.trigger("RuntimeError", G)
                });
                F.send(null, D)
            }
        }

        i.MAX_RESIZE_WIDTH = 6500;
        i.MAX_RESIZE_HEIGHT = 6500;
        i.prototype = w.instance;
        return i
    });
    h("moxie/runtime/html5/Runtime", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/Runtime", "moxie/core/utils/Env"], function (n, i, k, j) {
        var m = "html5", l = {};

        function o(q) {
            var p = this, t = k.capTest, s = k.capTrue;
            var r = n.extend({
                access_binary: t(window.FileReader || window.File && window.File.getAsDataURL),
                access_image_binary: function () {
                    return p.can("access_binary") && !!l.Image
                },
                display_media: t(j.can("create_canvas") || j.can("use_data_uri_over32kb")),
                do_cors: t(window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest()),
                drag_and_drop: t(function () {
                    var u = document.createElement("div");
                    return (("draggable" in u) || ("ondragstart" in u && "ondrop" in u)) && (j.browser !== "IE" || j.version > 9)
                }()),
                filter_by_extension: t(function () {
                    return (j.browser === "Chrome" && j.version >= 28) || (j.browser === "IE" && j.version >= 10)
                }()),
                return_response_headers: s,
                return_response_type: function (u) {
                    if (u === "json" && !!window.JSON) {
                        return true
                    }
                    return j.can("return_response_type", u)
                },
                return_status_code: s,
                report_upload_progress: t(window.XMLHttpRequest && new XMLHttpRequest().upload),
                resize_image: function () {
                    return p.can("access_binary") && j.can("create_canvas")
                },
                select_file: function () {
                    return j.can("use_fileinput") && window.File
                },
                select_folder: function () {
                    return p.can("select_file") && j.browser === "Chrome" && j.version >= 21
                },
                select_multiple: function () {
                    return p.can("select_file") && !(j.browser === "Safari" && j.os === "Windows") && !(j.os === "iOS" && j.verComp(j.osVersion, "7.0.4", "<"))
                },
                send_binary_string: t(window.XMLHttpRequest && (new XMLHttpRequest().sendAsBinary || (window.Uint8Array && window.ArrayBuffer))),
                send_custom_headers: t(window.XMLHttpRequest),
                send_multipart: function () {
                    return !!(window.XMLHttpRequest && new XMLHttpRequest().upload && window.FormData) || p.can("send_binary_string")
                },
                slice_blob: t(window.File && (File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice)),
                stream_upload: function () {
                    return p.can("slice_blob") && p.can("send_multipart")
                },
                summon_file_dialog: t(function () {
                    return (j.browser === "Firefox" && j.version >= 4) || (j.browser === "Opera" && j.version >= 12) || (j.browser === "IE" && j.version >= 10) || !!~n.inArray(j.browser, ["Chrome", "Safari"])
                }()),
                upload_filesize: s
            }, arguments[2]);
            k.call(this, q, (arguments[1] || m), r);
            n.extend(this, {
                init: function () {
                    this.trigger("Init")
                }, destroy: (function (u) {
                    return function () {
                        u.call(p);
                        u = p = null
                    }
                }(this.destroy))
            });
            n.extend(this.getShim(), l)
        }

        k.addConstructor(m, o);
        return l
    });
    h("moxie/runtime/html5/file/Blob", ["moxie/runtime/html5/Runtime", "moxie/file/Blob"], function (j, k) {
        function i() {
            function l(n, q, m) {
                var o;
                if (window.File.prototype.slice) {
                    try {
                        n.slice();
                        return n.slice(q, m)
                    } catch (p) {
                        return n.slice(q, m - q)
                    }
                } else {
                    if ((o = window.File.prototype.webkitSlice || window.File.prototype.mozSlice)) {
                        return o.call(n, q, m)
                    } else {
                        return null
                    }
                }
            }

            this.slice = function () {
                return new k(this.getRuntime().uid, l.apply(this, arguments))
            }
        }

        return (j.Blob = i)
    });
    h("moxie/core/utils/Events", ["moxie/core/utils/Basic"], function (o) {
        var p = {}, l = "moxie_" + o.guid();

        function k() {
            this.returnValue = false
        }

        function j() {
            this.cancelBubble = true
        }

        var m = function (u, q, v, s) {
            var t, r;
            q = q.toLowerCase();
            if (u.addEventListener) {
                t = v;
                u.addEventListener(q, t, false)
            } else {
                if (u.attachEvent) {
                    t = function () {
                        var w = window.event;
                        if (!w.target) {
                            w.target = w.srcElement
                        }
                        w.preventDefault = k;
                        w.stopPropagation = j;
                        v(w)
                    };
                    u.attachEvent("on" + q, t)
                }
            }
            if (!u[l]) {
                u[l] = o.guid()
            }
            if (!p.hasOwnProperty(u[l])) {
                p[u[l]] = {}
            }
            r = p[u[l]];
            if (!r.hasOwnProperty(q)) {
                r[q] = []
            }
            r[q].push({func: t, orig: v, key: s})
        };
        var n = function (v, q, w) {
            var t, s;
            q = q.toLowerCase();
            if (v[l] && p[v[l]] && p[v[l]][q]) {
                t = p[v[l]][q]
            } else {
                return
            }
            for (var r = t.length - 1; r >= 0; r--) {
                if (t[r].orig === w || t[r].key === w) {
                    if (v.removeEventListener) {
                        v.removeEventListener(q, t[r].func, false)
                    } else {
                        if (v.detachEvent) {
                            v.detachEvent("on" + q, t[r].func)
                        }
                    }
                    t[r].orig = null;
                    t[r].func = null;
                    t.splice(r, 1);
                    if (w !== s) {
                        break
                    }
                }
            }
            if (!t.length) {
                delete p[v[l]][q]
            }
            if (o.isEmptyObj(p[v[l]])) {
                delete p[v[l]];
                try {
                    delete v[l]
                } catch (u) {
                    v[l] = s
                }
            }
        };
        var i = function (r, q) {
            if (!r || !r[l]) {
                return
            }
            o.each(p[r[l]], function (t, s) {
                n(r, s, q)
            })
        };
        return {addEvent: m, removeEvent: n, removeAllEvents: i}
    });
    h("moxie/runtime/html5/file/FileInput", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/utils/Events", "moxie/core/utils/Mime", "moxie/core/utils/Env"], function (m, o, l, j, k, i) {
        function n() {
            var q = [], p;
            o.extend(this, {
                init: function (A) {
                    var r = this, y = r.getRuntime(), x, t, u, z, w, v;
                    p = A;
                    q = [];
                    u = p.accept.mimes || k.extList2mimes(p.accept, y.can("filter_by_extension"));
                    t = y.getShimContainer();
                    t.innerHTML = '<input id="' + y.uid + '" type="file" style="font-size:999px;opacity:0;"' + (p.multiple && y.can("select_multiple") ? "multiple" : "") + (p.directory && y.can("select_folder") ? "webkitdirectory directory" : "") + (u ? ' accept="' + u.join(",") + '"' : "") + " />";
                    x = l.get(y.uid);
                    o.extend(x.style, {position: "absolute", top: 0, left: 0, width: "100%", height: "100%"});
                    z = l.get(p.browse_button);
                    w = parseInt(l.getStyle(z, "z-index"), 10) || 0;
                    if (y.can("summon_file_dialog")) {
                        if (l.getStyle(z, "position") === "static") {
                            z.style.position = "relative"
                        }
                        t.style.zIndex = w - 1;
                        j.addEvent(z, "click", function (C) {
                            var B = l.get(y.uid);
                            if (B && !B.disabled) {
                                B.click()
                            }
                            C.preventDefault()
                        }, r.uid)
                    } else {
                        t.style.zIndex = w
                    }
                    v = y.can("summon_file_dialog") ? z : t;
                    j.addEvent(v, "mouseover", function () {
                        r.trigger("mouseenter")
                    }, r.uid);
                    j.addEvent(v, "mouseout", function () {
                        r.trigger("mouseleave")
                    }, r.uid);
                    j.addEvent(v, "mousedown", function () {
                        r.trigger("mousedown")
                    }, r.uid);
                    j.addEvent(l.get(p.container), "mouseup", function () {
                        r.trigger("mouseup")
                    }, r.uid);
                    x.onchange = function s() {
                        q = [];
                        if (p.directory) {
                            o.each(this.files, function (C) {
                                if (C.name !== ".") {
                                    q.push(C)
                                }
                            })
                        } else {
                            q = [].slice.call(this.files)
                        }
                        if (i.browser !== "IE" && i.browser !== "IEMobile") {
                            this.value = ""
                        } else {
                            var B = this.cloneNode(true);
                            this.parentNode.replaceChild(B, this);
                            B.onchange = s
                        }
                        r.trigger("change")
                    };
                    r.trigger({type: "ready", async: true});
                    t = null
                }, getFiles: function () {
                    return q
                }, disable: function (t) {
                    var s = this.getRuntime(), r;
                    if ((r = l.get(s.uid))) {
                        r.disabled = !!t
                    }
                }, destroy: function () {
                    var s = this.getRuntime(), t = s.getShim(), r = s.getShimContainer();
                    j.removeAllEvents(r, this.uid);
                    j.removeAllEvents(p && l.get(p.container), this.uid);
                    j.removeAllEvents(p && l.get(p.browse_button), this.uid);
                    if (r) {
                        r.innerHTML = ""
                    }
                    t.removeInstance(this.uid);
                    q = p = r = t = null
                }
            })
        }

        return (m.FileInput = n)
    });
    h("moxie/runtime/html5/file/FileDrop", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/utils/Events", "moxie/core/utils/Mime"], function (l, m, k, i, j) {
        function n() {
            var p = [], s = [], w;
            m.extend(this, {
                init: function (z) {
                    var y = this, A;
                    w = z;
                    s = r(w.accept);
                    A = w.container;
                    i.addEvent(A, "dragover", function (B) {
                        if (!q(B)) {
                            return
                        }
                        B.preventDefault();
                        B.dataTransfer.dropEffect = "copy"
                    }, y.uid);
                    i.addEvent(A, "drop", function (B) {
                        if (!q(B)) {
                            return
                        }
                        B.preventDefault();
                        p = [];
                        if (B.dataTransfer.items && B.dataTransfer.items[0].webkitGetAsEntry) {
                            v(B.dataTransfer.items, function () {
                                y.trigger("drop")
                            })
                        } else {
                            m.each(B.dataTransfer.files, function (C) {
                                if (u(C)) {
                                    p.push(C)
                                }
                            });
                            y.trigger("drop")
                        }
                    }, y.uid);
                    i.addEvent(A, "dragenter", function (B) {
                        y.trigger("dragenter")
                    }, y.uid);
                    i.addEvent(A, "dragleave", function (B) {
                        y.trigger("dragleave")
                    }, y.uid)
                }, getFiles: function () {
                    return p
                }, destroy: function () {
                    i.removeAllEvents(w && k.get(w.container), this.uid);
                    p = s = w = null
                }
            });
            function q(z) {
                if (!z.dataTransfer || !z.dataTransfer.types) {
                    return false
                }
                var y = m.toArray(z.dataTransfer.types || []);
                return m.inArray("Files", y) !== -1 || m.inArray("public.file-url", y) !== -1 || m.inArray("application/x-moz-file", y) !== -1
            }

            function r(A) {
                var z = [];
                for (var y = 0; y < A.length; y++) {
                    [].push.apply(z, A[y].extensions.split(/\s*,\s*/))
                }
                return m.inArray("*", z) === -1 ? z : []
            }

            function u(y) {
                if (!s.length) {
                    return true
                }
                var z = j.getFileExtension(y.name);
                return !z || m.inArray(z, s) !== -1
            }

            function v(A, z) {
                var y = [];
                m.each(A, function (D) {
                    var C = D.webkitGetAsEntry();
                    if (C) {
                        if (C.isFile) {
                            var B = D.getAsFile();
                            if (u(B)) {
                                p.push(B)
                            }
                        } else {
                            y.push(C)
                        }
                    }
                });
                if (y.length) {
                    t(y, z)
                } else {
                    z()
                }
            }

            function t(A, z) {
                var y = [];
                m.each(A, function (B) {
                    y.push(function (C) {
                        o(B, C)
                    })
                });
                m.inSeries(y, function () {
                    z()
                })
            }

            function o(z, y) {
                if (z.isFile) {
                    z.file(function (A) {
                        if (u(A)) {
                            p.push(A)
                        }
                        y()
                    }, function () {
                        y()
                    })
                } else {
                    if (z.isDirectory) {
                        x(z, y)
                    } else {
                        y()
                    }
                }
            }

            function x(C, z) {
                var y = [], B = C.createReader();

                function A(D) {
                    B.readEntries(function (E) {
                        if (E.length) {
                            [].push.apply(y, E);
                            A(D)
                        } else {
                            D()
                        }
                    }, D)
                }

                A(function () {
                    t(y, z)
                })
            }
        }

        return (l.FileDrop = n)
    });
    h("moxie/runtime/html5/file/FileReader", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Encode", "moxie/core/utils/Basic"], function (j, i, l) {
        function k() {
            var n, o = false;
            l.extend(this, {
                read: function (r, p) {
                    var q = this;
                    n = new window.FileReader();
                    n.addEventListener("progress", function (s) {
                        q.trigger(s)
                    });
                    n.addEventListener("load", function (s) {
                        q.trigger(s)
                    });
                    n.addEventListener("error", function (s) {
                        q.trigger(s, n.error)
                    });
                    n.addEventListener("loadend", function () {
                        n = null
                    });
                    if (l.typeOf(n[r]) === "function") {
                        o = false;
                        n[r](p.getSource())
                    } else {
                        if (r === "readAsBinaryString") {
                            o = true;
                            n.readAsDataURL(p.getSource())
                        }
                    }
                }, getResult: function () {
                    return n && n.result ? (o ? m(n.result) : n.result) : null
                }, abort: function () {
                    if (n) {
                        n.abort()
                    }
                }, destroy: function () {
                    n = null
                }
            });
            function m(p) {
                return i.atob(p.substring(p.indexOf("base64,") + 7))
            }
        }

        return (j.FileReader = k)
    });
    h("moxie/runtime/html5/xhr/XMLHttpRequest", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Mime", "moxie/core/utils/Url", "moxie/file/File", "moxie/file/Blob", "moxie/xhr/FormData", "moxie/core/Exceptions", "moxie/core/utils/Env"], function (o, j, l, i, n, k, r, p, m) {
        function q() {
            var u = this, y, w;
            j.extend(this, {
                send: function (G, D) {
                    var F = this, C = (m.browser === "Mozilla" && m.version >= 4 && m.version < 7), z = m.browser === "Android Browser", E = false;
                    w = G.url.replace(/^.+?\/([\w\-\.]+)$/, "$1").toLowerCase();
                    y = x();
                    y.open(G.method, G.url, G.async, G.user, G.password);
                    if (D instanceof k) {
                        if (D.isDetached()) {
                            E = true
                        }
                        D = D.getSource()
                    } else {
                        if (D instanceof r) {
                            if (D.hasBlob()) {
                                if (D.getBlob().isDetached()) {
                                    D = v.call(F, D);
                                    E = true
                                } else {
                                    if ((C || z) && j.typeOf(D.getBlob().getSource()) === "blob" && window.FileReader) {
                                        s.call(F, G, D);
                                        return
                                    }
                                }
                            }
                            if (D instanceof r) {
                                var B = new window.FormData();
                                D.each(function (I, H) {
                                    if (I instanceof k) {
                                        B.append(H, I.getSource())
                                    } else {
                                        B.append(H, I)
                                    }
                                });
                                D = B
                            }
                        }
                    }
                    if (y.upload) {
                        if (G.withCredentials) {
                            y.withCredentials = true
                        }
                        y.addEventListener("load", function (H) {
                            F.trigger(H)
                        });
                        y.addEventListener("error", function (H) {
                            F.trigger(H)
                        });
                        y.addEventListener("progress", function (H) {
                            F.trigger(H)
                        });
                        y.upload.addEventListener("progress", function (H) {
                            F.trigger({type: "UploadProgress", loaded: H.loaded, total: H.total})
                        })
                    } else {
                        y.onreadystatechange = function A() {
                            switch (y.readyState) {
                                case 1:
                                    break;
                                case 2:
                                    break;
                                case 3:
                                    var J, H;
                                    try {
                                        if (i.hasSameOrigin(G.url)) {
                                            J = y.getResponseHeader("Content-Length") || 0
                                        }
                                        if (y.responseText) {
                                            H = y.responseText.length
                                        }
                                    } catch (I) {
                                        J = H = 0
                                    }
                                    F.trigger({
                                        type: "progress",
                                        lengthComputable: !!J,
                                        total: parseInt(J, 10),
                                        loaded: H
                                    });
                                    break;
                                case 4:
                                    y.onreadystatechange = function () {
                                    };
                                    if (y.status === 0) {
                                        F.trigger("error")
                                    } else {
                                        F.trigger("load")
                                    }
                                    break
                            }
                        }
                    }
                    if (!j.isEmptyObj(G.headers)) {
                        j.each(G.headers, function (H, I) {
                            y.setRequestHeader(I, H)
                        })
                    }
                    if ("" !== G.responseType && "responseType" in y) {
                        if ("json" === G.responseType && !m.can("return_response_type", "json")) {
                            y.responseType = "text"
                        } else {
                            y.responseType = G.responseType
                        }
                    }
                    if (!E) {
                        y.send(D)
                    } else {
                        if (y.sendAsBinary) {
                            y.sendAsBinary(D)
                        } else {
                            (function () {
                                var H = new Uint8Array(D.length);
                                for (var I = 0; I < D.length; I++) {
                                    H[I] = (D.charCodeAt(I) & 255)
                                }
                                y.send(H.buffer)
                            }())
                        }
                    }
                    F.trigger("loadstart")
                }, getStatus: function () {
                    try {
                        if (y) {
                            return y.status
                        }
                    } catch (z) {
                    }
                    return 0
                }, getResponse: function (B) {
                    var A = this.getRuntime();
                    try {
                        switch (B) {
                            case"blob":
                                var D = new n(A.uid, y.response);
                                var E = y.getResponseHeader("Content-Disposition");
                                if (E) {
                                    var z = E.match(/filename=([\'\"'])([^\1]+)\1/);
                                    if (z) {
                                        w = z[2]
                                    }
                                }
                                D.name = w;
                                if (!D.type) {
                                    D.type = l.getFileMime(w)
                                }
                                return D;
                            case"json":
                                if (!m.can("return_response_type", "json")) {
                                    return y.status === 200 && !!window.JSON ? JSON.parse(y.responseText) : null
                                }
                                return y.response;
                            case"document":
                                return t(y);
                            default:
                                return y.responseText !== "" ? y.responseText : null
                        }
                    } catch (C) {
                        return null
                    }
                }, getAllResponseHeaders: function () {
                    try {
                        return y.getAllResponseHeaders()
                    } catch (z) {
                    }
                    return ""
                }, abort: function () {
                    if (y) {
                        y.abort()
                    }
                }, destroy: function () {
                    u = w = null
                }
            });
            function s(D, B) {
                var C = this, A, z;
                A = B.getBlob().getSource();
                z = new window.FileReader();
                z.onload = function () {
                    B.append(B.getBlobName(), new k(null, {type: A.type, data: z.result}));
                    u.send.call(C, D, B)
                };
                z.readAsBinaryString(A)
            }

            function x() {
                if (window.XMLHttpRequest && !(m.browser === "IE" && m.version < 8)) {
                    return new window.XMLHttpRequest()
                } else {
                    return (function () {
                        var z = ["Msxml2.XMLHTTP.6.0", "Microsoft.XMLHTTP"];
                        for (var B = 0; B < z.length; B++) {
                            try {
                                return new ActiveXObject(z[B])
                            } catch (A) {
                            }
                        }
                    })()
                }
            }

            function t(A) {
                var B = A.responseXML;
                var z = A.responseText;
                if (m.browser === "IE" && z && B && !B.documentElement && /[^\/]+\/[^\+]+\+xml/.test(A.getResponseHeader("Content-Type"))) {
                    B = new window.ActiveXObject("Microsoft.XMLDOM");
                    B.async = false;
                    B.validateOnParse = false;
                    B.loadXML(z)
                }
                if (B) {
                    if ((m.browser === "IE" && B.parseError !== 0) || !B.documentElement || B.documentElement.tagName === "parsererror") {
                        return null
                    }
                }
                return B
            }

            function v(B) {
                var E = "----moxieboundary" + new Date().getTime(), C = "--", D = "\r\n", z = "", A = this.getRuntime();
                if (!A.can("send_binary_string")) {
                    throw new p.RuntimeError(p.RuntimeError.NOT_SUPPORTED_ERR)
                }
                y.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + E);
                B.each(function (G, F) {
                    if (G instanceof k) {
                        z += C + E + D + 'Content-Disposition: form-data; name="' + F + '"; filename="' + unescape(encodeURIComponent(G.name || "blob")) + '"' + D + "Content-Type: " + (G.type || "application/octet-stream") + D + D + G.getSource() + D
                    } else {
                        z += C + E + D + 'Content-Disposition: form-data; name="' + F + '"' + D + D + unescape(encodeURIComponent(G)) + D
                    }
                });
                z += C + E + C + D;
                return z
            }
        }

        return (o.XMLHttpRequest = q)
    });
    h("moxie/runtime/html5/utils/BinaryReader", [], function () {
        return function () {
            var l = false, j;

            function m(o, q) {
                var n = l ? 0 : -8 * (q - 1), r = 0, p;
                for (p = 0; p < q; p++) {
                    r |= (j.charCodeAt(o + p) << Math.abs(n + p * 8))
                }
                return r
            }

            function i(p, n, o) {
                o = arguments.length === 3 ? o : j.length - n - 1;
                j = j.substr(0, n) + p + j.substr(o + n)
            }

            function k(o, p, r) {
                var s = "", n = l ? 0 : -8 * (r - 1), q;
                for (q = 0; q < r; q++) {
                    s += String.fromCharCode((p >> Math.abs(n + q * 8)) & 255)
                }
                i(s, o, r)
            }

            return {
                II: function (n) {
                    if (n === g) {
                        return l
                    } else {
                        l = n
                    }
                }, init: function (n) {
                    l = false;
                    j = n
                }, SEGMENT: function (n, p, o) {
                    switch (arguments.length) {
                        case 1:
                            return j.substr(n, j.length - n - 1);
                        case 2:
                            return j.substr(n, p);
                        case 3:
                            i(o, n, p);
                            break;
                        default:
                            return j
                    }
                }, BYTE: function (n) {
                    return m(n, 1)
                }, SHORT: function (n) {
                    return m(n, 2)
                }, LONG: function (n, o) {
                    if (o === g) {
                        return m(n, 4)
                    } else {
                        k(n, o, 4)
                    }
                }, SLONG: function (n) {
                    var o = m(n, 4);
                    return (o > 2147483647 ? o - 4294967296 : o)
                }, STRING: function (n, o) {
                    var p = "";
                    for (o += n; n < o; n++) {
                        p += String.fromCharCode(m(n, 1))
                    }
                    return p
                }
            }
        }
    });
    h("moxie/runtime/html5/image/JPEGHeaders", ["moxie/runtime/html5/utils/BinaryReader"], function (j) {
        return function i(o) {
            var p = [], n, k, l, m = 0;
            n = new j();
            n.init(o);
            if (n.SHORT(0) !== 65496) {
                return
            }
            k = 2;
            while (k <= o.length) {
                l = n.SHORT(k);
                if (l >= 65488 && l <= 65495) {
                    k += 2;
                    continue
                }
                if (l === 65498 || l === 65497) {
                    break
                }
                m = n.SHORT(k + 2) + 2;
                if (l >= 65505 && l <= 65519) {
                    p.push({hex: l, name: "APP" + (l & 15), start: k, length: m, segment: n.SEGMENT(k, m)})
                }
                k += m
            }
            n.init(null);
            return {
                headers: p, restore: function (s) {
                    var q, r;
                    n.init(s);
                    k = n.SHORT(2) == 65504 ? 4 + n.SHORT(4) : 2;
                    for (r = 0, q = p.length; r < q; r++) {
                        if (p[r].name == "APP2" && p[r].segment.indexOf("ProPhoto RGB") > 0) {
                            continue
                        } else {
                            n.SEGMENT(k, 0, p[r].segment);
                            k += p[r].length
                        }
                    }
                    s = n.SEGMENT();
                    n.init(null);
                    return s
                }, strip: function (s) {
                    var t, q, r;
                    q = new i(s);
                    t = q.headers;
                    q.purge();
                    n.init(s);
                    r = t.length;
                    while (r--) {
                        n.SEGMENT(t[r].start, t[r].length, "")
                    }
                    s = n.SEGMENT();
                    n.init(null);
                    return s
                }, get: function (r) {
                    var t = [];
                    for (var s = 0, q = p.length; s < q; s++) {
                        if (p[s].name === r.toUpperCase()) {
                            t.push(p[s].segment)
                        }
                    }
                    return t
                }, set: function (r, u) {
                    var v = [], s, t, q;
                    if (typeof(u) === "string") {
                        v.push(u)
                    } else {
                        v = u
                    }
                    for (s = t = 0, q = p.length; s < q; s++) {
                        if (p[s].name === r.toUpperCase()) {
                            p[s].segment = v[t];
                            p[s].length = v[t].length;
                            t++
                        }
                        if (t >= v.length) {
                            break
                        }
                    }
                }, purge: function () {
                    p = [];
                    n.init(null);
                    n = null
                }
            }
        }
    });
    h("moxie/runtime/html5/image/ExifParser", ["moxie/core/utils/Basic", "moxie/runtime/html5/utils/BinaryReader"], function (k, j) {
        return function i() {
            var p, m, l, n = {}, s;
            p = new j();
            m = {
                tiff: {
                    274: "Orientation",
                    270: "ImageDescription",
                    271: "Make",
                    272: "Model",
                    305: "Software",
                    34665: "ExifIFDPointer",
                    34853: "GPSInfoIFDPointer"
                },
                exif: {
                    36864: "ExifVersion",
                    40961: "ColorSpace",
                    40962: "PixelXDimension",
                    40963: "PixelYDimension",
                    36867: "DateTimeOriginal",
                    33434: "ExposureTime",
                    33437: "FNumber",
                    34855: "ISOSpeedRatings",
                    37377: "ShutterSpeedValue",
                    37378: "ApertureValue",
                    37383: "MeteringMode",
                    37384: "LightSource",
                    37385: "Flash",
                    37386: "FocalLength",
                    41986: "ExposureMode",
                    41987: "WhiteBalance",
                    41990: "SceneCaptureType",
                    41988: "DigitalZoomRatio",
                    41992: "Contrast",
                    41993: "Saturation",
                    41994: "Sharpness"
                },
                gps: {0: "GPSVersionID", 1: "GPSLatitudeRef", 2: "GPSLatitude", 3: "GPSLongitudeRef", 4: "GPSLongitude"}
            };
            s = {
                ColorSpace: {1: "sRGB", 0: "Uncalibrated"},
                MeteringMode: {
                    0: "Unknown",
                    1: "Average",
                    2: "CenterWeightedAverage",
                    3: "Spot",
                    4: "MultiSpot",
                    5: "Pattern",
                    6: "Partial",
                    255: "Other"
                },
                LightSource: {
                    1: "Daylight",
                    2: "Fliorescent",
                    3: "Tungsten",
                    4: "Flash",
                    9: "Fine weather",
                    10: "Cloudy weather",
                    11: "Shade",
                    12: "Daylight fluorescent (D 5700 - 7100K)",
                    13: "Day white fluorescent (N 4600 -5400K)",
                    14: "Cool white fluorescent (W 3900 - 4500K)",
                    15: "White fluorescent (WW 3200 - 3700K)",
                    17: "Standard light A",
                    18: "Standard light B",
                    19: "Standard light C",
                    20: "D55",
                    21: "D65",
                    22: "D75",
                    23: "D50",
                    24: "ISO studio tungsten",
                    255: "Other"
                },
                Flash: {
                    0: "Flash did not fire.",
                    1: "Flash fired.",
                    5: "Strobe return light not detected.",
                    7: "Strobe return light detected.",
                    9: "Flash fired, compulsory flash mode",
                    13: "Flash fired, compulsory flash mode, return light not detected",
                    15: "Flash fired, compulsory flash mode, return light detected",
                    16: "Flash did not fire, compulsory flash mode",
                    24: "Flash did not fire, auto mode",
                    25: "Flash fired, auto mode",
                    29: "Flash fired, auto mode, return light not detected",
                    31: "Flash fired, auto mode, return light detected",
                    32: "No flash function",
                    65: "Flash fired, red-eye reduction mode",
                    69: "Flash fired, red-eye reduction mode, return light not detected",
                    71: "Flash fired, red-eye reduction mode, return light detected",
                    73: "Flash fired, compulsory flash mode, red-eye reduction mode",
                    77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
                    79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
                    89: "Flash fired, auto mode, red-eye reduction mode",
                    93: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
                    95: "Flash fired, auto mode, return light detected, red-eye reduction mode"
                },
                ExposureMode: {0: "Auto exposure", 1: "Manual exposure", 2: "Auto bracket"},
                WhiteBalance: {0: "Auto white balance", 1: "Manual white balance"},
                SceneCaptureType: {0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night scene"},
                Contrast: {0: "Normal", 1: "Soft", 2: "Hard"},
                Saturation: {0: "Normal", 1: "Low saturation", 2: "High saturation"},
                Sharpness: {0: "Normal", 1: "Soft", 2: "Hard"},
                GPSLatitudeRef: {N: "North latitude", S: "South latitude"},
                GPSLongitudeRef: {E: "East longitude", W: "West longitude"}
            };
            function o(t, B) {
                var v = p.SHORT(t), y, E, F, A, z, u, w, C, D = [], x = {};
                for (y = 0; y < v; y++) {
                    w = u = t + 12 * y + 2;
                    F = B[p.SHORT(w)];
                    if (F === g) {
                        continue
                    }
                    A = p.SHORT(w += 2);
                    z = p.LONG(w += 2);
                    w += 4;
                    D = [];
                    switch (A) {
                        case 1:
                        case 7:
                            if (z > 4) {
                                w = p.LONG(w) + n.tiffHeader
                            }
                            for (E = 0; E < z; E++) {
                                D[E] = p.BYTE(w + E)
                            }
                            break;
                        case 2:
                            if (z > 4) {
                                w = p.LONG(w) + n.tiffHeader
                            }
                            x[F] = p.STRING(w, z - 1);
                            continue;
                        case 3:
                            if (z > 2) {
                                w = p.LONG(w) + n.tiffHeader
                            }
                            for (E = 0; E < z; E++) {
                                D[E] = p.SHORT(w + E * 2)
                            }
                            break;
                        case 4:
                            if (z > 1) {
                                w = p.LONG(w) + n.tiffHeader
                            }
                            for (E = 0; E < z; E++) {
                                D[E] = p.LONG(w + E * 4)
                            }
                            break;
                        case 5:
                            w = p.LONG(w) + n.tiffHeader;
                            for (E = 0; E < z; E++) {
                                D[E] = p.LONG(w + E * 4) / p.LONG(w + E * 4 + 4)
                            }
                            break;
                        case 9:
                            w = p.LONG(w) + n.tiffHeader;
                            for (E = 0; E < z; E++) {
                                D[E] = p.SLONG(w + E * 4)
                            }
                            break;
                        case 10:
                            w = p.LONG(w) + n.tiffHeader;
                            for (E = 0; E < z; E++) {
                                D[E] = p.SLONG(w + E * 4) / p.SLONG(w + E * 4 + 4)
                            }
                            break;
                        default:
                            continue
                    }
                    C = (z == 1 ? D[0] : D);
                    if (s.hasOwnProperty(F) && typeof C != "object") {
                        x[F] = s[F][C]
                    } else {
                        x[F] = C
                    }
                }
                return x
            }

            function r() {
                var t = n.tiffHeader;
                p.II(p.SHORT(t) == 18761);
                if (p.SHORT(t += 2) !== 42) {
                    return false
                }
                n.IFD0 = n.tiffHeader + p.LONG(t += 2);
                l = o(n.IFD0, m.tiff);
                if ("ExifIFDPointer" in l) {
                    n.exifIFD = n.tiffHeader + l.ExifIFDPointer;
                    delete l.ExifIFDPointer
                }
                if ("GPSInfoIFDPointer" in l) {
                    n.gpsIFD = n.tiffHeader + l.GPSInfoIFDPointer;
                    delete l.GPSInfoIFDPointer
                }
                return true
            }

            function q(A, C, z) {
                var x, v, u, t = 0;
                if (typeof(C) === "string") {
                    var B = m[A.toLowerCase()];
                    for (var w in B) {
                        if (B[w] === C) {
                            C = w;
                            break
                        }
                    }
                }
                x = n[A.toLowerCase() + "IFD"];
                v = p.SHORT(x);
                for (var y = 0; y < v; y++) {
                    u = x + 12 * y + 2;
                    if (p.SHORT(u) == C) {
                        t = u + 8;
                        break
                    }
                }
                if (!t) {
                    return false
                }
                p.LONG(t, z);
                return true
            }

            return {
                init: function (t) {
                    n = {tiffHeader: 10};
                    if (t === g || !t.length) {
                        return false
                    }
                    p.init(t);
                    if (p.SHORT(0) === 65505 && p.STRING(4, 5).toUpperCase() === "EXIF\0") {
                        return r()
                    }
                    return false
                }, TIFF: function () {
                    return l
                }, EXIF: function () {
                    var u;
                    u = o(n.exifIFD, m.exif);
                    if (u.ExifVersion && k.typeOf(u.ExifVersion) === "array") {
                        for (var v = 0, t = ""; v < u.ExifVersion.length; v++) {
                            t += String.fromCharCode(u.ExifVersion[v])
                        }
                        u.ExifVersion = t
                    }
                    return u
                }, GPS: function () {
                    var t;
                    t = o(n.gpsIFD, m.gps);
                    if (t.GPSVersionID && k.typeOf(t.GPSVersionID) === "array") {
                        t.GPSVersionID = t.GPSVersionID.join(".")
                    }
                    return t
                }, setExif: function (t, u) {
                    if (t !== "PixelXDimension" && t !== "PixelYDimension") {
                        return false
                    }
                    return q("exif", t, u)
                }, getBinary: function () {
                    return p.SEGMENT()
                }, purge: function () {
                    p.init(null);
                    p = l = null;
                    n = {}
                }
            }
        }
    });
    h("moxie/runtime/html5/image/JPEG", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/html5/image/JPEGHeaders", "moxie/runtime/html5/utils/BinaryReader", "moxie/runtime/html5/image/ExifParser"], function (n, i, k, m, j) {
        function l(w) {
            var p, r, t, s, v, o;

            function u() {
                var x = 0, y, z;
                while (x <= p.length) {
                    y = r.SHORT(x += 2);
                    if (y >= 65472 && y <= 65475) {
                        x += 5;
                        return {height: r.SHORT(x), width: r.SHORT(x += 2)}
                    }
                    z = r.SHORT(x += 2);
                    x += z - 2
                }
                return null
            }

            p = w;
            r = new m();
            r.init(p);
            if (r.SHORT(0) !== 65496) {
                throw new i.ImageError(i.ImageError.WRONG_FORMAT)
            }
            t = new k(w);
            s = new j();
            o = !!s.init(t.get("app1")[0]);
            v = u.call(this);
            n.extend(this, {
                type: "image/jpeg",
                size: p.length,
                width: v && v.width || 0,
                height: v && v.height || 0,
                setExif: function (x, y) {
                    if (!o) {
                        return false
                    }
                    if (n.typeOf(x) === "object") {
                        n.each(x, function (A, z) {
                            s.setExif(z, A)
                        })
                    } else {
                        s.setExif(x, y)
                    }
                    t.set("app1", s.getBinary())
                },
                writeHeaders: function () {
                    if (!arguments.length) {
                        return (p = t.restore(p))
                    }
                    return t.restore(arguments[0])
                },
                stripHeaders: function (x) {
                    return t.strip(x)
                },
                purge: function () {
                    q.call(this)
                }
            });
            if (o) {
                this.meta = {tiff: s.TIFF(), exif: s.EXIF(), gps: s.GPS()}
            }
            function q() {
                if (!s || !t || !r) {
                    return
                }
                s.purge();
                t.purge();
                r.init(null);
                p = v = t = s = r = null
            }
        }

        return l
    });
    h("moxie/runtime/html5/image/PNG", ["moxie/core/Exceptions", "moxie/core/utils/Basic", "moxie/runtime/html5/utils/BinaryReader"], function (i, l, k) {
        function j(u) {
            var n, p, r, q, t;
            n = u;
            p = new k();
            p.init(n);
            (function () {
                var v = 0, x = 0, w = [35152, 20039, 3338, 6666];
                for (x = 0; x < w.length; x++, v += 2) {
                    if (w[x] != p.SHORT(v)) {
                        throw new i.ImageError(i.ImageError.WRONG_FORMAT)
                    }
                }
            }());
            function s() {
                var w, v;
                w = m.call(this, 8);
                if (w.type == "IHDR") {
                    v = w.start;
                    return {width: p.LONG(v), height: p.LONG(v += 4)}
                }
                return null
            }

            function o() {
                if (!p) {
                    return
                }
                p.init(null);
                n = t = r = q = p = null
            }

            t = s.call(this);
            l.extend(this, {
                type: "image/png", size: n.length, width: t.width, height: t.height, purge: function () {
                    o.call(this)
                }
            });
            o.call(this);
            function m(v) {
                var y, x, z, w;
                y = p.LONG(v);
                x = p.STRING(v += 4, 4);
                z = v += 4;
                w = p.LONG(v + y);
                return {length: y, type: x, start: z, CRC: w}
            }
        }

        return j
    });
    h("moxie/runtime/html5/image/ImageInfo", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/html5/image/JPEG", "moxie/runtime/html5/image/PNG"], function (l, i, k, j) {
        return function (n) {
            var o = [k, j], m;
            m = (function () {
                for (var q = 0; q < o.length; q++) {
                    try {
                        return new o[q](n)
                    } catch (p) {
                    }
                }
                throw new i.ImageError(i.ImageError.WRONG_FORMAT)
            }());
            l.extend(this, {
                type: "", size: 0, width: 0, height: 0, setExif: function () {
                }, writeHeaders: function (p) {
                    return p
                }, stripHeaders: function (p) {
                    return p
                }, purge: function () {
                }
            });
            l.extend(this, m);
            this.purge = function () {
                m.purge();
                m = null
            }
        }
    });
    h("moxie/runtime/html5/image/MegaPixel", [], function () {
        function i(I, m, n) {
            var p = I.naturalWidth, v = I.naturalHeight;
            var C = n.width, z = n.height;
            var r = n.x || 0, q = n.y || 0;
            var D = m.getContext("2d");
            if (j(I)) {
                p /= 2;
                v /= 2
            }
            var G = 1024;
            var l = document.createElement("canvas");
            l.width = l.height = G;
            var o = l.getContext("2d");
            var E = k(I, p, v);
            var w = 0;
            while (w < v) {
                var H = w + G > v ? v - w : G;
                var A = 0;
                while (A < p) {
                    var B = A + G > p ? p - A : G;
                    o.clearRect(0, 0, G, G);
                    o.drawImage(I, -A, -w);
                    var t = (A * C / p + r) << 0;
                    var u = Math.ceil(B * C / p);
                    var s = (w * z / v / E + q) << 0;
                    var F = Math.ceil(H * z / v / E);
                    D.drawImage(l, 0, 0, B, H, t, s, u, F);
                    A += G
                }
                w += G
            }
            l = o = null
        }

        function j(n) {
            var m = n.naturalWidth, p = n.naturalHeight;
            if (m * p > 1024 * 1024) {
                var o = document.createElement("canvas");
                o.width = o.height = 1;
                var l = o.getContext("2d");
                l.drawImage(n, -m + 1, 0);
                return l.getImageData(0, 0, 1, 1).data[3] === 0
            } else {
                return false
            }
        }

        function k(p, m, u) {
            var l = document.createElement("canvas");
            l.width = 1;
            l.height = u;
            var v = l.getContext("2d");
            v.drawImage(p, 0, 0);
            var o = v.getImageData(0, 0, 1, u).data;
            var s = 0;
            var q = u;
            var t = u;
            while (t > s) {
                var n = o[(t - 1) * 4 + 3];
                if (n === 0) {
                    q = t
                } else {
                    s = t
                }
                t = (q + s) >> 1
            }
            l = null;
            var r = (t / u);
            return (r === 0) ? 1 : r
        }

        return {isSubsampled: j, renderTo: i}
    });
    h("moxie/runtime/html5/image/Image", ["moxie/runtime/html5/Runtime", "moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/core/utils/Encode", "moxie/file/File", "moxie/runtime/html5/image/ImageInfo", "moxie/runtime/html5/image/MegaPixel", "moxie/core/utils/Mime", "moxie/core/utils/Env"], function (o, i, p, k, m, r, q, j, l) {
        function n() {
            var C = this, B, G, A, w, E, I = false, t = true;
            i.extend(this, {
                loadFromBlob: function (L) {
                    var K = this, N = K.getRuntime(), J = arguments.length > 1 ? arguments[1] : true;
                    if (!N.can("access_binary")) {
                        throw new p.RuntimeError(p.RuntimeError.NOT_SUPPORTED_ERR)
                    }
                    E = L;
                    if (L.isDetached()) {
                        w = L.getSource();
                        z.call(this, w);
                        return
                    } else {
                        F.call(this, L.getSource(), function (O) {
                            if (J) {
                                w = H(O)
                            }
                            z.call(K, O)
                        })
                    }
                }, loadFromImage: function (J, K) {
                    this.meta = J.meta;
                    E = new m(null, {name: J.name, size: J.size, type: J.type});
                    z.call(this, K ? (w = J.getAsBinaryString()) : J.getAsDataURL())
                }, getInfo: function () {
                    var J = this.getRuntime(), K;
                    if (!G && w && J.can("access_image_binary")) {
                        G = new r(w)
                    }
                    K = {
                        width: x().width || 0,
                        height: x().height || 0,
                        type: E.type || j.getFileMime(E.name),
                        size: w && w.length || E.size || 0,
                        name: E.name || "",
                        meta: G && G.meta || this.meta || {}
                    };
                    return K
                }, downsize: function () {
                    s.apply(this, arguments)
                }, getAsCanvas: function () {
                    if (A) {
                        A.id = this.uid + "_canvas"
                    }
                    return A
                }, getAsBlob: function (J, K) {
                    if (J !== this.type) {
                        s.call(this, this.width, this.height, false)
                    }
                    return new m(null, {name: E.name || "", type: J, data: C.getAsBinaryString.call(this, J, K)})
                }, getAsDataURL: function (K) {
                    var L = arguments[1] || 90;
                    if (!I) {
                        return B.src
                    }
                    if ("image/jpeg" !== K) {
                        return A.toDataURL("image/png")
                    } else {
                        try {
                            return A.toDataURL("image/jpeg", L / 100)
                        } catch (J) {
                            return A.toDataURL("image/jpeg")
                        }
                    }
                }, getAsBinaryString: function (K, N) {
                    if (!I) {
                        if (!w) {
                            w = H(C.getAsDataURL(K, N))
                        }
                        return w
                    }
                    if ("image/jpeg" !== K) {
                        w = H(C.getAsDataURL(K, N))
                    } else {
                        var L;
                        if (!N) {
                            N = 90
                        }
                        try {
                            L = A.toDataURL("image/jpeg", N / 100)
                        } catch (J) {
                            L = A.toDataURL("image/jpeg")
                        }
                        w = H(L);
                        if (G) {
                            w = G.stripHeaders(w);
                            if (t) {
                                if (G.meta && G.meta.exif) {
                                    G.setExif({PixelXDimension: this.width, PixelYDimension: this.height})
                                }
                                w = G.writeHeaders(w)
                            }
                            G.purge();
                            G = null
                        }
                    }
                    I = false;
                    return w
                }, destroy: function () {
                    C = null;
                    u.call(this);
                    this.getRuntime().getShim().removeInstance(this.uid)
                }
            });
            function x() {
                if (!A && !B) {
                    throw new p.ImageError(p.DOMException.INVALID_STATE_ERR)
                }
                return A || B
            }

            function H(J) {
                return k.atob(J.substring(J.indexOf("base64,") + 7))
            }

            function D(K, J) {
                return "data:" + (J || "") + ";base64," + k.btoa(K)
            }

            function z(K) {
                var J = this;
                B = new Image();
                B.onerror = function () {
                    u.call(this);
                    J.trigger("error", p.ImageError.WRONG_FORMAT)
                };
                B.onload = function () {
                    J.trigger("load")
                };
                B.src = /^data:[^;]*;base64,/.test(K) ? K : D(K, E.type)
            }

            function F(L, N) {
                var K = this, J;
                if (window.FileReader) {
                    J = new FileReader();
                    J.onload = function () {
                        N(this.result)
                    };
                    J.onerror = function () {
                        K.trigger("error", p.ImageError.WRONG_FORMAT)
                    };
                    J.readAsDataURL(L)
                } else {
                    return N(L.getAsDataURL())
                }
            }

            function s(K, W, R, T) {
                var X = this, O, N, U = 0, S = 0, Q, V, L, J;
                t = T;
                J = (this.meta && this.meta.tiff && this.meta.tiff.Orientation) || 1;
                if (i.inArray(J, [5, 6, 7, 8]) !== -1) {
                    var P = K;
                    K = W;
                    W = P
                }
                Q = x();
                if (!R) {
                    O = Math.min(K / Q.width, W / Q.height)
                } else {
                    K = Math.min(K, Q.width);
                    W = Math.min(W, Q.height);
                    O = Math.max(K / Q.width, W / Q.height)
                }
                if (O > 1 && !R && T) {
                    this.trigger("Resize");
                    return
                }
                if (!A) {
                    A = document.createElement("canvas")
                }
                V = Math.round(Q.width * O);
                L = Math.round(Q.height * O);
                if (R) {
                    A.width = K;
                    A.height = W;
                    if (V > K) {
                        U = Math.round((V - K) / 2)
                    }
                    if (L > W) {
                        S = Math.round((L - W) / 2)
                    }
                } else {
                    A.width = V;
                    A.height = L
                }
                if (!t) {
                    y(A.width, A.height, J)
                }
                v.call(this, Q, A, -U, -S, V, L);
                this.width = A.width;
                this.height = A.height;
                I = true;
                X.trigger("Resize")
            }

            function v(N, O, J, Q, L, P) {
                if (l.OS === "iOS") {
                    q.renderTo(N, O, {width: L, height: P, x: J, y: Q})
                } else {
                    var K = O.getContext("2d");
                    K.drawImage(N, J, Q, L, P)
                }
            }

            function y(N, J, L) {
                switch (L) {
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        A.width = J;
                        A.height = N;
                        break;
                    default:
                        A.width = N;
                        A.height = J
                }
                var K = A.getContext("2d");
                switch (L) {
                    case 2:
                        K.translate(N, 0);
                        K.scale(-1, 1);
                        break;
                    case 3:
                        K.translate(N, J);
                        K.rotate(Math.PI);
                        break;
                    case 4:
                        K.translate(0, J);
                        K.scale(1, -1);
                        break;
                    case 5:
                        K.rotate(0.5 * Math.PI);
                        K.scale(1, -1);
                        break;
                    case 6:
                        K.rotate(0.5 * Math.PI);
                        K.translate(0, -J);
                        break;
                    case 7:
                        K.rotate(0.5 * Math.PI);
                        K.translate(N, -J);
                        K.scale(-1, 1);
                        break;
                    case 8:
                        K.rotate(-0.5 * Math.PI);
                        K.translate(-N, 0);
                        break
                }
            }

            function u() {
                if (G) {
                    G.purge();
                    G = null
                }
                w = B = A = E = null;
                I = false
            }
        }

        return (o.Image = n)
    });
    h("moxie/runtime/flash/Runtime", ["moxie/core/utils/Basic", "moxie/core/utils/Env", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/runtime/Runtime"], function (j, m, k, p, i) {
        var n = "flash", o = {};

        function l() {
            var r;
            try {
                r = navigator.plugins["Shockwave Flash"];
                r = r.description
            } catch (t) {
                try {
                    r = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version")
                } catch (s) {
                    r = "0.0"
                }
            }
            r = r.match(/\d+/g);
            return parseFloat(r[0] + "." + r[1])
        }

        function q(s) {
            var r = this, t;
            s = j.extend({swf_url: m.swf_url}, s);
            i.call(this, s, n, {
                access_binary: function (u) {
                    return u && r.mode === "browser"
                },
                access_image_binary: function (u) {
                    return u && r.mode === "browser"
                },
                display_media: i.capTrue,
                do_cors: i.capTrue,
                drag_and_drop: false,
                report_upload_progress: function () {
                    return r.mode === "client"
                },
                resize_image: i.capTrue,
                return_response_headers: false,
                return_response_type: function (u) {
                    if (u === "json" && !!window.JSON) {
                        return true
                    }
                    return !j.arrayDiff(u, ["", "text", "document"]) || r.mode === "browser"
                },
                return_status_code: function (u) {
                    return r.mode === "browser" || !j.arrayDiff(u, [200, 404])
                },
                select_file: i.capTrue,
                select_multiple: i.capTrue,
                send_binary_string: function (u) {
                    return u && r.mode === "browser"
                },
                send_browser_cookies: function (u) {
                    return u && r.mode === "browser"
                },
                send_custom_headers: function (u) {
                    return u && r.mode === "browser"
                },
                send_multipart: i.capTrue,
                slice_blob: function (u) {
                    return u && r.mode === "browser"
                },
                stream_upload: function (u) {
                    return u && r.mode === "browser"
                },
                summon_file_dialog: false,
                upload_filesize: function (u) {
                    return j.parseSizeStr(u) <= 2097152 || r.mode === "client"
                },
                use_http_method: function (u) {
                    return !j.arrayDiff(u, ["GET", "POST"])
                }
            }, {
                access_binary: function (u) {
                    return u ? "browser" : "client"
                }, access_image_binary: function (u) {
                    return u ? "browser" : "client"
                }, report_upload_progress: function (u) {
                    return u ? "browser" : "client"
                }, return_response_type: function (u) {
                    return j.arrayDiff(u, ["", "text", "json", "document"]) ? "browser" : ["client", "browser"]
                }, return_status_code: function (u) {
                    return j.arrayDiff(u, [200, 404]) ? "browser" : ["client", "browser"]
                }, send_binary_string: function (u) {
                    return u ? "browser" : "client"
                }, send_browser_cookies: function (u) {
                    return u ? "browser" : "client"
                }, send_custom_headers: function (u) {
                    return u ? "browser" : "client"
                }, stream_upload: function (u) {
                    return u ? "client" : "browser"
                }, upload_filesize: function (u) {
                    return j.parseSizeStr(u) >= 2097152 ? "client" : "browser"
                }
            }, "client");
            if (l() < 10) {
                this.mode = false
            }
            j.extend(this, {
                getShim: function () {
                    return k.get(this.uid)
                }, shimExec: function (v, w) {
                    var u = [].slice.call(arguments, 2);
                    return r.getShim().exec(this.uid, v, w, u)
                }, init: function () {
                    var v, w, u;
                    u = this.getShimContainer();
                    j.extend(u.style, {
                        position: "absolute",
                        top: "-8px",
                        left: "-8px",
                        width: "9px",
                        height: "9px",
                        overflow: "hidden"
                    });
                    v = '<object id="' + this.uid + '" type="application/x-shockwave-flash" data="' + s.swf_url + '" ';
                    if (m.browser === "IE") {
                        v += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
                    }
                    v += 'width="100%" height="100%" style="outline:0"><param name="movie" value="' + s.swf_url + '" /><param name="flashvars" value="uid=' + escape(this.uid) + "&target=" + m.global_event_dispatcher + '" /><param name="wmode" value="transparent" /><param name="allowscriptaccess" value="always" /></object>';
                    if (m.browser === "IE") {
                        w = document.createElement("div");
                        u.appendChild(w);
                        w.outerHTML = v;
                        w = u = null
                    } else {
                        u.innerHTML = v
                    }
                    t = setTimeout(function () {
                        if (r && !r.initialized) {
                            r.trigger("Error", new p.RuntimeError(p.RuntimeError.NOT_INIT_ERR))
                        }
                    }, 5000)
                }, destroy: (function (u) {
                    return function () {
                        u.call(r);
                        clearTimeout(t);
                        s = t = u = r = null
                    }
                }(this.destroy))
            }, o)
        }

        i.addConstructor(n, q);
        return o
    });
    h("moxie/runtime/flash/file/Blob", ["moxie/runtime/flash/Runtime", "moxie/file/Blob"], function (j, k) {
        var i = {
            slice: function (n, p, l, o) {
                var m = this.getRuntime();
                if (p < 0) {
                    p = Math.max(n.size + p, 0)
                } else {
                    if (p > 0) {
                        p = Math.min(p, n.size)
                    }
                }
                if (l < 0) {
                    l = Math.max(n.size + l, 0)
                } else {
                    if (l > 0) {
                        l = Math.min(l, n.size)
                    }
                }
                n = m.shimExec.call(this, "Blob", "slice", p, l, o || "");
                if (n) {
                    n = new k(m.uid, n)
                }
                return n
            }
        };
        return (j.Blob = i)
    });
    h("moxie/runtime/flash/file/FileInput", ["moxie/runtime/flash/Runtime"], function (i) {
        var j = {
            init: function (k) {
                this.getRuntime().shimExec.call(this, "FileInput", "init", {
                    name: k.name,
                    accept: k.accept,
                    multiple: k.multiple
                });
                this.trigger("ready")
            }
        };
        return (i.FileInput = j)
    });
    h("moxie/runtime/flash/file/FileReader", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Encode"], function (l, i) {
        var j = "";

        function k(n, o) {
            switch (o) {
                case"readAsText":
                    return i.atob(n, "utf8");
                case"readAsBinaryString":
                    return i.atob(n);
                case"readAsDataURL":
                    return n
            }
            return null
        }

        var m = {
            read: function (q, o) {
                var p = this, n = p.getRuntime();
                if (q === "readAsDataURL") {
                    j = "data:" + (o.type || "") + ";base64,"
                }
                p.bind("Progress", function (s, r) {
                    if (r) {
                        j += k(r, q)
                    }
                });
                return n.shimExec.call(this, "FileReader", "readAsBase64", o.uid)
            }, getResult: function () {
                return j
            }, destroy: function () {
                j = null
            }
        };
        return (l.FileReader = m)
    });
    h("moxie/runtime/flash/file/FileReaderSync", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Encode"], function (k, i) {
        function j(m, n) {
            switch (n) {
                case"readAsText":
                    return i.atob(m, "utf8");
                case"readAsBinaryString":
                    return i.atob(m);
                case"readAsDataURL":
                    return m
            }
            return null
        }

        var l = {
            read: function (p, o) {
                var m, n = this.getRuntime();
                m = n.shimExec.call(this, "FileReaderSync", "readAsBase64", o.uid);
                if (!m) {
                    return null
                }
                if (p === "readAsDataURL") {
                    m = "data:" + (o.type || "") + ";base64," + m
                }
                return j(m, p, o.type)
            }
        };
        return (k.FileReaderSync = l)
    });
    h("moxie/runtime/flash/xhr/XMLHttpRequest", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Basic", "moxie/file/Blob", "moxie/file/File", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/runtime/Transporter"], function (j, m, p, i, o, n, l) {
        var k = {
            send: function (x, s) {
                var u = this, y = u.getRuntime();

                function r() {
                    x.transport = y.mode;
                    y.shimExec.call(u, "XMLHttpRequest", "send", x, s)
                }

                function t(A, z) {
                    y.shimExec.call(u, "XMLHttpRequest", "appendBlob", A, z.uid);
                    s = null;
                    r()
                }

                function v(A, z) {
                    var B = new l();
                    B.bind("TransportingComplete", function () {
                        z(this.result)
                    });
                    B.transport(A.getSource(), A.type, {ruid: y.uid})
                }

                if (!m.isEmptyObj(x.headers)) {
                    m.each(x.headers, function (z, A) {
                        y.shimExec.call(u, "XMLHttpRequest", "setRequestHeader", A, z.toString())
                    })
                }
                if (s instanceof n) {
                    var w;
                    s.each(function (A, z) {
                        if (A instanceof p) {
                            w = z
                        } else {
                            y.shimExec.call(u, "XMLHttpRequest", "append", z, A)
                        }
                    });
                    if (!s.hasBlob()) {
                        s = null;
                        r()
                    } else {
                        var q = s.getBlob();
                        if (q.isDetached()) {
                            v(q, function (z) {
                                q.destroy();
                                t(w, z)
                            })
                        } else {
                            t(w, q)
                        }
                    }
                } else {
                    if (s instanceof p) {
                        if (s.isDetached()) {
                            v(s, function (z) {
                                s.destroy();
                                s = z.uid;
                                r()
                            })
                        } else {
                            s = s.uid;
                            r()
                        }
                    } else {
                        r()
                    }
                }
            }, getResponse: function (t) {
                var q, s, r = this.getRuntime();
                s = r.shimExec.call(this, "XMLHttpRequest", "getResponseAsBlob");
                if (s) {
                    s = new i(r.uid, s);
                    if ("blob" === t) {
                        return s
                    }
                    try {
                        q = new o();
                        if (!!~m.inArray(t, ["", "text"])) {
                            return q.readAsText(s)
                        } else {
                            if ("json" === t && !!window.JSON) {
                                return JSON.parse(q.readAsText(s))
                            }
                        }
                    } finally {
                        s.destroy()
                    }
                }
                return null
            }, abort: function (r) {
                var q = this.getRuntime();
                q.shimExec.call(this, "XMLHttpRequest", "abort");
                this.dispatchEvent("readystatechange");
                this.dispatchEvent("abort")
            }
        };
        return (j.XMLHttpRequest = k)
    });
    h("moxie/runtime/flash/runtime/Transporter", ["moxie/runtime/flash/Runtime", "moxie/file/Blob"], function (i, k) {
        var j = {
            getAsBlob: function (n) {
                var m = this.getRuntime(), l = m.shimExec.call(this, "Transporter", "getAsBlob", n);
                if (l) {
                    return new k(m.uid, l)
                }
                return null
            }
        };
        return (i.Transporter = j)
    });
    h("moxie/runtime/flash/image/Image", ["moxie/runtime/flash/Runtime", "moxie/core/utils/Basic", "moxie/runtime/Transporter", "moxie/file/Blob", "moxie/file/FileReaderSync"], function (j, l, k, n, m) {
        var i = {
            loadFromBlob: function (r) {
                var q = this, p = q.getRuntime();

                function o(t) {
                    p.shimExec.call(q, "Image", "loadFromBlob", t.uid);
                    q = p = null
                }

                if (r.isDetached()) {
                    var s = new k();
                    s.bind("TransportingComplete", function () {
                        o(s.result.getSource())
                    });
                    s.transport(r.getSource(), r.type, {ruid: p.uid})
                } else {
                    o(r.getSource())
                }
            }, loadFromImage: function (p) {
                var o = this.getRuntime();
                return o.shimExec.call(this, "Image", "loadFromImage", p.uid)
            }, getAsBlob: function (q, r) {
                var p = this.getRuntime(), o = p.shimExec.call(this, "Image", "getAsBlob", q, r);
                if (o) {
                    return new n(p.uid, o)
                }
                return null
            }, getAsDataURL: function () {
                var q = this.getRuntime(), p = q.Image.getAsBlob.apply(this, arguments), o;
                if (!p) {
                    return null
                }
                o = new m();
                return o.readAsDataURL(p)
            }
        };
        return (j.Image = i)
    });
    h("moxie/runtime/silverlight/Runtime", ["moxie/core/utils/Basic", "moxie/core/utils/Env", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/runtime/Runtime"], function (j, m, l, p, i) {
        var n = "silverlight", o = {};

        function q(z) {
            var C = false, v = null, r, s, t, B, u, x = 0;
            try {
                try {
                    v = new ActiveXObject("AgControl.AgControl");
                    if (v.IsVersionSupported(z)) {
                        C = true
                    }
                    v = null
                } catch (y) {
                    var w = navigator.plugins["Silverlight Plug-In"];
                    if (w) {
                        r = w.description;
                        if (r === "1.0.30226.2") {
                            r = "2.0.30226.2"
                        }
                        s = r.split(".");
                        while (s.length > 3) {
                            s.pop()
                        }
                        while (s.length < 4) {
                            s.push(0)
                        }
                        t = z.split(".");
                        while (t.length > 4) {
                            t.pop()
                        }
                        do {
                            B = parseInt(t[x], 10);
                            u = parseInt(s[x], 10);
                            x++
                        } while (x < t.length && B === u);
                        if (B <= u && !isNaN(B)) {
                            C = true
                        }
                    }
                }
            } catch (A) {
                C = false
            }
            return C
        }

        function k(s) {
            var r = this, t;
            s = j.extend({xap_url: m.xap_url}, s);
            i.call(this, s, n, {
                access_binary: i.capTrue,
                access_image_binary: i.capTrue,
                display_media: i.capTrue,
                do_cors: i.capTrue,
                drag_and_drop: false,
                report_upload_progress: i.capTrue,
                resize_image: i.capTrue,
                return_response_headers: function (u) {
                    return u && r.mode === "client"
                },
                return_response_type: function (u) {
                    if (u !== "json") {
                        return true
                    } else {
                        return !!window.JSON
                    }
                },
                return_status_code: function (u) {
                    return r.mode === "client" || !j.arrayDiff(u, [200, 404])
                },
                select_file: i.capTrue,
                select_multiple: i.capTrue,
                send_binary_string: i.capTrue,
                send_browser_cookies: function (u) {
                    return u && r.mode === "browser"
                },
                send_custom_headers: function (u) {
                    return u && r.mode === "client"
                },
                send_multipart: i.capTrue,
                slice_blob: i.capTrue,
                stream_upload: true,
                summon_file_dialog: false,
                upload_filesize: i.capTrue,
                use_http_method: function (u) {
                    return r.mode === "client" || !j.arrayDiff(u, ["GET", "POST"])
                }
            }, {
                return_response_headers: function (u) {
                    return u ? "client" : "browser"
                }, return_status_code: function (u) {
                    return j.arrayDiff(u, [200, 404]) ? "client" : ["client", "browser"]
                }, send_browser_cookies: function (u) {
                    return u ? "browser" : "client"
                }, send_custom_headers: function (u) {
                    return u ? "client" : "browser"
                }, use_http_method: function (u) {
                    return j.arrayDiff(u, ["GET", "POST"]) ? "client" : ["client", "browser"]
                }
            });
            if (!q("2.0.31005.0") || m.browser === "Opera") {
                this.mode = false
            }
            j.extend(this, {
                getShim: function () {
                    return l.get(this.uid).content.Moxie
                }, shimExec: function (v, w) {
                    var u = [].slice.call(arguments, 2);
                    return r.getShim().exec(this.uid, v, w, u)
                }, init: function () {
                    var u;
                    u = this.getShimContainer();
                    u.innerHTML = '<object id="' + this.uid + '" data="data:application/x-silverlight," type="application/x-silverlight-2" width="100%" height="100%" style="outline:none;"><param name="source" value="' + s.xap_url + '"/><param name="background" value="Transparent"/><param name="windowless" value="true"/><param name="enablehtmlaccess" value="true"/><param name="initParams" value="uid=' + this.uid + ",target=" + m.global_event_dispatcher + '"/></object>';
                    t = setTimeout(function () {
                        if (r && !r.initialized) {
                            r.trigger("Error", new p.RuntimeError(p.RuntimeError.NOT_INIT_ERR))
                        }
                    }, m.OS !== "Windows" ? 10000 : 5000)
                }, destroy: (function (u) {
                    return function () {
                        u.call(r);
                        clearTimeout(t);
                        s = t = u = r = null
                    }
                }(this.destroy))
            }, o)
        }

        i.addConstructor(n, k);
        return o
    });
    h("moxie/runtime/silverlight/file/Blob", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Basic", "moxie/runtime/flash/file/Blob"], function (i, j, k) {
        return (i.Blob = j.extend({}, k))
    });
    h("moxie/runtime/silverlight/file/FileInput", ["moxie/runtime/silverlight/Runtime"], function (i) {
        var j = {
            init: function (l) {
                function k(n) {
                    var o = "";
                    for (var m = 0; m < n.length; m++) {
                        o += (o !== "" ? "|" : "") + n[m].title + " | *." + n[m].extensions.replace(/,/g, ";*.")
                    }
                    return o
                }

                this.getRuntime().shimExec.call(this, "FileInput", "init", k(l.accept), l.name, l.multiple);
                this.trigger("ready")
            }
        };
        return (i.FileInput = j)
    });
    h("moxie/runtime/silverlight/file/FileDrop", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Dom", "moxie/core/utils/Events"], function (k, j, i) {
        var l = {
            init: function () {
                var n = this, m = n.getRuntime(), o;
                o = m.getShimContainer();
                i.addEvent(o, "dragover", function (p) {
                    p.preventDefault();
                    p.stopPropagation();
                    p.dataTransfer.dropEffect = "copy"
                }, n.uid);
                i.addEvent(o, "dragenter", function (q) {
                    q.preventDefault();
                    var p = j.get(m.uid).dragEnter(q);
                    if (p) {
                        q.stopPropagation()
                    }
                }, n.uid);
                i.addEvent(o, "drop", function (q) {
                    q.preventDefault();
                    var p = j.get(m.uid).dragDrop(q);
                    if (p) {
                        q.stopPropagation()
                    }
                }, n.uid);
                return m.shimExec.call(this, "FileDrop", "init")
            }
        };
        return (k.FileDrop = l)
    });
    h("moxie/runtime/silverlight/file/FileReader", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Basic", "moxie/runtime/flash/file/FileReader"], function (i, k, j) {
        return (i.FileReader = k.extend({}, j))
    });
    h("moxie/runtime/silverlight/file/FileReaderSync", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Basic", "moxie/runtime/flash/file/FileReaderSync"], function (i, j, k) {
        return (i.FileReaderSync = j.extend({}, k))
    });
    h("moxie/runtime/silverlight/xhr/XMLHttpRequest", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Basic", "moxie/runtime/flash/xhr/XMLHttpRequest"], function (i, k, j) {
        return (i.XMLHttpRequest = k.extend({}, j))
    });
    h("moxie/runtime/silverlight/runtime/Transporter", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Basic", "moxie/runtime/flash/runtime/Transporter"], function (i, k, j) {
        return (i.Transporter = k.extend({}, j))
    });
    h("moxie/runtime/silverlight/image/Image", ["moxie/runtime/silverlight/Runtime", "moxie/core/utils/Basic", "moxie/runtime/flash/image/Image"], function (j, k, i) {
        return (j.Image = k.extend({}, i, {
            getInfo: function () {
                var m = this.getRuntime(), n = ["tiff", "exif", "gps"], o = {meta: {}}, l = m.shimExec.call(this, "Image", "getInfo");
                if (l.meta) {
                    k.each(n, function (q) {
                        var u = l.meta[q], p, r, s, t;
                        if (u && u.keys) {
                            o.meta[q] = {};
                            for (r = 0, s = u.keys.length; r < s; r++) {
                                p = u.keys[r];
                                t = u[p];
                                if (t) {
                                    if (/^(\d|[1-9]\d+)$/.test(t)) {
                                        t = parseInt(t, 10)
                                    } else {
                                        if (/^\d*\.\d+$/.test(t)) {
                                            t = parseFloat(t)
                                        }
                                    }
                                    o.meta[q][p] = t
                                }
                            }
                        }
                    })
                }
                o.width = parseInt(l.width, 10);
                o.height = parseInt(l.height, 10);
                o.size = parseInt(l.size, 10);
                o.type = l.type;
                o.name = l.name;
                return o
            }
        }))
    });
    h("moxie/runtime/html4/Runtime", ["moxie/core/utils/Basic", "moxie/core/Exceptions", "moxie/runtime/Runtime", "moxie/core/utils/Env"], function (o, i, l, k) {
        var n = "html4", m = {};

        function j(q) {
            var p = this, s = l.capTest, r = l.capTrue;
            l.call(this, q, n, {
                access_binary: s(window.FileReader || window.File && File.getAsDataURL),
                access_image_binary: false,
                display_media: s(m.Image && (k.can("create_canvas") || k.can("use_data_uri_over32kb"))),
                do_cors: false,
                drag_and_drop: false,
                filter_by_extension: s(function () {
                    return (k.browser === "Chrome" && k.version >= 28) || (k.browser === "IE" && k.version >= 10)
                }()),
                resize_image: function () {
                    return m.Image && p.can("access_binary") && k.can("create_canvas")
                },
                report_upload_progress: false,
                return_response_headers: false,
                return_response_type: function (t) {
                    if (t === "json" && !!window.JSON) {
                        return true
                    }
                    return !!~o.inArray(t, ["text", "document", ""])
                },
                return_status_code: function (t) {
                    return !o.arrayDiff(t, [200, 404])
                },
                select_file: function () {
                    return k.can("use_fileinput")
                },
                select_multiple: false,
                send_binary_string: false,
                send_custom_headers: false,
                send_multipart: true,
                slice_blob: false,
                stream_upload: function () {
                    return p.can("select_file")
                },
                summon_file_dialog: s(function () {
                    return (k.browser === "Firefox" && k.version >= 4) || (k.browser === "Opera" && k.version >= 12) || !!~o.inArray(k.browser, ["Chrome", "Safari"])
                }()),
                upload_filesize: r,
                use_http_method: function (t) {
                    return !o.arrayDiff(t, ["GET", "POST"])
                }
            });
            o.extend(this, {
                init: function () {
                    this.trigger("Init")
                }, destroy: (function (t) {
                    return function () {
                        t.call(p);
                        t = p = null
                    }
                }(this.destroy))
            });
            o.extend(this.getShim(), m)
        }

        l.addConstructor(n, j);
        return m
    });
    h("moxie/runtime/html4/file/FileInput", ["moxie/runtime/html4/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/utils/Events", "moxie/core/utils/Mime", "moxie/core/utils/Env"], function (m, o, l, j, k, i) {
        function n() {
            var s, q = [], t = [], p;

            function r() {
                var w = this, z = w.getRuntime(), y, x, u, B, v, A;
                A = o.guid("uid_");
                y = z.getShimContainer();
                if (s) {
                    u = l.get(s + "_form");
                    if (u) {
                        o.extend(u.style, {top: "100%"})
                    }
                }
                B = document.createElement("form");
                B.setAttribute("id", A + "_form");
                B.setAttribute("method", "post");
                B.setAttribute("enctype", "multipart/form-data");
                B.setAttribute("encoding", "multipart/form-data");
                o.extend(B.style, {
                    overflow: "hidden",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                });
                v = document.createElement("input");
                v.setAttribute("id", A);
                v.setAttribute("type", "file");
                v.setAttribute("name", p.name || "Filedata");
                v.setAttribute("accept", t.join(","));
                o.extend(v.style, {fontSize: "999px", opacity: 0});
                B.appendChild(v);
                y.appendChild(B);
                o.extend(v.style, {position: "absolute", top: 0, left: 0, width: "100%", height: "100%"});
                if (i.browser === "IE" && i.version < 10) {
                    o.extend(v.style, {filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=0)"})
                }
                v.onchange = function () {
                    var D;
                    if (!this.value) {
                        return
                    }
                    if (this.files) {
                        D = this.files[0]
                    } else {
                        D = {name: this.value}
                    }
                    q = [D];
                    this.onchange = function () {
                    };
                    r.call(w);
                    w.bind("change", function C() {
                        var E = l.get(A), G = l.get(A + "_form"), F;
                        w.unbind("change", C);
                        if (w.files.length && E && G) {
                            F = w.files[0];
                            E.setAttribute("id", F.uid);
                            G.setAttribute("id", F.uid + "_form");
                            G.setAttribute("target", F.uid + "_iframe")
                        }
                        E = G = null
                    }, 998);
                    v = B = null;
                    w.trigger("change")
                };
                if (z.can("summon_file_dialog")) {
                    x = l.get(p.browse_button);
                    j.removeEvent(x, "click", w.uid);
                    j.addEvent(x, "click", function (C) {
                        if (v && !v.disabled) {
                            v.click()
                        }
                        C.preventDefault()
                    }, w.uid)
                }
                s = A;
                y = u = x = null
            }

            o.extend(this, {
                init: function (x) {
                    var u = this, w = u.getRuntime(), v;
                    p = x;
                    t = x.accept.mimes || k.extList2mimes(x.accept, w.can("filter_by_extension"));
                    v = w.getShimContainer();
                    (function () {
                        var y, A, z;
                        y = l.get(x.browse_button);
                        A = parseInt(l.getStyle(y, "z-index"), 10) || 0;
                        if (w.can("summon_file_dialog")) {
                            if (l.getStyle(y, "position") === "static") {
                                y.style.position = "relative"
                            }
                            v.style.zIndex = A - 1
                        } else {
                            v.style.zIndex = A
                        }
                        z = w.can("summon_file_dialog") ? y : v;
                        j.addEvent(z, "mouseover", function () {
                            u.trigger("mouseenter")
                        }, u.uid);
                        j.addEvent(z, "mouseout", function () {
                            u.trigger("mouseleave")
                        }, u.uid);
                        j.addEvent(z, "mousedown", function () {
                            u.trigger("mousedown")
                        }, u.uid);
                        j.addEvent(l.get(x.container), "mouseup", function () {
                            u.trigger("mouseup")
                        }, u.uid);
                        y = null
                    }());
                    r.call(this);
                    v = null;
                    u.trigger({type: "ready", async: true})
                }, getFiles: function () {
                    return q
                }, disable: function (v) {
                    var u;
                    if ((u = l.get(s))) {
                        u.disabled = !!v
                    }
                }, destroy: function () {
                    var v = this.getRuntime(), w = v.getShim(), u = v.getShimContainer();
                    j.removeAllEvents(u, this.uid);
                    j.removeAllEvents(p && l.get(p.container), this.uid);
                    j.removeAllEvents(p && l.get(p.browse_button), this.uid);
                    if (u) {
                        u.innerHTML = ""
                    }
                    w.removeInstance(this.uid);
                    s = q = t = p = u = w = null
                }
            })
        }

        return (m.FileInput = n)
    });
    h("moxie/runtime/html4/file/FileReader", ["moxie/runtime/html4/Runtime", "moxie/runtime/html5/file/FileReader"], function (i, j) {
        return (i.FileReader = j)
    });
    h("moxie/runtime/html4/xhr/XMLHttpRequest", ["moxie/runtime/html4/Runtime", "moxie/core/utils/Basic", "moxie/core/utils/Dom", "moxie/core/utils/Url", "moxie/core/Exceptions", "moxie/core/utils/Events", "moxie/file/Blob", "moxie/xhr/FormData"], function (m, j, l, i, n, p, k, q) {
        function o() {
            var t, r, u;

            function s(v) {
                var A = this, y, z, w, x, B = false;
                if (!u) {
                    return
                }
                y = u.id.replace(/_iframe$/, "");
                z = l.get(y + "_form");
                if (z) {
                    w = z.getElementsByTagName("input");
                    x = w.length;
                    while (x--) {
                        switch (w[x].getAttribute("type")) {
                            case"hidden":
                                w[x].parentNode.removeChild(w[x]);
                                break;
                            case"file":
                                B = true;
                                break
                        }
                    }
                    w = [];
                    if (!B) {
                        z.parentNode.removeChild(z)
                    }
                    z = null
                }
                setTimeout(function () {
                    p.removeEvent(u, "load", A.uid);
                    if (u.parentNode) {
                        u.parentNode.removeChild(u)
                    }
                    var C = A.getRuntime().getShimContainer();
                    if (!C.children.length) {
                        C.parentNode.removeChild(C)
                    }
                    C = u = null;
                    v()
                }, 1)
            }

            j.extend(this, {
                send: function (D, x) {
                    var z = this, C = z.getRuntime(), y, w, B, v;
                    t = r = null;
                    function A() {
                        var E = C.getShimContainer() || document.body, F = document.createElement("div");
                        F.innerHTML = '<iframe id="' + y + '_iframe" name="' + y + '_iframe" src="javascript:&quot;&quot;" style="display:none"></iframe>';
                        u = F.firstChild;
                        E.appendChild(u);
                        p.addEvent(u, "load", function () {
                            var H;
                            try {
                                H = u.contentWindow.document || u.contentDocument || window.frames[u.id].document;
                                if (/^4(0[0-9]|1[0-7]|2[2346])\s/.test(H.title)) {
                                    t = H.title.replace(/^(\d+).*$/, "$1")
                                } else {
                                    t = 200;
                                    r = j.trim(H.body.innerHTML);
                                    z.trigger({type: "progress", loaded: r.length, total: r.length});
                                    if (v) {
                                        z.trigger({
                                            type: "uploadprogress",
                                            loaded: v.size || 1025,
                                            total: v.size || 1025
                                        })
                                    }
                                }
                            } catch (G) {
                                if (i.hasSameOrigin(D.url)) {
                                    t = 404
                                } else {
                                    s.call(z, function () {
                                        z.trigger("error")
                                    });
                                    return
                                }
                            }
                            s.call(z, function () {
                                z.trigger("load")
                            })
                        }, z.uid)
                    }

                    if (x instanceof q && x.hasBlob()) {
                        v = x.getBlob();
                        y = v.uid;
                        B = l.get(y);
                        w = l.get(y + "_form");
                        if (!w) {
                            throw new n.DOMException(n.DOMException.NOT_FOUND_ERR)
                        }
                    } else {
                        y = j.guid("uid_");
                        w = document.createElement("form");
                        w.setAttribute("id", y + "_form");
                        w.setAttribute("method", D.method);
                        w.setAttribute("enctype", "multipart/form-data");
                        w.setAttribute("encoding", "multipart/form-data");
                        w.setAttribute("target", y + "_iframe");
                        C.getShimContainer().appendChild(w)
                    }
                    if (x instanceof q) {
                        x.each(function (G, E) {
                            if (G instanceof k) {
                                if (B) {
                                    B.setAttribute("name", E)
                                }
                            } else {
                                var F = document.createElement("input");
                                j.extend(F, {type: "hidden", name: E, value: G});
                                if (B) {
                                    w.insertBefore(F, B)
                                } else {
                                    w.appendChild(F)
                                }
                            }
                        })
                    }
                    w.setAttribute("action", D.url);
                    A();
                    w.submit();
                    z.trigger("loadstart")
                }, getStatus: function () {
                    return t
                }, getResponse: function (v) {
                    if ("json" === v) {
                        if (j.typeOf(r) === "string" && !!window.JSON) {
                            try {
                                return JSON.parse(r.replace(/^\s*<pre[^>]*>/, "").replace(/<\/pre>\s*$/, ""))
                            } catch (w) {
                                return null
                            }
                        }
                    } else {
                        if ("document" === v) {
                        }
                    }
                    return r
                }, abort: function () {
                    var v = this;
                    if (u && u.contentWindow) {
                        if (u.contentWindow.stop) {
                            u.contentWindow.stop()
                        } else {
                            if (u.contentWindow.document.execCommand) {
                                u.contentWindow.document.execCommand("Stop")
                            } else {
                                u.src = "about:blank"
                            }
                        }
                    }
                    s.call(this, function () {
                        v.dispatchEvent("abort")
                    })
                }
            })
        }

        return (m.XMLHttpRequest = o)
    });
    h("moxie/runtime/html4/image/Image", ["moxie/runtime/html4/Runtime", "moxie/runtime/html5/image/Image"], function (j, i) {
        return (j.Image = i)
    });
    a(["moxie/core/utils/Basic", "moxie/core/I18n", "moxie/core/utils/Mime", "moxie/core/utils/Env", "moxie/core/utils/Dom", "moxie/core/Exceptions", "moxie/core/EventTarget", "moxie/core/utils/Encode", "moxie/runtime/Runtime", "moxie/runtime/RuntimeClient", "moxie/file/Blob", "moxie/file/File", "moxie/file/FileInput", "moxie/file/FileDrop", "moxie/runtime/RuntimeTarget", "moxie/file/FileReader", "moxie/core/utils/Url", "moxie/file/FileReaderSync", "moxie/xhr/FormData", "moxie/xhr/XMLHttpRequest", "moxie/runtime/Transporter", "moxie/image/Image", "moxie/core/utils/Events"])
})(this);

(function (a) {
    var d = {}, c = a.moxie.core.utils.Basic.inArray;
    (function b(f) {
        var e, g;
        for (e in f) {
            g = typeof(f[e]);
            if (g === "object" && !~c(e, ["Exceptions", "Env", "Mime"])) {
                b(f[e])
            } else {
                if (g === "function") {
                    d[e] = f[e]
                }
            }
        }
    })(a.moxie);
    d.Env = a.moxie.core.utils.Env;
    d.Mime = a.moxie.core.utils.Mime;
    d.Exceptions = a.moxie.core.Exceptions;
    a.mOxie = d;
    if (!a.o) {
        a.o = d
    }
    return d
})(this);

(function (f, h, e) {
    var d = f.setTimeout, g = {};

    function a(j) {
        var i = j.required_features, k = {};

        function l(n, o, m) {
            var p = {
                chunks: "slice_blob",
                jpgresize: "send_binary_string",
                pngresize: "send_binary_string",
                progress: "report_upload_progress",
                multi_selection: "select_multiple",
                dragdrop: "drag_and_drop",
                drop_element: "drag_and_drop",
                headers: "send_custom_headers",
                urlstream_upload: "send_binary_string",
                canSendBinary: "send_binary",
                triggerDialog: "summon_file_dialog"
            };
            if (p[n]) {
                k[p[n]] = o
            } else {
                if (!m) {
                    k[n] = o
                }
            }
        }

        if (typeof(i) === "string") {
            c.each(i.split(/\s*,\s*/), function (m) {
                l(m, true)
            })
        } else {
            if (typeof(i) === "object") {
                c.each(i, function (n, m) {
                    l(m, n)
                })
            } else {
                if (i === true) {
                    if (j.chunk_size > 0) {
                        k.slice_blob = true
                    }
                    if (j.resize.enabled || !j.multipart) {
                        k.send_binary_string = true
                    }
                    c.each(j, function (n, m) {
                        l(m, !!n, true)
                    })
                }
            }
        }
        return k
    }

    var c = {
        VERSION: "2.1.2",
        STOPPED: 1,
        STARTED: 2,
        QUEUED: 1,
        UPLOADING: 2,
        FAILED: 4,
        DONE: 5,
        GENERIC_ERROR: -100,
        HTTP_ERROR: -200,
        IO_ERROR: -300,
        SECURITY_ERROR: -400,
        INIT_ERROR: -500,
        FILE_SIZE_ERROR: -600,
        FILE_EXTENSION_ERROR: -601,
        FILE_DUPLICATE_ERROR: -602,
        IMAGE_FORMAT_ERROR: -700,
        MEMORY_ERROR: -701,
        IMAGE_DIMENSIONS_ERROR: -702,
        mimeTypes: h.mimes,
        ua: h.ua,
        typeOf: h.typeOf,
        extend: h.extend,
        guid: h.guid,
        get: function b(m) {
            var k = [], l;
            if (h.typeOf(m) !== "array") {
                m = [m]
            }
            var j = m.length;
            while (j--) {
                l = h.get(m[j]);
                if (l) {
                    k.push(l)
                }
            }
            return k.length ? k : null
        },
        each: h.each,
        getPos: h.getPos,
        getSize: h.getSize,
        xmlEncode: function (j) {
            var k = {"<": "lt", ">": "gt", "&": "amp", '"': "quot", "'": "#39"}, i = /[<>&\"\']/g;
            return j ? ("" + j).replace(i, function (l) {
                return k[l] ? "&" + k[l] + ";" : l
            }) : j
        },
        toArray: h.toArray,
        inArray: h.inArray,
        addI18n: h.addI18n,
        translate: h.translate,
        isEmptyObj: h.isEmptyObj,
        hasClass: h.hasClass,
        addClass: h.addClass,
        removeClass: h.removeClass,
        getStyle: h.getStyle,
        addEvent: h.addEvent,
        removeEvent: h.removeEvent,
        removeAllEvents: h.removeAllEvents,
        cleanName: function (j) {
            var k, l;
            l = [/[\300-\306]/g, "A", /[\340-\346]/g, "a", /\307/g, "C", /\347/g, "c", /[\310-\313]/g, "E", /[\350-\353]/g, "e", /[\314-\317]/g, "I", /[\354-\357]/g, "i", /\321/g, "N", /\361/g, "n", /[\322-\330]/g, "O", /[\362-\370]/g, "o", /[\331-\334]/g, "U", /[\371-\374]/g, "u"];
            for (k = 0; k < l.length; k += 2) {
                j = j.replace(l[k], l[k + 1])
            }
            j = j.replace(/\s+/g, "_");
            j = j.replace(/[^a-z0-9_\-\.]+/gi, "");
            return j
        },
        buildUrl: function (j, i) {
            var k = "";
            c.each(i, function (m, l) {
                k += (k ? "&" : "") + encodeURIComponent(l) + "=" + encodeURIComponent(m)
            });
            if (k) {
                j += (j.indexOf("?") > 0 ? "&" : "?") + k
            }
            return j
        },
        formatSize: function (j) {
            if (j === e || /\D/.test(j)) {
                return c.translate("N/A")
            }
            function i(m, l) {
                return Math.round(m * Math.pow(10, l)) / Math.pow(10, l)
            }

            var k = Math.pow(1024, 4);
            if (j > k) {
                return i(j / k, 1) + " " + c.translate("tb")
            }
            if (j > (k /= 1024)) {
                return i(j / k, 1) + " " + c.translate("gb")
            }
            if (j > (k /= 1024)) {
                return i(j / k, 1) + " " + c.translate("mb")
            }
            if (j > 1024) {
                return Math.round(j / 1024) + " " + c.translate("kb")
            }
            return j + " " + c.translate("b")
        },
        parseSize: h.parseSizeStr,
        predictRuntime: function (k, j) {
            var i, l;
            i = new c.Uploader(k);
            l = h.Runtime.thatCan(i.getOption().required_features, j || k.runtimes);
            i.destroy();
            return l
        },
        addFileFilter: function (j, i) {
            g[j] = i
        }
    };
    c.addFileFilter("mime_types", function (k, j, i) {
        if (k.length && k.regexp && !k.regexp.test(j.name)) {
            this.trigger("Error", {
                code: c.FILE_EXTENSION_ERROR,
                message: c.translate("File extension error."),
                file: j
            });
            i(false)
        } else {
            i(true)
        }
    });
    c.addFileFilter("max_file_size", function (l, j, i) {
        var k;
        l = c.parseSize(l);
        if (j.size !== k && l && j.size > l) {
            this.trigger("Error", {code: c.FILE_SIZE_ERROR, message: c.translate("File size error."), file: j});
            i(false)
        } else {
            i(true)
        }
    });
    c.addFileFilter("prevent_duplicates", function (l, j, i) {
        if (l) {
            var k = this.files.length;
            while (k--) {
                if (j.name === this.files[k].name && j.size === this.files[k].size) {
                    this.trigger("Error", {
                        code: c.FILE_DUPLICATE_ERROR,
                        message: c.translate("Duplicate file error."),
                        file: j
                    });
                    i(false);
                    return
                }
            }
        }
        i(true)
    });
    c.Uploader = function (l) {
        var t = c.guid(), G, p = [], x = {}, F = [], w = [], C, J, n = false, v;

        function I() {
            var L, N = 0, K;
            if (this.state == c.STARTED) {
                for (K = 0; K < p.length; K++) {
                    if (!L && p[K].status == c.QUEUED) {
                        L = p[K];
                        if (this.trigger("BeforeUpload", L)) {
                            L.status = c.UPLOADING;
                            this.trigger("UploadFile", L)
                        }
                    } else {
                        N++
                    }
                }
                if (N == p.length) {
                    if (this.state !== c.STOPPED) {
                        this.state = c.STOPPED;
                        this.trigger("StateChanged")
                    }
                    this.trigger("UploadComplete", p)
                }
            }
        }

        function k(K) {
            K.percent = K.size > 0 ? Math.ceil(K.loaded / K.size * 100) : 100;
            j()
        }

        function j() {
            var L, K;
            J.reset();
            for (L = 0; L < p.length; L++) {
                K = p[L];
                if (K.size !== e) {
                    J.size += K.origSize;
                    J.loaded += K.loaded * K.origSize / K.size
                } else {
                    J.size = e
                }
                if (K.status == c.DONE) {
                    J.uploaded++
                } else {
                    if (K.status == c.FAILED) {
                        J.failed++
                    } else {
                        J.queued++
                    }
                }
            }
            if (J.size === e) {
                J.percent = p.length > 0 ? Math.ceil(J.uploaded / p.length * 100) : 0
            } else {
                J.bytesPerSec = Math.ceil(J.loaded / ((+new Date() - C || 1) / 1000));
                J.percent = J.size > 0 ? Math.ceil(J.loaded / J.size * 100) : 0
            }
        }

        function H() {
            var K = F[0] || w[0];
            if (K) {
                return K.getRuntime().uid
            }
            return false
        }

        function E(L, K) {
            if (L.ruid) {
                var N = h.Runtime.getInfo(L.ruid);
                if (N) {
                    return N.can(K)
                }
            }
            return false
        }

        function y() {
            this.bind("FilesAdded FilesRemoved", function (K) {
                K.trigger("QueueChanged");
                K.refresh()
            });
            this.bind("CancelUpload", i);
            this.bind("BeforeUpload", B);
            this.bind("UploadFile", D);
            this.bind("UploadProgress", u);
            this.bind("StateChanged", A);
            this.bind("QueueChanged", j);
            this.bind("Error", r);
            this.bind("FileUploaded", s);
            this.bind("Destroy", q)
        }

        function z(Q, N) {
            var O = this, L = 0, K = [];
            var P = {
                runtime_order: Q.runtimes,
                required_caps: Q.required_features,
                preferred_caps: x,
                swf_url: Q.flash_swf_url,
                xap_url: Q.silverlight_xap_url
            };
            c.each(Q.runtimes.split(/\s*,\s*/), function (R) {
                if (Q[R]) {
                    P[R] = Q[R]
                }
            });
            if (Q.browse_button) {
                c.each(Q.browse_button, function (R) {
                    K.push(function (S) {
                        var T = new h.FileInput(c.extend({}, P, {
                            accept: Q.filters.mime_types,
                            name: Q.file_data_name,
                            multiple: Q.multi_selection,
                            container: Q.container,
                            browse_button: R
                        }));
                        T.onready = function () {
                            var U = h.Runtime.getInfo(this.ruid);
                            h.extend(O.features, {
                                chunks: U.can("slice_blob"),
                                multipart: U.can("send_multipart"),
                                multi_selection: U.can("select_multiple")
                            });
                            L++;
                            F.push(this);
                            S()
                        };
                        T.onchange = function () {
                            O.addFile(this.files)
                        };
                        T.bind("mouseenter mouseleave mousedown mouseup", function (U) {
                            if (!n) {
                                if (Q.browse_button_hover) {
                                    if ("mouseenter" === U.type) {
                                        h.addClass(R, Q.browse_button_hover)
                                    } else {
                                        if ("mouseleave" === U.type) {
                                            h.removeClass(R, Q.browse_button_hover)
                                        }
                                    }
                                }
                                if (Q.browse_button_active) {
                                    if ("mousedown" === U.type) {
                                        h.addClass(R, Q.browse_button_active)
                                    } else {
                                        if ("mouseup" === U.type) {
                                            h.removeClass(R, Q.browse_button_active)
                                        }
                                    }
                                }
                            }
                        });
                        T.bind("mousedown", function () {
                            O.trigger("Browse")
                        });
                        T.bind("error runtimeerror", function () {
                            T = null;
                            S()
                        });
                        T.init()
                    })
                })
            }
            if (Q.drop_element) {
                c.each(Q.drop_element, function (R) {
                    K.push(function (S) {
                        var T = new h.FileDrop(c.extend({}, P, {drop_zone: R}));
                        T.onready = function () {
                            var U = h.Runtime.getInfo(this.ruid);
                            O.features.dragdrop = U.can("drag_and_drop");
                            L++;
                            w.push(this);
                            S()
                        };
                        T.ondrop = function () {
                            O.addFile(this.files)
                        };
                        T.bind("error runtimeerror", function () {
                            T = null;
                            S()
                        });
                        T.init()
                    })
                })
            }
            h.inSeries(K, function () {
                if (typeof(N) === "function") {
                    N(L)
                }
            })
        }

        function o(N, P, K) {
            var L = new h.Image();
            try {
                L.onload = function () {
                    if (P.width > this.width && P.height > this.height && P.quality === e && P.preserve_headers && !P.crop) {
                        this.destroy();
                        return K(N)
                    }
                    L.downsize(P.width, P.height, P.crop, P.preserve_headers)
                };
                L.onresize = function () {
                    K(this.getAsBlob(N.type, P.quality));
                    this.destroy()
                };
                L.onerror = function () {
                    K(N)
                };
                L.load(N)
            } catch (O) {
                K(N)
            }
        }

        function m(N, P, Q) {
            var L = this, K = false;

            function O(S, T, U) {
                var R = G[S];
                switch (S) {
                    case"max_file_size":
                        if (S === "max_file_size") {
                            G.max_file_size = G.filters.max_file_size = T
                        }
                        break;
                    case"chunk_size":
                        if (T = c.parseSize(T)) {
                            G[S] = T;
                            G.send_file_name = true
                        }
                        break;
                    case"multipart":
                        G[S] = T;
                        if (!T) {
                            G.send_file_name = true
                        }
                        break;
                    case"unique_names":
                        G[S] = T;
                        if (T) {
                            G.send_file_name = true
                        }
                        break;
                    case"filters":
                        if (c.typeOf(T) === "array") {
                            T = {mime_types: T}
                        }
                        if (U) {
                            c.extend(G.filters, T)
                        } else {
                            G.filters = T
                        }
                        if (T.mime_types) {
                            G.filters.mime_types.regexp = (function (V) {
                                var W = [];
                                c.each(V, function (X) {
                                    X.extensions && c.each(X.extensions.split(/,/), function (Y) {
                                        if (/^\s*\*\s*$/.test(Y)) {
                                            W.push("\\.*")
                                        } else {
                                            W.push("\\." + Y.replace(new RegExp("[" + ("/^$.*+?|()[]{}\\".replace(/./g, "\\$&")) + "]", "g"), "\\$&"))
                                        }
                                    })
                                });
                                return new RegExp("(" + W.join("|") + ")$", "i")
                            }(G.filters.mime_types))
                        }
                        break;
                    case"resize":
                        if (U) {
                            c.extend(G.resize, T, {enabled: true})
                        } else {
                            G.resize = T
                        }
                        break;
                    case"prevent_duplicates":
                        G.prevent_duplicates = G.filters.prevent_duplicates = !!T;
                        break;
                    case"browse_button":
                    case"drop_element":
                        T = c.get(T);
                    case"container":
                    case"runtimes":
                    case"multi_selection":
                    case"flash_swf_url":
                    case"silverlight_xap_url":
                        G[S] = T;
                        if (!U) {
                            K = true
                        }
                        break;
                    default:
                        G[S] = T
                }
                if (!U) {
                    L.trigger("OptionChanged", S, T, R)
                }
            }

            if (typeof(N) === "object") {
                c.each(N, function (S, R) {
                    O(R, S, Q)
                })
            } else {
                O(N, P, Q)
            }
            if (Q) {
                G.required_features = a(c.extend({}, G));
                x = a(c.extend({}, G, {required_features: true}))
            } else {
                if (K) {
                    L.trigger("Destroy");
                    z.call(L, G, function (R) {
                        if (R) {
                            L.runtime = h.Runtime.getInfo(H()).type;
                            L.trigger("Init", {runtime: L.runtime});
                            L.trigger("PostInit")
                        } else {
                            L.trigger("Error", {code: c.INIT_ERROR, message: c.translate("Init error.")})
                        }
                    })
                }
            }
        }

        function B(K, L) {
            if (K.settings.unique_names) {
                var O = L.name.match(/\.([^.]+)$/), N = "part";
                if (O) {
                    N = O[1]
                }
                L.target_name = L.id + "." + N
            }
        }

        function D(T, Q) {
            var N = T.settings.url, R = T.settings.chunk_size, U = T.settings.max_retries, O = T.features, S = 0, K;
            if (Q.loaded) {
                S = Q.loaded = R ? R * Math.floor(Q.loaded / R) : 0
            }
            function P() {
                if (U-- > 0) {
                    d(L, 1000)
                } else {
                    Q.loaded = S;
                    T.trigger("Error", {
                        code: c.HTTP_ERROR,
                        message: c.translate("HTTP Error."),
                        file: Q,
                        response: v.responseText,
                        status: v.status,
                        responseHeaders: v.getAllResponseHeaders()
                    })
                }
            }

            function L() {
                var X, W, V = {}, Z;
                if (Q.status !== c.UPLOADING || T.state === c.STOPPED) {
                    return
                }
                if (T.settings.send_file_name) {
                    V.name = Q.target_name || Q.name
                }
                if (R && O.chunks && K.size > R) {
                    Z = Math.min(R, K.size - S);
                    X = K.slice(S, S + Z)
                } else {
                    Z = K.size;
                    X = K
                }
                if (R && O.chunks) {
                    if (T.settings.send_chunk_number) {
                        V.chunk = Math.ceil(S / R);
                        V.chunks = Math.ceil(K.size / R)
                    } else {
                        V.offset = S;
                        V.total = K.size
                    }
                }
                v = new h.XMLHttpRequest();
                if (v.upload) {
                    v.upload.onprogress = function (aa) {
                        Q.loaded = Math.min(Q.size, S + aa.loaded);
                        T.trigger("UploadProgress", Q)
                    }
                }
                var Y = v;
                v.onload = function () {
                    if (Y.status >= 400) {
                        P();
                        return
                    }
                    U = T.settings.max_retries;
                    if (Z < K.size) {
                        X.destroy();
                        S += Z;
                        Q.loaded = Math.min(S, K.size);
                        T.trigger("ChunkUploaded", Q, {
                            offset: Q.loaded,
                            total: K.size,
                            response: Y.responseText,
                            status: Y.status,
                            responseHeaders: Y.getAllResponseHeaders()
                        });
                        if (h.Env.browser === "Android Browser") {
                            T.trigger("UploadProgress", Q)
                        }
                    } else {
                        Q.loaded = Q.size
                    }
                    X = W = null;
                    if (!S || S >= K.size) {
                        if (Q.size != Q.origSize) {
                            K.destroy();
                            K = null
                        }
                        T.trigger("UploadProgress", Q);
                        Q.status = c.DONE;
                        T.trigger("FileUploaded", Q, {
                            response: Y.responseText,
                            status: Y.status,
                            responseHeaders: Y.getAllResponseHeaders()
                        })
                    } else {
                        d(L, 1)
                    }
                };
                v.onerror = function () {
                    P()
                };
                v.onloadend = function () {
                    this.destroy();
                    Y = null
                };
                if (T.settings.multipart && O.multipart) {
                    v.open("post", N, true);
                    c.each(T.settings.headers, function (ab, aa) {
                        v.setRequestHeader(aa, ab)
                    });
                    W = new h.FormData();
                    c.each(c.extend(V, T.settings.multipart_params), function (ab, aa) {
                        W.append(aa, ab)
                    });
                    W.append(T.settings.file_data_name, X);
                    v.send(W, {
                        runtime_order: T.settings.runtimes,
                        required_caps: T.settings.required_features,
                        preferred_caps: x,
                        swf_url: T.settings.flash_swf_url,
                        xap_url: T.settings.silverlight_xap_url
                    })
                } else {
                    N = c.buildUrl(T.settings.url, c.extend(V, T.settings.multipart_params));
                    v.open("post", N, true);
                    v.setRequestHeader("Content-Type", "application/octet-stream");
                    c.each(T.settings.headers, function (ab, aa) {
                        v.setRequestHeader(aa, ab)
                    });
                    v.send(X, {
                        runtime_order: T.settings.runtimes,
                        required_caps: T.settings.required_features,
                        preferred_caps: x,
                        swf_url: T.settings.flash_swf_url,
                        xap_url: T.settings.silverlight_xap_url
                    })
                }
            }

            K = Q.getSource();
            if (T.settings.resize.enabled && E(K, "send_binary_string") && !!~h.inArray(K.type, ["image/jpeg", "image/png"])) {
                o.call(this, K, T.settings.resize, function (V) {
                    K = V;
                    Q.size = V.size;
                    L()
                })
            } else {
                L()
            }
        }

        function u(K, L) {
            k(L)
        }

        function A(K) {
            if (K.state == c.STARTED) {
                C = (+new Date())
            } else {
                if (K.state == c.STOPPED) {
                    for (var L = K.files.length - 1; L >= 0; L--) {
                        if (K.files[L].status == c.UPLOADING) {
                            K.files[L].status = c.QUEUED;
                            j()
                        }
                    }
                }
            }
        }

        function i() {
            if (v) {
                v.abort()
            }
        }

        function s(K) {
            j();
            d(function () {
                I.call(K)
            }, 1)
        }

        function r(K, L) {
            if (L.code === c.INIT_ERROR) {
                K.destroy()
            } else {
                if (L.file) {
                    L.file.status = c.FAILED;
                    k(L.file);
                    if (K.state == c.STARTED) {
                        K.trigger("CancelUpload");
                        d(function () {
                            I.call(K)
                        }, 1)
                    }
                }
            }
        }

        function q(K) {
            K.stop();
            c.each(p, function (L) {
                L.destroy()
            });
            p = [];
            if (F.length) {
                c.each(F, function (L) {
                    L.destroy()
                });
                F = []
            }
            if (w.length) {
                c.each(w, function (L) {
                    L.destroy()
                });
                w = []
            }
            x = {};
            n = false;
            C = v = null;
            J.reset()
        }

        G = {
            runtimes: h.Runtime.order,
            max_retries: 0,
            chunk_size: 0,
            multipart: true,
            multi_selection: true,
            file_data_name: "file",
            flash_swf_url: "js/Moxie.swf",
            silverlight_xap_url: "js/Moxie.xap",
            filters: {mime_types: [], prevent_duplicates: false, max_file_size: 0},
            resize: {enabled: false, preserve_headers: true, crop: false},
            send_file_name: true,
            send_chunk_number: true
        };
        m.call(this, l, null, true);
        J = new c.QueueProgress();
        c.extend(this, {
            id: t,
            uid: t,
            state: c.STOPPED,
            features: {},
            runtime: null,
            files: p,
            settings: G,
            total: J,
            init: function () {
                var K = this;
                if (typeof(G.preinit) == "function") {
                    G.preinit(K)
                } else {
                    c.each(G.preinit, function (N, L) {
                        K.bind(L, N)
                    })
                }
                y.call(this);
                if (!G.browse_button || !G.url) {
                    this.trigger("Error", {code: c.INIT_ERROR, message: c.translate("Init error.")});
                    return
                }
                z.call(this, G, function (L) {
                    if (typeof(G.init) == "function") {
                        G.init(K)
                    } else {
                        c.each(G.init, function (O, N) {
                            K.bind(N, O)
                        })
                    }
                    if (L) {
                        K.runtime = h.Runtime.getInfo(H()).type;
                        K.trigger("Init", {runtime: K.runtime});
                        K.trigger("PostInit")
                    } else {
                        K.trigger("Error", {code: c.INIT_ERROR, message: c.translate("Init error.")})
                    }
                })
            },
            setOption: function (K, L) {
                m.call(this, K, L, !this.runtime)
            },
            getOption: function (K) {
                if (!K) {
                    return G
                }
                return G[K]
            },
            refresh: function () {
                if (F.length) {
                    c.each(F, function (K) {
                        K.trigger("Refresh")
                    })
                }
                this.trigger("Refresh")
            },
            start: function () {
                if (this.state != c.STARTED) {
                    this.state = c.STARTED;
                    this.trigger("StateChanged");
                    I.call(this)
                }
            },
            stop: function () {
                if (this.state != c.STOPPED) {
                    this.state = c.STOPPED;
                    this.trigger("StateChanged");
                    this.trigger("CancelUpload")
                }
            },
            disableBrowse: function () {
                n = arguments[0] !== e ? arguments[0] : true;
                if (F.length) {
                    c.each(F, function (K) {
                        K.disable(n)
                    })
                }
                this.trigger("DisableBrowse", n)
            },
            getFile: function (L) {
                var K;
                for (K = p.length - 1; K >= 0; K--) {
                    if (p[K].id === L) {
                        return p[K]
                    }
                }
            },
            addFile: function (Q, S) {
                var N = this, K = [], L = [], O;

                function R(V, U) {
                    var T = [];
                    h.each(N.settings.filters, function (X, W) {
                        if (g[W]) {
                            T.push(function (Y) {
                                g[W].call(N, X, V, function (Z) {
                                    Y(!Z)
                                })
                            })
                        }
                    });
                    h.inSeries(T, U)
                }

                function P(T) {
                    var U = h.typeOf(T);
                    if (T instanceof h.File) {
                        if (!T.ruid && !T.isDetached()) {
                            if (!O) {
                                return false
                            }
                            T.ruid = O;
                            T.connectRuntime(O)
                        }
                        P(new c.File(T))
                    } else {
                        if (T instanceof h.Blob) {
                            P(T.getSource());
                            T.destroy()
                        } else {
                            if (T instanceof c.File) {
                                if (S) {
                                    T.name = S
                                }
                                K.push(function (V) {
                                    R(T, function (W) {
                                        if (!W) {
                                            p.push(T);
                                            L.push(T);
                                            N.trigger("FileFiltered", T)
                                        }
                                        d(V, 1)
                                    })
                                })
                            } else {
                                if (h.inArray(U, ["file", "blob"]) !== -1) {
                                    P(new h.File(null, T))
                                } else {
                                    if (U === "node" && h.typeOf(T.files) === "filelist") {
                                        h.each(T.files, P)
                                    } else {
                                        if (U === "array") {
                                            S = null;
                                            h.each(T, P)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                O = H();
                P(Q);
                if (K.length) {
                    h.inSeries(K, function () {
                        if (L.length) {
                            N.trigger("FilesAdded", L)
                        }
                    })
                }
            },
            removeFile: function (L) {
                var N = typeof(L) === "string" ? L : L.id;
                for (var K = p.length - 1; K >= 0; K--) {
                    if (p[K].id === N) {
                        return this.splice(K, 1)[0]
                    }
                }
            },
            splice: function (O, K) {
                var L = p.splice(O === e ? 0 : O, K === e ? p.length : K);
                var N = false;
                if (this.state == c.STARTED) {
                    c.each(L, function (P) {
                        if (P.status === c.UPLOADING) {
                            N = true;
                            return false
                        }
                    });
                    if (N) {
                        this.stop()
                    }
                }
                this.trigger("FilesRemoved", L);
                c.each(L, function (P) {
                    P.destroy()
                });
                if (N) {
                    this.start()
                }
                return L
            },
            bind: function (L, O, N) {
                var K = this;
                c.Uploader.prototype.bind.call(this, L, function () {
                    var P = [].slice.call(arguments);
                    P.splice(0, 1, K);
                    return O.apply(this, P)
                }, 0, N)
            },
            destroy: function () {
                this.trigger("Destroy");
                G = J = null;
                this.unbindAll()
            }
        })
    };
    c.Uploader.prototype = h.EventTarget.instance;
    c.File = (function () {
        var j = {};

        function i(k) {
            c.extend(this, {
                id: c.guid(),
                name: k.name || k.fileName,
                type: k.type || "",
                size: k.size || k.fileSize,
                origSize: k.size || k.fileSize,
                loaded: 0,
                percent: 0,
                status: c.QUEUED,
                lastModifiedDate: k.lastModifiedDate || (new Date()).toLocaleString(),
                getNative: function () {
                    var l = this.getSource().getSource();
                    return h.inArray(h.typeOf(l), ["blob", "file"]) !== -1 ? l : null
                },
                getSource: function () {
                    if (!j[this.id]) {
                        return null
                    }
                    return j[this.id]
                },
                destroy: function () {
                    var l = this.getSource();
                    if (l) {
                        l.destroy();
                        delete j[this.id]
                    }
                }
            });
            j[this.id] = k
        }

        return i
    }());
    c.QueueProgress = function () {
        var i = this;
        i.size = 0;
        i.loaded = 0;
        i.uploaded = 0;
        i.failed = 0;
        i.queued = 0;
        i.percent = 0;
        i.bytesPerSec = 0;
        i.reset = function () {
            i.size = i.loaded = i.uploaded = i.failed = i.queued = i.percent = i.bytesPerSec = 0
        }
    };
    f.plupload = c
}(window, mOxie));

if (window.M && typeof M.define == "function") {
    M.define("/js/plupload", function () {
        return window.plupload
    })
}

M.define("/js/module/uploader/Pluploader", function (f, d, g) {
    var e = f("/js/plupload"), b = 0;

    function c() {
        b += 1;
        return "_j_pluplader_btn_container_" + b
    }

    function a(j, i, m, k) {
        var n = $(j).parent(), o = n.attr("id"), h = o || c();
        j = $(j).get(0);
        if (!o) {
            n.attr("id", h)
        }
        var l = new e.Uploader(M.mix({multipart: "form-data", browse_button: j, container: h}, i));
        l.init();
        M.forEach(m, function (q, p) {
            l.bind(p, M.bind(q, k))
        });
        return l
    }

    return a
});
/*!
 * jQuery Templates Plugin 1.0.0pre
 * http://github.com/jquery/jquery-tmpl
 * Requires jQuery 1.4.2
 *
 * Copyright 2011, Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function(i,f){var t=i.fn.domManip,h="_tmplitem",u=/^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,p={},e={},y,x={key:0,data:{}},w=0,q=0,g=[];function k(B,A,D,E){var C={data:E||(E===0||E===false)?E:(A?A.data:{}),_wrap:A?A._wrap:null,tmpl:null,parent:A||null,nodes:[],calls:c,nest:b,wrap:n,html:r,update:z};if(B){i.extend(C,B,{nodes:[],parent:A})}if(D){C.tmpl=D;C._ctnt=C._ctnt||C.tmpl(i,C);C.key=++w;(g.length?e:p)[w]=C}return C}i.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(A,B){i.fn[A]=function(C){var F=[],I=i(C),E,G,D,J,H=this.length===1&&this[0].parentNode;y=p||{};if(H&&H.nodeType===11&&H.childNodes.length===1&&I.length===1){I[B](this[0]);F=this}else{for(G=0,D=I.length;G<D;G++){q=G;E=(G>0?this.clone(true):this).get();i(I[G])[B](E);F=F.concat(E)}q=0;F=this.pushStack(F,A,I.selector)}J=y;y=null;i.tmpl.complete(J);return F}});i.fn.extend({tmpl:function(C,B,A){return i.tmpl(this[0],C,B,A)},tmplItem:function(){return i.tmplItem(this[0])},template:function(A){return i.template(A,this[0])},domManip:function(E,H,G,I){if(E[0]&&i.isArray(E[0])){var B=i.makeArray(arguments),A=E[0],F=A.length,C=0,D;while(C<F&&!(D=i.data(A[C++],"tmplItem"))){}if(D&&q){B[2]=function(J){i.tmpl.afterManip(this,J,G)}}t.apply(this,B)}else{t.apply(this,arguments)}q=0;if(!y){i.tmpl.complete(p)}return this}});i.extend({tmpl:function(C,F,E,B){var D,A=!B;if(A){B=x;C=i.template[C]||i.template(null,C);e={}}else{if(!C){C=B.tmpl;p[B.key]=B;B.nodes=[];if(B.wrapped){s(B,B.wrapped)}return i(m(B,null,B.tmpl(i,B)))}}if(!C){return[]}if(typeof F==="function"){F=F.call(B||{})}if(E&&E.wrapped){s(E,E.wrapped)}D=i.isArray(F)?i.map(F,function(G){return G?k(E,B,C,G):null}):[k(E,B,C,F)];return A?i(m(B,null,D)):D},tmplItem:function(B){var A;if(B instanceof i){B=B[0]}while(B&&B.nodeType===1&&!(A=i.data(B,"tmplItem"))&&(B=B.parentNode)){}return A||x},template:function(B,A){if(A){if(typeof A==="string"){A=l(A)}else{if(A instanceof i){A=A[0]||{}}}if(A.nodeType){A=i.data(A,"tmpl")||i.data(A,"tmpl",l(A.innerHTML))}return typeof B==="string"?(i.template[B]=A):A}return B?(typeof B!=="string"?i.template(null,B):(i.template[B]||i.template(null,u.test(B)?B:i(B)))):null},encode:function(A){return(""+A).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")}});i.extend(i.tmpl,{tag:{tmpl:{_default:{$2:"null"},open:"if($notnull_1){__=__.concat($item.nest($1,$2));}"},wrap:{_default:{$2:"null"},open:"$item.calls(__,$1,$2);__=[];",close:"call=$item.calls();__=call._.concat($item.wrap(call,__));"},each:{_default:{$2:"$index, $value"},open:"if($notnull_1){$.each($1a,function($2){with(this){",close:"}});}"},"if":{open:"if(($notnull_1) && $1a){",close:"}"},"else":{_default:{$1:"true"},open:"}else if(($notnull_1) && $1a){"},html:{open:"if($notnull_1){__.push($1a);}"},"=":{_default:{$1:"$data"},open:"if($notnull_1){__.push($.encode($1a));}"},"!":{open:""}},complete:function(A){p={}},afterManip:function v(C,A,D){var B=A.nodeType===11?i.makeArray(A.childNodes):A.nodeType===1?[A]:[];D.call(C,A);o(B);q++}});function m(A,E,C){var D,B=C?i.map(C,function(F){return(typeof F==="string")?(A.key?F.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g,"$1 "+h+'="'+A.key+'" $2'):F):m(F,A,F._ctnt)}):A;if(E){return B}B=B.join("");B.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/,function(G,H,F,I){D=i(F).get();o(D);if(H){D=a(H).concat(D)}if(I){D=D.concat(a(I))}});return D?D:a(B)}function a(B){var A=document.createElement("div");A.innerHTML=B;return i.makeArray(A.childNodes)}function l(A){return new Function("jQuery","$item","var $=jQuery,call,__=[],$data=$item.data;with($data){__.push('"+i.trim(A).replace(/([\\'])/g,"\\$1").replace(/[\r\t\n]/g," ").replace(/\$\{([^\}]*)\}/g,"{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,function(I,C,G,D,E,J,F){var L=i.tmpl.tag[G],B,H,K;if(!L){throw"Unknown template tag: "+G}B=L._default||[];if(J&&!/\w$/.test(E)){E+=J;J=""}if(E){E=j(E);F=F?(","+j(F)+")"):(J?")":"");H=J?(E.indexOf(".")>-1?E+j(J):("("+E+").call($item"+F)):E;K=J?H:"(typeof("+E+")==='function'?("+E+").call($item):("+E+"))"}else{K=H=B.$1||"null"}D=j(D);return"');"+L[C?"close":"open"].split("$notnull_1").join(E?"typeof("+E+")!=='undefined' && ("+E+")!=null":"true").split("$1a").join(K).split("$1").join(H).split("$2").join(D||B.$2||"")+"__.push('"})+"');}return __;")}function s(B,A){B._wrap=m(B,true,i.isArray(A)?A:[u.test(A)?A:i(A).html()]).join("")}function j(A){return A?A.replace(/\\'/g,"'").replace(/\\\\/g,"\\"):null}function d(A){var B=document.createElement("div");B.appendChild(A.cloneNode(true));return B.innerHTML}function o(G){var I="_"+q,B,A,E={},F,D,C;for(F=0,D=G.length;F<D;F++){if((B=G[F]).nodeType!==1){continue}A=B.getElementsByTagName("*");for(C=A.length-1;C>=0;C--){H(A[C])}H(B)}function H(P){var L,O=P,N,J,K;if((K=P.getAttribute(h))){while(O.parentNode&&(O=O.parentNode).nodeType===1&&!(L=O.getAttribute(h))){}if(L!==K){O=O.parentNode?(O.nodeType===11?0:(O.getAttribute(h)||0)):0;if(!(J=p[K])){J=e[K];J=k(J,p[O]||e[O]);J.key=++w;p[w]=J}if(q){Q(K)}}P.removeAttribute(h)}else{if(q&&(J=i.data(P,"tmplItem"))){Q(J.key);p[J.key]=J;O=i.data(P.parentNode,"tmplItem");O=O?O.key:0}}if(J){N=J;while(N&&N.key!=O){N.nodes.push(P);N=N.parent}delete J._ctnt;delete J._wrap;i.data(P,"tmplItem",J)}function Q(R){R=R+I;J=E[R]=(E[R]||k(J,p[J.parent.key+I]||J.parent))}}}function c(C,A,D,B){if(!C){return g.pop()}g.push({_:C,tmpl:A,item:this,data:D,options:B})}function b(A,C,B){return i.tmpl(i.template(A),C,B,this)}function n(C,A){var B=C.options||{};B.wrapped=A;return i.tmpl(i.template(C.tmpl),C.data,B,C.item)}function r(B,C){var A=this._wrap;return i.map(i(i.isArray(A)?A.join(""):A).filter(B||"*"),function(D){return C?D.innerText||D.textContent:D.outerHTML||d(D)})}function z(){var A=this.nodes;i.tmpl(null,null,null,this).insertBefore(A[0]);i(A).remove()}if(window.M&&typeof M.define=="function"){M.define("jq-tmpl",function(){return i})}})(jQuery);

M.define("/js/common/CommentPicDialog", function (e, c, g) {
    e("jq-tmpl");
    var f = e("dialog/alert"),
        a = e("dialog/Dialog"),
        b = '<div class="bd"><ul class="_j_imglist"></ul></div>    	                          <div class="action"><a class="btn-large _j_commit" role="button">提交</a><span>共<em class="_j_imglength"></em>张照片</span></div>', d = '<li data-id="${img.id}" data-imgstr="${img.imgstr}" class="_j_imgitem _j_imgitem_${img.id}{{if !img.src}} _j_waiting{{/if}}">                                <div class="img">                                    {{if img.src}}<img class="_j_uploadimg" style="width: 100px;height: 100px" src="${img.src}" />{{else}}                                    <div class="mask"></div>                                    <div class="bar uploderate">                                        <i class="bg"></i>                                        <span class="start">等待上传</span>                                        <em class="progress_bar" style="width:0;"></em>                                    </div>{{/if}}                                </div>                                <textarea class="_j_piccomment" placeholder="照片描述？在哪拍的？">${img.title}</textarea>                                <a class="btn-remove _j_remove_li" role="button"></a>                            </li>';

    function h(j) {
        var m = j.imgs;
        if (!m.length) {
            M.error("comment pic dialog has no pics");
            return false
        }
        var i = new a({
            PANEL_CLASS: "popup-box pop-upload",
            content: b,
            bgOpacity: 0,
            stackable: false,
            layerZIndex: 2000,
            impl: "COMMENT_PIC"
        }), k = i.getPanel();
        var l = k.find("._j_imglist");
        M.forEach(m, function (n, o) {
            $.tmpl(d, {img: n}).appendTo(l)
        });
        k.find("._j_imglength").text(m.length);
        if (j.waiting) {
            M.Event(this).on("img upload progress updated", function (n) {
                if (n.percent > 0) {
                    var o = k.find("._j_imgitem_" + n.id);
                    if (o.length) {
                        o.find(".start").text(n.percent + "%");
                        o.find(".progress_bar").width(n.percent + "%")
                    }
                }
            });
            M.Event(this).on("img upload finish", function (n) {
                var o = k.find("._j_imgitem_" + n.id);
                if (o.length) {
                    o.children(".img").prepend('<img class="_j_uploadimg" style="width: 100px;height: 100px" src="' + n.src + '" />');
                    o.find(".uploderate").addClass("hide");
                    o.data("imgstr", n.imgstr);
                    o.data("id", 0);
                    o.removeClass("_j_waiting")
                }
            })
        }
        if (j.edit) {
            k.find("._j_remove_li").addClass("hide")
        }
        this.dialog = i;
        this.bindEvents(k)
    }

    M.mix(h.prototype, {
        show: function () {
            this.dialog.show()
        }, bindEvents: function (i) {
            i.on("click", "._j_remove_li", $.proxy(function (n) {
                var k = $(n.currentTarget), j = k.parent(), m = i.find("._j_imglength"), l = (+m.text()) - 1;
                m.text(l);
                M.Event(this).fire("img removed", {file_id: j.data("id")});
                j.remove();
                if (l === 0) {
                    this.dialog.close()
                }
            }, this)).on("click", "._j_commit", $.proxy(function (k) {
                var j = i.find("._j_waiting");
                if (j.length) {
                    f.pop("图片正在上传中，请稍后...");
                    return false
                }
                var m = i.find("._j_imgitem"), l = [];
                m.each(function (n, o) {
                    o = $(o);
                    l.push({
                        id: o.data("id"),
                        imgstr: o.data("imgstr"),
                        src: o.find("._j_uploadimg").attr("src"),
                        title: o.children("._j_piccomment").val()
                    })
                });
                M.Event(this).fire("imgs committed", {imgs: l});
                this.dialog.close()
            }, this))
        }
    });
    g.exports = h
});
M.define("/js/common/CommentPicUploader", function (c, b, e) {
    var a = c("/js/module/uploader/Pluploader"),
        f = c("/js/common/CommentPicDialog"),
        d = c("dialog/alert");

    function g(h) {
        this.trigger = h.trigger;
        this.commentPicDialog = null;
        this.commentPluploader = null;
        this.init()
    }

    M.mix(g.prototype, {
        settings: {
            runtimes: "html5,flash,html4",
            max_file_size: "8mb",
            url: "/interface/Iupload.php",
            flash_swf_url: "/swf/plupload/Moxie.swf",
            filters: [{title: "选择照片", extensions: "jpeg,jpg,gif,png,JPEG"}],
            file_data_name: "Filedata",
            multipart_params: {cat: "rbook_comment", rtype: "w290_h195"}
        }, init: function () {
            this.commentPluploader = new a(this.trigger, this.settings, this.eventHandlers, this)
        }, eventHandlers: {
            FilesAdded: function (h, i) {
                this.commentPicDialog = new f({waiting: true, imgs: i});
                M.Event(this.commentPicDialog).on("img removed", $.proxy(function (j) {
                    this.commentPluploader.stop();
                    this.commentPluploader.removeFile(j.file_id);
                    this.commentPluploader.start()
                }, this));
                M.Event(this.commentPicDialog).on("imgs committed", $.proxy(function (j) {
                    M.Event(this).fire("imgs committed", j)
                }, this));
                this.commentPicDialog.show()
            }, UploadProgress: function (h, i) {
                M.Event(this.commentPicDialog).fire("img upload progress updated", i)
            }, QueueChanged: function (h) {
                setTimeout(function () {
                    h.start()
                }, 500)
            }, FileUploaded: function (h, i, k) {
                var j = k.response.split(",");
                M.Event(this.commentPicDialog).fire("img upload finish", {
                    id: i.id,
                    imgstr: $.trim(j[0]),
                    src: $.trim(j[2])
                })
            }, Error: function (h, i) {
                if (i.message == "File size error.") {
                    d.pop("请上传小于8M的图片")
                }
                M.error(i)
            }
        }
    });
    e.exports = g
});
M.define("/js/common/Comment", function (e, f, b) {
    var c = e("StarRating"),
        j = e("InputListener"),
        a = e("Select"),
        g = e("dialog/alert"),
        k = e("dialog/confirm"),
        h = e("/js/common/CommentPicUploader"),
        i = e("/js/common/CommentPicDialog"),
        m = '<dd class="_j_picitem" data-imgstr="${imgstr}" data-picid="${id}">                        <div class="place">                            <div class="img"><img class="_j_edit_src" src="${src}" style="width:120px;height:120px"></div>                            <div class="title"><h4 class="_j_edit_title">${title}</h4></div>                            <div class="mask-operate"><a class="btn-edit _j_edit_dd"></a><a class="btn-remove _j_remove_dd"></a></div>                        </div>                    </dd>';

    function d(n) {
        this.container = $(n.container);
        this.delPicIds = [];
        this.init();
        M.Event.fire("comment form loaded", {poi_id: this.container.find('input[name="poiid"]').val()})
    }

    M.mix(d.prototype, {
        init: function () {
            this.bindEvents(this.container)
        }, bindEvents: function (n) {
            var p = n.find("._j_commentdialogform");
            var u = new c({
                context: n,
                blockSelector: "._j_rankblock",
                starCountSelector: "._j_starcount",
                starItemSelector: "._j_starlist a"
            });
            M.Event(u).on("onrating", function (y) {
                var A = y.block, x = A.next("._j_startip"), z = A.find("._j_starlist a").eq(y.star - 1).attr("title");
                x.text(z).data("originText", z);
                A.children("input").val(y.star)
            });
            M.Event(u).on("enterrating", function (y) {
                var A = y.block, x = A.next("._j_startip"), z = A.find("._j_starlist a").eq(y.star - 1).attr("title");
                x.text(z)
            });
            M.Event(u).on("leaverating", function (y) {
                var z = y.block, x = z.next("._j_startip");
                x.text(x.data("originText"))
            });
            n.find("._j_rankblock").each(function () {
                if ($(this).data("star") > 0) {
                    var y = $(this).find("._j_starlist a").eq($(this).data("star") - 1).attr("title");
                    $(this).next("._j_startip").text(y)
                }
                var x = $(this).next("._j_startip");
                x.data("originText", x.text())
            });
            var o = n.find("._j_commentarea"), q = n.find("._j_commentcounttip");
            j.listen(o, function (x) {
                l(q, $.trim(o.val()).length)
            });
            var v = new a({
                valueBox: n.find("._j_timevaluebox"),
                dropTrigger: n.find("._j_droptrigger"),
                dropListCnt: n.find("._j_timeselectdroplist")
            });
            n.find("._j_viewbox").click(function (x) {
                if ($(x.target).is("._j_viewbox")) {
                    setTimeout(function () {
                        n.find("._j_droptrigger").trigger("click")
                    }, 1)
                }
            });
            n.on("click", "._j_radio", function (z) {
                var A = $(z.currentTarget), y = A.attr("name"), x = $('input[name="' + y + '"]');
                if ($(this).hasClass("on")) {
                    $(this).removeClass("on");
                    x.val("")
                } else {
                    $(this).addClass("on").siblings().removeClass("on");
                    x.val($(this).data("value"))
                }
            });
            n.on("click", "._j_checkbox", "click", function (z) {
                var A = $(z.currentTarget), y = A.attr("name");
                if ($(this).hasClass("select")) {
                    $(this).removeClass("select")
                } else {
                    $(this).addClass("select")
                }
                var x = [];
                $(this).siblings().add(this).filter(".select").each(function () {
                    x.push($(this).data("value"))
                });
                $('input[name="' + y + '"]').val(x.join(","))
            });
            n.find("._j_needinitselect").each(function () {
                var z = $(this), y = z.data("type"), x = z.attr("name"), A = $.trim(z.val());
                if (A) {
                    if (y == "checkbox") {
                        A = M.map(A.split(","), function (B) {
                            return +B
                        })
                    }
                    $('._j_selectitem[name="' + x + '"]').each(function () {
                        if (y == "checkbox") {
                            if (M.indexOf(A, $(this).data("value")) !== -1) {
                                $(this).addClass("select")
                            }
                        } else {
                            if (A == $(this).data("value")) {
                                $(this).addClass("on")
                            }
                        }
                    })
                }
            });
            n.on("click", "._j_submit", function (x) {
                p.submit()
            });
            var r = $("#_j_addpicbtns"), t = r.children("a"), w = new h({trigger: t}), s = p.find("._j_piclist");
            M.Event(w).on("imgs committed", function (x) {
                var y = x.imgs.reverse();
                M.forEach(y, function (z) {
                    $.tmpl(m, z).insertAfter(r)
                });
                M.Event.fire("comment form add imgs")
            });
            M.Event.on("out img insert", function (x) {
                var y = x.imgs.reverse();
                M.forEach(y, function (z) {
                    $.tmpl(m, z).insertAfter(r)
                });
                M.Event.fire("comment form add imgs")
            });
            s.on("click", "._j_remove_dd", $.proxy(function (y) {
                var z = $(y.currentTarget), x = z.closest("._j_picitem");
                k.pop("确认删除该图片吗？", $.proxy(function () {
                    if (x.data("picid") > 0) {
                        this.delPicIds.push(x.data("picid"))
                    }
                    x.remove()
                }, this))
            }, this)).on("click", "._j_edit_dd", function (B) {
                var C = $(B.currentTarget), x = C.closest("._j_picitem"), A = x.find("._j_edit_title"), z = x.find("._j_edit_src"), D = x.data("picid");
                var y = new i({
                    edit: true,
                    imgs: [{id: D, imgstr: x.data("imgstr"), src: z.attr("src"), title: A.text()}]
                });
                M.Event(y).on("imgs committed", function (E) {
                    var F = E.imgs;
                    if (F.length == 1 && F[0].id == D) {
                        A.text(F[0].title);
                        $.post("/path/ajax.php", {act: "updateAlbum", id: D, title: F[0].title})
                    }
                });
                y.show()
            });
            p.submit($.proxy(function (E) {
                if (p.data("locking")) {
                    return false
                }
                E.preventDefault();
                var G = p.data("typeid"), A = p.serializeArray(), x = true;
                for (var C = 0, D = A.length; C < D; C++) {
                    var H = A[C], B = $(p.get(0)[H.name]), F = $.trim(H.value);
                    if (B.attr("essential")) {
                        if (!F) {
                            x = false;
                            g.pop("请先完善" + B.data("inputname"));
                            break
                        }
                    }
                    if (B.data("minlen")) {
                        if (F.length < B.data("minlen")) {
                            x = false;
                            g.pop(B.data("inputname") + "不能少于" + B.data("minlen") + "个字");
                            break
                        }
                    }
                    if (B.data("maxlen")) {
                        if (F.length > B.data("maxlen")) {
                            x = false;
                            g.pop(B.data("inputname") + "不能超过" + B.data("maxlen") + "个字");
                            break
                        }
                    }
                    if (B.data("type") == "number") {
                        F = +F;
                        if (!M.is(F, "Number") && !isNaN(F)) {
                            x = false;
                            g.pop(B.data("inputname") + "需要填写数字");
                            break
                        }
                    }
                }
                if (x) {
                    p.data("locking", true);
                    if (this.delPicIds.length) {
                        if (!p.children('[name="del_aids"]').length) {
                            p.append('<input type="hidden" name="del_aids" value="" />')
                        }
                        p.children('[name="del_aids"]').val(this.delPicIds.join(","))
                    } else {
                        p.children('[name="del_aids"]').val("")
                    }
                    var y = p.find("._j_picitem"), z = [];
                    y.each(function (I, J) {
                        J = $(J);
                        if (!J.data("picid")) {
                            z.push({img: J.data("imgstr"), title: J.find("._j_edit_title").text()})
                        }
                    });
                    if (z.length) {
                        if (!p.children('[name="add_imgs"]').length) {
                            p.append('<input type="hidden" name="add_imgs" value="" />')
                        }
                        p.children('[name="add_imgs"]').val(JSON.stringify(z))
                    } else {
                        p.children('[name="add_imgs"]').val("")
                    }
                    $.post(p.attr("action"), p.serialize(), function (I) {
                        if (!I.error && I.data) {
                            var J = I.data;
                            J.rank = p.get(0).rank.value;
                            J.comment = p.get(0).comment.value;
                            M.Event.fire("comment published", {info: J})
                        } else {
                            g.pop('<span style="padding:10px 30px; display:inline-block">' + (I.error.msg || "暂时无法点评，请稍后再试.") + "</a>")
                        }
                        setTimeout(function () {
                            p.data("locking", false)
                        }, 100)
                    }, "json")
                }
            }, this))
        }
    });
    function l(n, o) {
        if (o > 0 && o < 15) {
            n.css("color", "#f00").text("还需要输入" + (15 - o) + "个字")
        } else {
            if (o > 2000) {
                n.css("color", "#f00").text("超出" + (o - 2000) + "个字")
            } else {
                n.css("color", "").text("15-1000个字，已输入" + o + "个字")
            }
        }
    }

    b.exports = d
});