/**
 *  Personen
 */

app = Object.assign({

    route_personen: function () {

        var view = app.getRouteData("view");

        if (view == null) {
            view = "cards"
        }

        app.loadPersonen(view)

        app.bindAll("click", '[data-tab="personen"] nav .new', app.new_person);
        app.bindAll("click", '[data-tab="personen"] nav .cards', app.show_as_cards);
        app.bindAll("click", '[data-tab="personen"] nav .table', app.show_as_table);
    },

    show_as_cards: function(){
        app.changeRoute("personen", {
            view: "cards"
        })
    },

    show_as_table: function(){
        app.changeRoute("personen", {
            view: "table"
        })
    },

    loadPersonen: function(view) {

        app.clearChilds('[data-tab="personen"] main');

        var innerHtml = "";
        var json = app.getStorageJson("json_personen")
        if (json && json.Personen) {
            json.Personen.forEach(json => {

                if (typeof json.Bild === "undefined" || json.Bild == "") {
                    if (json.Geschlecht == "Männlich") {
                        json.Bild = "assets/img/familyGraph/man.png";
                    } else {
                        json.Bild = "assets/img/familyGraph/woman.png";
                    }
                } else {
                    if (view == "cards")
                        json.Bild = json.Bild.replace(".jpeg", "_autox300.jpeg")
                }

                innerHtml += app.renderTemplate("person_"+view, json);
            })
        }

        app.appendChild('[data-tab="personen"] main', app.renderTemplate("person_"+view+"_wrapper", {
            body: innerHtml
        }))

        app.bindPersons(view);
    },

    bindPersons: function(view) {

        if (view == "cards") {
            app.bindAll("click", '[data-tab="personen"] main #personen_list .person main', app.personClick);
            app.bindAll("keypress", '[data-tab="personen"] main #personen_list .person main', app.personKeyPress);
        }

        if (view == "table") {
            app.bindAll("click", '[data-tab="personen"] main .table tbody tr', app.personClick);
            app.bindAll("keypress", '[data-tab="personen"] main .table tbody tr', app.personKeyPress);
        }

    },

    personClick: function (event) {
        app.changeRoute("person", {
            id: event.currentTarget.dataset.id
        });
    },

    personKeyPress: function (event) {
        app.changeRoute("person", {
            id: event.currentTarget.dataset.id
        });
    },

    new_person: function(){

        event.preventDefault();

        var newId = -1;
        var json = app.getStorageJson("json_personen")
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

        app.changeRoute("person", {
            id: newId
        })

        return false;
    }

}, app)