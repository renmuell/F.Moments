/**
 *  Bild
 */

Moments = Object.assign({

    route_bild: function () {

        let id = Moments.getRouteData("id");
        Moments.bild_render(id);

        Moments.bindAll("click", '[data-tab="bild"] nav .save', Moments.save_bild);
        Moments.bindAll("click", '[data-tab="bild"] nav .delete', Moments.delete_bild);
        Moments.bindAll("click", '[data-tab="bild"] nav .zoom_with', Moments.zoom_with);
        Moments.bindAll("click", '[data-tab="bild"] nav .zoom_original', Moments.zoom_original);

        Moments.bindAll("click", '[data-tab="bild"] nav .new', Moments.new_bild);
        Moments.bindAll("click", '[data-tab="bild"] nav .pre', Moments.pre_bild);
        Moments.bindAll("click", '[data-tab="bild"] nav .next', Moments.next_bild);
        Moments.bindAll("click", '[data-tab="bild"] nav .hide_markers', Moments.bild_hide_markers);
        Moments.bindAll("click", '[data-tab="bild"] nav .show_markers', Moments.bild_show_markers);
        Moments.bindAll("click", '[data-tab="bild"] nav .hide_edit', Moments.bild_hide_edit);
        Moments.bindAll("click", '[data-tab="bild"] nav .show_edit', Moments.bild_show_edit);

        Moments.bind("load", '[data-tab="bild"] main .image-container img', Moments.bild_img_loaded)

        Moments.bild_canvas_start = false;
        Moments.bild_canvas_persons_drawing = undefined;

        Moments.inputMoveElementInit(
            document.querySelector('[data-tab="bild"] main .image-container canvas'),
            function (e) {
                Moments.bild_canvas_start = true;
                e.setLayerXY()
                Moments.bild_canvas_persons_drawing = {
                    x_start: e.layerX,
                    y_start: e.layerY,
                    x_end: e.layerX,
                    y_end: e.layerY,
                };
            },
            function (e) {
                if (Moments.bild_canvas_start) {
                    e.setLayerXY()
                    Moments.bild_canvas_persons_drawing.x_end = e.layerX
                    Moments.bild_canvas_persons_drawing.y_end = e.layerY
                }
                Moments.bild_canvas_draw();
            },
            function () {
                if (Moments.bild_canvas_persons_drawing) {
                    var x, y = 0;

                    if (Moments.bild_canvas_persons_drawing.x_start > Moments.bild_canvas_persons_drawing.x_end) {
                        x = Moments.bild_canvas_persons_drawing.x_end
                    } else {
                        x = Moments.bild_canvas_persons_drawing.x_start
                    }

                    if (Moments.bild_canvas_persons_drawing.y_start > Moments.bild_canvas_persons_drawing.y_end) {
                        y = Moments.bild_canvas_persons_drawing.y_end
                    } else {
                        y = Moments.bild_canvas_persons_drawing.y_start
                    }

                    var width = height = 0;

                    width = Math.abs(Moments.bild_canvas_persons_drawing.x_start - Moments.bild_canvas_persons_drawing.x_end)
                    height = Math.abs(Moments.bild_canvas_persons_drawing.y_start - Moments.bild_canvas_persons_drawing.y_end)

                    var newId = "0_" + Math.floor(Math.random()*10000)
                    var name = "?"
                    Moments.createMarkedBox(
                        newId,
                        name,
                        x,
                        y,
                        width,
                        height
                    )

                    Moments.bild_person_hinzufuegen(new Event('Add Person'), newId, x, y, width, height);

                    Moments.bild_canvas_start = false;
                    Moments.bild_canvas_persons_drawing = undefined;
                    document.querySelector('[data-tab="bild"] main .image-container canvas').style.display = "none";
                    Moments.bild_canvas_draw();
                }
            },
            "inputMoveElementInit_canvas"
        )

        document.querySelector('[data-tab="bild"] main .image-container canvas').style.display = "none";

        Moments.bild_canvas = document.querySelector('[data-tab="bild"] main .image-container canvas');
        Moments.bild_canvas_context = document.querySelector('[data-tab="bild"] main .image-container canvas').getContext("2d");

        Moments.bind("click", '[data-tab="bild"] form table[data-key="Personen"] tfoot button', Moments.add_person_marker)
        Moments.bindAll("click", '[data-tab="bild"] form table[data-key="Personen"] tbody button[data-delete]', Moments.bild_person_entfernen)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Id"]', Moments.bild_person_id_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="X"]', Moments.bild_person_X_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Y"]', Moments.bild_person_Y_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Width"]', Moments.bild_person_Width_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Height"]', Moments.bild_person_Height_change)

        Moments.bindAll("change", '[data-tab="bild"] form [name="URL"]', Moments.bild_person_url_change)

        setTimeout(function(){
            Moments.zoom_with();
            let bild = Moments.bild_get_data(id)
            if (bild.URL === undefined || bild.URL === "") {
                Moments.bild_show_edit();
            }
        }, 50)
    },

    delete_bild: function () {
        event.preventDefault();

        if (confirm("Möchten Sie das Bild wirklich löschen?")) {
            let id = Moments.getRouteData("id");

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

            Moments.changeRoute("bilder")
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
        if (Moments.bild_zoom_factor!= 1) {
            Moments.zoom_original();
            Moments.zoom_with();
        }
    },

    bild_show_edit: function() {
        document.querySelector('[data-tab="bild"]').classList.remove("hideEdit")
        if (Moments.bild_zoom_factor!= 1) {
            Moments.zoom_original();
            Moments.zoom_with();
        }
    },

    bild_zoom_factor: 1,
    bild_orginal_img_width: undefined,

    zoom_with: function () {
        if (Moments.bild_zoom_factor == 1) {
            var img = document.querySelector('[data-tab="bild"] .image-container img');

            if (typeof Moments.bild_orginal_img_width === "undefined") {
                Moments.bild_orginal_img_width = img.width;
            }

            var img_container = document.querySelector('[data-tab="bild"] .image-container');
            var img_container_box = img_container.getBoundingClientRect();
            var img_container_width = img_container_box.width;

            Moments.bild_zoom_factor = img_container_width/Moments.bild_orginal_img_width;

            img.width = img_container_width;

            Moments.bild_set_all_to_img_size()

            document.querySelectorAll('[data-tab="bild"] .image-container .markers [data-id]').forEach(function(m){
                m.style.top = (parseInt(m.style.top) * Moments.bild_zoom_factor) + "px"
                m.style.left = (parseInt(m.style.left) * Moments.bild_zoom_factor) + "px"
                m.style.height = (parseInt(m.style.height) * Moments.bild_zoom_factor) + "px"
                m.style.width = (parseInt(m.style.width) * Moments.bild_zoom_factor) + "px"
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

        if (Moments.bild_orginal_img_width) {
            var img = document.querySelector('[data-tab="bild"] .image-container img');
            Moments.bild_zoom_factor = 1
            img.width = Moments.bild_orginal_img_width
            Moments.bild_set_all_to_img_size()
        }

        document.querySelectorAll('[data-tab="bild"] .image-container .markers [data-id]').forEach(function(m){
            m.style.top = (parseInt(m.style.top) * Moments.bild_zoom_factor) + "px"
            m.style.left = (parseInt(m.style.left) * Moments.bild_zoom_factor) + "px"
            m.style.height = (parseInt(m.style.height) * Moments.bild_zoom_factor) + "px"
            m.style.width = (parseInt(m.style.width) * Moments.bild_zoom_factor) + "px"
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
        var value = parseInt(this.value) * Moments.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.left = value + "px"
    },

    bild_person_Y_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * Moments.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.top = value + "px"
    },

    bild_person_Width_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * Moments.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.width = value + "px"
    },

    bild_person_Height_change: function() {
        var id = this.parentElement.parentElement.dataset.person;
        var value = parseInt(this.value) * Moments.bild_zoom_factor;
        document.querySelector('[data-tab="bild"] .image-container .markers [data-id="'+id+'"]').style.height = value + "px"
    },

    bild_person_id_change: function() {
        var newId = this.value
        var oldId = this.parentElement.parentElement.dataset.person;

        var person = Moments.get_person_data(newId);
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
        let bild = Moments.bild_get_data(id)

        if (bild.Personen) {
            bild.Personen = bild.Personen.map(p => {
                p.personOptionsHtml =  Moments.get_person_options_html()
                return p
            })
        }

        let html = Moments.renderTemplate("bild_details", bild);

        Moments.appendChild('[data-tab="bild"] main', html)

        document.querySelectorAll('[data-tab="bild"] form select').forEach(elm => {
            elm.querySelectorAll("option").forEach(o => {
                if (o.value == elm.dataset.value) {
                    o.setAttribute("selected", "selected");
                }
            })
        });

        if (bild.Personen) {
            bild.Personen = bild.Personen.forEach(p => {
                var person = Moments.get_person_data(p.Id);
                Moments.createMarkedBox(p.Id, person.Vornamen + " " + person.Name, p.X, p.Y, p.Width, p.Height)
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

    bild_canvas_draw: function () {
        Moments.bild_canvas_context.clearRect(0, 0, Moments.bild_canvas.width, Moments.bild_canvas.height);

        if (Moments.bild_canvas_persons_drawing) {
            Moments.bild_canvas_context.fillStyle = "#FF0000";
            Moments.bild_canvas_context.fillRect(
                Moments.bild_canvas_persons_drawing.x_start,
                Moments.bild_canvas_persons_drawing.y_start,
                Moments.bild_canvas_persons_drawing.x_end - Moments.bild_canvas_persons_drawing.x_start,
                Moments.bild_canvas_persons_drawing.y_end - Moments.bild_canvas_persons_drawing.y_start,
            );
        }
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

    bild_person_hinzufuegen: function (event, id, x, y, width, height) {
        event.preventDefault();
        var viewbag = {
            "Id": id,
            "X": parseInt(x * (1/Moments.bild_zoom_factor)),
            "Y": parseInt(y * (1/Moments.bild_zoom_factor)),
            "Width": parseInt(width * (1/Moments.bild_zoom_factor)),
            "Height": parseInt(height * (1/Moments.bild_zoom_factor)),
        };
        viewbag.personOptionsHtml = Moments.get_person_options_html();
        var html = Moments.renderTemplate("bild_details_Personen", viewbag)
        document.querySelector('[data-tab="bild"] form table[data-key="Personen"] tbody').innerHTML += html;

        Moments.bindAll("click", '[data-tab="bild"] form table[data-key="Personen"] tbody button[data-delete]', Moments.bild_person_entfernen)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Id"]', Moments.bild_person_id_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="X"]', Moments.bild_person_X_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Y"]', Moments.bild_person_Y_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Width"]', Moments.bild_person_Width_change)
        Moments.bindAll("change", '[data-tab="bild"] form table[data-key="Personen"] tbody [name="Height"]', Moments.bild_person_Height_change)

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

        Moments.makeResizableDiv(id, box)
    },

    bild_set_person_data: function (id, name, value) {
        value = parseInt(value * (1/Moments.bild_zoom_factor))
        document.querySelector('[data-tab="bild"] form table[data-key="Personen"] tr[data-person="'+id+'"] [name="'+name+'"]').value = value;
    },

    makeResizableDiv: function(id, element){
        /* https://codepen.io/ZeroX-DG/pen/vjdoYe */
        const resizers = element.querySelectorAll('.resizer')
        const minimum_size = 20;

        let original_width = 0;
        let original_height = 0;

        Moments.inputMoveElementInit(
            element,
            function(){},
            function(e){
                element.style.left = e.newTargetX + "px";
                element.style.top  = e.newTargetY + "px";
                Moments.bild_set_person_data(element.dataset.id, "X", e.newTargetX);
                Moments.bild_set_person_data(element.dataset.id, "Y", e.newTargetY);
            }
        );

        for (let i = 0;i < resizers.length; i++) {
            const currentResizer = resizers[i];

            Moments.inputMoveElementInit(
                element,
                function(){
                    original_width = parseInt(element.currentStyle.width);
                    original_height = parseInt( element.currentStyle.height);
                },
                function(e){
                    if (currentResizer.classList.contains('bottom-right')) {
                        const width = original_width + e.deltaX;
                        const height = original_height + e.deltaY;
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Width", width)
                        }
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Height", height)
                        }
                    } else if (currentResizer.classList.contains('bottom-left')) {
                        const height = original_height + e.deltaY;
                        const width = original_width - e.deltaX;
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Height", height)
                        }
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            element.style.left = e.newTargetX + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Width", width)
                            Moments.bild_set_person_data(element.dataset.id, "X", e.newTargetX)
                        }
                    } else if (currentResizer.classList.contains('top-right')) {
                        const width = original_width + e.deltaX;
                        const height = original_height - e.deltaY;
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Width", width)
                        }
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Height", height)
                            element.style.top = e.newTargetY + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Y", e.newTargetY)
                        }
                    } else {
                        const width = original_width - e.deltaX;
                        const height = original_height - e.deltaY;
                        if (width > minimum_size) {
                            element.style.width = width + 'px'
                            element.style.left = e.newTargetX + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Width", width)
                            Moments.bild_set_person_data(element.dataset.id, "X", e.newTargetX)
                        }
                        if (height > minimum_size) {
                            element.style.height = height + 'px'
                            element.style.top = e.newTargetY + 'px'
                            Moments.bild_set_person_data(element.dataset.id, "Height", height)
                            Moments.bild_set_person_data(element.dataset.id, "Y", e.newTargetY)
                        }
                    }
                },
                function(){},
                "inputMoveElementInitResizer",
                currentResizer
            );
        }
    },

    get_bild_form_data: function (name) {
        return document.querySelector('[data-tab="bild"] [name="'+name+'"]').value
    },

    save_bild: function () {

        let form = {
            Id: parseInt(Moments.get_bild_form_data("Id")),
            URL: Moments.get_bild_form_data("URL"),
            Datum: Moments.get_bild_form_data("Datum"),
            Uhrzeit: Moments.get_bild_form_data("Uhrzeit"),
            Ort: Moments.get_bild_form_data("Ort"),
            Strasse: Moments.get_bild_form_data("Strasse"),
            Nummer: Moments.get_bild_form_data("Nummer"),
            Land: Moments.get_bild_form_data("Land"),
            Note: Moments.get_bild_form_data("Note")
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
        let id = Moments.getRouteData("id");
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

        Moments.changeRoute("bild", {
            id:  bilder[nextIndex].Id
        })
    },

    pre_bild: function(){
        let id = Moments.getRouteData("id");
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

        Moments.changeRoute("bild", {
            id: bilder[preIndex].Id
        })
    }
}, Moments)