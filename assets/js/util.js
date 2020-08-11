/**
 *  UTILS
 */

app = Object.assign({

    clearChilds: function (id) {
        document.querySelector(id).innerHTML = "";
    },
    appendChild: function(id, child) {
        document.querySelector(id).innerHTML += child;
    },
    renderTemplate: function (id, data, _default = {}) {
        var result = document.querySelector("#template_" + id).innerHTML;
        let match;
        while ((match = (/\%\%[a-zA-Z]*\%\%/g).exec(result)) !== null) {
            match = match[0]
            var key = match.replace(/\%/g, "")

            var value = typeof data[key] !== "undefined" ? data[key] : _default[key];

            if (typeof value !== "undefined") {
                if (Array.isArray(value)) {
                    var innerhtml = "";
                    value.forEach(function(item) {
                        innerhtml += app.renderTemplate(id + "_" + key, typeof item == "object" ? item : { data: item });
                    });
                    result = result.replace(RegExp(match, 'g'), innerhtml)
                } else {
                    result = result.replace(RegExp(match, 'g'), value)
                }
            } else {
                result = result.replace(RegExp(match, 'g'), "")
            }
        }
        return result;
    },

    replaceTemplateData: function (html, key, value){
        return html.replace(RegExp("%%"+key+"%%", 'g'), value)
    },

    bind: function (event, selector, callback) {
        document
        .querySelector(selector)
        .addEventListener(event, callback, false);
    },
    bindAll: function (event, selector, callback) {
        Array
        .from(document.querySelectorAll(selector))
        .forEach(a => {
            a.addEventListener(event, callback, false)
        })
    },
    downloadJson: function (json, filename){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },
    getStorageJson: function (key) {
        var json = {};
        try {
            json = JSON.parse(localStorage.getItem(key));
        } catch (error) {}
        return json;
    }

}, app)