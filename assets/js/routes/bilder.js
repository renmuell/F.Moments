/**
 *  Bilder
 */

app = Object.assign({

    route_bilder: function () {

        var view = app.getRouteData("view");

        if (view == null) {
            view = "cards"
        }

        app.loadBilder(view)

        app.bindAll("click", '[data-tab="bilder"] nav .new', app.new_bild);
        app.bindAll("click", '[data-tab="bilder"] nav .table', app.bilder_show_as_table);
        app.bindAll("click", '[data-tab="bilder"] nav .cards', app.bilder_show_as_cards);
        app.bindAll("click", '[data-tab="bilder"] nav .add_multi', app.bilder_add_multi);
    },

    bilder_add_multi: function() {
        app.changeRoute("add_multi_bilder")
    },

    bilder_show_as_cards: function(){
        app.changeRoute("bilder", {
            view: "cards"
        })
    },

    bilder_show_as_table: function(){
        app.changeRoute("bilder", {
            view: "table"
        })
    },

    loadBilder: function(view) {

        app.clearChilds('[data-tab="bilder"] main');
        var json = app.getStorageJson("json_bilder")

        var innerHtml = "";
        if (json) {
            json.forEach(bild => {
                bild.PersonenLine = "";
                if (bild.Personen) {
                    bild.Personen.forEach(function(p){
                        var person = app.get_person_data(p.Id);
                        bild.PersonenLine += person.Vornamen + " " + person.Name + ";"
                    })
                }
                if (view == "cards")
                    bild.URL = bild.URL.replace(".jpeg", "_autox300.jpeg")
                innerHtml += app.renderTemplate("bild_"+view, bild);
            })
        }

        app.appendChild('[data-tab="bilder"] main', app.renderTemplate("bild_"+view+"_wrapper", {
            body: innerHtml
        }));

        app.bindBilder(view);
    },

    bindBilder: function(view) {

        if (view == "cards") {
            app.bindAll("click", "#bilder_list .bild main", app.bilderClick);
            app.bindAll("keypress", "#bilder_list .bild main", app.bilderClick);
        }

        if (view == "table") {
            app.bindAll("click", '[data-tab="bilder"] main .table tbody tr', app.bilderClick);
            app.bindAll("keypress", '[data-tab="bilder"] main .table tbody tr', app.bilderClick);
        }
    },

    bilderClick: function (event) {
        app.changeRoute("bild", {
            id: event.currentTarget.dataset.id
        });
    },

    new_bild: function(){

        event.preventDefault();

        var newId = -1;
        var json = app.getStorageJson("json_bilder")
        if (json) {
            var maxId = -1;
            var i = -1;
            for (i = 0; i < json.length; i++) {
                if (json[i].Id > maxId) {
                    maxId = json[i].Id
                }
            }

            maxId++
            newId =maxId

            json.push({
                Id: newId
            })

            localStorage.setItem("json_bilder", JSON.stringify(json))

        } else {
            newId = 1
            localStorage.setItem("json_bilder", JSON.stringify([{
                Id: newId
            }]))
        }

        app.changeRoute("bild", {
            id: newId
        })

        return false;
    }

}, app)