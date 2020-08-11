/**
 *  Famile
 */

app = Object.assign({

    route_familie: function () {

        let FGApp = {
            PersonDirectory : {}
          , PersonenJson    : undefined
          , PersonGraph     : undefined
          , $GraphWrapper   : undefined
          , $GraphCanvas    : undefined
          , $GraphBoard     : undefined
          , $Menu           : undefined

          , Graph2dContext  : undefined

          , showDots : true

          , makierung: false
          , makierungX: 0
          , makierungY: 0
          , makierungWidth: 0
          , makierungHeight: 0

          , $personPlates: []

          , init: function(){
                if (app.FGAppInit) return;

                document.addEventListener("touchmove", function(event){ event.preventDefault(); return false;}, false);
                FGApp.loadJSON();

                app.FGAppInit = true;
             }

          , loadJSON: function () {

                FGApp.PersonenJson = app.getStorageJson("json_personen")

                if (FGApp.PersonenJson && FGApp.PersonenJson.Personen) {

                    FGApp.PersonenJson.Personen.forEach(function(person){
                        FGApp.PersonDirectory[person.Id] = person
                    })

                    FGApp.PersonGraph = app.getStorageJson("json_familie_graph")

                    if (FGApp.PersonGraph == null){
                        FGApp.PersonGraph = {
                            positions: {},
                            width: "10000px",
                            height: "10000px"
                        }
                    }

                    if (FGApp.PersonGraph.positions == ""){
                        FGApp.PersonGraph.positions = {}
                        FGApp.PersonenJson.Personen.forEach(function(person){
                            FGApp.PersonGraph.positions[person.Id] = {
                                Id : person.Id
                            , left: '0px'
                            , top: '0px'
                            , color: "lightGreen"
                            }
                        })
                    }

                    FGApp.PersonenJson.Personen.forEach(function(person){
                        if (typeof FGApp.PersonGraph.positions[person.Id] === "undefined") {
                            FGApp.PersonGraph.positions[person.Id] = {
                                Id : person.Id
                                , left: '0px'
                                , top: '0px'
                                , color: "lightGreen"
                            }
                        }
                    })

                    FGApp.PersonenJson.Personen
                    .map(person => FGApp.PersonGraph.positions[person.Id])
                    .forEach(x => { x.color = x.color ? x.color : "lightGreen"})

                    FGApp.start()
                }
            }

          , createDom: function(){
                FGApp.$GraphWrapper = document.createElement('div')
                FGApp.$GraphWrapper.id = 'FamilieGraphWrapper'
                FGApp.$GraphWrapper.style.position = 'relative'
                FGApp.$GraphWrapper.style.height = '100%'
                FGApp.$GraphWrapper.style.width = '100%'
                FGApp.$GraphWrapper.style.overflow = 'scroll'
                FGApp.$GraphWrapper.addEventListener("touchmove", function(event){ event.preventDefault(); return false;}, false);
                document.querySelector('[data-tab="familie"] main').appendChild(FGApp.$GraphWrapper)


                FGApp.$GraphCanvas = document.createElement('canvas')
                FGApp.$GraphCanvas.id = 'FamilieGraphCanvas'
                FGApp.$GraphCanvas.style.position = "absolute"
                FGApp.$GraphCanvas.style.left = "0px"
                FGApp.$GraphCanvas.style.top = "0px"
                FGApp.$GraphCanvas.style.opacity = "0.8"

                FGApp.$GraphCanvas.style.height = FGApp.PersonGraph.height
                FGApp.$GraphCanvas.style.width = FGApp.PersonGraph.width
                FGApp.$GraphCanvas.height = parseInt(FGApp.PersonGraph.height)
                FGApp.$GraphCanvas.width = parseInt(FGApp.PersonGraph.width)
                FGApp.$GraphWrapper.appendChild(FGApp.$GraphCanvas)

                //setDPI(FGApp.$GraphCanvas, 96/window.devicePixelRatio)
                FGApp.Graph2dContext = document.getElementById(FGApp.$GraphCanvas.id).getContext('2d')

                FGApp.$GraphBoard = document.createElement('div')
                FGApp.$GraphBoard.id = 'FamilieGraphBoard'

                if (FGApp.showDots) {
                    FGApp.$GraphBoard.className = "dotted"
                }

                FGApp.$GraphBoard.style.position = "absolute"
                FGApp.$GraphBoard.style.left = "0px"
                FGApp.$GraphBoard.style.top = "0px"
                FGApp.$GraphBoard.style.height = FGApp.PersonGraph.height
                FGApp.$GraphBoard.style.width = FGApp.PersonGraph.width

                FGApp.$GraphBoard.onmousedown = function (event){
                    if (event.which === 1) {
                        FGApp.makierung = true;
                        FGApp.makierungX = event.offsetX
                        FGApp.makierungY = event.offsetY
                        FGApp.$personPlates.forEach(x => x.className = "")
                        FGApp.$personPlates.forEach(x => x.style.pointerEvents = "none")
                        FGApp.draw()
                    }
                }

                FGApp.Graph2dContext.strokeStyle = 'rgba(0,0,255,0.1)';
                FGApp.Graph2dContext.fillStyle = 'rgba(0,0,255,0.1)';
                FGApp.Graph2dContext.lineWidth = 1
                FGApp.Graph2dContext.lineCap="round";
                FGApp.$GraphBoard.onmousemove = function(event){
                    if (FGApp.makierung){
                        FGApp.makierungWidth = event.offsetX - FGApp.makierungX
                        FGApp.makierungHeight = event.offsetY - FGApp.makierungY
                        if (Math.random()*100 > 89)
                            FGApp.draw()
                    }
                }

                FGApp.$GraphBoard.onmouseup = function(event){
                    if (FGApp.makierung){

                        if (FGApp.makierungWidth < 0) {
                            FGApp.makierungWidth = FGApp.makierungWidth * -1
                            FGApp.makierungX = FGApp.makierungX - FGApp.makierungWidth
                        }

                        if (FGApp.makierungHeight < 0) {
                            FGApp.makierungHeight = FGApp.makierungHeight * -1
                            FGApp.makierungY = FGApp.makierungY - FGApp.makierungHeight
                        }

                        FGApp.getAllPersonsInArea(
                            FGApp.makierungX
                          , FGApp.makierungY
                          , FGApp.makierungX + FGApp.makierungWidth
                          , FGApp.makierungY + FGApp.makierungHeight)
                        .forEach(person => document.getElementById(person.Id).className = "marked")

                        FGApp.$personPlates.forEach(x => x.style.pointerEvents = "auto")

                        FGApp.makierung = false
                        FGApp.makierungX = 0
                        FGApp.makierungY = 0
                        FGApp.makierungWidth = 0
                        FGApp.makierungHeight = 0
                        FGApp.draw()
                    }
                }

                FGApp.$GraphWrapper.appendChild(FGApp.$GraphBoard)

                FGApp.addButtonToMenu("Get Grap Json", function(){
                    FGApp.createPersonGraphJson()
                })

                FGApp.addButtonToMenu("Align Marked Horizontal", function(){
                    var maxY,minY, centerY

                    document.querySelectorAll('.marked')
                    .forEach(function(elm){
                        var x = parseInt(elm.style.top)
                        if (maxY) {
                            maxY = x > maxY ? x : maxY
                            minY = x < minY ? x : minY
                        } else {
                            maxY = x
                            minY = x
                        }
                    })

                    centerY = maxY - Math.round((maxY - minY)/2)

                    document.querySelectorAll('.marked')
                    .forEach(function(elm){
                        FGApp.setPersonPlate(elm, parseInt(elm.style.left), centerY)
                    })

                    FGApp.draw()
                })

                var colorPicker = FGApp.addColorPickerToMenu()

                FGApp.addButtonToMenu("Color Marked", function(){
                    document.querySelectorAll('.marked')
                    .forEach(function(elm){
                        elm.setAttribute('data-color', colorPicker.value)
                        FGApp.PersonGraph.positions[elm.id].color = colorPicker.value
                        FGApp.draw()
                    })
                })

                FGApp.addButtonToMenu("Save Images", function(){
                    var backupWidth = FGApp.$GraphWrapper.style.width
                    var backupHeight = FGApp.$GraphWrapper.style.height
                    FGApp.$GraphWrapper.style.width = FGApp.$GraphBoard.style.width
                    FGApp.$GraphWrapper.style.height = FGApp.$GraphBoard.style.height
                    document.querySelector('body > nav').style.display = "none"
                    document.querySelector('[data-tab="familie"] > div > nav').style.display = "none"
                    document.querySelector("html").style.width = FGApp.$GraphBoard.style.width
                    document.querySelector("html").style.height = FGApp.$GraphBoard.style.height
                    html2canvas(FGApp.$GraphWrapper, {
                      onrendered: function(canvas) {
                        canvas.toBlob(function(blob) {
                            FGApp.$GraphWrapper.style.width = backupWidth
                            FGApp.$GraphWrapper.style.height = backupHeight

                            saveAs(blob, "FamilyGrap.png");

                            document.querySelector('body > nav').style.display = "block"
                            document.querySelector('[data-tab="familie"] > div > nav').style.display = "block"
                            document.querySelector("html").style.width = "100%"
                            document.querySelector("html").style.height ="100%"
                        });
                      }
                    });
                })
           }

          , addButtonToMenu: function(text, clickCallback){
                let button = document.createElement('button')

                button.innerHTML = text
                button.style.float = "right"
                button.style.background = "none"
                button.style.borderRadius = "0"
                button.onmouseup = clickCallback

                let li = document.createElement("li");
                li.appendChild(button)

                document.querySelector('[data-tab="familie"] nav ul').appendChild(li)
            }
          , addColorPickerToMenu:function(){
                let colorPicker = document.createElement('input')
                colorPicker.type = "color"
                colorPicker.id = "ColorPicker"
                colorPicker.style.float = "right"
                colorPicker.style.height = "38px"
                colorPicker.style.border = "none"

                let li = document.createElement("li");
                li.appendChild(colorPicker)

                document.querySelector('[data-tab="familie"] nav ul').appendChild(li)
                return colorPicker
           }
          , draw: function(){
                FGApp.Graph2dContext.clearRect(0, 0, FGApp.$GraphCanvas.width, FGApp.$GraphCanvas.height);
                 document.querySelectorAll('.familyPlate')
                        .forEach((f) => FGApp.$GraphBoard.removeChild(f))
                FGApp.PersonenJson.Personen.forEach(function(person){


                    if (person.Mutter)
                        FGApp.drawLineFromPersonToPerson(person
                            , FGApp.PersonDirectory[person.Mutter]
                            , FGApp.personWidth/2
                            , FGApp.personHeiht/4
                            , FGApp.personWidth/2
                            , FGApp.personHeiht/4)
                    if (person.Vater)
                        FGApp.drawLineFromPersonToPerson(person
                            , FGApp.PersonDirectory[person.Vater]
                            , FGApp.personWidth/2
                            , FGApp.personHeiht/4
                            , FGApp.personWidth/2
                            , FGApp.personHeiht/4)
                    if (person.Partner){

                        person.Partner.forEach(function(partner){
                            if (partner.Typ =="Ehe")
                                FGApp.addFamilyName(person, partner);
                            FGApp.drawLineFromPersonToPerson2(
                                  person
                                , FGApp.PersonDirectory[partner.Partner]
                                , FGApp.personWidth/2
                                , FGApp.personHeiht/4
                                , FGApp.personWidth/2
                                , FGApp.personHeiht/4)
                        })
                    }
                })

                FGApp.Graph2dContext.fillRect(FGApp.makierungX, FGApp.makierungY, FGApp.makierungWidth, FGApp.makierungHeight);

           }
          , addFamilyName(person, partner){
                if (person.Geschlecht == "Mänlich") {
                let $namePlate = document.createElement('div')
                $namePlate.className = "familyPlate"
                $namePlate.style.position = "absolute"

                var person1X = parseInt(FGApp.PersonGraph.positions[person.Id].left)
                var person2X = parseInt(FGApp.PersonGraph.positions[partner.Partner].left)

                if (person1X < person2X) {
                    $namePlate.style.left = (person1X + (FGApp.personWidth/2)) + "px"
                } else {
                    $namePlate.style.left = (person2X + (FGApp.personWidth/2)) + "px"
                }

                $namePlate.style.top = (parseInt(FGApp.PersonGraph.positions[person.Id].top)-34)+"px"
                $namePlate.style.width = ((FGApp.personWidth)) + "px"
                $namePlate.style.height = "30px"
                $namePlate.style.padding = "2px"
                $namePlate.style.textAlign = 'center'
                $namePlate.style.backgroundColor = FGApp.PersonGraph.positions[person.Id].color
                $namePlate.style.color = invertColor(FGApp.PersonGraph.positions[person.Id].color)
                //$namePlate.style.border = '1px solid rgba(0,0,0,.2)'
                $namePlate.style.borderTopLeftRadius = '5px'
                $namePlate.style.borderTopRightRadius = '5px'

                $namePlate.style.fontSize = "18px"

                $namePlate.style.fontFamily = "Lato"

                $namePlate.innerHTML = person.Name;
                FGApp.$GraphBoard.appendChild($namePlate)
                }
            }
          , drawLineFromPersonToPerson2(person1, person2, person1XOffset, person1YOffset, person2XOffset, person2YOffset){
                if (person1 && person2) {
                   var backupLineWidth = FGApp.Graph2dContext.lineWidth;
                   FGApp.Graph2dContext.beginPath();
                   FGApp.Graph2dContext.lineWidth = FGApp.personWidth/2;
                   FGApp.Graph2dContext.strokeStyle = FGApp.PersonGraph.positions[person2.Id].color;
                   FGApp.Graph2dContext.moveTo(
                     parseInt(FGApp.PersonGraph.positions[person1.Id].left) + person1XOffset
                   , parseInt(FGApp.PersonGraph.positions[person1.Id].top) + person1YOffset)

                   FGApp.Graph2dContext.lineTo(
                     parseInt(FGApp.PersonGraph.positions[person2.Id].left) + person2XOffset
                   , parseInt(FGApp.PersonGraph.positions[person2.Id].top) + person2YOffset)
                   FGApp.Graph2dContext.stroke();
                   FGApp.Graph2dContext.lineWidth = backupLineWidth;
               }
            }
          , drawLineFromPersonToPerson(person1, person2, person1XOffset, person1YOffset, person2XOffset, person2YOffset) {

                if (person1 && person2) {
                   /*FGApp.Graph2dContext.beginPath();
                   FGApp.Graph2dContext.strokeStyle = FGApp.PersonGraph.positions[person2.Id].color;
                   FGApp.Graph2dContext.moveTo(
                     parseInt(FGApp.PersonGraph.positions[person1.Id].left) + person1XOffset
                   , parseInt(FGApp.PersonGraph.positions[person1.Id].top) + person1YOffset)

                   FGApp.Graph2dContext.lineTo(
                     parseInt(FGApp.PersonGraph.positions[person2.Id].left) + person2XOffset
                   , parseInt(FGApp.PersonGraph.positions[person2.Id].top) + person2YOffset)
                   FGApp.Graph2dContext.stroke();*/

                   FGApp.drawCurve(
                     parseInt(FGApp.PersonGraph.positions[person1.Id].left) + person1XOffset
                   , parseInt(FGApp.PersonGraph.positions[person1.Id].top) + person1YOffset
                   , parseInt(FGApp.PersonGraph.positions[person2.Id].left) + person2XOffset
                   , parseInt(FGApp.PersonGraph.positions[person2.Id].top) + person2YOffset
                   , FGApp.PersonGraph.positions[person2.Id].color)
               }
           }
          , setPersonPlate: function (elm, left, top){
                left = 50 * Math.ceil(left / 50)
                top = 50 * Math.ceil(top / 50)
                elm.style.left = left + "px"
                elm.style.top = top + "px"

                FGApp.PersonGraph.positions[elm.id].left = elm.style.left
                FGApp.PersonGraph.positions[elm.id].top = elm.style.top
            }
          , getAllPersonsInArea : function(left,top, right, bottom) {
                return FGApp.PersonenJson.Personen
                .map(person => FGApp.PersonGraph.positions[person.Id])
                .filter(position =>
                    (left   < (parseInt(position.left) + FGApp.personWidth) &&
                      right  > parseInt(position.left) &&
                      bottom > parseInt(position.top) &&
                      top    < (parseInt(position.top) + FGApp.personHeiht)))
                .map(position => FGApp.PersonDirectory[position.Id])
          }

          , start: function(){
                FGApp.createDom()
                FGApp.PersonenJson.Personen.forEach(FGApp.personCallback)
                FGApp.draw()
            }
          , personWidth: 100
          , personHeiht: 100
          , personFontSize: "14px"

          , personCallback: function(person) {
                let $personPlate = document.createElement('div')
                $personPlate.id = person.Id

                $personPlate.style.width = FGApp.personWidth + 'px'
                $personPlate.style.height = FGApp.personHeiht + 'px'
                $personPlate.style.position = 'absolute'
                //$personPlate.style.border = "2px solid "+ FGApp.PersonGraph.positions[person.Id].color
                //$personPlate.style.borderRadius = "10px"
                //$personPlate.style.backgroundColor = "white"


                $personPlate.setAttribute(
                    'data-color'
                 ,  FGApp.PersonGraph.positions[person.Id].color)

                FGApp.setPersonPlate(
                     $personPlate
                   , parseInt(FGApp.PersonGraph.positions[person.Id].left)
                   , parseInt(FGApp.PersonGraph.positions[person.Id].top))

                $personPlate.onmousedown = function(event){
                    if (event.which === 1){
                        var elm = this;
                        drag(elm, event, function(){
                            FGApp.draw()
                        })
                    }
                }

                $personPlate.ondblclick = function (event) {
                    if (event.which === 1){
                        app.changeRoute("person", {
                            id: this.id
                        })
                    }
                }

                let $personImage = FGApp.createImage(person)
                $personImage.style.width = ((FGApp.personWidth)/2) + 'px'
                $personImage.style.height = ((FGApp.personWidth)/2) + 'px'
                $personImage.style.marginLeft = ((FGApp.personWidth)/4) + 'px'
                $personImage.style.border = "1px solid #ccc"
                $personImage.style.borderRadius = ((FGApp.personWidth)/4) + 'px'
                $personPlate.appendChild($personImage)

                let $namePlate = document.createElement('div')
                $namePlate.style.textAlign = 'center'
                $namePlate.style.backgroundColor = 'rgba(255,255,255,.7)'
                $namePlate.style.border = '1px solid rgba(0,0,0,.2)'
                $namePlate.style.borderRadius = '5px'
                $namePlate.style.padding = '2px'

                $namePlate.style.fontSize = FGApp.personFontSize
                $namePlate.style.fontFamily = "Lato"

                $namePlate.innerHTML = FGApp.getPersonName(person)

                if (person.Geburtstag){
                    $namePlate.innerHTML += "<hr>"
                    $namePlate.innerHTML += "* " + person.Geburtstag
                }

                if (person.Gestorben){
                    $namePlate.innerHTML += "<br>"
                    $namePlate.innerHTML += "† " + person.Gestorben
                }

                $personPlate.appendChild($namePlate)

                FGApp.$GraphBoard.appendChild($personPlate)

                FGApp.$personPlates.push($personPlate)
            }
          , drawCurve: function(x, y, xx, yy, color){
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
                FGApp.Graph2dContext.beginPath();
                FGApp.Graph2dContext.strokeStyle = color;
                for(var isFirst = true,            /// first point is moveTo, rest lineTo
                        angle = 1.5 * Math.PI,     /// start angle in radians
                        goal = 2 * Math.PI,        /// goal angle
                        x, y; angle < goal; angle += steps) {

                    /// calculate x and y using cos/sin
                    x = c1.x + mx * Math.cos(angle);
                    y = c1.y + my * Math.sin(angle);

                    /// move or draw line
                    (isFirst) ? FGApp.Graph2dContext.moveTo(x, y) : FGApp.Graph2dContext.lineTo(x, y);
                    isFirst = false;
                }

                /// second box
                for(var isFirst = true,
                        angle = Math.PI,
                        goal = 0.5 * Math.PI,
                        x, y;angle > goal; angle -= steps) {

                    x = c2.x + mx * Math.cos(angle);
                    y = c2.y + my * Math.sin(angle);

                    (isFirst) ? FGApp.Graph2dContext.lineTo(x, y) : FGApp.Graph2dContext.lineTo(x, y);
                    isFirst = false;
                }

                FGApp.Graph2dContext.stroke();
            }
          , getPersonName: function(person){
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

          , createImage: function(person){
                var img = document.createElement("img");

                if (typeof person === 'undefined'){
                    img.src = "assets/img/familyGraph/question.jpg";
                }
                else if (person.Bild){
                    img.src = person.Bild;
                }
                else if (person.Geschlecht === "Männlich")
                    img.src = "assets/img/familyGraph/man.png";
                else
                    img.src = "assets/img/familyGraph/woman.png";

                return img;
            }

          , createPersonGraphJson: function (){
                FGApp.saveToJsonDatei("personenGraph", JSON.stringify(FGApp.PersonGraph))
            }
          , saveToJsonDatei: function(name, content) {
                var blob = new Blob([content], {type: "application/json;charset=utf-8"});
                saveAs(blob, name + ".json")
            }
          , copyToClipboard: function (text) {
              var popup = document.createElement('div')
              popup.style.position = 'fixed'
              popup.style.backgroundColor = "rgba(0,0,0,.2)"
              popup.style.left = "0px"
              popup.style.top = "0px"
              popup.style.bottom = "0px"
              popup.style.right = "0px"
              popup.style.border = "100px solid rgba(0,0,0,.2)"

              var textarea = document.createElement('textarea')
              textarea.innerHTML = text
              textarea.style.position = "absolute"
              textarea.style.left = "0px"
              textarea.style.top = "0px"
              textarea.style.bottom = "100px"
              textarea.style.width = "100%";
              popup.appendChild(textarea)

              var button = document.createElement('button')
              button.innerHTML = "Ok"
              button.style.position = "absolute"
              button.style.left = "0px"
              button.style.height = "100px"
              button.style.bottom = "0px"
              button.style.width = "100%";
              button.onmouseup = function(event) {
                document.querySelector('[data-tab="familie"] main').removeChild(popup)
              }
              popup.appendChild(button)

              document.querySelector('[data-tab="familie"] main').appendChild(popup)

              textarea.select()
            }
        }

        FGApp.init()

        /* Drag ------------------- */

        function drag(elementToDrag, event, callback)
        {
           // The mouse position (in window coordinates)
           // at which the drag begins
           var startX = event.clientX, startY = event.clientY;

           // The original position (in document coordinates) of the
           // element that is going to be dragged. Since elementToDrag is
           // absolutely positioned, we assume that its offsetParent is the
           //document bodt.
           var origX = elementToDrag.offsetLeft , origY = elementToDrag.offsetTop;

           // Even though the coordinates are computed in different
           // coordinate systems, we can still compute the difference between them
           // and use it in the moveHandler() function. This works because
           // the scrollbar positoin never changes during the drag.
           var deltaX = startX - origX, deltaY = startY - origY;

           elementToDrag.className = 'drag';

           // Register the event handlers that will respond to the mousemove events
           // and the mouseup event that follow this mousedown event.
           if (document.addEventListener) //DOM Level 2 event model
           {
               // Register capturing event handlers
               document.addEventListener("mousemove", moveHandler, true);
               document.addEventListener("mouseup", upHandler, true);
           }
           else if (document.attachEvent) //IE 5+ Event Model
           {
               //In the IE event model, we capture events by calling
               //setCapture() on the element to capture them.
               elementToDrag.setCapture();
               elementToDrag.attachEvent("onmousemove", moveHandler);
               elementToDrag.attachEvent("onmouseup", upHandler);
               // Treat loss of mouse capture as a mouseup event.
               elementToDrag.attachEvent("onclosecapture", upHandler);
           }
           else //IE 4 Event Model
           {
               // In IE 4, we can't use attachEvent() or setCapture(), so we set
               // event handlers directly on the document object and hope that the
               // mouse event we need will bubble up.
               var oldmovehandler = document.onmousemove; //used by upHandler()
               var olduphandler = document.onmouseup;
               document.onmousemove = moveHandler;
               document.onmouseup = upHandler;
           }

           // We've handled this event. Don't let anybody else see it.
           if (event.stopPropagation) event.stopPropagation();    //  DOM Level 2
           else event.cancelBubble = true;                        //  IE

           // Now prevent any default action.
           if (event.preventDefault) event.preventDefault();      //  DOM Level 2
           else event.returnValue = false;                        //  IE

           /**
            * This is the handler that captures mousemove events when an element
            * is being dragged. It is responsible for moving the element.
            **/
            function moveHandler(e)
            {
                if (!e) e = window.event; //  IE Event Model

                // Move the element to the current mouse position, adjusted as
                // necessary by the offset of the initial mouse-click.
                var offsetX = parseInt(elementToDrag.style.left);
                var offsetY = parseInt(elementToDrag.style.top);
                FGApp.setPersonPlate(elementToDrag, e.clientX - deltaX, e.clientY - deltaY)
                offsetX -= parseInt(elementToDrag.style.left);
                offsetY -= parseInt(elementToDrag.style.top);

                document.querySelectorAll('.marked').forEach(function(elm){
                  FGApp.setPersonPlate(elm, parseInt(elm.style.left) - offsetX, parseInt(elm.style.top) - offsetY )
                })

                // And don't let anyone else see this event.
                if (e.stopPropagation) e.stopPropagation();       // DOM Level 2
                else e.cancelBubble = true;                       // IE
            }

            /**
             * This is the handler that captures the final mouseup event that
             * occurs at the end of a drag.
             **/
             function upHandler(e)
             {
                 if (!e) e = window.event;    //IE Event Model

                 // Unregister the capturing event handlers.
                 if (document.removeEventListener) // DOM event model
                  {
                      document.removeEventListener("mouseup", upHandler, true);
                      document.removeEventListener("mousemove", moveHandler, true);
                  }
                  else if (document.detachEvent)  //  IE 5+ Event Model
                  {
                      elementToDrag.detachEvent("onlosecapture", upHandler);
                      elementToDrag.detachEvent("onmouseup", upHandler);
                      elementToDrag.detachEvent("onmousemove", moveHandler);
                      elementToDrag.releaseCapture();
                  }
                  else    //IE 4 Event Model
                  {
                      //Restore the original handlers, if any
                      document.onmouseup = olduphandler;
                      document.onmousemove = oldmovehandler;
                  }

                  // Rene
                  elementToDrag.className = '';
                  callback()

                  //  And don't let the event propagate any further.
                  if (e.stopPropagation) e.stopPropagation(); //DOM Level 2
                  else e.cancelBubble = true;                 //IE
             }
        }

        function closeMe(elementToClose)
        {
           elementToClose.innerHTML = '';
           elementToClose.style.display = 'none';
        }

        function minimizeMe(elementToMin, maxElement)
        {
           elementToMin.style.display = 'none';
        }

    }


}, app)