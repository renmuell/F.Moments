/**
 *  Bilder
 */

Moments = Object.assign({

    route_bilder: function () {

        var view = Moments.getRouteData("view");

        if (view == null) {
            view = "cards"
        }

        Moments.loadBilder(view)

        Moments.bindAll("click", '[data-tab="bilder"] nav .new', Moments.new_bild);
        Moments.bindAll("click", '[data-tab="bilder"] nav .table', Moments.bilder_show_as_table);
        Moments.bindAll("click", '[data-tab="bilder"] nav .cards', Moments.bilder_show_as_cards);
        Moments.bindAll("click", '[data-tab="bilder"] nav .add_multi', Moments.bilder_add_multi);
    },

    bilder_add_multi: function() {
        Moments.changeRoute("add_multi_bilder")
    },

    bilder_show_as_cards: function(){
        Moments.changeRoute("bilder", {
            view: "cards"
        })
    },

    bilder_show_as_table: function(){
        Moments.changeRoute("bilder", {
            view: "table"
        })
    },

    loadBilder: function(view) {

        Moments.clearChilds('[data-tab="bilder"] main');
        var json = Moments.getStorageJson("json_bilder")

        var innerHtml = "";
        if (json) {
            json.forEach(bild => {
                bild.PersonenLine = "";
                if (bild.Personen) {
                    bild.Personen.forEach(function(p){
                        var person = Moments.get_person_data(p.Id);
                        bild.PersonenLine += person.Vornamen + " " + person.Name + ";"
                    })
                }
                if (view == "cards")
                    bild.URL = bild.URL.replace(".jpeg", "_autox300.jpeg")
                innerHtml += Moments.renderTemplate("bild_"+view, bild);
            })
        }

        Moments.appendChild('[data-tab="bilder"] main', Moments.renderTemplate("bild_"+view+"_wrapper", {
            body: innerHtml
        }));

        Moments.bindBilder(view);
    },

    bindBilder: function(view) {

        if (view == "cards") {
            Moments.bindAll("click", "#bilder_list .bild main", Moments.bilderClick);
            Moments.bindAll("keypress", "#bilder_list .bild main", Moments.bilderClick);
        }

        if (view == "table") {
            Moments.bindAll("click", '[data-tab="bilder"] main .table tbody tr', Moments.bilderClick);
            Moments.bindAll("keypress", '[data-tab="bilder"] main .table tbody tr', Moments.bilderClick);
        }
    },

    bilderClick: function (event) {
        Moments.changeRoute("bild", {
            id: event.currentTarget.dataset.id
        });
    },

    new_bild: function(){

        event.preventDefault();

        var newId = -1;
        var json = Moments.getStorageJson("json_bilder")
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

        Moments.changeRoute("bild", {
            id: newId
        })

        return false;
    }

}, Moments)