/**
 *  Person
 */

app = Object.assign({

    route_person: function () {
        let id = app.getRouteData("id");
        var person = app.get_person_data(id);

        if (person.Geburtstag && person.Geburtstag.length > 0)
            person.Geburtstag = app.convertDINToISODate(person.Geburtstag)

        if (person.Gestorben && person.Gestorben.length > 0)
            person.Gestorben = app.convertDINToISODate(person.Gestorben)

        person.personOptionsHtml = app.get_person_options_html();

        if (person.Kinder) {
            person.Kinder = person.Kinder.map(k => {
                return {
                    Id: k,
                    personOptionsHtml: person.personOptionsHtml
                }
            })
        }

        if (person.Partner) {
            person.Partner = person.Partner.map(p => {
                if (p.Von) {
                    p.Von = app.convertDINToISODate(p.Von)
                }
                if (p.Bis) {
                    p.Bis = app.convertDINToISODate(p.Bis)
                }


                p.personOptionsHtml = person.personOptionsHtml
                return p
            })
        }

        if (person.Ereignisse) {
            person.Ereignisse = person.Ereignisse.map(p => {
                if (p.Wann) {
                    p.Wann = app.convertDINToISODate(p.Wann)
                }
                return p
            })
        }

        if (person.Berufe) {
            person.Berufe = person.Berufe.map(b => {
                if (b.Von) {
                    b.Von = app.convertDINToISODate(b.Von)
                }
                if (b.Bis) {
                    b.Bis = app.convertDINToISODate(b.Bis)
                }
                return b
            })
        }

        if (person.Addressen) {
            person.Addressen = person.Addressen.map(a => {
                if (a.Seit) {
                    a.Seit = app.convertDINToISODate(a.Seit)
                }
                return a
            })
        }

        let html = app.renderTemplate("person_details", person);

        app.appendChild('[data-tab="person"] main', html)

        document.querySelectorAll('[data-tab="person"] form select').forEach(elm => {
            elm.querySelectorAll("option").forEach(o => {
                if (o.value == elm.dataset.value) {
                    o.setAttribute("selected", "selected");
                }
            })
        });

        app.bind("click", '[data-tab="person"] form table[data-key="Kinder"] tfoot button', app.kind_hinzufuegen)
        app.bind("click", '[data-tab="person"] form table[data-key="Partner"] tfoot button', app.partner_hinzufuegen)
        app.bind("click", '[data-tab="person"] form table[data-key="Ereignisse"] tfoot button', app.ereignisse_hinzufuegen)
        app.bind("click", '[data-tab="person"] form table[data-key="Berufe"] tfoot button', app.berufe_hinzufuegen)
        app.bind("click", '[data-tab="person"] form table[data-key="Addressen"] tfoot button', app.addressen_hinzufuegen)

        app.bindAll("click", '[data-tab="person"] form table[data-key="Kinder"] tbody button[data-delete]', app.kind_entfernen)
        app.bindAll("click", '[data-tab="person"] form table[data-key="Partner"] tbody button[data-delete]', app.partner_entfernen)
        app.bindAll("click", '[data-tab="person"] form table[data-key="Ereignisse"] tbody button[data-delete]', app.ereignisse_entfernen)
        app.bindAll("click", '[data-tab="person"] form table[data-key="Berufe"] tbody button[data-delete]', app.berufe_entfernen)
        app.bindAll("click", '[data-tab="person"] form table[data-key="Addressen"] tbody button[data-delete]', app.addressen_entfernen)

        app.bindAll("click", '[data-tab="person"] nav .save', app.save_person);
        app.bindAll("click", '[data-tab="person"] nav .pre', app.pre_person);
        app.bindAll("click", '[data-tab="person"] nav .next', app.next_person);
        app.bindAll("click", '[data-tab="person"] nav .new', app.new_person);
        app.bindAll("click", '[data-tab="person"] nav .delete', app.delete_person);
    },

    next_person: function(){
        let id = app.getRouteData("id");
        let personen = JSON
        .parse(localStorage.getItem("json_personen"))
        .Personen

        var i = -1;
        for (i = 0; i < personen.length; i++) {
            if (personen[i].Id == id) {
                break;
            }
        }

        var nextIndex = i;
        if (i === (personen.length - 1)) {
            nextIndex = 0
        } else {
            nextIndex++;
        }

        app.changeRoute("person", {
            id:  personen[nextIndex].Id
        })
    },

    pre_person: function(){
        let id = app.getRouteData("id");
        let personen = JSON
        .parse(localStorage.getItem("json_personen"))
        .Personen

        var i = -1;
        for (i = 0; i < personen.length; i++) {
            if (personen[i].Id == id) {
                break;
            }
        }

        var preIndex = i;
        if (i === 0) {
            preIndex = personen.length - 1
        } else {
            preIndex--;
        }

        app.changeRoute("person", {
            id: personen[preIndex].Id
        })
    },

    save_person: function () {

        let form = {
            Id: parseInt(app.get_person_form_data("Id")),
            Vornamen: app.get_person_form_data("Vornamen"),
            Name: app.get_person_form_data("Name"),
            Geboren: app.get_person_form_data("Geboren"),
            Geburtstag: app.get_person_form_data("Geburtstag"),
            Geburtsort: app.get_person_form_data("Geburtsort"),
            Geschlecht: app.get_person_form_data("Geschlecht"),
            Vater: parseInt(app.get_person_form_data("Vater")),
            Mutter: parseInt(app.get_person_form_data("Mutter")),

            Nickname:app.get_person_form_data("Nickname"),
            Geburtsuhrzeit:app.get_person_form_data("Geburtsuhrzeit"),
            Sterbeuhrzeit:app.get_person_form_data("Sterbeuhrzeit"),
            Gestorben:app.get_person_form_data("Gestorben"),
            Glaube:app.get_person_form_data("Glaube"),
            Bild: app.get_person_form_data("Bild"),

            Note: app.get_person_form_data("Note")
        };

        var KinderTr = document.querySelectorAll('[data-key="Kinder"] tbody tr')
        if (KinderTr.length > 0) {

            form.Kinder = [];

            KinderTr.forEach(ktr => {
                form.Kinder.push(parseInt(ktr.querySelector('[name="Id"]').value))
            })
        }

        var Partnertr = document.querySelectorAll('[data-key="Partner"] tbody tr')
        if (Partnertr.length > 0) {

            form.Partner = [];

            Partnertr.forEach(ktr => {
                form.Partner.push({
                    Id: parseInt(ktr.querySelector('[name="Id"]').value),
                    Von: app.convertISOToDINDate(ktr.querySelector('[name="Von"]').value),
                    Bis: app.convertISOToDINDate(ktr.querySelector('[name="Bis"]').value),
                    Ort: ktr.querySelector('[name="Ort"]').value,
                    Typ: ktr.querySelector('[name="Typ"]').value
                })
            })
        }

        var Ereignissetr = document.querySelectorAll('[data-key="Ereignisse"] tbody tr')
        if (Ereignissetr.length > 0) {

            form.Ereignisse = [];

            Ereignissetr.forEach(ktr => {
                form.Ereignisse.push({
                    Id: parseInt(ktr.querySelector('[name="Id"]').value),
                    Art: ktr.querySelector('[name="Art"]').value,
                    Wann: app.convertISOToDINDate(ktr.querySelector('[name="Wann"]').value),
                    Note: ktr.querySelector('[name="Note"]').value,
                    Ort: ktr.querySelector('[name="Ort"]').value,
                })
            })
        }

        var Berufetr = document.querySelectorAll('[data-key="Berufe"] tbody tr')
        if (Berufetr.length > 0) {

            form.Berufe = [];

            Berufetr.forEach(ktr => {
                form.Berufe.push({
                    Id: parseInt(ktr.querySelector('[name="Id"]').value),
                    Von: app.convertISOToDINDate(ktr.querySelector('[name="Von"]').value),
                    Bis: app.convertISOToDINDate(ktr.querySelector('[name="Bis"]').value),
                    Bezeichnung: ktr.querySelector('[name="Bezeichnung"]').value,
                    Firma: ktr.querySelector('[name="Firma"]').value,
                })
            })
        }

        var Addressentr = document.querySelectorAll('[data-key="Addresse"] tbody tr')
        if (Addressentr.length > 0) {

            form.Addressen = [];

            Addressentr.forEach(ktr => {
                form.Berufe.push({
                    Id: parseInt(ktr.querySelector('[name="Id"]').value),
                    Seit: app.convertISOToDINDate(ktr.querySelector('[name="Seit"]').value),
                    Ort: ktr.querySelector('[name="Ort"]').value,
                    Strasse: ktr.querySelector('[name="Strasse"]').value,
                    Nummer: ktr.querySelector('[name="Nummer"]').value,
                    Land: ktr.querySelector('[name="Land"]').value,
                    Note: ktr.querySelector('[name="Note"]').value
                })
            })
        }

        if (form.Geburtstag && form.Geburtstag.length > 0)
            form.Geburtstag = app.convertISOToDINDate(form.Geburtstag)

        if (form.Gestorben && form.Gestorben.length > 0)
            form.Gestorben = app.convertISOToDINDate(form.Gestorben)


        let personen = JSON
        .parse(localStorage.getItem("json_personen"))
        .Personen

        var i = -1;
        for (i = 0; i < personen.length; i++) {
            if (personen[i].Id == form.Id) {
                break;
            }
        }

        if (i == -1) {
            personen.push(form)
        } else {
            personen[i] = form;
        }

        localStorage.setItem("json_personen", JSON.stringify({
            Personen: personen
        }))

        alert("saved")
    },

    get_person_form_data: function (name) {
        return document.querySelector('[data-tab="person"] [name="'+name+'"]').value
    },

    get_person_data: function (id) {
        var data = {};
        JSON
        .parse(localStorage.getItem("json_personen"))
        .Personen
        .forEach(person => {
            if (person.Id == id) {
                data = person;
            }
        })
        return data;
    },

    get_person_options_html: function() {
        var html = "<option value disabled selected>--Bitte auwählen--</option>";

        JSON
        .parse(localStorage.getItem("json_personen"))
        .Personen
        .forEach(person => {
            html += app.renderTemplate("options_person", person)
        })

        return html;
    },

    convertDINToISODate: function (date) {
        // dd.MM.yyyy  ->   yyyy-MM-dd
        return date.replace(/(.*)\.(.*)\.(.*)/, "$3-$2-$1")
    },

    convertISOToDINDate: function (date) {
        // yyyy-MM-dd -> dd.MM.yyyy
        return date.replace(/(.*)-(.*)-(.*)/, "$3.$2.$1")
    },

    kind_hinzufuegen: function (event) {
        event.preventDefault();
        var viewbag = {};
        viewbag.personOptionsHtml = app.get_person_options_html();
        var html = app.renderTemplate("person_details_Kinder", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Kinder"] tbody').innerHTML += html;

        app.bindAll("click", '[data-tab="person"] form table[data-key="Kinder"] tbody button[data-delete]', app.kind_entfernen)

        return false;
    },
    kind_entfernen: function () {
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Kinder"] tr[data-kind="'+this.dataset.delete+'"]').remove();
        return false;
    },
    partner_hinzufuegen : function (){
        event.preventDefault();
        var viewbag = {};
        viewbag.personOptionsHtml = app.get_person_options_html();
        var html = app.renderTemplate("person_details_Partner", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Partner"] tbody').innerHTML += html;

        app.bindAll("click", '[data-tab="person"] form table[data-key="Partner"] tbody button[data-delete]', app.partner_entfernen)

        return false;
    },
    partner_entfernen: function () {
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Partner"] tr[data-partner="'+this.dataset.delete+'"]').remove();
        return false;
    },
    ereignisse_hinzufuegen: function () {
        event.preventDefault();
        var viewbag = {};
        var html = app.renderTemplate("person_details_Ereignisse", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Ereignisse"] tbody').innerHTML += html;

        app.bindAll("click", '[data-tab="person"] form table[data-key="Ereignisse"] tbody button[data-delete]', app.ereignisse_entfernen)
        return false;
    },
    ereignisse_entfernen: function(){
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Ereignisse"] tr[data-ereignis="'+this.dataset.delete+'"]').remove();
        return false;
    },
    berufe_hinzufuegen: function(){
        event.preventDefault();
        var viewbag = {};
        var html = app.renderTemplate("person_details_Berufe", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Berufe"] tbody').innerHTML += html;

        app.bindAll("click", '[data-tab="person"] form table[data-key="Berufe"] tbody button[data-delete]', app.berufe_entfernen)
        return false;
    },
    berufe_entfernen: function(){
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Berufe"] tr[data-beruf="'+this.dataset.delete+'"]').remove();
        return false;
    },
    addressen_hinzufuegen: function(){
        event.preventDefault();
        var viewbag = {};
        var html = app.renderTemplate("person_details_Adressen", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Addressen"] tbody').innerHTML += html;

        app.bindAll("click", '[data-tab="person"] form table[data-key="Addressen"] tbody button[data-delete]', app.addressen_entfernen)
        return false;
    },
    addressen_entfernen: function(){
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Addressen"] tr[data-addresse="'+this.dataset.delete+'"]').remove();
        return false;
    },
    delete_person: function () {
        event.preventDefault();

        if (confirm("Möchten Sie den Nutzer wirklich löschen?")) {
            let id = app.getRouteData("id");

            let json = JSON
            .parse(localStorage.getItem("json_personen"))

            var i = -1;
            for (i = 0; i < json.Personen.length; i++) {
                if (json.Personen[i].Id == id) {
                    break;
                }
            }

            if (i > -1) {
                json.Personen.splice(i, 1);
            }

            localStorage.setItem("json_personen", JSON.stringify(json))

            app.changeRoute("personen")
        }

        return false;
    }

}, app)