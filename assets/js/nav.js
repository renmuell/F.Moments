/**
 *  Nav
 */

app = Object.assign({

    bindNav: function () {
        app.bindAll("click", "nav a", app.navClick)
    },

    updateNav: function () {
        if (document.querySelector('nav a.active')) {
            document.querySelector('nav a.active').classList.remove("active");
        }
        if (document.querySelector('main section.active')) {
            document.querySelector('main section.active').classList.remove("active");
        }
        if (document.querySelector('[data-tab="'+app.getRoute()+'"]')) {
            document.querySelector('[data-tab="'+app.getRoute()+'"]').classList.add("active")
        }
        if (document.querySelector('nav a[data-route="'+app.getRoute()+'"]')) {
            document.querySelector('nav a[data-route="'+app.getRoute()+'"]').classList.add("active");
        }
    },

    navClick: function (event) {
        event.preventDefault();
        app.changeRoute(event.target.dataset.route)
        return false;
    }

}, app)