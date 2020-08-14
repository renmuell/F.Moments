/**
 *  JSON Editor
 */

Moments = Object.assign({

    json_editor_init: function (id) {
        Moments.json_editor_bind(id);
        Moments.json_editor_laod(id);
    },

    json_editor_bind: function(id) {
        Moments.bind("change", '#'+id+' input[type="file"]', Moments.json_editor_laod_change)
        Moments.bind("click", '#'+id+' button.download', Moments.json_editor_laod_change_download)
        Moments.bind("click", '#'+id+' button.save', Moments.json_editor_laod_change_save)
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
                    Moments.json_editor_laod(event.target.dataset.json);
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
        Moments.downloadJson(json, event.target.dataset.json);
        return false;
    },

    json_editor_laod_change_save: function (event) {
        event.preventDefault();
        let json = document.querySelector("#"+event.target.dataset.json+" textarea").value;
        localStorage.setItem(event.target.dataset.json, json)
        alert("Saved");
        return false;
    }

}, Moments)