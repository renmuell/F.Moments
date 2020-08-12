/**
 *  JSON Editor
 */

app = Object.assign({

    json_editor_init: function (id) {
        app.json_editor_bind(id);
        app.json_editor_laod(id);
    },

    json_editor_bind: function(id) {
        app.bind("change", '#'+id+' input[type="file"]', app.json_editor_laod_change)
        app.bind("click", '#'+id+' button.download', app.json_editor_laod_change_download)
        app.bind("click", '#'+id+' button.save', app.json_editor_laod_change_save)
        document.querySelector('#'+id+' input[type="file"]').dataset.json = id;
        document.querySelector('#'+id+' button.download').dataset.json = id;
        document.querySelector('#'+id+' button.save').dataset.json = id;
    },

    json_editor_laod: function(id) {
        let json = localStorage.getItem(id);
        document.querySelector("#"+id+" textarea").value = json;
    },

    json_editor_laod_change: function (event) {
        if (event.target.files.length > 0){
            var reader = new FileReader();
            reader.addEventListener('load', function() {
                try {
                    localStorage.setItem(event.target.dataset.json, reader.result)
                    app.json_editor_laod(event.target.dataset.json);
                } catch (error) {
                    console.log(error)
                }
                alert("loaded");
            });
            reader.readAsText(event.target.files[0]);
        }
        this.value=null;
        return false;
    },

    json_editor_laod_change_download: function (event) {
        event.preventDefault();
        let json = document.querySelector("#"+event.target.dataset.json+" textarea").value;
        app.downloadJson(json, event.target.dataset.json);
        return false;
    },

    json_editor_laod_change_save: function (event) {
        event.preventDefault();
        let json = document.querySelector("#"+event.target.dataset.json+" textarea").value;
        localStorage.setItem(event.target.dataset.json, json)
        alert("Saved");
        return false;
    }

}, app)