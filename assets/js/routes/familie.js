/**
 *  Famile
 */

Moments = Object.assign({

    route_familie: function () {

        let FGMoments = {
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

          , touchMarking: false
          , touchMoving: false

          , init: function(){
                if (Moments.FGAppInit) return;

                FGMoments.loadJSON();

                Moments.FGAppInit = true;
             }

          , loadJSON: function () {

                FGMoments.PersonenJson = Moments.getStorageJson("json_personen")

                if (FGMoments.PersonenJson && FGMoments.PersonenJson.Personen) {

                    FGMoments.PersonenJson.Personen.forEach(function(person){
                        FGMoments.PersonDirectory[person.Id] = person
                    })

                    FGMoments.PersonGraph = Moments.getStorageJson("json_familie_graph")

                    if (FGMoments.PersonGraph == null){
                        FGMoments.PersonGraph = {
                            positions: {},
                            width: "1000px",
                            height: "1000px"
                        }
                    }

                    if (FGMoments.PersonGraph.positions == ""){
                        FGMoments.PersonGraph.positions = {}
                        FGMoments.PersonenJson.Personen.forEach(function(person){
                            FGMoments.PersonGraph.positions[person.Id] = {
                                Id : person.Id
                            , left: '0px'
                            , top: '0px'
                            , color: "lightGreen"
                            }
                        })
                    }

                    FGMoments.PersonenJson.Personen.forEach(function(person){
                        if (typeof FGMoments.PersonGraph.positions[person.Id] === "undefined") {
                            FGMoments.PersonGraph.positions[person.Id] = {
                                Id : person.Id
                                , left: '0px'
                                , top: '0px'
                                , color: "lightGreen"
                            }
                        }
                    })

                    FGMoments.PersonenJson.Personen
                    .map(person => FGMoments.PersonGraph.positions[person.Id])
                    .forEach(x => { x.color = x.color ? x.color : "lightGreen"})

                    FGMoments.start()
                }
            }

          , createDom: function(){
                FGMoments.$GraphWrapper = document.createElement('div')
                FGMoments.$GraphWrapper.id = 'FamilieGraphWrapper'
                FGMoments.$GraphWrapper.style.position = 'relative'
                FGMoments.$GraphWrapper.style.height = '100%'
                FGMoments.$GraphWrapper.style.width = '100%'
                FGMoments.$GraphWrapper.style.overflow = 'scroll'
                document.querySelector('[data-tab="familie"] main').appendChild(FGMoments.$GraphWrapper)


                FGMoments.$GraphCanvas = document.createElement('canvas')
                FGMoments.$GraphCanvas.id = 'FamilieGraphCanvas'
                FGMoments.$GraphCanvas.style.position = "absolute"
                FGMoments.$GraphCanvas.style.left = "0px"
                FGMoments.$GraphCanvas.style.top = "0px"
                FGMoments.$GraphCanvas.style.opacity = "0.8"

                FGMoments.$GraphCanvas.style.height = FGMoments.PersonGraph.height
                FGMoments.$GraphCanvas.style.width = FGMoments.PersonGraph.width
                FGMoments.$GraphCanvas.height = parseInt(FGMoments.PersonGraph.height)
                FGMoments.$GraphCanvas.width = parseInt(FGMoments.PersonGraph.width)
                FGMoments.$GraphWrapper.appendChild(FGMoments.$GraphCanvas)

                FGMoments.Graph2dContext = document.getElementById(FGMoments.$GraphCanvas.id).getContext('2d')

                FGMoments.$GraphBoard = document.createElement('div')
                FGMoments.$GraphBoard.id = 'FamilieGraphBoard'

                if (FGMoments.showDots) {
                    FGMoments.$GraphBoard.className = "dotted"
                }

                FGMoments.$GraphBoard.style.position = "absolute"
                FGMoments.$GraphBoard.style.left = "0px"
                FGMoments.$GraphBoard.style.top = "0px"
                FGMoments.$GraphBoard.style.height = FGMoments.PersonGraph.height
                FGMoments.$GraphBoard.style.width = FGMoments.PersonGraph.width

                FGMoments.Graph2dContext.strokeStyle = 'rgba(0,0,255,0.1)';
                FGMoments.Graph2dContext.fillStyle = 'rgba(0,0,255,0.1)';
                FGMoments.Graph2dContext.lineWidth = 1
                FGMoments.Graph2dContext.lineCap="round";

                Moments.inputMoveElementInit(
                    FGMoments.$GraphBoard,
                    function (e) {
                        if (FGMoments.touchMarking) {
                            FGMoments.makierung = true;

                            e.setLayerXY()
                            FGMoments.makierungX = e.layerX
                            FGMoments.makierungY = e.layerY

                            FGMoments.$personPlates.forEach(x => x.classList.remove("marked"))
                            //FGMoments.$personPlates.forEach(x => x.style.pointerEvents = "none")

                            FGMoments.draw()
                        }
                    },
                    function (e) {
                        if (FGMoments.makierung){
                            e.setLayerXY()
                            FGMoments.makierungWidth = e.layerX - FGMoments.makierungX
                            FGMoments.makierungHeight = e.layerY - FGMoments.makierungY
                            FGMoments.draw()
                        }
                    },
                    function () {
                        FGMoments.touchMarking = false;
                        document.querySelector('[data-tab="familie"] nav .fa-mouse-pointer').parentElement.style.background = "white"

                        if (FGMoments.makierung){

                            if (FGMoments.makierungWidth < 0) {
                                FGMoments.makierungWidth = FGMoments.makierungWidth * -1
                                FGMoments.makierungX = FGMoments.makierungX - FGMoments.makierungWidth
                            }

                            if (FGMoments.makierungHeight < 0) {
                                FGMoments.makierungHeight = FGMoments.makierungHeight * -1
                                FGMoments.makierungY = FGMoments.makierungY - FGMoments.makierungHeight
                            }

                            FGMoments.getAllPersonsInArea(
                                FGMoments.makierungX
                              , FGMoments.makierungY
                              , FGMoments.makierungX + FGMoments.makierungWidth
                              , FGMoments.makierungY + FGMoments.makierungHeight)
                            .forEach(person => document.getElementById(person.Id).classList.add("marked"))

                            FGMoments.makierung = false
                            FGMoments.makierungX = 0
                            FGMoments.makierungY = 0
                            FGMoments.makierungWidth = 0
                            FGMoments.makierungHeight = 0
                            FGMoments.draw()
                        }
                    },
                    "inputMoveElementInit_GraphBoard"
                )

                FGMoments.$GraphWrapper.appendChild(FGMoments.$GraphBoard)

                FGMoments.addButtonToMenu('<i class="fas fa-save"></i>', function(){
                    FGMoments.createPersonGraphJson()
                })

                FGMoments.addButtonToMenu('<i class="fas fa-ellipsis-h"></i>', function(){
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
                        FGMoments.setPersonPlate(elm, parseInt(elm.style.left), centerY)
                    })

                    FGMoments.draw()
                })

                var colorPicker = FGMoments.addColorPickerToMenu()

                FGMoments.addButtonToMenu('<i class="fas fa-paint-brush"></i>', function(){
                    document.querySelectorAll('.marked')
                    .forEach(function(elm){
                        elm.setAttribute('data-color', colorPicker.value)
                        FGMoments.PersonGraph.positions[elm.id].color = colorPicker.value
                        FGMoments.draw()
                    })
                })

                FGMoments.addButtonToMenu('<i class="fas fa-camera"></i>', function(){
                    var backupWidth = FGMoments.$GraphWrapper.style.width
                    var backupHeight = FGMoments.$GraphWrapper.style.height
                    FGMoments.$GraphWrapper.style.width = FGMoments.$GraphBoard.style.width
                    FGMoments.$GraphWrapper.style.height = FGMoments.$GraphBoard.style.height
                    document.querySelector('body > nav').style.display = "none"
                    document.querySelector('[data-tab="familie"] > div > nav').style.display = "none"
                    document.querySelector("html").style.width = FGMoments.$GraphBoard.style.width
                    document.querySelector("html").style.height = FGMoments.$GraphBoard.style.height
                    html2canvas(FGMoments.$GraphWrapper, {
                      onrendered: function(canvas) {
                        canvas.toBlob(function(blob) {
                            FGMoments.$GraphWrapper.style.width = backupWidth
                            FGMoments.$GraphWrapper.style.height = backupHeight

                            saveAs(blob, "FamilyGrap.png");

                            document.querySelector('body > nav').style.display = "block"
                            document.querySelector('[data-tab="familie"] > div > nav').style.display = "block"
                            document.querySelector("html").style.width = "100%"
                            document.querySelector("html").style.height ="100%"
                        });
                      }
                    });
                })

                FGMoments.addButtonToMenu('<i class="fas fa-mouse-pointer"></i>', function(event){
                    FGMoments.touchMarking = !FGMoments.touchMarking;
                    if (FGMoments.touchMarking) {
                        event.srcElement.style.background = "lightblue"
                    } else {
                        event.srcElement.style.background = "white"
                    }
                })

                FGMoments.addButtonToMenu('<i class="fas fa-arrows-alt"></i>', function(event){
                    FGMoments.touchMoving = !FGMoments.touchMoving;
                    if (FGMoments.touchMoving) {
                        event.srcElement.style.background = "lightblue"
                        FGMoments.$GraphBoard.style.pointerEvents = "none"
                    } else {
                        event.srcElement.style.background = "white"
                        FGMoments.$GraphBoard.style.pointerEvents = "all"
                    }
                })
           }
          , addButtonToMenu: function(text, clickCallback){
                let button = document.createElement('button')

                button.innerHTML = text
                button.style.float = "right"
                button.style.background = "none"
                button.style.borderRadius = "0"
                button.onclick = clickCallback

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

                FGMoments.Graph2dContext.clearRect(0, 0, FGMoments.$GraphCanvas.width, FGMoments.$GraphCanvas.height);
                 document.querySelectorAll('.familyPlate')
                        .forEach((f) => FGMoments.$GraphBoard.removeChild(f))
                FGMoments.PersonenJson.Personen.forEach(function(person){


                    if (person.Mutter)
                        FGMoments.drawLineFromPersonToPerson(person
                            , FGMoments.PersonDirectory[person.Mutter]
                            , FGMoments.personWidth/2
                            , FGMoments.personHeiht/4
                            , FGMoments.personWidth/2
                            , FGMoments.personHeiht/4)
                    if (person.Vater)
                        FGMoments.drawLineFromPersonToPerson(person
                            , FGMoments.PersonDirectory[person.Vater]
                            , FGMoments.personWidth/2
                            , FGMoments.personHeiht/4
                            , FGMoments.personWidth/2
                            , FGMoments.personHeiht/4)
                    if (person.Partner){

                        person.Partner.forEach(function(partner){
                            if (partner.Typ =="Ehe")
                                FGMoments.addFamilyName(person, partner);
                            FGMoments.drawLineFromPersonToPerson2(
                                  person
                                , FGMoments.PersonDirectory[partner.Partner]
                                , FGMoments.personWidth/2
                                , FGMoments.personHeiht/4
                                , FGMoments.personWidth/2
                                , FGMoments.personHeiht/4)
                        })
                    }
                })

                FGMoments.Graph2dContext.fillRect(FGMoments.makierungX, FGMoments.makierungY, FGMoments.makierungWidth, FGMoments.makierungHeight);

           }
          , addFamilyName(person, partner){
                if (person.Geschlecht == "Mänlich") {
                let $namePlate = document.createElement('div')
                $namePlate.className = "familyPlate"
                $namePlate.style.position = "absolute"

                var person1X = parseInt(FGMoments.PersonGraph.positions[person.Id].left)
                var person2X = parseInt(FGMoments.PersonGraph.positions[partner.Partner].left)

                if (person1X < person2X) {
                    $namePlate.style.left = (person1X + (FGMoments.personWidth/2)) + "px"
                } else {
                    $namePlate.style.left = (person2X + (FGMoments.personWidth/2)) + "px"
                }

                $namePlate.style.top = (parseInt(FGMoments.PersonGraph.positions[person.Id].top)-34)+"px"
                $namePlate.style.width = ((FGMoments.personWidth)) + "px"
                $namePlate.style.height = "30px"
                $namePlate.style.padding = "2px"
                $namePlate.style.textAlign = 'center'
                $namePlate.style.backgroundColor = FGMoments.PersonGraph.positions[person.Id].color
                $namePlate.style.color = invertColor(FGMoments.PersonGraph.positions[person.Id].color)
                //$namePlate.style.border = '1px solid rgba(0,0,0,.2)'
                $namePlate.style.borderTopLeftRadius = '5px'
                $namePlate.style.borderTopRightRadius = '5px'

                $namePlate.style.fontSize = "18px"

                $namePlate.style.fontFamily = "Lato"

                $namePlate.innerHTML = person.Name;
                FGMoments.$GraphBoard.appendChild($namePlate)
                }
            }
          , drawLineFromPersonToPerson2(person1, person2, person1XOffset, person1YOffset, person2XOffset, person2YOffset){
                if (person1 && person2) {
                   var backupLineWidth = FGMoments.Graph2dContext.lineWidth;
                   FGMoments.Graph2dContext.beginPath();
                   FGMoments.Graph2dContext.lineWidth = FGMoments.personWidth/2;
                   FGMoments.Graph2dContext.strokeStyle = FGMoments.PersonGraph.positions[person2.Id].color;
                   FGMoments.Graph2dContext.moveTo(
                     parseInt(FGMoments.PersonGraph.positions[person1.Id].left) + person1XOffset
                   , parseInt(FGMoments.PersonGraph.positions[person1.Id].top) + person1YOffset)

                   FGMoments.Graph2dContext.lineTo(
                     parseInt(FGMoments.PersonGraph.positions[person2.Id].left) + person2XOffset
                   , parseInt(FGMoments.PersonGraph.positions[person2.Id].top) + person2YOffset)
                   FGMoments.Graph2dContext.stroke();
                   FGMoments.Graph2dContext.lineWidth = backupLineWidth;
               }
            }
          , drawLineFromPersonToPerson(person1, person2, person1XOffset, person1YOffset, person2XOffset, person2YOffset) {

                if (person1 && person2) {

                   FGMoments.drawCurve(
                     parseInt(FGMoments.PersonGraph.positions[person1.Id].left) + person1XOffset
                   , parseInt(FGMoments.PersonGraph.positions[person1.Id].top) + person1YOffset
                   , parseInt(FGMoments.PersonGraph.positions[person2.Id].left) + person2XOffset
                   , parseInt(FGMoments.PersonGraph.positions[person2.Id].top) + person2YOffset
                   , FGMoments.PersonGraph.positions[person2.Id].color)
               }
           }
          , setPersonPlate: function (elm, left, top){
                left = 50 * Math.ceil(left / 50)
                top = 50 * Math.ceil(top / 50)
                elm.style.left = left + "px"
                elm.style.top = top + "px"

                FGMoments.PersonGraph.positions[elm.id].left = elm.style.left
                FGMoments.PersonGraph.positions[elm.id].top = elm.style.top
            }
          , getAllPersonsInArea : function(left,top, right, bottom) {
                return FGMoments.PersonenJson.Personen
                .map(person => FGMoments.PersonGraph.positions[person.Id])
                .filter(position =>
                    (left   < (parseInt(position.left) + FGMoments.personWidth) &&
                      right  > parseInt(position.left) &&
                      bottom > parseInt(position.top) &&
                      top    < (parseInt(position.top) + FGMoments.personHeiht)))
                .map(position => FGMoments.PersonDirectory[position.Id])
          }

          , start: function(){
                FGMoments.createDom()
                FGMoments.PersonenJson.Personen.forEach(FGMoments.personCallback)
                FGMoments.draw()
            }
          , personWidth: 100
          , personHeiht: 100
          , personFontSize: "14px"

          , personCallback: function(person) {
                let $personPlate = document.createElement('div')
                $personPlate.id = person.Id

                $personPlate.style.width = FGMoments.personWidth + 'px'
                $personPlate.style.height = FGMoments.personHeiht + 'px'
                $personPlate.style.position = 'absolute'

                $personPlate.setAttribute(
                    'data-color'
                 ,  FGMoments.PersonGraph.positions[person.Id].color)

                FGMoments.setPersonPlate(
                     $personPlate
                   , parseInt(FGMoments.PersonGraph.positions[person.Id].left)
                   , parseInt(FGMoments.PersonGraph.positions[person.Id].top))

                Moments.inputMoveElementInit(
                    $personPlate,
                    function () {},
                    function (e) {
                        var left = parseInt($personPlate.style.left);
                        var top = parseInt($personPlate.style.top);

                        FGMoments.setPersonPlate($personPlate, e.newTargetX, e.newTargetY)
                        document.querySelectorAll('.marked').forEach(function(elm){
                            if (elm != $personPlate)
                                FGMoments.setPersonPlate(elm, parseInt(elm.style.left) - (left - e.newTargetX), parseInt(elm.style.top) - (top - e.newTargetY))
                        })
                        //FGMoments.draw()
                    },
                    function () {
                        FGMoments.draw()
                    },
                    "inputMoveElementInit_personPlate_"+$personPlate.id
                )

                $personPlate.ondblclick = function (event) {
                    if (event.which === 1){
                        Moments.changeRoute("person", {
                            id: this.id
                        })
                    }
                }

                let $personImage = FGMoments.createImage(person)
                $personImage.style.width = ((FGMoments.personWidth)/2) + 'px'
                $personImage.style.height = ((FGMoments.personWidth)/2) + 'px'
                $personImage.style.marginLeft = ((FGMoments.personWidth)/4) + 'px'
                $personImage.style.border = "1px solid #ccc"
                $personImage.style.backgroundColor = "white"
                $personImage.style.backgroundRepeat = "no-repeat";
                $personImage.style.backgroundPosition = "center center";
                $personImage.style.backgroundSize = "cover";
                $personImage.style.borderRadius = ((FGMoments.personWidth)/4) + 'px'
                $personImage.style.pointerEvents = "none"
                $personPlate.appendChild($personImage)

                let $namePlate = document.createElement('div')
                $namePlate.style.textAlign = 'center'
                $namePlate.style.backgroundColor = 'rgba(255,255,255,.7)'
                $namePlate.style.border = '1px solid rgba(0,0,0,.2)'
                $namePlate.style.borderRadius = '5px'
                $namePlate.style.padding = '2px'
                $namePlate.style.pointerEvents = "none"

                $namePlate.style.fontSize = FGMoments.personFontSize
                $namePlate.style.fontFamily = "Lato"

                $namePlate.innerHTML = FGMoments.getPersonName(person)

                if (person.Geburtstag){
                    $namePlate.innerHTML += "<hr>"
                    $namePlate.innerHTML += "* " + person.Geburtstag
                }

                if (person.Gestorben){
                    $namePlate.innerHTML += "<br>"
                    $namePlate.innerHTML += "† " + person.Gestorben
                }

                $personPlate.appendChild($namePlate)

                FGMoments.$GraphBoard.appendChild($personPlate)

                FGMoments.$personPlates.push($personPlate)
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
                FGMoments.Graph2dContext.beginPath();
                FGMoments.Graph2dContext.strokeStyle = color;
                for(var isFirst = true,            /// first point is moveTo, rest lineTo
                        angle = 1.5 * Math.PI,     /// start angle in radians
                        goal = 2 * Math.PI,        /// goal angle
                        x, y; angle < goal; angle += steps) {

                    /// calculate x and y using cos/sin
                    x = c1.x + mx * Math.cos(angle);
                    y = c1.y + my * Math.sin(angle);

                    /// move or draw line
                    (isFirst) ? FGMoments.Graph2dContext.moveTo(x, y) : FGMoments.Graph2dContext.lineTo(x, y);
                    isFirst = false;
                }

                /// second box
                for(var isFirst = true,
                        angle = Math.PI,
                        goal = 0.5 * Math.PI,
                        x, y;angle > goal; angle -= steps) {

                    x = c2.x + mx * Math.cos(angle);
                    y = c2.y + my * Math.sin(angle);

                    (isFirst) ? FGMoments.Graph2dContext.lineTo(x, y) : FGMoments.Graph2dContext.lineTo(x, y);
                    isFirst = false;
                }

                FGMoments.Graph2dContext.stroke();
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
                var img = document.createElement("div");

                if (typeof person === 'undefined'){
                }
                else if (person.Bild){
                    img.style.backgroundImage = "url('"+person.Bild.replace(".jpeg", "_autox52.jpeg");+"')";
                }
                else if (typeof person.Geschlecht === 'undefined'){
                }
                else if (person.Geschlecht === "Männlich")
                    img.style.backgroundImage = "url('assets/img/familyGraph/man.png')";
                else
                    img.style.backgroundImage = "url('assets/img/familyGraph/woman.png')";

                return img;
            }

          , createPersonGraphJson: function (){
                localStorage.setItem("json_familie_graph", JSON.stringify(FGMoments.PersonGraph));
                alert("Saved")
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

        FGMoments.init()
    }

}, Moments)