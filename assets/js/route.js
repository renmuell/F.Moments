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

}, Moments)
