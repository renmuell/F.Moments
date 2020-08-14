/**
 *  Nav
 */

Moments = Object.assign({

    bindNav: function () {
        Moments.bindAll("click", "nav a", Moments.navClick)
    },

    updateNav: function () {
        if (document.querySelector('nav a.active')) {
            document.querySelector('nav a.active').classList.remove("active");
        }
        if (document.querySelector('main section.active')) {
            document.querySelector('main section.active').classList.remove("active");
        }
        if (document.querySelector('[data-tab="'+Moments.getRoute()+'"]')) {
            document.querySelector('[data-tab="'+Moments.getRoute()+'"]').classList.add("active")
        }
        if (document.querySelector('nav a[data-route="'+Moments.getRoute()+'"]')) {
            document.querySelector('nav a[data-route="'+Moments.getRoute()+'"]').classList.add("active");
        }
    },

    navClick: function (event) {
        event.preventDefault();
        Moments.changeRoute(event.target.dataset.route)
        return false;
    }

}, Moments)