/**
 *  inputMoveElementInit
 */

//uses vendors/polyfill.js
//uses vendors/limit.js

app = Object.assign({

    /**
     * Fügt Dragging Mouse/Touch-Events an das Element und ruft zum Start, während des Moves und am Ende die entsprechenden Callbacks auf.
     *
     * @param {HTMLElement} $elm          Das Element.
     * @param {function}    startCallback Die Start-Methode.
     * @param {function}    moveCallback  Die Move-Methode.
     * @param {function}    endCallback   Die End-Methode.
     * @param {string}      dragClass     Die CSS-Klasse die zur Erkennung an das Element angehängt wird.
     */
    inputMoveElementInit: function (
        $elm,
        startCallback = function () {},
        moveCallback  = function () {},
        endCallback   = function () {},
        dragClass     = "inputMoveElementInit",
        $eventBinder  = null
    ) {
        if (typeof $elm === "undefined") { return; }

        if ($eventBinder == null) {
            $eventBinder = $elm;
        }

        let touchIdentifer = undefined
        let eventObject = {
            startInputX  : 0,
            startInputY  : 0,
            startTargetX : 0,
            startTargetY : 0,
            pageX        : 0,
            pageY        : 0,
            deltaX       : 0,
            deltaY       : 0,
            clientX      : 0,
            clientY      : 0,
            newTargetX   : 0,
            newTargetY   : 0,
            target       : $elm,
            layerX       : 0,
            layerY       : 0,
            setLayerXY   : function () {
                var el = $elm;

                eventObject.layerX = 0;
                eventObject.layerY = 0;

                while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                    eventObject.layerX += el.offsetLeft - el.scrollLeft;
                    eventObject.layerY += el.offsetTop - el.scrollTop;
                    el = el.offsetParent;
                }

                eventObject.layerX = eventObject.clientX - eventObject.layerX;
                eventObject.layerY = eventObject.clientY - eventObject.layerY;
            }
        };

        // touchmove and mousemove needs to be a variable because of throttle and scope access to $elm

        let touchmove = function (e) {
            e.preventDefault();
            var touch = Array.from(e.changedTouches).find( t => t.identifier == touchIdentifer)
            if (touch && touch.target.classList.contains(dragClass)) {
                moveCallback.call($elm, mapInputEvent(touch));
            }
            return false;
        }.throttle(1000/30);

        let  mousemove = function  (e) {
            if (e.which == 1) {
                e.preventDefault();
                moveCallback.call($elm, mapInputEvent(e));
                return false;
            }
        }.throttle(1000/30)

        $eventBinder.classList.add(dragClass)

        $eventBinder.addEventListener("touchstart", function(e){
            e.preventDefault();
            var touches = e.changedTouches;
            if (touches.length > 0) {
                var touch = touches[0];
                touchIdentifer = touch.identifier;
                eventObject.startInputX  = touch.pageX;
                eventObject.startInputY  = touch.pageY;
                eventObject.startTargetX = parseInt($elm.currentStyle.left);
                eventObject.startTargetY = parseInt($elm.currentStyle.top);

                startCallback.call($elm, mapInputEvent(touch));

                window.addEventListener('touchmove'  , touchmove, { passive: false })
                window.addEventListener('touchend'   , touchend)
                window.addEventListener('touchcancel', touchend)
            }
            return false;
        })

        $eventBinder.addEventListener("mousedown", function(e) {
            e.preventDefault()
            if (e.which == 1) {
                if (e.target.classList.contains(dragClass)) {
                    eventObject.startInputX  = e.pageX;
                    eventObject.startInputY  = e.pageY;
                    eventObject.startTargetX = parseInt($elm.currentStyle.left);
                    eventObject.startTargetY = parseInt($elm.currentStyle.top);

                    startCallback.call($elm, mapInputEvent(e));

                    window.addEventListener('mousemove', mousemove)
                    window.addEventListener('mouseup'  , mouseend)
                }
            }
            return false;
        })

        function touchend (e) {
            window.removeEventListener('touchmove', touchmove)
            endCallback.call($elm, e);
        }

        function mouseend (e) {
            window.removeEventListener('mousemove', mousemove)
            endCallback.call($elm, mapInputEvent(e));
        }

        function mapInputEvent (input) {
            eventObject.pageX      = input.pageX;
            eventObject.pageY      = input.pageY;
            eventObject.clientX    = input.clientX;
            eventObject.clientY    = input.clientY;
            eventObject.deltaX     = input.pageX - eventObject.startInputX;
            eventObject.deltaY     = input.pageY - eventObject.startInputY;
            eventObject.newTargetX = eventObject.startTargetX + eventObject.deltaX;
            eventObject.newTargetY = eventObject.startTargetY + eventObject.deltaY;
            return eventObject;
        }
    }

}, app)