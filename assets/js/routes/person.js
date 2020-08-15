/**
 *  Person
 */

Moments = Object.assign({

    route_person: function () {
        let id = Moments.getRouteData("id");
        var person = Moments.get_person_data(id);

        if (person.Geburtstag && person.Geburtstag.length > 0)
            person.Geburtstag = Moments.convertDINToISODate(person.Geburtstag)

        if (person.Gestorben && person.Gestorben.length > 0)
            person.Gestorben = Moments.convertDINToISODate(person.Gestorben)

        person.personOptionsHtml = Moments.get_person_options_html();

        if (typeof person.Bild === "undefined" || person.Bild == "") {
            if (typeof person.Geschlecht == "undefined") {
                person.HeaderBild = ""
            } else if (person.Geschlecht == "Männlich") {
                person.HeaderBild = "assets/img/familyGraph/man.png";
            } else {
                person.HeaderBild = "assets/img/familyGraph/woman.png";
            }
        } else {
            person.HeaderBild = person.Bild.replace(".jpeg", "_autox200.jpeg")
        }

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
                    p.Von = Moments.convertDINToISODate(p.Von)
                }
                if (p.Bis) {
                    p.Bis = Moments.convertDINToISODate(p.Bis)
                }


                p.personOptionsHtml = person.personOptionsHtml
                return p
            })
        }

        if (person.Ereignisse) {
            person.Ereignisse = person.Ereignisse.map(p => {
                if (p.Wann) {
                    p.Wann = Moments.convertDINToISODate(p.Wann)
                }
                return p
            })
        }

        if (person.Berufe) {
            person.Berufe = person.Berufe.map(b => {
                if (b.Von) {
                    b.Von = Moments.convertDINToISODate(b.Von)
                }
                if (b.Bis) {
                    b.Bis = Moments.convertDINToISODate(b.Bis)
                }
                return b
            })
        }

        if (person.Adressen) {
            person.Adressen = person.Adressen.map(a => {
                if (a.Seit) {
                    a.Seit = Moments.convertDINToISODate(a.Seit)
                }
                return a
            })
        }

        let html = Moments.renderTemplate("person_details", person);

        Moments.appendChild('[data-tab="person"] main', html)

        document.querySelectorAll('[data-tab="person"] form select').forEach(elm => {
            elm.querySelectorAll("option").forEach(o => {
                if (o.value == elm.dataset.value) {
                    o.setAttribute("selected", "selected");
                }
            })
        });

        Moments.bind("click", '[data-tab="person"] form table[data-key="Kinder"] tfoot button', Moments.kind_hinzufuegen)
        Moments.bind("click", '[data-tab="person"] form table[data-key="Partner"] tfoot button', Moments.partner_hinzufuegen)
        Moments.bind("click", '[data-tab="person"] form table[data-key="Ereignisse"] tfoot button', Moments.ereignisse_hinzufuegen)
        Moments.bind("click", '[data-tab="person"] form table[data-key="Berufe"] tfoot button', Moments.berufe_hinzufuegen)
        Moments.bind("click", '[data-tab="person"] form table[data-key="Addressen"] tfoot button', Moments.addressen_hinzufuegen)

        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Kinder"] tbody button[data-delete]', Moments.kind_entfernen)
        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Partner"] tbody button[data-delete]', Moments.partner_entfernen)
        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Ereignisse"] tbody button[data-delete]', Moments.ereignisse_entfernen)
        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Berufe"] tbody button[data-delete]', Moments.berufe_entfernen)
        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Addressen"] tbody button[data-delete]', Moments.addressen_entfernen)

        Moments.bindAll("click", '[data-tab="person"] nav .save', Moments.save_person);
        Moments.bindAll("click", '[data-tab="person"] nav .pre', Moments.pre_person);
        Moments.bindAll("click", '[data-tab="person"] nav .next', Moments.next_person);
        Moments.bindAll("click", '[data-tab="person"] nav .new', Moments.new_person);
        Moments.bindAll("click", '[data-tab="person"] nav .delete', Moments.delete_person);
    },

    next_person: function(){
        let id = Moments.getRouteData("id");
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

        Moments.changeRoute("person", {
            id:  personen[nextIndex].Id
        })
    },

    pre_person: function(){
        let id = Moments.getRouteData("id");
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

        Moments.changeRoute("person", {
            id: personen[preIndex].Id
        })
    },

    save_person: function () {

        let form = {
            Id: parseInt(Moments.get_person_form_data("Id")),
            Vornamen: Moments.get_person_form_data("Vornamen"),
            Name: Moments.get_person_form_data("Name"),
            Geboren: Moments.get_person_form_data("Geboren"),
            Geburtstag: Moments.get_person_form_data("Geburtstag"),
            Geburtsort: Moments.get_person_form_data("Geburtsort"),
            Geschlecht: Moments.get_person_form_data("Geschlecht"),
            Vater: parseInt(Moments.get_person_form_data("Vater")),
            Mutter: parseInt(Moments.get_person_form_data("Mutter")),

            Nickname:Moments.get_person_form_data("Nickname"),
            Geburtsuhrzeit:Moments.get_person_form_data("Geburtsuhrzeit"),
            Sterbeuhrzeit:Moments.get_person_form_data("Sterbeuhrzeit"),
            Gestorben:Moments.get_person_form_data("Gestorben"),
            Glaube:Moments.get_person_form_data("Glaube"),
            Bild: Moments.get_person_form_data("Bild"),

            Note: Moments.get_person_form_data("Note")
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
                    Partner: parseInt(ktr.querySelector('[name="Partner"]').value),
                    Von: Moments.convertISOToDINDate(ktr.querySelector('[name="Von"]').value),
                    Bis: Moments.convertISOToDINDate(ktr.querySelector('[name="Bis"]').value),
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
                    Wann: Moments.convertISOToDINDate(ktr.querySelector('[name="Wann"]').value),
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
                    Von: Moments.convertISOToDINDate(ktr.querySelector('[name="Von"]').value),
                    Bis: Moments.convertISOToDINDate(ktr.querySelector('[name="Bis"]').value),
                    Bezeichnung: ktr.querySelector('[name="Bezeichnung"]').value,
                    Firma: ktr.querySelector('[name="Firma"]').value,
                })
            })
        }

        var Addressentr = document.querySelectorAll('[data-key="Addressen"] tbody tr')
        if (Addressentr.length > 0) {

            form.Adressen = [];

            Addressentr.forEach(ktr => {
                form.Adressen.push({
                    Id: parseInt(ktr.querySelector('[name="Id"]').value),
                    Seit: Moments.convertISOToDINDate(ktr.querySelector('[name="Seit"]').value),
                    Ort: ktr.querySelector('[name="Ort"]').value,
                    Strasse: ktr.querySelector('[name="Strasse"]').value,
                    Nummer: ktr.querySelector('[name="Nummer"]').value,
                    Land: ktr.querySelector('[name="Land"]').value,
                    Note: ktr.querySelector('[name="Note"]').value
                })
            })
        }

        if (form.Geburtstag && form.Geburtstag.length > 0)
            form.Geburtstag = Moments.convertISOToDINDate(form.Geburtstag)

        if (form.Gestorben && form.Gestorben.length > 0)
            form.Gestorben = Moments.convertISOToDINDate(form.Gestorben)


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
            html += Moments.renderTemplate("options_person", person)
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
        var viewbag = {
            Id: document.querySelectorAll('[data-tab="person"] form table[data-key="Kinder"] tbody tr').length + 1
        };
        viewbag.personOptionsHtml = Moments.get_person_options_html();
        var html = Moments.renderTemplate("person_details_Kinder", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Kinder"] tbody').innerHTML += html;

        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Kinder"] tbody button[data-delete]', Moments.kind_entfernen)

        return false;
    },
    kind_entfernen: function () {
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Kinder"] tr[data-kind="'+this.dataset.delete+'"]').remove();
        return false;
    },
    partner_hinzufuegen : function (){
        event.preventDefault();
        var viewbag = {
            Id: document.querySelectorAll('[data-tab="person"] form table[data-key="Partner"] tbody tr').length + 1
        };
        viewbag.personOptionsHtml = Moments.get_person_options_html();
        var html = Moments.renderTemplate("person_details_Partner", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Partner"] tbody').innerHTML += html;

        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Partner"] tbody button[data-delete]', Moments.partner_entfernen)

        return false;
    },
    partner_entfernen: function () {
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Partner"] tr[data-partner="'+this.dataset.delete+'"]').remove();
        return false;
    },
    ereignisse_hinzufuegen: function () {
        event.preventDefault();
        var viewbag = {
            Id: document.querySelectorAll('[data-tab="person"] form table[data-key="Ereignisse"] tbody tr').length + 1
        };
        var html = Moments.renderTemplate("person_details_Ereignisse", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Ereignisse"] tbody').innerHTML += html;

        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Ereignisse"] tbody button[data-delete]', Moments.ereignisse_entfernen)
        return false;
    },
    ereignisse_entfernen: function(){
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Ereignisse"] tr[data-ereignis="'+this.dataset.delete+'"]').remove();
        return false;
    },
    berufe_hinzufuegen: function(){
        event.preventDefault();
        var viewbag = {
            Id: document.querySelectorAll('[data-tab="person"] form table[data-key="Berufe"] tbody tr').length + 1
        };
        var html = Moments.renderTemplate("person_details_Berufe", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Berufe"] tbody').innerHTML += html;

        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Berufe"] tbody button[data-delete]', Moments.berufe_entfernen)
        return false;
    },
    berufe_entfernen: function(){
        event.preventDefault();
        document.querySelector('[data-tab="person"] form table[data-key="Berufe"] tr[data-beruf="'+this.dataset.delete+'"]').remove();
        return false;
    },
    addressen_hinzufuegen: function(){
        event.preventDefault();
        var viewbag = {
            Id: document.querySelectorAll('[data-tab="person"] form table[data-key="Addressen"] tbody tr').length + 1
        };
        var html = Moments.renderTemplate("person_details_Adressen", viewbag)
        document.querySelector('[data-tab="person"] form table[data-key="Addressen"] tbody').innerHTML += html;

        Moments.bindAll("click", '[data-tab="person"] form table[data-key="Addressen"] tbody button[data-delete]', Moments.addressen_entfernen)
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
            let id = Moments.getRouteData("id");

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

            Moments.changeRoute("personen")
        }

        return false;
    }

}, Moments)