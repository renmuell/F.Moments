/**
 *  Personen
 */

Moments = Object.assign({

    personen_init_menu: false,

    route_personen: function () {

        var view = Moments.getRouteData("view");

        if (view == null) {
            view = "cards"
        }

        Moments.loadPersonen(view)

        Moments.bindAll("click", '[data-tab="personen"] nav .new', Moments.new_person);
        Moments.bindAll("click", '[data-tab="personen"] nav .cards', Moments.show_as_cards);
        Moments.bindAll("click", '[data-tab="personen"] nav .table', Moments.show_as_table);
    },

    show_as_cards: function(){
        Moments.changeRoute("personen", {
            view: "cards"
        })
    },

    show_as_table: function(){
        Moments.changeRoute("personen", {
            view: "table"
        })
    },

    loadPersonen: function(view) {
        let offset = view == "cards" ? 20 : 100;
        let page = Moments.getRouteData("page");

        if (page == null) page = 1;

        Moments.clearChilds('[data-tab="personen"] main');

        var length = 0;
        var innerHtml = "";
        var json = Moments.getStorageJson("json_personen")
        if (json && json.Personen) {
            length = json.Personen.length;
            numPages = Math.ceil(length/offset);

            if (Moments.personen_init_menu == false) {
                Moments.personen_init_menu = true;

                var button_pre = document.createElement("button");
                button_pre.innerHTML = '<i class="fas fa-chevron-left"></i>'
                button_pre.onclick = function () {
                    Moments.changeRoute("personen", {
                        page: parseInt(page) > 1 ? parseInt(page)-1 : page,
                        view: view
                    })
                }
                var li_pre = document.createElement("li");
                li_pre.appendChild(button_pre)
                document.querySelector('[data-tab="personen"] nav ul').appendChild(li_pre);

                var label_paginate = document.createElement("label");
                label_paginate.innerHTML = page + " of " + numPages
                var li_paginate = document.createElement("li");
                li_paginate.appendChild(label_paginate)
                document.querySelector('[data-tab="personen"] nav ul').appendChild(li_paginate);

                var button_next = document.createElement("button");
                button_next.innerHTML = '<i class="fas fa-chevron-right"></i>'
                button_next.onclick = function () {
                    Moments.changeRoute("personen", {
                        page: parseInt(page) < numPages ? parseInt(page)+1 : page,
                        view: view
                    })
                }
                var li_next = document.createElement("li");
                li_next.appendChild(button_next)
                document.querySelector('[data-tab="personen"] nav ul').appendChild(li_next);

                var label_length = document.createElement("label");
                label_length.innerHTML = length + ' <i class="fas fa-users"></i>'
                var li_length = document.createElement("li");
                li_length.appendChild(label_length)
                document.querySelector('[data-tab="personen"] nav ul').appendChild(li_length);
            }

            json.Personen.slice((page - 1) * offset, page * offset).forEach(json => {

                if (typeof json.Bild === "undefined" || json.Bild == "") {
                    if (typeof json.Geschlecht == "undefined") {
                        json.Bild = ""
                    } else if (json.Geschlecht == "Männlich") {
                        json.Bild = "assets/img/man.png";
                    } else {
                        json.Bild = "assets/img/woman.png";
                    }
                } else {
                    if (view == "cards")
                        json.Bild = json.Bild.replace(".jpeg", "-AUTOx300.jpeg")
                }

                innerHtml += Moments.renderTemplate("person_"+view, json);
            })
        }

        Moments.appendChild('[data-tab="personen"] main', Moments.renderTemplate("person_"+view+"_wrapper", {
            body: innerHtml
        }))

        Moments.bindPersons(view);
    },

    bindPersons: function(view) {

        if (view == "cards") {
            Moments.bindAll("click", '[data-tab="personen"] main #personen_list .person main', Moments.personClick);
            Moments.bindAll("keypress", '[data-tab="personen"] main #personen_list .person main', Moments.personKeyPress);
        }

        if (view == "table") {
            Moments.bindAll("click", '[data-tab="personen"] main .table tbody tr', Moments.personClick);
            Moments.bindAll("keypress", '[data-tab="personen"] main .table tbody tr', Moments.personKeyPress);
        }

    },

    personClick: function (event) {
        Moments.changeRoute("person", {
            id: event.currentTarget.dataset.id
        });
    },

    personKeyPress: function (event) {
        Moments.changeRoute("person", {
            id: event.currentTarget.dataset.id
        });
    },

    new_person: function(){

        event.preventDefault();

        var newId = -1;
        var json = Moments.getStorageJson("json_personen")
        if (json && json.Personen) {
            var maxId = -1;
            var i = -1;
            for (i = 0; i < json.Personen.length; i++) {
                if (json.Personen[i].Id > maxId) {
                    maxId = json.Personen[i].Id
                }
            }

            maxId++
            newId =maxId

            json.Personen.push({
                Id: newId
            })

            localStorage.setItem("json_personen", JSON.stringify(json))

        } else {
            newId = 1
            localStorage.setItem("json_personen", JSON.stringify({
                Personen: [{
                    Id: newId
                }]
            }))
        }

        Moments.changeRoute("person", {
            id: newId
        })

        return false;
    }

}, Moments)