/**
 *  Bild
 */

app = Object.assign({

    route_bild: function () {

        let id = app.getRouteData("id");
        app.bild_render(id);

        app.bild_canvas_start = false;
        app.bild_canvas_persons = [];
        app.bild_canvas_persons_drawing = undefined;

        app.bindAll("click", '[data-tab="bild"] nav .save', app.save_bild);
        app.bindAll("click", '[data-tab="bild"] nav .delete', app.delete_bild);
        app.bindAll("click", '[data-tab="bild"] nav .zoom_with', app.zoom_with);
        app.bindAll("click", '[data-tab="bild"] nav .zoom_original', app.zoom_original);

        app.bindAll("click", '[data-tab="bild"] nav .new', app.new_bild);
        app.bindAll("click", '[data-tab="bild"] nav .pre', app.pre_bild);
        app.bindAll("click", '[data-tab="bild"] nav .next', app.next_bild);
        app.bindAll("click", '[data-tab="bild"] nav .hide_markers', app.bild_hide_markers);
        app.bindAll("click", '[data-tab="bild"] nav .show_markers', app.bild_show_markers);
        app.bindAll("click", '[data-tab="bild"] nav .hide_edit', app.bild_hide_edit);
        app.bindAll("click", '[data-tab="bild"] nav .show_edit', app.bild_show_edit);

        app.bind("load", '[data-tab="bild"] main .image-container img', app.bild_img_loaded)

        app.bind("mousedown", '[data-tab="bild"] main .image-container canvas', app.bild_mousedown)
        app.bind("mousemove", '[data-tab="bild"] main .image-container canvas', app.bild_mousemove)
        app.bind("mouseup", '[data-tab="bild"] main .image-container canvas', app.bild_mouseup)

        app.bind("touchstart", '[data-tab="bild"] main .image-container canvas', app.bild_touchstart)
        app.bind("touchmove", '[data-tab="bild"] main .image-container canvas', app.bild_touchmove)
        app.bind("touchend", '[data-tab="bild"] main .image-container canvas', app.bild_mouseup)
        app.bind("touchcancel", '[data-tab="bild"] main .image-container canvas', app.bild_mouseup)

        document.querySelector('[data-tab="bild"] main .image-container canvas').style.display = "none";

        app.bild_canvas = document.querySelector('[data-tab="bild"] main .image-container canvas');
        app.bild_canvas_context = document.querySelector('[data-tab="bild"] main .image-container canvas').getContext("2d");


        if (typeof app.bild_canvas_is_running == "undefined") {
            app.bild_canvas_run();
            app.bild_canvas_is_running = true;
        }

        app.bind("click", '[data-tab="bild"] form table[data-key="Personen"] tfoot button', app.add_person_marker)
        app.bindAll("click", '[data-tab="bild"] form table[data-key="Personen"] tbody button[data-delete]', app.bild_person_entfernen)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Id"]', app.bild_person_id_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="X"]', app.bild_person_X_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Y"]', app.bild_person_Y_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Width"]', app.bild_person_Width_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Height"]', app.bild_person_Height_change)

        app.bindAll("change", '[data-tab="bild"] form [name="URL"]', app.bild_person_url_change)

        setTimeout(function(){
            app.zoom_with();
            let bild = app.bild_get_data(id)
            if (bild.URL === undefined || bild.URL === "") {
                app.bild_show_edit();
            }
        }, 50)
    },

    delete_bild: function () {
        event.preventDefault();

        if (confirm("Möchten Sie das Bild wirklich löschen?")) {
            let id = app.getRouteData("id");

            let json = JSON
            .parse(localStorage.getItem("json_bilder"))

            var i = -1;
            for (i = 0; i < json.length; i++) {
                if (json[i].Id == id) {
                    break;
                }
            }

            if (i > -1) {
                json.splice(i, 1);
            }

            localStorage.setItem("json_bilder", JSON.stringify(json))

            app.changeRoute("bilder")
        }

        return false;
    },

    bild_hide_markers: function() {
        document.querySelector('[data-tab="bild"] .image-container .markers').style.display = "none"
    },

    bild_show_markers: function() {
        document.querySelector('[data-tab="bild"] .image-container .markers').style.display = "block"
    },

    bild_hide_edit: function() {
        document.querySelector('[data-tab="bild"]').classList.add("hideEdit")
        if (app.bild_zoom_factor!= 1) {
            app.zoom_original();
            app.zoom_with();
        }
    },

    bild_show_edit: function() {
        document.querySelector('[data-tab="bild"]').classList.remove("hideEdit")
        if (app.bild_zoom_factor!= 1) {
            app.zoom_original();
            app.zoom_with();
        }
    },

    bild_zoom_factor: 1,
    bild_orginal_img_width: undefined,

    zoom_with: function () {
        if (app.bild_zoom_factor == 1) {
            var img = document.querySelector('[data-tab="bild"] .image-container img');

            if (typeof app.bild_orginal_img_width === "undefined") {
                app.bild_orginal_img_width = img.width;
            }

            var img_container = document.querySelector('[data-tab="bild"] .image-container');
            var img_container_box = img_container.getBoundingClientRect();
            var img_container_width = img_container_box.width;

            app.bild_zoom_factor = img_container_width/app.bild_orginal_img_width;

            img.width = img_container_width;

            app.bild_set_all_to_img_size()

            document.querySelectorAll('[data-tab="bild"] .image-container .markers [data-id]').forEach(function(m){
                m.style.top = (parseInt(m.style.top) * app.bild_zoom_factor) + "px"
                m.style.left = (parseInt(m.style.left) * app.bild_zoom_factor) + "px"
                m.style.height = (parseInt(m.style.height) * app.bild_zoom_factor) + "px"
                m.style.width = (parseInt(m.style.width) * app.bild_zoom_factor) + "px"
            })
        }

    },
    bild_set_all_to_img_size: function() {
        var img = document.querySelector('[data-tab="bild"] .image-container img');

        document.querySelector('[data-tab="bild"] .image-container .markers').style.width = img.width +"px"
        document.querySelector('[data-tab="bild"] .image-container .markers').style.height = img.height+"px"

        document.querySelector('[data-tab="bild"] .image-container canvas').width = img.width
        document.querySelector('[data-tab="bild"] .image-container canvas').height = img.height
    },
    zoom_original: function() {

        if (app.bild_orginal_img_width) {
            var img = document.querySelector('[data-tab="bild"] .image-container img');
            app.bild_zoom_factor = 1
            img.width = app.bild_orginal_img_width
            app.bild_set_all_to_img_size()
        }

        document.querySelectorAll('[data-tab="bild"] .image-container .markers [data-id]').forEach(function(m){
            m.style.top = (parseInt(m.style.top) * app.bild_zoom_factor) + "px"
            m.style.left = (parseInt(m.style.left) * app.bild_zoom_factor) + "px"
            m.style.height = (parseInt(m.style.height) * app.bild_zoom_factor) + "px"
            m.style.width = (parseInt(m.style.width) * app.bild_zoom_factor) + "px"
        })

        var PersonenTr = document.querySelectorAll('[data-key="Personen"] tbody tr')
        if (PersonenTr.length > 0) {
            PersonenTr.forEach(ptr => {
                var m = document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+ptr.querySelector('[name="Id"]').dataset.value+'"]')
                m.style.left =  parseInt(ptr.querySelector('[name="X"]').value) + "px"
                m.style.top = parseInt(ptr.querySelector('[name="Y"]').value) + "px"
                m.style.height = parseInt(ptr.querySelector('[name="Height"]').value) + "px"
                m.style.width = parseInt(ptr.querySelector('[name="Width"]').value) + "px"
            })
        }

    },

    bild_person_url_change: function() {
        document.querySelector('[data-tab="bild"] .image-container img').setAttribute("src", this.value)
    },

    bild_person_X_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * app.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.left = value + "px"
    },

    bild_person_Y_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * app.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.top = value + "px"
    },

    bild_person_Width_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * app.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.width = value + "px"
    },

    bild_person_Height_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * app.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.height = value + "px"
    },

    bild_person_id_change: function() {
        var newId = this.value
        var oldId = this.parentElement.parentElement.dataset.person;

        var person = app.get_person_data(newId);
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+oldId+'"]').setAttribute("data-name", person.Vornamen + " " + person.Name)
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+oldId+'"]').setAttribute("data-id", newId);

        this.parentElement.parentElement.setAttribute("data-person", newId)
        this.setAttribute("data-value", newId)

        var oldOption = this.querySelector('[value="'+oldId+'"]');
        if (oldOption)
            oldOption.removeAttribute("selected");

        var newOption = this.querySelector('[value="'+newId+'"]');
        if (newOption)
            newOption.setAttribute("selected", "selected");

        this.parentElement.parentElement.querySelector("[data-delete]").setAttribute("data-delete", newId)
    },

    bild_render: function(id){
        let bild = app.bild_get_data(id)

        if (bild.Personen) {
            bild.Personen = bild.Personen.map(p => {
                p.personOptionsHtml =  app.get_person_options_html()
                return p
            })
        }

        let html = app.renderTemplate("bild_details", bild);

        app.appendChild('[data-tab="bild"] main', html)

        document.querySelectorAll('[data-tab="bild"] form select').forEach(elm => {
            elm.querySelectorAll("option").forEach(o => {
                if (o.value == elm.dataset.value) {
                    o.setAttribute("selected", "selected");
                }
            })
        });

        if (bild.Personen) {
            bild.Personen = bild.Personen.forEach(p => {
                var person = app.get_person_data(p.Id);
                app.createMarkedBox(p.Id, person.Vornamen + " " + person.Name, p.X, p.Y, p.Width, p.Height)
            })
        }
    },

    bild_get_data: function (id) {
        var data = null;
        JSON.parse(localStorage.getItem("json_bilder")).forEach(bild => {

            if (bild.Id == id) {
                data = bild;
            }
        })
        return data;
    },

    add_person_marker: function(e){
        e.preventDefault();
        document.querySelector('[data-tab="bild"] main .image-container canvas').style.display = "block";
        return false;
    },

    bild_canvas_run: function () {
        requestAnimationFrame(app.bild_canvas_run);
        app.bild_canvas_context.clearRect(0, 0, app.bild_canvas.width, app.bild_canvas.height);

        if (app.bild_canvas_persons_drawing) {
            app.bild_canvas_context.fillStyle = "#FF0000";
            app.bild_canvas_context.fillRect(
                app.bild_canvas_persons_drawing.x_start,
                app.bild_canvas_persons_drawing.y_start,
                app.bild_canvas_persons_drawing.x_end - app.bild_canvas_persons_drawing.x_start,
                app.bild_canvas_persons_drawing.y_end - app.bild_canvas_persons_drawing.y_start,
            );
        }

        app.bild_canvas_persons.forEach(function(box){
            app.bild_canvas_context.fillStyle = "#0000FF";
            app.bild_canvas_context.fillRect(
                box.x,
                box.y,
                box.width,
                box.height,
            );
        })

    },

    bild_img_loaded: function () {
        var img = document.querySelector('[data-tab="bild"] main .image-container img')
        var c = document.querySelector('[data-tab="bild"] main .image-container canvas')
        c.width = img.clientWidth
        c.height=  img.clientHeight
        var m = document.querySelector('[data-tab="bild"] main .image-container .markers')
        m.style.width = img.clientWidth + "px"
        m.style.height=  img.clientHeight+ "px"
    },

    bild_get_touch_layerXY (evt) {
        var el = evt.target,
            x = 0,
            y = 0;

        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
          x += el.offsetLeft - el.scrollLeft;
          y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
        }

        x = evt.clientX - x;
        y = evt.clientY - y;

        return { x: x, y: y };
    },

    bild_touch_identifer: undefined,
    bild_touchstart: function(e) {
        e.preventDefault();
        var touches = e.changedTouches;
        if (touches.length > 0) {
            var touch = touches[0];
            app.bild_touch_identifer = touch.identifier;
            app.bild_canvas_start = true;

            layerXY = app.bild_get_touch_layerXY(touch);

            app.bild_canvas_persons_drawing = {
                x_start: layerXY.x,
                y_start: layerXY.y,
                x_end: layerXY.x,
                y_end: layerXY.y,
            };
        }
        return false;
    },

    bild_touchmove: function (e) {
        e.preventDefault();
        var touches = e.changedTouches;
        var touch = Array.from(touches).find( t => t.identifier == app.bild_touch_identifer)
        if (touch) {
            if (app.bild_canvas_start && Math.random() > 0.8) {
                layerXY = app.bild_get_touch_layerXY(touch);
                app.bild_canvas_persons_drawing.x_end = layerXY.x
                app.bild_canvas_persons_drawing.y_end = layerXY.y
            }
        }
        return false;
    },

    bild_mousedown: function (event) {
        if (event.which == 1) {
            app.bild_canvas_start = true;
            app.bild_canvas_persons_drawing = {
                x_start: event.layerX,
                y_start: event.layerY,
                x_end: event.layerX,
                y_end: event.layerY,
            };
        }
    },

    bild_mousemove: function (event) {
        if (event.which == 1) {
            if (app.bild_canvas_start && Math.random() > 0.8) {
                app.bild_canvas_persons_drawing.x_end = event.layerX
                app.bild_canvas_persons_drawing.y_end = event.layerY
            }
        }
    },

    bild_mouseup: function () {
        var x, y = 0;

        if (app.bild_canvas_persons_drawing.x_start > app.bild_canvas_persons_drawing.x_end) {
            x = app.bild_canvas_persons_drawing.x_end
        } else {
            x = app.bild_canvas_persons_drawing.x_start
        }

        if (app.bild_canvas_persons_drawing.y_start > app.bild_canvas_persons_drawing.y_end) {
            y = app.bild_canvas_persons_drawing.y_end
        } else {
            y = app.bild_canvas_persons_drawing.y_start
        }

        var width = height = 0;

        width = Math.abs(app.bild_canvas_persons_drawing.x_start - app.bild_canvas_persons_drawing.x_end)
        height = Math.abs(app.bild_canvas_persons_drawing.y_start - app.bild_canvas_persons_drawing.y_end)

        var newId = app.bild_canvas_persons.length + "_" + Math.floor(Math.random()*10000)
        var name = "?"
        app.createMarkedBox(
            newId,
            name,
            x,
            y,
            width,
            height
        )

        app.bild_person_hinzufuegen(new Event('Add Person'), newId, x, y, width, height);

        app.bild_canvas_start = false;
        app.bild_canvas_persons_drawing = undefined;
        document.querySelector('[data-tab="bild"] main .image-container canvas').style.display = "none";
    },

    bild_person_hinzufuegen: function (event, id, x, y, width, height) {
        event.preventDefault();
        var viewbag = {
            "Id": id,
            "X": parseInt(x * (1/app.bild_zoom_factor)),
            "Y": parseInt(y * (1/app.bild_zoom_factor)),
            "Width": parseInt(width * (1/app.bild_zoom_factor)),
            "Height": parseInt(height * (1/app.bild_zoom_factor)),
        };
        viewbag.personOptionsHtml = app.get_person_options_html();
        var html = app.renderTemplate("bild_details_Personen", viewbag)
        document.querySelector('[data-tab="bild"] form table[data-key="Personen"] tbody').innerHTML += html;

        app.bindAll("click", '[data-tab="bild"] form table[data-key="Personen"] tbody button[data-delete]', app.bild_person_entfernen)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Id"]', app.bild_person_id_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="X"]', app.bild_person_X_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Y"]', app.bild_person_Y_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Width"]', app.bild_person_Width_change)
        app.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Height"]', app.bild_person_Height_change)

        return false;
    },
    bild_person_entfernen: function () {
        event.preventDefault();
        document.querySelector('[data-tab="bild"] form table[data-key="Personen"] tr[data-person="'+this.dataset.delete+'"]').remove();
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+this.dataset.delete+'"]').remove();
        return false;
    },

    createMarkedBox: function (id, name, x, y, width, height) {
        var box = document.createElement("div");

        box.style.top = y+ "px";
        box.style.left = x+ "px";
        box.style.width = width+ "px";
        box.style.height = height+ "px";
        box.style.cursor = "move"
        box.setAttribute("data-name", name)
        box.setAttribute("data-id", id)
        box.className = "resizable"

        var resizers_wrapper = document.createElement("div");
        resizers_wrapper.className = "resizers"
        resizers_wrapper.style.pointerEvents = "none"
        box.appendChild(resizers_wrapper)

        var resizers_wrapper_top_left = document.createElement("div");
        resizers_wrapper_top_left.className = "resizer top-left";
        resizers_wrapper_top_left.style.pointerEvents = "all"
        resizers_wrapper.appendChild(resizers_wrapper_top_left)

        var resizers_wrapper_top_right= document.createElement("div");
        resizers_wrapper_top_right.className = "resizer top-right";
        resizers_wrapper_top_right.style.pointerEvents = "all"
        resizers_wrapper.appendChild(resizers_wrapper_top_right)

        var resizers_wrapper_bottom_left = document.createElement("div");
        resizers_wrapper_bottom_left.className = "resizer bottom-left";
        resizers_wrapper_bottom_left.style.pointerEvents = "all"
        resizers_wrapper.appendChild(resizers_wrapper_bottom_left)

        var resizers_wrapper_bottom_right = document.createElement("div");
        resizers_wrapper_bottom_right.className = "resizer bottom-right";
        resizers_wrapper_bottom_right.style.pointerEvents = "all"
        resizers_wrapper.appendChild(resizers_wrapper_bottom_right)

        document.querySelector('[data-tab="bild"] main .image-container .markers').appendChild(box)

        app.makeResizableDiv(id, box)
    },

    bild_set_person_data: function (id, name, value) {
        value = parseInt(value * (1/app.bild_zoom_factor))
        document.querySelector('[data-tab="bild"] form table[data-key="Personen"] tr[data-person="'+id+'"] [name="'+name+'"]').value = value;
    },

    makeResizableDiv: function(id, element){
        /* https://codepen.io/ZeroX-DG/pen/vjdoYe */
        const resizers = element.querySelectorAll('.resizer')
        const minimum_size = 20;

        let touchIdentifer = undefined;
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;

        element.addEventListener("touchstart", function(e){
            e.preventDefault();
            var touches = e.changedTouches;
            if (touches.length > 0) {
                var touch = touches[0];
                touchIdentifer = touch.identifier;
                original_x = parseFloat(element.style.left);
                original_y = parseFloat(element.style.top);
                original_mouse_x = touch.pageX;
                original_mouse_y = touch.pageY;
                window.addEventListener('touchmove', touchmove, { passive: false })
                window.addEventListener('touchend', touchend)
                window.addEventListener('touchcancel', touchend)
            }
            return false;
        })

        function touchmove (e) {
            e.preventDefault();
            var touches = e.changedTouches;
            var touch = Array.from(touches).find( t => t.identifier == touchIdentifer)
            if (touch && touch.target.classList.contains('resizable')) {
                var left =  original_x + (touch.pageX - original_mouse_x);
                var top = original_y + (touch.pageY - original_mouse_y) ;

                element.style.left =left + 'px'
                element.style.top = top+ 'px'

                app.bild_set_person_data(element.dataset.id, "X", left)
                app.bild_set_person_data(element.dataset.id, "Y", top)
            }
            return false;
        }

        function touchend () {
            window.removeEventListener('touchmove', touchmove)
        }

        element.addEventListener("mousedown", function(e) {
            if (e.which == 1) {
                e.preventDefault()
                if (e.target.classList.contains('resizable')) {
                    original_x = parseFloat(element.style.left);
                    original_y = parseFloat(element.style.top);
                    original_mouse_x = e.pageX;
                    original_mouse_y = e.pageY;
                    window.addEventListener('mousemove', move)
                    window.addEventListener('mouseup', stopMove)
                }

                return false;
            }
        })

        function move (e) {
            if (e.which == 1) {
                e.preventDefault();

                var left =  original_x + (e.pageX - original_mouse_x);
                var top = original_y + (e.pageY - original_mouse_y) ;

                element.style.left =left + 'px'
                element.style.top = top+ 'px'

                app.bild_set_person_data(element.dataset.id, "X", left)
                app.bild_set_person_data(element.dataset.id, "Y", top)
            }
        }

        function stopMove () {
            window.removeEventListener('mousemove', move)
        }

        for (let i = 0;i < resizers.length; i++) {
            const currentResizer = resizers[i];


            currentResizer.addEventListener('touchstart', function(e){
                e.preventDefault();
                var touches = e.changedTouches;
                if (touches.length > 0) {
                    var touch = touches[0];
                    touchIdentifer = touch.identifier;
                    if (touch.target.classList.contains("resizer")) {
                        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                        original_x = parseFloat(element.style.left);
                        original_y = parseFloat(element.style.top);
                        original_mouse_x = touch.pageX;
                        original_mouse_y = touch.pageY;
                        window.addEventListener('touchmove', touchresize, { passive: false })
                        window.addEventListener('touchend', touchstopResize)
                        window.addEventListener('touchcancel', touchstopResize)
                    }
                }
                return false;
            })

            function touchresize (e) {
                e.preventDefault();
                var touches = e.changedTouches;
                var touch = Array.from(touches).find( t => t.identifier == touchIdentifer)
                if (touch) {

                    if (currentResizer.classList.contains('bottom-right')) {
                        const width = original_width + (touch.pageX - original_mouse_x);
                        const height = original_height + (touch.pageY - original_mouse_y)
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                        }
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                        }
                    }
                    else if (currentResizer.classList.contains('bottom-left')) {
                        const height = original_height + (touch.pageY - original_mouse_y)
                        const width = original_width - (touch.pageX - original_mouse_x)
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                         }
                        if (width > minimum_size) {
                            let newleft = original_x + (touch.pageX - original_mouse_x);
                            element.style.width = width + 'px'
                            element.style.left = newleft + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                            app.bild_set_person_data(element.dataset.id, "X", newleft)
                        }
                    }
                    else if (currentResizer.classList.contains('top-right')) {
                        const width = original_width + (touch.pageX - original_mouse_x)
                        const height = original_height - (touch.pageY - original_mouse_y)
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                       }
                        if (height > minimum_size) {
                            let newtop = original_y + (touch.pageY - original_mouse_y)
                            element.style.height = height + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                            element.style.top = newtop + 'px'
                            app.bild_set_person_data(element.dataset.id, "Y", newtop)
                        }
                    }
                    else {
                        const width = original_width - (touch.pageX - original_mouse_x)
                        const height = original_height - (touch.pageY - original_mouse_y)
                        if (width > minimum_size) {
                            let newleft = original_x + (touch.pageX - original_mouse_x);
                            element.style.width = width + 'px'
                            element.style.left = newleft + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                            app.bild_set_person_data(element.dataset.id, "X", newleft)
                          }
                        if (height > minimum_size) {
                            let newtop = original_y + (touch.pageY - original_mouse_y)
                            element.style.height = height + 'px'
                            element.style.top = newtop + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                            app.bild_set_person_data(element.dataset.id, "Y", newtop)
                        }
                    }

                }
                return false;
            }

            function touchstopResize () {
                window.removeEventListener('touchmove', touchresize)
            }

            currentResizer.addEventListener('mousedown', function(e) {

                if (e.which == 1) {

                    e.preventDefault()

                    if (e.target.classList.contains("resizer")) {
                        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                        original_x = parseFloat(element.style.left);
                        original_y = parseFloat(element.style.top);
                        original_mouse_x = e.pageX;
                        original_mouse_y = e.pageY;
                        window.addEventListener('mousemove', resize)
                        window.addEventListener('mouseup', stopResize)
                    }

                    return false;
                }
            })

            function resize(e) {
                if (e.which == 1) {
                    e.preventDefault()
                    if (currentResizer.classList.contains('bottom-right')) {
                        const width = original_width + (e.pageX - original_mouse_x);
                        const height = original_height + (e.pageY - original_mouse_y)
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                        }
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                        }
                    }
                    else if (currentResizer.classList.contains('bottom-left')) {
                        const height = original_height + (e.pageY - original_mouse_y)
                        const width = original_width - (e.pageX - original_mouse_x)
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                         }
                        if (width > minimum_size) {
                            let newleft = original_x + (e.pageX - original_mouse_x);
                            element.style.width = width + 'px'
                            element.style.left = newleft + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                            app.bild_set_person_data(element.dataset.id, "X", newleft)
                        }
                    }
                    else if (currentResizer.classList.contains('top-right')) {
                        const width = original_width + (e.pageX - original_mouse_x)
                        const height = original_height - (e.pageY - original_mouse_y)
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                       }
                        if (height > minimum_size) {
                            let newtop = original_y + (e.pageY - original_mouse_y)
                            element.style.height = height + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                            element.style.top = newtop + 'px'
                            app.bild_set_person_data(element.dataset.id, "Y", newtop)
                        }
                    }
                    else {
                        const width = original_width - (e.pageX - original_mouse_x)
                        const height = original_height - (e.pageY - original_mouse_y)
                        if (width > minimum_size) {
                            let newleft = original_x + (e.pageX - original_mouse_x);
                            element.style.width = width + 'px'
                            element.style.left = newleft + 'px'
                            app.bild_set_person_data(element.dataset.id, "Width", width)
                            app.bild_set_person_data(element.dataset.id, "X", newleft)
                          }
                        if (height > minimum_size) {
                            let newtop = original_y + (e.pageY - original_mouse_y)
                            element.style.height = height + 'px'
                            element.style.top = newtop + 'px'
                            app.bild_set_person_data(element.dataset.id, "Height", height)
                            app.bild_set_person_data(element.dataset.id, "Y", newtop)
                        }
                    }
                }
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize)
            }
        }
    },

    get_bild_form_data: function (name) {
        return document.querySelector('[data-tab="bild"] [name="'+name+'"]').value
    },

    save_bild: function () {

        let form = {
            Id: parseInt(app.get_bild_form_data("Id")),
            URL: app.get_bild_form_data("URL"),
            Datum: app.get_bild_form_data("Datum"),
            Uhrzeit: app.get_bild_form_data("Uhrzeit"),
            Ort: app.get_bild_form_data("Ort"),
            Strasse: app.get_bild_form_data("Strasse"),
            Nummer: app.get_bild_form_data("Nummer"),
            Land: app.get_bild_form_data("Land"),
            Note: app.get_bild_form_data("Note")
        };

        var PersonenTr = document.querySelectorAll('[data-key="Personen"] tbody tr')
        if (PersonenTr.length > 0) {

            form.Personen = [];

            PersonenTr.forEach(ptr => {
                form.Personen.push({
                    Id: parseInt(ptr.querySelector('[name="Id"]').value),
                    X: parseInt(ptr.querySelector('[name="X"]').value),
                    Y: parseInt(ptr.querySelector('[name="Y"]').value),
                    Height: parseInt(ptr.querySelector('[name="Height"]').value),
                    Width: parseInt(ptr.querySelector('[name="Width"]').value)
                })
            })
        }

        let bilder = JSON
        .parse(localStorage.getItem("json_bilder"))

        var i = -1;
        for (i = 0; i < bilder.length; i++) {
            if (bilder[i].Id == form.Id) {
                break;
            }
        }

        if (i == -1) {
            bilder.push(form)
        } else {
            bilder[i] = form;
        }

        localStorage.setItem("json_bilder", JSON.stringify(bilder))

        alert("saved")
    },

    next_bild: function(){
        let id = app.getRouteData("id");
        let bilder = JSON
        .parse(localStorage.getItem("json_bilder"))

        var i = -1;
        for (i = 0; i < bilder.length; i++) {
            if (bilder[i].Id == id) {
                break;
            }
        }

        var nextIndex = i;
        if (i === (bilder.length - 1)) {
            nextIndex = 0
        } else {
            nextIndex++;
        }

        app.changeRoute("bild", {
            id:  bilder[nextIndex].Id
        })
    },

    pre_bild: function(){
        let id = app.getRouteData("id");
        let bilder = JSON
        .parse(localStorage.getItem("json_bilder"))

        var i = -1;
        for (i = 0; i < bilder.length; i++) {
            if (bilder[i].Id == id) {
                break;
            }
        }

        var preIndex = i;
        if (i === 0) {
            preIndex = bilder.length - 1
        } else {
            preIndex--;
        }

        app.changeRoute("bild", {
            id: bilder[preIndex].Id
        })
    }
}, app)