/**
 *  Route
 */

app = Object.assign({

    startRouting: function() {
        var hash = app.getRoute();
        if (hash.length == 0) { app.changeRoute("personen", { person_id: 1 }); return; }
        app.routeApply(hash);

        window.addEventListener('hashchange', app.routeChange, false);
    },

    routeChange: function () {
        app.routeApply(app.getRoute());
    },

    routeApply: function (route) {
        app.updateNav();
        setTimeout(function(){
            app["route_"+route].call();
        }, 100)
    },

    changeRoute: function (route, data) {
        let url = new URL(location.href);
        url.searchParams.forEach((v, k) => {
            url.searchParams.delete(k)
        });
        for (key in data) {
            if (data.hasOwnProperty(key)) {
                url.searchParams.append(key, data[key]);
            }
        }
        url.hash = route;
        location.href = url;
    },

    getRoute: function () {
        return location.hash.replace("#", '');
    },

    getRouteData: function (key) {
        return (new URL(location.href)).searchParams.get(key);
    }

}, app)
