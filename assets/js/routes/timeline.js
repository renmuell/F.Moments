/**
 *  Timeline
 */

(function(){

    app = Object.assign({

        route_timeline: function () {

            timeline = [];

            document.querySelector('[data-tab="timeline"] main').innerHTML = "";

            var json = app.getStorageJson("json_personen")
            var daten = json;

            if (daten === null) {
                return;
            }

            obj = {};
            daten.Personen.forEach(function(item){
                obj[item.Id] = item
            });

            var divTimeline = document.createElement('div');
            divTimeline.style.position = "absolute";
            divTimeline.style.left = "100px"
            divTimeline.style.top = "20px"
            divTimeline.className = "Timeline";

            document.querySelector('[data-tab="timeline"] main').appendChild(divTimeline)

            var divTimelineWrapper = document.createElement('div');
            divTimelineWrapper.style.position = "absolute";
            divTimelineWrapper.style.left = "400px"
            divTimelineWrapper.style.top = "124px"

            document.querySelector('[data-tab="timeline"] main').appendChild(divTimelineWrapper)

            daten.Personen
            .forEach(function(person){
              if (person.Geburtstag){
                addTimeline(person.Geburtstag, "Geboren", [person])
              }
              if (person.Gestorben){
                addTimeline(person.Gestorben, "Gestorben", [person])
              }
              if (person.Partner) {
                person.Partner.forEach(function(x){
                  if(x.Von){
                    var canAdd = true;

                    timeline.forEach(function(y){
                      if (y.datumOrginal == x.Von
                        && y.personen.includes(person)
                        && y.personen.includes(obj[x.Partner])){
                        canAdd = false;
                      }

                    })

                    if (canAdd)
                      addTimeline(x.Von, "Ehe", [ person, obj[x.Partner]])
                  }
                })
              }
            })

            timeline
            .sort(function(a, b){
              if (a.datum < b.datum) {
                return -1;
              }
              if (a.datum > b.datum) {
                return 1;
              }
              return 0;
            })

            if (timeline.length == 0) {
              return;
            }

            var minDatumJahrhunder = timeline[0].jahrHundert
            var maxDatumJahrhunder = timeline[timeline.length -1 ].jahrHundert
            var jahrHundertDivs = {};
            var ind = 0;
            for (var i = minDatumJahrhunder; i <= maxDatumJahrhunder; i++) {

                var timeDiv = document.createElement('div');

                timeDiv.style.height = "800px";// daysOfJahrHundert[i] * 22 + "px"
                timeDiv.style.position = "relative";
                timeDiv.style.borderLeft = "1px solid black";
                divTimeline.appendChild(timeDiv);

                var span = document.createElement('span');
                span.innerHTML = i + "00";
                span.style.position = "absolute";
                span.style.width = "100px";
                span.style.height = "50px";
                span.style.left = "-110px"
                span.style.top = "-25px"
                span.style.textAlign = "right"
                span.style.horizontalAlign = "middle"
                span.style.lineHeight = "50px"
                timeDiv.appendChild(span)

                var dot = document.createElement('div');
                  dot.style.height = "1px";
                  dot.style.width = "7px";
                dot.style.backgroundColor = "black";
                dot.style.position = "absolute";
                dot.style.left = "-4px"
                  dot.style.top = "-1px"
                timeDiv.dataset.index = ind;
                timeDiv.appendChild(dot)

                jahrHundertDivs[i] = timeDiv;
                ind++;

                if ((i+1) > maxDatumJahrhunder){
                  var span = document.createElement('span');
                  span.innerHTML = (i+1) + "00";
                  span.style.position = "absolute";
                  span.style.width = "100px";
                  span.style.height = "50px";
                  span.style.left = "-110px"
                  span.style.bottom = "-25px"
                  span.style.textAlign = "right"
                  span.style.horizontalAlign = "middle"
                  span.style.lineHeight = "50px"
                  timeDiv.appendChild(span)

                  var dot = document.createElement('div');
                  dot.style.height = "1px";
                  dot.style.width = "7px";
                dot.style.backgroundColor = "black";
                  dot.style.position = "absolute";
                  dot.style.left = "-4px"
                  dot.style.bottom = "-1px"

                  timeDiv.appendChild(dot)
                }
            }

            var height = 0;
            var dot1 = [];
            var dot2 = [];

            function getAlter(geburtstag, vergeleich){
              var alter = vergeleich - geburtstag
              var ageDate = new Date(alter);
              return Math.abs(ageDate.getUTCFullYear() - 1970)
            }

            function showAlter(p, time){
                if (p.Geburtstag){
                  var alter = getAlter(toDate(p.Geburtstag), time.datum);
                  return time.type != "Geboren" ? " (" + alter +")" : "";
                } else {
                  return ""
                }

            }

            timeline
            .forEach(function(time){
                var timeDiv = document.createElement('div');
                timeDiv.className = "Timeline";
                timeDiv.innerHTML = EVENT_TYPES[time.type]
                var personNames = "";
                timeDiv.style.position = "relative";
                timeDiv.style.backgroundColor = "rgba(0,0,0,.1)"
                timeDiv.style.border = "1px solid white";
                timeDiv.style.borderBottom = "none";
                timeDiv.style.marginBottom ="10px"
                timeDiv.style.paddingLeft = "10px"
                timeDiv.style.paddingRight = "10px"
                timeDiv.style.height = "20px"
                timeDiv.style.fontSize = "18px"
                height += 15;
                time.personen.forEach((p) => personNames += ((personNames != "" ? " und ": "" ) + getName(p) + showAlter(p, time)))
                timeDiv.innerHTML += " " + personNames;

                divTimelineWrapper.appendChild(timeDiv);

                var timeSpan = document.createElement('div');
                timeSpan.innerHTML = time.datumOrginal
                timeSpan.style.position = "absolute";
                timeSpan.style.paddingLeft = "10px"
                timeSpan.style.paddingRight = "10px"
                timeSpan.style.backgroundColor = "rgba(255,255,255,1)"
                timeSpan.style.left = "-100px"
                timeSpan.style.top = "0px"
                timeSpan.style.height = "20px"
                timeDiv.appendChild(timeSpan)


                var bound = timeDiv.getBoundingClientRect();

                dot1.push({ top:bound.top + 2, left:bound.left })

                var dot = document.createElement('div');
                dot.style.height = "0";
                dot.style.width = "0";
                dot.style.backgroundColor = "rgba(0,0,0,.4)";
                dot.style.border = "4px solid rgba(0,0,0,.4)";
                dot.style.borderRadius = "4px"
                dot.style.borderTopRightRadius = "0px"
                dot.style.borderBottomRightRadius = "0px"
                dot.style.borderRight = "none"
                dot.style.position = "absolute";
                dot.style.left = "-105px"
                dot.style.top = "2px"

                timeDiv.appendChild(dot)

                dot = document.createElement('div');
                dot.style.height = "6px";
                dot.style.width = "6px";
                dot.style.backgroundColor = "rgba(255,0,0,.3)";
                dot.style.border = "1px solid transparent";
                dot.style.borderRadius = "4px"
                dot.style.position = "absolute";
                dot.style.left = "-4px"
                dot.style.top = Math.floor((parseInt(jahrHundertDivs[time.jahrHundert].style.height)) * (time.tagImJahrhundertProzent)) + "px"

                jahrHundertDivs[time.jahrHundert].appendChild(dot)

                var bound = dot.getBoundingClientRect();
                dot2.push({ top:(bound.top + 2), left:bound.left })

            })

            var canvas = document.createElement('canvas');
            canvas.style.position = "absolute";
            canvas.style.left = "100px"
            canvas.style.top = "-90px"
            canvas.style.width = "200px"
            canvas.style.height =800*3 + "px"
            canvas.height = 800*3;
            canvas.width = 100;
            canvas.style.zIndex = "-1"

            document.querySelector('[data-tab="timeline"] main').appendChild(canvas);

            var context = canvas.getContext("2d");

            context.fillStyle = "green"
            context.strokeStyle = "green"

            for (var i = dot2.length - 1; i >= 0; i--) {
              drawCurve(context, 100, dot1[i].top-16,0, dot2[i].top-18, "rgba(0,0,0,.2)" )
            }
        }

    }, app)
    var obj;
    var timeline = [];
    var divPersonList;
    var TAGE_IM_JAHRHUNDERT = 35600;
    var EVENT_TYPES = {
      Ehe : " &#9901;", //"⚭",
      Geboren: "*",
      Gestorben: "  &#8224;",//"†"
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
     function toDate(date){
      if (date){
        var array = date.split('.')
        return new Date(
          array[2]
        , array[1].indexOf("?") > -1 ? "0" : (parseInt(array[1]) - 1) + ""
        , array[0].indexOf("?") > -1 ?  "1" : array[0])
        }
     }
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    function daysBetween(one, another) {
      return Math.round(Math.abs((+one) - (+another))/8.64e7);
    }
     var pastDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
     var pastDaysSchaltJahr = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

     var daysOfJahrHundert = {
      "18": 36524,
      "19": 36524,
      "20": 36525
     }

     function leapYear(year)
     {
       return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
     }

      function getDaysInJahrhundert(datum){
          return daysBetween(new Date(Math.floor((datum.getFullYear()/100)) + "00",0,1), datum);
     }

     function addTimeline(datum, type, personen){

      timeline.push({
        jahrHundert: Math.floor((toDate(datum).getFullYear()/100)),
        tagImJahrhundertProzent: getDaysInJahrhundert(toDate(datum))/daysOfJahrHundert[Math.floor((toDate(datum).getFullYear()/100))],
        datumOrginal: datum,
        datum: toDate(datum),
        personen: personen,
        type: type
      })
     }


    function drawCurve(context, x, y, xx, yy, color){
        /// set up some values
        var p1 = {x:x, y:y},                /// point 1
            p2 = {x:xx, y:yy},           /// point 2
            mx,
            my,
            c1,
            c2
            //rm - style change :) dragon style
            dragonStyle = false,
            steps = 0.05;                  /// curve resolution

        if (dragonStyle) {
            mx = (p2.x - p1.x) * 0.45;      /// mid-point between point 1 and 2
            my = (p2.y - p1.y) * 0.55;
        }else {
            mx = (p2.x - p1.x) * 0.5;      /// mid-point between point 1 and 2
            my = (p2.y - p1.y) * 0.5;
        }

        c1 = {x: p1.x, y: p1.y + my};  /// create center point objects
        c2 = {x: p2.x, y: p2.y - my};

        /// render the smooth curves using 1/4 ellipses
        context.beginPath();
        context.strokeStyle = color;
        for(var isFirst = true,            /// first point is moveTo, rest lineTo
                angle = 1.5 * Math.PI,     /// start angle in radians
                goal = 2 * Math.PI,        /// goal angle
                x, y; angle < goal; angle += steps) {

            /// calculate x and y using cos/sin
            x = c1.x + mx * Math.cos(angle);
            y = c1.y + my * Math.sin(angle);

            /// move or draw line
            (isFirst) ? context.moveTo(x, y) : context.lineTo(x, y);
            isFirst = false;
        }

        /// second box
        for(var isFirst = true,
                angle = Math.PI,
                goal = 0.5 * Math.PI,
                x, y;angle > goal; angle -= steps) {

            x = c2.x + mx * Math.cos(angle);
            y = c2.y + my * Math.sin(angle);

            (isFirst) ? context.lineTo(x, y) : context.lineTo(x, y);
            isFirst = false;
        }

        context.stroke();
    }

}())

