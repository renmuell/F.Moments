/**
 *  add_multi_bilder
 */

app = Object.assign({

    route_add_multi_bilder: function () {
        app.bindAll("click", '[data-tab="add_multi_bilder"] nav .save', app.add_multi_bilder_save);
    },

    add_multi_bilder_save: function () {

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
            newId =maxId
        } else {
            json = []
            newId = 0
        }

        document
        .querySelector('[data-tab="add_multi_bilder"] textarea')
        .value
        .split("\n")
        .filter(x => x != "")
        .map(x => x.trim())
        .forEach(function(url){

            if (json.find(x => x.URL == url) == null) {
                newId++;
                json.push({
                    Id: newId,
                    URL: url
                })
            }
        })

        localStorage.setItem("json_bilder", JSON.stringify(json))

        app.changeRoute("bilder")
    }

}, app)