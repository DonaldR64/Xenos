const XR = (() => {
    const version = '2026.4.24';
    if (!state.XR) {state.XR = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    let HexSize, HexInfo, DIRECTIONS;

    //math constants
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    }

    const DefineHexInfo = () => {
        HexSize = (70 * pageInfo.scale)/M.f0;
        if (pageInfo.type === "hex") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: 35 * pageInfo.scale,
                    y: HexSize,
                },
                width: 70  * pageInfo.scale,
                height: pageInfo.scale*HexSize,
                xSpacing: 70 * pageInfo.scale,
                ySpacing: 3/2 * HexSize,
                directions: {
                    "Northeast": new Cube(1,-1,0),
                    "East": new Cube(1,0,-1),
                    "Southeast": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "West": new Cube(-1,0,1),
                    "Northwest": new Cube(0,-1,1),
                },
                halfToggleX: 35 * pageInfo.scale,
                halfToggleY: 0,
            }
            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            //Hex H or Flat Topped
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: pageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {
                    "North": new Cube(0, -1, 1),
                    "Northeast": new Cube(1, -1, 0),
                    "Southeast": new Cube(1,0,-1),
                    "South": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "Northwest": new Cube(-1,0,1),
                },
                halfToggleX: 0,
                halfToggleY: 35 * pageInfo.scale,
            }
            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }
    }

    let ModelArray = {};
    let UnitArray = {};
    //let CompanyArray = {}; // ? if have multiple detachments then this ?
    

    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    const Factions = {
        "Blood Angels": {
            "image": "",
            "backgroundColour": "#ff0000",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#ff0000",
            "borderStyle": "5px groove",
            dice: "BloodAngels",
        },
        "Orks": {
            "image": "",
            "backgroundColour": "#00ff00",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            dice: "Orks",
            dice: "Orks",

        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",

        },

    };


    const SM = {
        supp: "status_yellow",
        unavail: "status_oneshot::5503748",
        gtg: "status_Disadvantage-or-Down::2006464",
        back: "status_green",



    }

    const UnitMarkers = ["Plus-1d4::2006401","Minus-1d4::2006429","Plus-1d6::2006402","Minus-1d6::2006434","Plus-1d20::2006409","Minus-1d20::2006449","Hot-or-On-Fire-2::2006479","Animal-Form::2006480","Red-Cloak::2006523","A::6001458","B::6001459","C::6001460","D::6001461","E::6001462","F::6001463","G::6001464","H::6001465","I::6001466","J::6001467","L::6001468","M::6001469","O::6001471","P::6001472","Q::6001473","R::6001474","S::6001475"];

    const Capit = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }



    //height is height of terrain element
    //move -> 1 = open, 2 = difficult, 50 = obstacle, 100 = impassable
    //cover for  fire - 0 = None, 1 = Light, 2 = Heavy
    //los -> true = doesnt block LOS, false = blocks los or Woods (max # of hexes)

    const TerrainInfo = {
        "Woods": {name: "Woods",height: 2, los: "Woods", move: 2, cover: 1},
        "Low Hedge": {name: "Low Hedge",height: .5, los: true, move: 50, cover: 1},
        "Low Wall": {name: "Low Wall",height: .5, los: true, move: 50, cover: 2},
        "Trench": {name: "Trench",height: 0,los: true, move: 50, cover: 2},


    }

    const BuildingInfo = {



    }



    const HillHeights = {
        "#434343": 1,
        "#666666": 2,
        
    }








    const simpleObj = (o) => {
        let p = JSON.parse(JSON.stringify(o));
        return p;
    };

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    const tokenImage = (img) => {
        //modifies imgsrc to fit api's requirement for token
        img = getCleanImgSrc(img);
        img = img.replace("%3A", ":");
        img = img.replace("%3F", "?");
        img = img.replace("med", "thumb");
        return img;
    };

    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    };

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };

    const FX = (fxname,model1,model2) => {
        //model2 is target, model1 is shooter
        //if its an area effect, model1 isnt used
        if (fxname.includes("System")) {
            //system fx
            fxname = fxname.replace("System-","");
            if (fxname.includes("Blast")) {
                fxname = fxname.replace("Blast-","");
                spawnFx(model2.token.get("left"),model2.token.get("top"), fxname);
            } else {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxname);
            }
        } else {
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(new Point(model1.token.get("left"),model1.token.get("top")), new Point(model2.token.get("left"),model2.token.get("top")), fxType.id);
            }
        }
    }






    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        px = point.x
        py = point.y
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }

    const translatePoly = (poly) => {
        //translate points in a pathv2 polygon to map points
        let vertices = [];
        let points = JSON.parse(poly.get("points"));
        let centre = new Point(poly.get("x"), poly.get("y"));
        //covert path points from relative coords to actual map coords
        //define 'bounding box;
        let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
        _.each(points,pt => {
            minX = Math.min(pt[0],minX);
            minY = Math.min(pt[1],minY);
            maxX = Math.max(pt[0],maxX);
            maxY = Math.max(pt[1],maxY);
        })
        //translate each point back based on centre of box
        let halfW = (maxX - minX)/2 + minX;
        let halfH = (maxY - minY)/2 + minY
        let zeroX = centre.x - halfW;
        let zeroY = centre.y - halfH;
        _.each(points,pt => {
            let x = Math.round(pt[0] + zeroX);
            let y = Math.round(pt[1] + zeroY);
            vertices.push(new Point(x,y));
        })
        return vertices;
    }


    const KeyNum = (model,keyword) => {
        let key = model.keywords.split(",");
        log(key)
        let num = 1;
        _.each(key,word => {
            if (word.includes(keyword)) {
                word = word.trim().replace(keyword,"").replace("(","").replace(")","");
                num = parseInt(word);
            }
            log(num)
        })
        return num;
    }









    //Retrieve Values from character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    };

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;
            let max = attributes[j].get("max")   
            if (!max || max === "") {max = " "} 
            aa[name + "_max"] = max;
        }
        return aa;
    };

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
        return attributeobj.id;
    };

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }

    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toOffset() {
            let cube = this.toCube();
            let offset = cube.toOffset();
            return offset;
        };
        toCube() {
            let x = this.x - HexInfo.pixelStart.x;
            let y = this.y - HexInfo.pixelStart.y;
            let q,r;
            if (pageInfo.type === "hex") {
                q = (M.b0 * x + M.b1 * y) / HexInfo.size;
                r = (M.b3 * y) / HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                q = (M.b3 * x) / HexInfo.size;
                r = (M.b1 * x + M.b0 * y) / HexInfo.size;
            }
            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        label() {
            return this.toCube().label();
        }
    }

    class Offset {
        constructor(col,row) {
            this.col = col;
            this.row = row;
        }
        label() {
            let label = rowLabels[this.row] + (this.col + 1).toString();
            return label;
        }
        toCube() {
            let q,r;
            if (pageInfo.type === "hex") {
                q = this.col - (this.row - (this.row&1))/2;
                r = this.row;
            } else if (pageInfo.type === "hexr") {
                q = this.col;
                r = this.row - (this.col - (this.col&1))/2;
            }
            let cube = new Cube(q,r,-q-r);
            cube = cube.round(); 
            return cube;
        }
        toPoint() {
            let cube = this.toCube();
            let point = cube.toPoint();
            return point;
        }
    };

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   

    class Cube {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Cube(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        angle(b) {
            //angle between 2 hexes
            let origin = this.toPoint();
            let destination = b.toPoint();

            let x = Math.round(origin.x - destination.x);
            let y = Math.round(origin.y - destination.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
        subtract(b) {
            return new Cube(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        lerp(b, t) {
            return new Cube(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b' incl. hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }

        spiralToCube(index) {
            if (index === 0) {
                return this;
            } else {
                let radius = (index === 0) ? 0:Math.floor((Math.sqrt(12 * index - 3) + 3) / 6);
                let startIndex = (radius === 0) ? 0: 1 + 3 * radius * (radius - 1);
                let ring = this.ring(radius);
                let pos = index - startIndex;
                return ring[pos];
            }
        }




        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Cube(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }

        ring(radius) {
            let results = [];
            let b = new Cube(-1 * radius,0,1 * radius);  //start at west 
            let cube = this.add(b);
            for (let i=0;i<6;i++) {
                //for each direction
                for (let j=0;j<radius;j++) {
                    results.push(cube);
                    cube = cube.neighbour(DIRECTIONS[i]);
                }
            }
            return results;
        }

        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Cube(qi, ri, si);
        }
        toPoint() {
            let x,y;
            if (pageInfo.type === "hex") {
                x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
                y = 3/2 * this.r * HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                x = 3/2 * this.q * HexInfo.size;
                y = (M.f1 * this.q + M.f0 * this.r) * HexInfo.size;
            }
            x += HexInfo.pixelStart.x;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col,row;
            if (pageInfo.type === "hex") {
                col = this.q + (this.r - (this.r&1))/2;
                row = this.r;
            } else if (pageInfo.type === "hexr") {
                col = this.q;
                row = this.r + (this.q - (this.q&1))/2;
            }
            let offset = new Offset(col,row);
            return offset;
        }
        whatDirection(b) {
            let delta = new Cube(b.q - this.q,b.r - this.r, b.s - this.s);
            let dir = "Unknown";
            let keys = Object.keys(HexInfo.directions);
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[keys[i]];
                if (d.q === delta.q && d.r === delta.r && d.s === delta.s) {
                    dir = keys[i];
                }
            }
            return dir
        }

     
    };

    class Hex {
        //hex will have its elevation and the hexes terrain which can reference TerrainInfo for other details
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();
            this.elevation = 0;
            this.height = 0;
            this.terrain = "Open";
            this.offboard = false;
            this.cover = 0;
            this.move = 1;
            this.los = true;
            HexMap[this.label] = this;
        }
    }

    class Model {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            let label = (new Point(token.get("left"),token.get("top"))).label();
            let charID = token.get("represents");
            let char = getObj("character", charID); 

            let aa = AttributeArray(charID);
  
            this.charName = char.get("name");
            let name = token.get("name");
            if (!name || name === "") {
                name = this.charName;
            }
            this.name = name;

            this.id = id;
            this.charID = charID;
            this.hexLabel = label;
            this.startHexLabel = label;
            this.startRotation = token.get("rotation");
            this.special = aa.special || " ";
            this.rank = aa.rank || "Trooper";

            this.faction = aa.faction || "Neutral";
            if (state.XR.factions[0] === "") {
                state.XR.factions[0] = this.faction;
            } else if (state.XR.factions[0] !== this.faction && state.XR.factions[1] === "") {
                state.XR.factions[1] = this.faction;
            }
            this.player = (this.faction === "Neutral") ? 2:(state.XR.factions[0] === this.faction)? 0:1;
            this.type = aa.type;

            let radius = Math.round(Math.max(token.get("width"),token.get("height"))/70);
            this.size = Math.round(radius/2);

            let act = ["attackOn","moveOn","shootOn"];
            _.each(act,a => {
                let val = aa[a] || " "
                let res = [];
                if (val.includes("Auto")) {
                    res = [1,parseInt(val.replace(/[^0-9]/g,""))];
                } else {
                    res = [parseInt(val),parseInt(val)];
                }
                this[a] = res;
            })

            let atts = ["courage","armour","attackVal","defenceVal","shootVal","moveRate"];
            _.each(atts,a => {
                this[a] = parseInt(aa[a]);
            })

            this.wounds = parseInt(aa.wounds) || 1;

            let weaponArray = [];
            for (let i=1;i<3;i++) {
                let name = aa["weapon" + i + "Name"];
                if (!name || name === "") {continue};
                let range = aa["weapon" + i + "Range"];
                range = parseInt(range) || "CC";
                let special = aa["weapon" + i + "Special"] || " ";
                let fx = aa["weapon" + i + "FX"];
                let sound = aa["weapon" + i + "Sound"];
                let weapon = {
                    name: name,
                    range: range,
                    special: special,
                    fx: fx,
                    sound: sound,
                }
                weaponArray.push(weapon);
            }

            this.weaponArray = weaponArray;
            this.token = token;
            this.unitID = "";


            ModelArray[id] = this;
            HexMap[label].tokenIDs.push(id);






        }







        Distance = (model2) => {
            let hex1 = HexMap[this.hexLabel];
            let hex2 = HexMap[model2.hexLabel];
            let distance = hex1.cube.distance(hex2.cube);
            distance -= (this.size + model2.size - 1); 
            return distance;
        }

        ClosestHex = (model2) => {
            let closest = Infinity;
            let c1,c2
            let cubes1 = HexMap[this.hexLabel].cube.radius(this.size);
            let cubes2 = HexMap[model2.hexLabel].cube.radius(model2.size);
            _.each(cubes1,cube1 => {
                _.each(cubes2,cube2 => {
                    let d = cube1.distance(cube2);
                    if (d < closest) {
                        closest = d;
                        c1 = cube1;
                        c2 = cube2;
                    }
                })
            })
            let result = {
                hexLabel1: c1.label(),
                hexLabel2: c2.label(),
            }
            return result;
        }






    }

    class Unit {
        constructor(mID,uID = stringGen()) {
            let refModel = ModelArray[mID];
            if (!refModel) {refModel = new Model(mID)};
            this.faction = refModel.faction;
            this.player = refModel.player;
            this.wild = (refModel.special.includes("Wild Charge")) ? true:false;
            refModel.unitID = uID;
            this.id = uID;
            this.tokenIDs = [mID];
            this.symbol = "";
            if (refModel.rank !== "Trooper") {
                this.leaderID = mID;
            }
            UnitArray[uID] = this;
        }

        AddModel(mID) {
            if (this.tokenIDs.includes(mID) === false) {
                this.tokenIDs.push(mID);
                let model = ModelArray[mID];
                if (model.special.includes("Wild Charge")) {
                    this.wild = true;
                }
                model.unitID = this.id;
                if (model.rank !== "Trooper") {
                    this.leaderID = mID;
                }
            }
        }

        Distance(id) {
            //determine if unitid or modelid
            let model2 = ModelArray[id];
            let unit2 = UnitArray[id];
            let closestDistance = Infinity;
            if (model2 && !unit2) {
                _.each(this.tokenIDs,tokenID => {
                    let model = ModelArray[tokenID];
                    let dist = Model.Distance(model,model2);
                    if (dist < closestDistance) {
                        closestDistance = dist;
                    }
                })
            } else if (!model2 && unit2) {
                _.each(this.tokenIDs,tokenID => {
                    let model = ModelArray[tokenID];
                    _.each(unit2.tokenIDs,tokenID2 => {
                        let model2 = ModelArray[tokenID2];
                        let dist = Model.Distance(model,model2);
                        if (dist < closestDistance) {
                            closestDistance = dist;
                        }
                    })
                })
            } else {
                sendChat("","Error in Unit Distance Routine");
                closestDistance = 1;
            }
            return closestDistance;
        }





        Damage(damage) {
            //if a single token then can apply damage, possibly destroy unit
            //if has multiple tokens, can put in output to remove individual models to damage total, unless damage > total then destroy unit
            if (this.tokenIDs.length === 1) {
                let model = ModelArray[this.tokenIDs[0]];
                let wounds = parseInt(model.token.get("bar1_value")) - damage;
                if (wounds <= 0) {
                    outputCard.body.push("Damage Destroys the Unit");
                    this.Destroy();
                } else {
                    model.token.set("bar1_value",wounds);
                }
            } else {
                let totalWounds = 0;
                _.each(this.tokenIDs,tokenID => {
                    totalWounds += parseInt(ModelArray[tokenID].token.get("bar1_value"));
                });
                if (totalWounds <= damage) {
                    outputCard.body.push("Damage Destroys the Unit");
                    this.Destroy();
                } else {
                    let s = (damage === 1) ? "":"s";
                    outputCard.body.push("Apply Damage to Model" + s);
                }
            }
        }

        Destroy() {
            _.each(this.tokenIDs,tokenID => {
                let model = ModelArray[tokenID];
                model.token.remove();
                delete ModelArray[tokenID];
            })
            delete state.XR.unitInfo[this.id];
            delete UnitArray[this.id];
        }

        Suppress() {
            _.each(this.tokenIDs,tokenID => {
                let model = ModelArray[tokenID];
                model.token.set("tint_color","#ffff00");
            })
            let leader = ModelArray[unit.leaderID];
            leader.token.set("aura1_color","#ffff00");
            leader.token.set(SM.gtg,false);
        }

        Rally() {
            _.each(this.tokenIDs,tokenID => {
                let model = ModelArray[tokenID];
                model.token.set("tint_color","transparent");
            })
            let leader = ModelArray[this.leaderID];
            if (leader.token.get(SM.back) === true) {
                leader.token.set("aura1_color","#00ff00");
            } else {
                leader.token.set("aura1_color","#000000");
            }
        }



    }





    const squaredPolar = (point, centre) => {
        return [
            Math.atan2(point.y-centre.y, point.x-centre.x),
            (point.x-centre.x)**2 + (point.y-centre.y)**2 // Square of distance
        ];
    }

    // sort points into a polygon
    const polySort = (points,request) => {
        // Get "centre of mass"
        let centre = [points.reduce((sum, p) => sum + p.x, 0) / points.length,
                      points.reduce((sum, p) => sum + p.y, 0) / points.length];
        if (request && request == "Centre") {
            return centre
        }
        // Sort by polar angle and distance, centered at this centre of mass.
        for (let point of points) point.push(...squaredPolar(point, centre));
        points.sort((a,b) => a[2] - b[2] || a[3] - b[3]);
        // Throw away the temporary polar coordinates
        for (let point of points) point.length -= 2; 
    }










    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
    }    

    const AddAbilities = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!model) {return};
        AddAbilities2(model);
    }


    const AddAbilities2 = (model) => {
        let char = getObj("character", model.charID);   

        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: char.id});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        //Move 
        if (model.moveMax > 0) {
            abilityName = "0 - Move";
            action = "!Activate;Move;@{selected|token_id}";
            AddAbility(abilityName,action,char.id);
        }

        let systemNum = 0;
        //Use Weapons 
        for (let i=0;i<model.weapons.length;i++) {
            let weapon = model.weapons[i];
            systemNum++;
            abilityName = systemNum + " - " + weapon.name;
            action = "!Activate;Attack" + i + ";@{selected|token_id}";
            //how many targets?
            let targets = 1;
            if (weapon.name.includes("(x")) {
                let temp = weapon.name.split("(x");
                targets = parseInt(temp[1].replace(")",""));
            }
            for (let t=0;t<targets;t++) {
                action += ";@{target|Target " + (t+1) + "|token_id}";
            }
            AddAbility(abilityName,action,char.id);
        }

        //Use Abilities

        


        //Load Weapons/Abilities





        sendChat("","Abilities Added")
    }


    const ButtonInfo = (phrase,action,inline) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,side) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.side = side;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        tablename = tablename.replace(/\s+/g, '');
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];        
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.side || !Factions[outputCard.side]) {
            outputCard.side = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Factions[outputCard.side].borderStyle + " " + Factions[outputCard.side].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Factions[outputCard.side].backgroundColour + `; `;
        output += `background-image: url(` + Factions[outputCard.side].image + `), url(` + Factions[outputCard.side].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Factions[outputCard.side].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Factions[outputCard.side].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Factions[outputCard.side].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Factions[outputCard.side].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack,fontcolour;
                if (line.includes("[F]")) {
                    let ind1 = line.indexOf("[F]") + 3;
                    let ind2 = line.indexOf("[/f]");
                    let fac = line.substring(ind1,ind2);
                    if (Factions[fac]) {
                        lineBack = Factions[fac].backgroundColour;
                        fontcolour = Factions[fac].fontColour;
                    }
                    line = line.replace("[F]" + fac + "[/f]","");

                } else {
                    lineBack = (i % 2 === 0) ? "#D3D3D3": "#EEEEEE";
                    fontcolour = "#000000";
                }
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color:` + fontcolour + `; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let info = outputCard.buttons[i];
                let inline = info.inline;
                if (i>0 && inline === false) {
                    output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let borderColour = Factions[outputCard.side].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Factions[outputCard.side].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.side].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a>`
                
                if (inline === false || i === (outputCard.buttons.length - 1)) {
                    out += `</div></span></div></div>`;
                }
                output += out;
            }

        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};
    }

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.type = pageInfo.page.get("grid_type");

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;
        let halfToggleX = HexInfo.halfToggleX;
        let halfToggleY = HexInfo.halfToggleY;
        if (pageInfo.type === "hex") {
            for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
                for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startX += halfToggleX;
                halfToggleX = -halfToggleX;
            }
        } else if (pageInfo.type === "hexr") {
            for (let i=startX;i<=pageInfo.width;i+=HexInfo.xSpacing) {
                for (let j=startY;j<=pageInfo.height;j+=HexInfo.ySpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startY += halfToggleY;
                halfToggleY = -halfToggleY;
            }
        }
        AddElevations();
        AddTerrain();    
        AddTokens();


        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };








    const AddTerrain = () => {




        //part 1 - add terrain that is tokens - woods, rubble
        //add terrain using tokens on map page, either on top or under map
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");


            //part 1 - add terrain that is tokens - woods, rubble
            let terrain = TerrainInfo[name];
            if (terrain) {
//log(terrain)
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                if (hex.terrain === "Open") {
                    hex.terrain = name;
                } else {
                    hex.terrain += ", " + terrain.name;
                }
                hex.height = Math.max(hex.height,terrain.height);
                hex.los = terrain.los;
                hex.cover = Math.max(hex.cover,terrain.cover);
                hex.move = Math.max(hex.move,terrain.move);
            } 



            if (name === "Map") {
                DefineOffboard(token);
            }
        })





        //part 2 - add buildings, defined by paths
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});

        _.each(paths,path => {
            let terrain = BuildingInfo[path.get("stroke").toLowerCase()];
            if (terrain) {
                let vertices = translatePoly(path);
                _.each(HexMap,hex => {
                    let result = pointInPolygon(hex.centre,vertices);
                    if (result === true) {
                        if (hex.terrain === "Open") {
                            hex.terrain = terrain.name;
                        } else {
                            hex.terrain += ", " + terrain.name;
                        }
                        hex.height = Math.max(hex.height,terrain.height);
                        hex.losLevel = Math.max(hex.losLevel,terrain.losLevel);
                        hex.cover = Math.max(hex.cover,terrain.cover);
                        hex.move = Math.max(hex.move,terrain.move);
                    }
                });
            }
        })






    }

    const AddElevations = () => {
        //use terrain lines to build elevations
        //add roads also
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let elevation = HillHeights[path.get("stroke").toLowerCase()];
            if (elevation) {
                elevation = parseInt(elevation);
                let vertices = translatePoly(path);
                _.each(HexMap,hex => {
                    let result = pointInPolygon(hex.centre,vertices);
                    if (result === true) {
                        hex.elevation = Math.max(hex.elevation,elevation);
                    }
                });
            }
        });
    }

     
    const AddTokens = () => {
        UnitArray = {};
        ModelArray = {};
        //create an array of all tokens
        let start = Date.now();
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });

        let c = tokens.length;
        let s = (1===c?'':'s');     
        
        tokens.forEach((token) => {
            let character = getObj("character", token.get("represents"));   
            let gmn = decodeURIComponent(token.get("gmnotes")).toString();
            if (gmn) {
                let model = new Model(token.get("id"))
                let unit = UnitArray[gmn];
                if (!unit) {
                    unit = new Unit(token.get("id"),gmn);
                }
                unit.AddModel(model.id);
            }
        });
        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(ModelArray).length + " placed in Model Array");

    }

    const DefineOffboard = (token) => {
        let centre = new Point(token.get("left"),token.get('top'));
        let halfW = token.get("width")/2;
        let halfH = token.get("height")/2;
        let minX = centre.x - halfW;
        let maxX = centre.x + halfW;
        let minY = centre.y - halfH;
        let maxY = centre.y + halfH;
        _.each(HexMap,hex => {
            if (hex.centre.x < minX || hex.centre.x > maxX || hex.centre.y < minY || hex.centre.y > maxY) {
                hex.terrain = "Offboard";
                hex.offboard = true;
            }
        })
    }

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(Math.floor(randomInteger(possible.length)));
        }
        return text;
    };




    const SetupGame = (msg) => {
        //!Setup;?{Game Points|0}
        let Tag = msg.content.split(";");
        state.XR.gamePoints = Tag[1];

    }

    const NextTurn = () => {
        //is really next players turn
        let turn = state.XR.turn;
        if (turn === 0) {
            turn = 1;
            SetupCard("Turn 1","","Neutral");
            outputCard.body.push("If appropriate, roll for Attacker/Defender");
            outputCard.body.push("Setup and Start according to Scenario");
            //no need to check for rally 
            //first player will be set once someone activates a unit

        } else {
            //check if prior player has any unactivated units
            let flag = false;
            _.each(UnitArray,unit => {
                if (unit.faction === state.XR.activePlayer) {
                    let model = ModelArray[unit.leaderID];
                    if (model.token.get("aura1_color") === "#00ff00") {
                        flag = true;
                    }
                }
            })
            if (flag === true) {
                SetupCard("Turn Not Over","","Neutral");
                outputCard.body.push("Player has units that have not activated");
                PrintCard();
                return;
            }
            if (state.XR.activePlayer !== state.XR.firstPlayer) {
                turn++
            } 
            state.XR.activePlayer = (state.XR.activePlayer === 0) ? 1:0;
            let faction = state.XR.factions[state.XR.activePlayer];
            SetupCard(faction,"Turn " + turn,faction);
            outputCard.body.push("Start with Rallying Suppressed Units (Yellow)");
            outputCard.body.push("Then activate any units with Wild Charge active (Red)");
            outputCard.body.push("Finally can activate remaining Units (Green)");
            SetAuras(faction); //set to green or red, those that arent yellow/suppressed







        }

        state.XR.turn = turn;
        PrintCard();


    }
 
    const SetAuras = (faction) => {
        _.each(UnitArray,unit => {
            let leader = ModelArray[unit.leaderID];
            if (unit.faction === faction && leader.token.get("aura1_color") !== "#ffff00") {
                let wildFlag = false;
                if (unit.wild === true) {
                    wildFlag = WildCheck(unit);
                }
                if (wildFlag === true) {
                    leader.token.set("aura1_color","#ff0000");
                } else {
                    leader.token.set("aura1_color","#00ff00");
                }
            }
        })
    }
 
    const WildCheck = (unit) => {
        _.each(UnitArray,unit2 => {
            if (unit2.faction !== unit.faction) {
                let dist = unit.Distance(unit2.id); //closest distance
                if (dist <= leader.moveRate) {
                    //now need to see LOS and move rates on hexes crossed to see if actually has move
                    //if does, change aura to red, and result to true
                    for (let i=0;i<unit.tokenIDs.length;i++) {
                        let model1 = ModelArray[unit.tokenIDs[i]];
                        for (let j=0;j<unit2.tokenIDs.length;j++) {
                            let model2 = ModelArray[unit2.tokenIDs[j]];
                            let dist2 = model1.Distance(model2);
                            if (dist2 > model1.moveRate) {continue};
                            let losResult = LOS(model1,model2);
                            if (losResult.los === false) {continue};
                            let moveCost = aStar(model1,model2);
                            if (moveCost <= model1.moveRate) {return true};
                        }
                    }
                }
            }
        })
        return false;
    }
    


    const aStar = (model1,model2) => {
log("In aStar")
        let startTime = Date.now();
log(model1.name + ": " + model1.unitID)
        let closest = model1.ClosestHex(model2);
        let startHex = HexMap[closest.hexLabel1];
        let endHex = HexMap[closest.hexLabel2];
log("Start: " + closest.hexLabel1)
log("End: " + closest.hexLabel2)
        let move = model1.moveRate;
log("Move: " + move)
        let distance = startHex.cube.distance(endHex.cube);
        let nodes = 1;
        let explored = [];
        let frontier = [{
            label: startHex.label,
            cost: startHex.move,
            estimate: distance,
        }]

        while (frontier.length > 0) {
            //sort paths in frontier by cost,lowest cost first
            //choose lowest cost path from the frontier
            //if more than one, choose one with highest cost       
            frontier.sort(function(a,b) {
                return a.estimate - b.estimate || b.cost - a.cost; //2nd part used if estimates are same
            })
            let node = frontier.shift();
log("Node: " + node.label)
            nodes++;
            explored.push(node); //add this node to explored paths
            //if this node reaches goal, end loop
            if (node.label === endHex.label) {
                break;
            }
            //generate possible next steps
            let next = HexMap[node.label].cube.neighbours();
            //for each possible next step
            for (let i=0;i<next.length;i++) {
                //calculate the cost of the next step 
                //by adding the step's cost to the node's cost
                let stepCube = next[i];
                let stepHexLabel = stepCube.label();
                let stepHex = HexMap[stepHexLabel];
                if (!stepHex) {continue};
                if (stepHex.offboard === true) {continue};
                let cost = stepHex.move;

                //check for units adjacent to the hex, cant move adjacent
                let surrounding = stepCube.neighbours();
                for (let i=0;i<surrounding.length;i++) {
                    let checkHex = HexMap[surrounding[i].label()];
                    if (checkHex.tokenIDs.length > 0) {
                        let model3 = ModelArray[checkHex.tokenIDs[0]];
log(model3.name + ": " + model3.unitID)
                        if (model3.unitID !== model1.unitID) {
                            cost = 100;
                            break;
                        }
                    }
                }
                if (model1.special.includes("Open Order") && cost === 2) {
                    cost = 1;
                }
                if (model1.special.includes("Skimmer") && cost < 100) {
                    cost = 1;
                }
                if (model1.special.includes("Flyer")) {
                    cost = 1;
                }

                //check if this step has already been explored
                let isExplored = (explored.find(e => {
                    return e.label === stepHexLabel
                }));
                //avoid repeated nodes during the calcualtion of neighbours
                let isFrontier = (frontier.find(e => {
                    return e.label === stepHexLabel
                }));
                //if this step has not been explored
                if (!isExplored && !isFrontier) {
log("StepHex: " + stepHexLabel + " Added, Cost: " + cost)
                    let est = cost + stepHex.cube.distance(endHex.cube);
                    //add the step to the frontier
                    frontier.push({
                        label: stepHexLabel,
                        cost: cost,
                        estimate: est,
                    })
                }

            }
        }

        //if there are no paths left to explore or hit end hex
        let finalHexLabel = startHex.label;
        let totalCost = 0;
        if (explored.length > 0) {
            explored.sort((a,b) => {
                return b.estimate - a.estimate || a.cost - b.cost;
            })
log("Explored")
log(explored)
            let final = explored.length - 1;
            for (let i=0;i<explored.length;i++) {
                totalCost += explored[i].cost;
            }
        } else {
            totalCost = 100;
        }


        let elapsed = Date.now()-startTime;
        log("aStar done in " + elapsed/1000 + " seconds");

        return totalCost;



    }








    const TokenInfo = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let model = ModelArray[id];
        if (!model) {return};
        SetupCard(model.name,"",model.faction);
        let hex = HexMap[model.hexLabel];
log(hex)

        outputCard.body.push("Hex: " + model.hexLabel);
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        let cover = (hex.cover === 0) ? "None":(hex.cover === 1) ? "Light":"Hard";
        outputCard.body.push("Cover: " + cover);

        
        PrintCard();
    }


    const BlastCheck = (targetCentre,model,radius) => {
        radius = radius * HexInfo.size * 2;
        let modelCentre = HexMap[model.hexLabel].centre;
        let theta = Angle(model.token.get("rotation")) * Math.PI/180;
        let w = model.token.get("width");
        let h = model.token.get("height");
        let squareTokens = ["Infantry","Mortar"]; //tokens without a direction triangle
        if (squareTokens.includes(model.type) === false) {
            h -= 10;    
        }
        dXmin = modelCentre.x - (w/2);
        dXmax = modelCentre.x + (w/2);
        dYmin = modelCentre.y - (h/2);
        dYmax = modelCentre.y + (h/2);
        scale = pageInfo.scale;
        cX = (Math.cos(theta) * (targetCentre.x - modelCentre.x)) - (Math.sin(theta)*(targetCentre.y - modelCentre.y)) + modelCentre.x
        cY = (Math.sin(theta) * (targetCentre.x - modelCentre.x)) + (Math.cos(theta)*(targetCentre.y - modelCentre.y)) + modelCentre.y
        //closest point
        eX = Clamp(cX,dXmin,dXmax)
        eY = Clamp(cY,dYmin,dYmax)

        A = (eX - cX)
        B = (eY - cY)
        
        let caught = false;
        C = Math.sqrt(A*A + B*B)
        C = Math.round(C/70)*scale
        if (C<=radius) {
            caught = true
        }
        return caught;
    }

    const Clamp = (val,min,max) => {
        return (val>max) ? max:(val <min) ? min: val;
    }


    const DrawLine = (hex1,hex2) => {
        let x1 = hex1.centre.x;
        let x2 = hex2.centre.x;
        let y1 = hex1.centre.y;
        let y2 = hex2.centre.y;

        let x = (x1+x2)/2;
        let y = (y1+y2)/2;

        x1 = x - x1;
        x2 = x - x2;
        y1 = y - y1;
        y2 = y - y2;

        let pts = [[x1,y1],[x2,y2]];
        

        let page = getObj('page',Campaign().get('playerpageid'));
        let newLine = createObj('pathv2',{
            layer: "foreground",
            pageid: page.id,
            shape: "pol",
            stroke: '#000000',
            stroke_width: 3,
            fill: '#000000',
            x: x,
            y: y,
            points: JSON.stringify(pts),
        });

        
    }

    const RemoveLines = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "foreground",});
        _.each(paths,path => {
            path.remove();
        })
    }


    const RollDice = (msg) => {
        PlaySound("Dice");
        let roll = randomInteger(8);
        let playerID = msg.playerid;
        let id,model,player;
        if (msg.selected) {
            id = msg.selected[0]._id;
        }
        let faction = "Neutral";

        if (!id && !playerID) {
            log("Back")
            return;
        }
        if (id) {
            model = ModelArray[id];
            if (model) {
                faction = model.faction;
                player = model.player;
            }
        }
        if ((!id || !model) && playerID) {
            faction = state.XR.players[playerID];
            player = (state.XR.factions[0] === faction) ? 0:1;
        }

        if (!state.XR.players[playerID] || state.XR.players[playerID] === undefined) {
            if (faction !== "Neutral") {    
                state.XR.players[playerID] = faction;
            } else {
                sendChat("","Click on one of your tokens then select Roll again");
                return;
            }
        } 
        let res = "/direct " + DisplayDice(roll,faction,40);
        sendChat("player|" + playerID,res);
    }




    const ClearState = (msg) => {
        LoadPage();
        BuildMap();
        //clear arrays
        ModelArray = {};
        UnitArray = {};
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
        tokens.forEach((token) => {
            if (token.get("name").includes("Objective") === true) {return};
            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                aura2_color: "transparent",
                aura2_radius: 0,
                bar1_value: 0,
                showplayers_bar1: true,
                showplayers_bar2: false,
                showplayers_bar3: false,
                showname: true,
                showplayers_aura1: true,
                showplayers_aura2: true,
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
            });                
        });
    
        RemoveDead("All");

        state.XR = {
            playerIDs: ["",""],
            players: {},
            factions: ["",""],
            unitNum: [0,0],
            unitInfo: {},
            lines: [],
            turn: 0,
            activePlayer: -1,
            firstPlayer: -1,
            commanderID: ["",""],
            gamePoints: 0, //eg 24 points
        }
        BuildMap();
        sendChat("","Cleared State/Arrays");
    }


    const RemoveDepLines = () => {
        for (let i=0;i<state.XR.deployLines.length;i++) {
            let id = state.XR.deployLines[i];
            let path = findObjs({_type: "path", id: id})[0];
            if (path) {
                path.remove();
            }
        }
    }

    const RemoveDead = (info) => {
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "map",
        });
        tokens.forEach((token) => {
            if (token.get("status_dead") === true) {
                token.remove();
            }
            if (info === "All" && token.get("name") === "Wreck") {
                token.remove();
            }
            if (token.get("name") === "Map Marker") {
                token.remove();
            }
        });
        if (info === "All") {
            let tokens = findObjs({
                _pageid: Campaign().get("playerpageid"),
                _type: "graphic",
                _subtype: "token",
                layer: "foreground",
            });
            tokens.forEach((token) => {
                token.remove();
            });



        }



    }



    //line line collision where line1 is pt1 and 2, line2 is pt 3 and 4
    const lineLine = (pt1,pt2,pt3,pt4) => {
        //calculate the direction of the lines
        uA = ( ((pt4.x-pt3.x)*(pt1.y-pt3.y)) - ((pt4.y-pt3.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        uB = ( ((pt2.x-pt1.x)*(pt1.y-pt3.y)) - ((pt2.y-pt1.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            intersection = {
                x: (pt1.x + (uA * (pt2.x-pt1.x))),
                y: (pt1.y + (uA * (pt2.y-pt1.y)))
            }
            return intersection;
        }
        return;
    }
   


    const TargetAngle = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        //angle from shooter's hex to target's hex
        let phi = Angle(shooterHex.cube.angle(targetHex.cube));
        let theta = Angle(shooter.token.get("rotation"));
        let gamma = Angle(phi - theta);
        return gamma;
    }




    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooterID = Tag[1];
        let targetID = Tag[2];
        let shooter = ModelArray[shooterID];
        let coverLevels = ["No","Light","Hard"];
        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        let target = ModelArray[targetID];
        if (!target) {
            sendChat("","Not valid target");
            return;
        }
        SetupCard(shooter.name,"LOS",shooter.faction);
        let losResult = LOS(shooter,target);
        let distance = losResult.distance
        let s = (distance === 1) ? "":"es";
        outputCard.body.push("Distance: " + distance + " Hex" + s);
        if (losResult.los === false) {
            outputCard.body.push("[#ff0000]No LOS to Target[/#]");
            outputCard.body.push(losResult.losReason);
        } else {
            outputCard.body.push("Shooter has LOS to Target");
            outputCard.body.push("Target has " + coverLevels[losResult.cover] + " Cover");
            //outputCard.body.push("Target is in the " + losResult.shooterFacing + " Arc");
            //outputCard.body.push("Target is being hit on the " + losResult.targetFacing + " Arc");



        }



        PrintCard();
    }


    const LOS = (shooter,target) => {
        let los = true;
        let losReason = "";
        let cover = 0;
        let coverTerrain = "";
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHex = HexMap[target.hexLabel];
        let distance = shooter.Distance(target);

        //firing arc on weapon
        let angle = TargetAngle(shooter,target);
        let angleT = TargetAngle(target,shooter);
        let shooterFacing = (angle <= 60 || angle >= 300) ? "Front":"Side/Rear";
        let targetFacing = (angleT <= 60 || angleT >= 300) ? "Front":"Side/Rear";

        //check lines
        let pt1 = new Point(0,shooterHex.elevation);
        let pt2 = new Point(distance,targetHex.elevation);
log("Shooter E: " + shooterHex.elevation);
log("Target E: " + targetHex.elevation);

        let woodhexes = 0;
        let startInWoods = (shooterHex.los === "Woods") ? true:false;
log("Start in Woods: " + startInWoods);

        let interCubes = shooterHex.cube.linedraw(targetHex.cube)
log("Length: " + interCubes.length)
        for (let i=0;i<interCubes.length;i++) {
            let label = interCubes[i].label();
            let interHex = HexMap[label];
log("I: " + i + ": " + label + ": " + interHex.terrain)
            let teH = interHex.height; //terrain in hex
            let edH = 0; //height of any terrain on edge crossed
            let iH = Math.max(teH,edH);
            interHexHeight = iH + interHex.elevation;
            let pt3 = new Point(i,0);
            let pt4 = new Point(i,interHexHeight);
            
            if (lineLine(pt1,pt2,pt3,pt4)) {
log("Intersect Terrain")
                if (interHex.los === false) {
                    los = false;
                    losReason = "Blocked by " +  interHex.terrain;
                    break;
                }
                if (interHex.los === "Woods") {
                    woodhexes += 1;
                    if (woodhexes > 3) {
                        los = false;
                        losReason = "Blocked by Depth of Woods";
                        break;
                    }
                }
                if (interHex.los === true) {
                    if (woodhexes > 0) {
                        if (startInWoods === false) {
                            los = false;
                            losReason = "On Other Side of Woods";
                            break;
                        } 
                    }
                    startInWoods = false;
                    woodhexes = 0;
                }
                if (i > 0 && ((interCubes.length - i) <= 3 || i <= 2)) { //0 index 
                    cover = interHex.cover;
                    coverTerrain = interHex.terrain;
                }
            } else {
                if (woodhexes > 0) {
                    if (startInWoods === false) {
                        los = false;
                        losReason = "On Other Side of Woods";
                        break;
                    } 
                }
                startInWoods = false;
                woodhexes = 0;
            }
        }

        //target hex
        if (targetHex.los === "Woods") {
            woodhexes += 1;
            if (woodhexes > 5) {
                los = false;
                losReason = "Blocked by Depth of Woods";
            }
        } else if (woodhexes > 0 && startInWoods === false) {
            los = false;
            losReason = "On Other Side of Woods";
        }
        if (cover === 1 && targetHex.cover === 1 && targetHex.terrain !== coverTerrain) {
            cover = 2;
        } else {
            cover = Math.max(cover,targetHex.cover);
        }

log("Cover: " + cover)

        //check of other units for blocking los
        //sort their token centres into a polygon, then check if LOS line crosses it
        if (los === true) {
            _.each(UnitArray, unit => {
                if (unit.id !== shooter.unitID && los === true) {
                    let points = [];
                    _.each(unit.tokenIDs.length, tokenID => {
                        let model = ModelArray[tokenID];
                        let pt = HexMap[model.hexLabel].centre;
                        pts.push(pt);
                    })
                    polySort(points);
                    for (let i=0;i<points.length - 1;i++) {
                        let pt3 = points[i];
                        let pt4 = points[i+1];
                        if (lineLine(shooterHex.centre,targetHex.centre,pt3,pt4)) {
                            los = false;
                            losReson = "Another Unit is Blocking LOS";
                            break;
                        }
                    }
                }
            })
        }

        let result = {
            los: los,
            losReason: losReason,
            distance: distance,
            cover: cover,
            shooterFacing: shooterFacing,
            targetFacing: targetFacing,
        }

        return result;
    }

    const CreateUnit = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let Tag = msg.content.split(";");
        let unitPoints = Tag[1];

        let unit = new Unit(msg.selected[0]._id);
        state.XR.unitNum[unit.player] += 1;
        unit.symbol = "status_" + UnitMarkers[state.XR.unitNum] || "status_brown";
        let unitStrength = 0;

        let number = 1;
        _.each(msg.selected,e => {
            let id = e._id;
            let model = ModelArray[id];
            if (!model) {model = new Model(id)};
            unit.AddModel(id);
            let a1c,name;
            if (model.rank === "Trooper") {
                a1c = "transparent";
                name = model.charName + " " + number;
                number++;
            } else {
                a1c = "#00ff00";
                name = model.charName;
//call an actual name function for leaders eg. Brother Sgt or similar
            }
            model.token.set({
                name: name,
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: .05,
                aura1_color: a1c,
                aura2_color: "transparent",
                aura2_radius: 0,
                showplayers_bar1: false,
                showplayers_bar2: false,
                showplayers_bar3: false,
                showname: true,
                showplayers_aura1: true,
                showplayers_aura2: true,
                gmnotes: unit.id,
                statusmarkers: unit.symbol,
                tooltip: "",
                gmnotes: unit.id,
            });     
            if (model.wounds > 1) {
                model.token.set({
                    bar1_value: model.wounds,
                    bar1_max: model.wounds,
                })
            }
            unitStrength += model.wounds;
        })
        let info = {
            strength: unitStrength,
            points: unitPoints,
        }
        state.XR.unitInfo[unit.id] = info;
        sendChat("","Unit Created");
    }

    const IdentifyCommander = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        let model = ModelArray[msg.selected[0]._id];
        state.XR.commanderID[model.player] = model.id;
        model.token.set("status_flag",true);
        sendChat("","Commander Set");
    }



    const ActivateUnit = (msg) => {
        let Tag = msg.content.split(";");
        let id = msg.selected[0]._id;
        let order = Tag[1]; //Move, Shoot, Attack, others, options set in abilities
        let model = ModelArray[id];
        let unit = UnitArray[model.unitID];
        let errorMsg = [];

        if (model.token.get("aura1_color") !== "#00ff00") {
            errorMsg.push("Unit has already Activated this turn");
        }

        SetupCard("Activation",model.name,model.faction);

        if (ErrorMsg(errorMsg) === true) {return};

        if (state.XR.firstPlayer === -1) {
            state.XR.firstPlayer = unit.player;
        }
        if (state.XR.activePlayer !== unit.player) {
            state.XR.activePlayer = unit.player;
        }

        let pos = 0; //alter for thing like back in the fray
        if (model.token.get(SM.back) === true) {pos = 1}; //back into fray

        let orders = {
            Move: {
                moving: true,
                stat: "Move",
                target: model.moveOn[pos],
                phrase: "Unit can complete its Movement, it has a movement rate of " + model.moveRate,
                marker: "",
            },
            "Go to Ground": {
                moving: false,
                stat: "Move",
                target: model.moveOn[pos],
                phrase: "Unit Goes to Ground",
                marker: SM.gtg,
            },
            Attack: {
                moving: true,
                stat: "Attack",
                target: model.attackOn[pos],
                phrase: "Unit can complete its Charge, it has a movement rate of " + model.moveRate,
                marker: "",
            },
            Shoot: {
                moving: false,
                stat: "Shoot",
                target: model.shootOn[pos],
                phrase: "Unit may Shoot",
                marker: "",
            },
            Skirmish: {
                moving: true,
                stat: "Fixed 7",
                target: 7,
                phrase: "Unit may Move up to 1/2 (" + Math.floor(model.moveRate/2) + ") and Shoot, in either order",
                marker: SM.skirmish,
            },
            "Move and Shoot": {
                moving: true,
                stat: "Move",
                target: model.moveOn[pos],
                phrase: "Unit may Move (" + model.moveRate+ ") and Shoot, in either order",
                marker: "",
            },
        }

        let result = ActivationTest(model,orders[order].stat,orders[order].target,2,pos); 

        if (result === true) {
            outputCard.body.push(orders[order].phrase);
            let except = ["Open Order","All-Terrain","Skimmer","Flyer"];
            _.each(except,ex => {
                if (model.special.includes(ex) && orders[order].moving === true) {
                    outputCard.body.push("Unit has " + ex + " and can ignore some terrain effects");
                }
            })
        } else {
            outputCard.body.push("Activation Fails, Player's Turn is Over");
            _.each(UnitArray,unit => {
                if (unit.player === model.player) {
                    let leader = ModelArray[unit.leaderID];
                    if (leader.token.get("aura1_color") === "#00ff00") {
                        leader.token.set("aura1_color","#000000");
                    }
                }
            })
        }
        if (order !== "Go to Ground" && result !== true) {
            model.token.set(SM.gtg,false);
        }
        model.token.set("aura1_color","#000000");
        PrintCard();
    }

    const ErrorMsg = (msgs) => {
        if (msgs.length === 0) {return false};
        _.each(msgs,msg => {
            outputCard.body.push(msg);
        })
        PrintCard();
        return true;
    }





    const RallyUnit = (msg) => {
        let id = msg.content.split(";")[1];
        let model = ModelArray[id];
        let unit = UnitArray[model.unitID];
        let leader = ModelArray[unit.leaderID];
        let errorMsg = [];
        SetupCard(leader.name,"Rally",leader.faction);
        if (leader.token.get("aura1_color") !== "#ffff00") {
            errorMsg.push("Unit is not Suppressed");
        }
        if (ErrorMsg(errorMsg) === true) {return};
        let result = CourageTest(unit);
        outputCard.body.push(result.text);
        if (result === true) {
            outputCard.body.push("Unit has Rallied");
            if (leader.special.includes("Back into the Fray")) {
                leader.token.set(SM.back,true);
                outputCard.body.push("The Unit has Back into the Fray");
                outputCard.body.push("It can Activate but must take an Activation Test even if Auto");
            }
        } 
        if (result !== "Rout") {
            unit.Rally();
        }
        PrintCard();
    }

    const WildCharge = (msg) => {
        //testing to see if unit needs to test for wild charge is done at start of players turn, unit leaders have red auras
        let Tag = msg.content.split(";");
        let id = Tag[1];
        let model = ModelArray[id];
        let unit = UnitArray[model.unitID];
        let errorMsg = [];
        SetupCard(model.name,"Wild Charge",model.faction);
        if (model.token.get("aura1_color") !== "#ff0000") {
            errorMsg.push("Unit is not Subject to Wild Charge");
        }
        if (ErrorMsg(errorMsg) === true) {return};
        let result = ActivationTest(model,"Attack",model.attackOn[0],2);
        outputCard.body.push(result.text);
        if (result === true) {
            outputCard.body.push("Unit must conduct an Attack against an enemy unit in charge range");
        } else {
            outputCard.body.push("Unit's turn is done.")
        }
        PrintCard();
    }


    const ActivationTest = (model,statName,target,dice) => {
        let targetText = target + "+";
        if (target === 1) {targetText = "Auto"}
        let line = "";
        let total = 0;
        for (let i=0;i<dice;i++) {
            let roll = randomInteger(6);
            total += roll;
            line += DisplayDice(roll,Factions[model.faction].dice,24) + " ";
        }
        line += " vs. " + targetText + " (" + statName + ")";
        outputCard.body.push(line);
        model.token.set(SM.back,false);

        if (total >= target) {
            outputCard.body.push("Success!");
            return true;
        } else {
            outputCard.body.push("[#ff0000]Failure![/#]");
            return false;
        }
    }






    const CourageTest = (unit,casualties = 0) => {
        let currentStrength = 0;
        let inCover = 0;
        let unitLeader = ModelArray[unit.leaderID]
        let target = unitLeader.courage;
        let courageTip = "Unit Courage: " + target;
        _.each(unit.tokenIDs,tokenID => {
            let model = ModelArray[tokenID];
            currentStrength += model.token.get("bar1_value");
            if (HexMap[model.hexLabel].cover > 0) {inCover++};
        })
        let dice = (currentStrength/state.XR.unitInfo[unit.id].strength > 0.5) ? 2:1;
        courageTip += "<br>Dice: " + dice;
        if (dice === 1) {courageTip += " [Unit Half Strength]"};
        let mods = 0;
        //bonuses
        if (inCover >= unit.tokenIDs.length/2) {
            mods ++;
            courageTip += "<br>+1 for Unit in Cover";
        }
        let commander = ModelArray[unit.commanderID];
        if (commander) {
            let distance = Unit.Distance(commander,unit);
            if (distance <= 12) {
                mods++;
                courageTip += "<br>+1 for Commander in 12 hexes";
            }
        }
        //penalties
        if (casualties > 0) {
            mods -= casualties;
            courageTip += "<br>Casualties: -" + casualties; 
        }
        let detachPoints = 0;
        _.each(UnitArray,unit2 => {
            if (unit2.player === unit.player) {
                detachPoints += state.XR.unitInfo[unit2.id].points;
            }
        })
        if (detachPoints <= state.XR.gamePoints[unit.player]/2) {
            mods -= 1;
            courageTip += "<br>-1 as Detachment Casualties";
        }

        let line = "";
        let total = 0;
        for (let i=0;i<dice;i++) {
            let roll = randomInteger(6);
            total += roll;
            line += DisplayDice(roll,Factions[unit.faction].dice,24) + " ";
        }
        total += mods;
        line += " vs. " + target + "+";
        outputCard.body.push(line);

        let success = '[Success: ](#" class="showtip" title="' + courageTip + ')';
        let failure = '[Failure: ](#" class="showtip" title="' + courageTip + ')';
        if (total >= target) {
            outputCard.body.push(success + "The Unit makes the Courage Test");
            return true;
        } else {
            outputCard.body.push(failure + "The Unit fails the Courage Test")
            if (total > 0) {
                if (unitLeader.token.get("aura1_color") === "#ffff00") {
                    outputCard.body.push("It loses another Strength Point");
                    unit.Damage(1);
                } else {
                    outputCard.body.push("The Unit is Suppressed");
                    unit.Suppress();
                }
                outputCard.body.push("The Unit must immediately Retreat");
                return false;
            } else {
                outputCard.body.push("[/#ff0000]The Unit Routs from the Field![/#]");
                unit.Destroy();
                return "Rout";
            }
        }
    }


    const Test = (msg) => {
        let Tag =  msg.content.split(";");
        let model1 = ModelArray[Tag[1]];
        let model2 = ModelArray[Tag[2]];
        let result = aStar(model1,model2);
log(result)
        sendChat("","Done");
    }










    const changeGraphic = (tok,prev) => {
        //RemoveLines();
        let model = ModelArray[tok.id];
        if (model) {
            let label = (new Point(tok.get("left"),tok.get("top"))).label();
            let prevLabel = (new Point(prev.left,prev.top)).label();
            if (label !== model.hexLabel || tok.get("rotation") !== prev.rotation) {
                
                log(model.name + ' is moving from ' + model.hexLabel + ' to ' + label)
                let index = HexMap[model.hexLabel].tokenIDs.indexOf(model.id);
                if (index > -1) {
                    HexMap[model.hexLabel].tokenIDs.splice(index,1);
                }
                HexMap[label].tokenIDs.push(model.id);
                model.hexLabel = label;
                model.token.set({
                    left: HexMap[label].centre.x,
                    top: HexMap[label].centre.y,
                })
            }
        }
    }


    const addGraphic = (obj) => {
        log(obj)
        RemoveLines();




    }
    
    const destroyGraphic = (obj) => {
        let name = obj.get("name");
        log(name + " Destroyed")
        if (ModelArray[obj.get("id")]) {
            delete ModelArray[obj.get("id")];
        }


    }






    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':
                log("State");
                log(state.XR);
                log("Models");
                log(ModelArray);
                log("Platoons");
                log(PlatoonArray)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!CreateUnit':
                CreateUnit(msg);
                break;
            case '!Activate':
                ActivateUnit(msg);
                break;
            case '!Rally':
                RallyUnit(msg);
                break;

            case '!SetupGame':
                SetupGame(msg);
                break;
            case '!NextTurn':
                NextTurn();
                break;

            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!Test':
                Test(msg);
                break;
            case '!Roll':
                RollDice(msg);
                break;


        }
    };

    function displayCurrentTime() {
        let now = new Date();
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');
        hours -= 5; //GMT to EST
        ampm = hours > 12 ? " PM":" AM";
        hours = hours > 12 ? hours-12:hours;
        let time = hours + ":" + minutes + ampm
        return time
    }



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on("add:graphic", addGraphic);
        on('change:graphic',changeGraphic);
        on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===>Xenos Rampant<===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready at " + displayCurrentTime());
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


