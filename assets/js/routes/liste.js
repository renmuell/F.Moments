/**
 *  Test
 */

Moments = Object.assign({

    route_liste: function () {

        var obj;
    var divPersonList;
     function loadJSON(file, callback) {
        callback(localStorage.getItem("json_personen"))
     }

     function addPersonDetail(name, value, wrapIntoText){
       wrapIntoText = typeof wrapIntoText === 'undefined' ? true : wrapIntoText

       if (typeof value === 'undefined') return;

        var row = document.createElement("tr");

        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(name + ':'));
        row.appendChild(cell);

        var cell2 = document.createElement("td");
        cell2.appendChild(wrapIntoText ? document.createTextNode(value) : value);
        row.appendChild(cell2);

        return row;
      }

      function addPersonDetailList(name, list) {
        if (typeof list === 'undefined') return;

        var row = document.createElement("tr");

        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(name + ':'));
        row.appendChild(cell);

        var cell2 = document.createElement("td");
        list.forEach(function(item) {
          if (typeof item === 'undefined') return;
          cell2.appendChild(item);
          cell2.appendChild(document.createElement('br'));
        })

        row.appendChild(cell2);

        return row;
      }

      function tblBodyAdd(tblBody, child) {
        if (child) {
          tblBody.appendChild(child)
        }
      }

      function convertDate(date){
        if (date.indexOf("?")>-1) {
          return new Date();
        }

        var array = date.split('.')
        return new Date(
          array[2]
        , (parseInt(array[1]) - 1) + ""
        , array[0])
      }

      function holeGeschwister(person){
        var geschwister = [];

        if (person.Mutter && person.Mutter != "?"){
            geschwister = geschwister.concat(obj[person.Mutter].Kinder)
        }

        if (person.Vater && person.Vater != "?"){
            geschwister = geschwister.concat(obj[person.Vater].Kinder)
        }

        geschwister = geschwister.filter(function(item, pos) {
            return geschwister.indexOf(item) == pos;
        })

        geschwister = geschwister.filter(function(item, pos) {
            return item != person.Id;
        })

       return geschwister;
      }

      function getName(person) {
        if (person)
        {
          var name = (person.Vornamen ? person.Vornamen + ' ' : '' )+ (person.Name ? person.Name : '' );

          if (person.Geboren) {
            name = name + ' (geb. '+person.Geboren+')'
          }

          return name;
        }
        else
          return '?'
      }

      function toLink(id, value) {
        var link = document.createElement("a");
        link.href = "#"+id;
        link.innerHTML = value
        link.onclick = function(e){
            e.preventDefault();
            document.getElementById(id).scrollIntoView()
            return false;
        }
        return link
      }

     function personDetail(person) {
      var tbl     = document.createElement("table");
      tbl.id = person.Id;
      var tblBody = document.createElement("tbody");

      //tblBodyAdd(tblBody, addPersonDetail("Id", person.Id))
      tblBodyAdd(tblBody, addPersonDetail("Vornamen", person.Vornamen))
      tblBodyAdd(tblBody, addPersonDetail("Name", person.Name))
      tblBodyAdd(tblBody, addPersonDetail("Geboren", person.Geboren))

      if (person.Nickname) {
        tblBodyAdd(tblBody, addPersonDetail("Nickname", person.Nickname))
      }

      if (person.Geburtstag) {
        var vergeleich = new Date();

        if (person.Gestorben) {
          vergeleich = convertDate(person.Gestorben)
        }

        var alter = vergeleich - convertDate(person.Geburtstag)
        var ageDate = new Date(alter);
        alter = Math.abs(ageDate.getUTCFullYear() - 1970)

         tblBodyAdd(tblBody, addPersonDetail("Geburtstag", person.Geburtstag + ' (' + alter + ')'))
      }

      tblBodyAdd(tblBody, addPersonDetail("Geburtsort", person.Geburtsort))
      tblBodyAdd(tblBody, addPersonDetail("Geschlecht", person.Geschlecht))
      tblBodyAdd(tblBody, addPersonDetail("Gestorben", person.Gestorben))

      if (person.Mutter && person.Mutter != "?")
      tblBodyAdd(tblBody, addPersonDetail("Mutter", toLink(person.Mutter, getName(obj[person.Mutter])), false))

      if (person.Vater && person.Vater != "?")
      tblBodyAdd(tblBody, addPersonDetail("Vater", toLink(person.Vater,getName(obj[person.Vater])), false))

      if (person.Kinder){
        tblBodyAdd(tblBody, addPersonDetailList("Kinder (" + person.Kinder.length + ")", person.Kinder.map(x=>toLink(x, getName(obj[x])))))
      }

      if (person.Partner) {
        tblBodyAdd(tblBody, addPersonDetailList("Partner", person.Partner.map(x=>toLink(x.Id, getName(obj[x.Id]) + ' ('+x.Typ + (x.Von ? ' - '+ x.Von : '')  +')'))))
      }

      var geschwister = holeGeschwister(person);

      if (geschwister.length > 0 ){
        tblBodyAdd(tblBody, addPersonDetailList("Geschwister (" + geschwister.length + ")", geschwister.map(x=>toLink(x, getName(obj[x])))))
      }

      tblBodyAdd(tblBody, addPersonDetail("Note", person.Note))

      tbl.appendChild(tblBody);
      document.querySelector('[data-tab="liste"] main').appendChild(tbl);
     }

     loadJSON('personen.json', function(response) {
        var daten = JSON.parse(response);
        obj = {};

        daten.Personen.forEach(function(item){
          obj[item.Id] = item
        });

        divPersonList = document.createElement('div');
        divPersonList.className = "Familie";
        document.querySelector('[data-tab="liste"] main').appendChild(divPersonList);


        daten.Personen
        .sort(function(a, b){
          if (typeof a.Geburtstag == 'undefined' || a.Geburtstag.indexOf("?")>-1) {
            return -1;
          }

          if (typeof b.Geburtstag == 'undefined' || b.Geburtstag.indexOf("?")>-1) {
            return 1;
          }

          var aD = convertDate(a.Geburtstag);
          var bD = convertDate(b.Geburtstag);
          if (aD < bD) {
            return -1;
          }
          if (aD > bD) {
            return 1;
          }

          // names must be equal
          return 0;
        })
        .forEach(personDetail)
        //.forEach(personList)
     });

     function personList(person){
      var div = document.createElement('div');
      div.id = person.Id;
      div.className = "Person";

      var divMe = document.createElement("div");

      divMe.appendChild(createPersonPlate("Me", person, false))

      div.appendChild(divMe)

      var h2Eltern = document.createElement("h2");
      h2Eltern.innerHTML = "Eltern";
      div.appendChild(h2Eltern)

      var divEltern = document.createElement('div');
      divEltern.className = "Eltern";

      var list = [];

      if (person.Mutter && person.Mutter != "?"){
        list.push(obj[person.Mutter])
      } else {
        list.push(undefined)
      }

      if (person.Vater && person.Vater != "?"){
        list.push(obj[person.Vater])
      } else {
        list.push(undefined)
      }

      divEltern =  createPersonPlateList("Eltern small", list);;


      div.appendChild(divEltern)

      if (person.Partner) {
        var h2Partner = document.createElement("h2");
        h2Partner.innerHTML = "Partner (" + person.Partner.length + ")";
        div.appendChild(h2Partner)

        var divKinder = createPersonPlateList("Partner small", person.Partner.map(x=> obj[x.Id]));
        divKinder.className += " Partners";
        div.appendChild(divKinder)
      }

      var geschwister = holeGeschwister(person);

      if (geschwister.length > 0 ){
        var h2Partner = document.createElement("h2");
        h2Partner.innerHTML = "Geschwister (" + geschwister.length + ")";
        div.appendChild(h2Partner)

        var divKinder = createPersonPlateList("Gewister small", geschwister.map(x=> obj[x]));
        divKinder.className += " Gewisters";
        div.appendChild(divKinder)
      }

      if (person.Kinder){
        var h2Kinder = document.createElement("h2");
        h2Kinder.innerHTML = "Kinder (" + person.Kinder.length + ")";
        div.appendChild(h2Kinder)
        var divKinder = createPersonPlateList("Kind small", person.Kinder.map(x=> obj[x]));
        divKinder.className += " Kinder";
        div.appendChild(divKinder)
      }

      //div.innerHTML = person.Vornamen + " " + person.Name;
      divPersonList.appendChild(div);
     }

     function createPersonPlateList(wrapperClass, personList){
      var div = document.createElement("div");
      div.className = "PersonList"
      personList.forEach(function(person){
        div.appendChild(createPersonPlate(wrapperClass, person))
      })

      return div;
     }

     function createPersonPlate(wrapperClass, person, alsLink) {
        alsLink = typeof alsLink == 'undefined' ? true : alsLink;
        var divPerson = document.createElement(alsLink ? "a" : "div")
        if (alsLink && person) {
          divPerson.href = "#" + person.Id;
        }
        divPerson.className = "PersonPlate " + wrapperClass;

        var img = createImage(person);
        divPerson.appendChild(img)

        divPerson.appendChild(document.createElement("br"))

        if (person) {
          var span = document.createElement("div")
          span.innerHTML = getName(person)
          divPerson.appendChild(span)
        }

        return divPerson
     }

     function createImage(person){
      var img = document.createElement("img");

      if (typeof person === 'undefined'){
        img.src = "img/question.jpg";
      }
      else if (person.Geschlecht === "Mänlich")
        img.src = "img/man.png";
      else
        img.src = "img/woman.png";

      return img;
     }



    }

}, Moments)