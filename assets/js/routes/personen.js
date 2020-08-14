/**
 *  Personen
 */

Moments = Object.assign({

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

        Moments.clearChilds('[data-tab="personen"] main');

        var innerHtml = "";
        var json = Moments.getStorageJson("json_personen")
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