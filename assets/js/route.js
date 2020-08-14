/**
 *  Route
 */

Moments = Object.assign({

    startRouting: function() {
        var hash = Moments.getRoute();
        if (hash.length == 0) { Moments.changeRoute("personen", { person_id: 1 }); return; }
        Moments.routeApply(hash);

        window.addEventListener('hashchange', Moments.routeChange, false);
    },

    routeChange: function () {
        Moments.routeApply(Moments.getRoute());
    },

    routeApply: function (route) {
        Moments.updateNav();
        setTimeout(function(){
            Moments["route_"+route].call();
        }, 100)
    },

    changeRoute: function (route, data) {
        let url = new URL(location.href);
        var search = [];
        url.search = "";
        for (key in data) {
            if (data.hasOwnProperty(key)) {
                search.push(key+"="+data[key])
            }
        }
        if (search.length > 0 ) {
            url.search = "?"+ search.join("&")
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

}, Moments)
