const XR = (() => {
    const version = '2026.4.9';
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

    let UnitArray = {};
    let PlatoonArray = {};
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
        },
        "Orks": {
            "image": "",
            "backgroundColour": "#00ff00",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px double",
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
        hug: "status_Disadvantage-or-Down::2006464",




    }



    //height is height of terrain element
    //move -> 0 = open, 1 = difficult, 2 = impassable to ground
    //cover for  fire - 0 = None, 1 = Light, 2 = Heavy
    //los -> additive, once hit 1 next hex is blocked
    //so woods are .2 -> can see in 5 hexes

    const LinearTerrain = {




    }

    const Capit = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }


    const TerrainInfo = {
        "Woods": {name: "Woods",height: 2, los: "Woods", move: 1, cover: 1},



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

    const FX = (fxname,unit1,unit2) => {
        //unit2 is target, unit1 is shooter
        //if its an area effect, unit1 isnt used
        if (fxname.includes("System")) {
            //system fx
            fxname = fxname.replace("System-","");
            if (fxname.includes("Blast")) {
                fxname = fxname.replace("Blast-","");
                spawnFx(unit2.token.get("left"),unit2.token.get("top"), fxname);
            } else {
                spawnFxBetweenPoints(new Point(unit1.token.get("left"),unit1.token.get("top")), new Point(unit2.token.get("left"),unit2.token.get("top")), fxname);
            }
        } else {
            let fxType =  findObjs({type: "custfx", name: fxname})[0];
            if (fxType) {
                spawnFxBetweenPoints(new Point(unit1.token.get("left"),unit1.token.get("top")), new Point(unit2.token.get("left"),unit2.token.get("top")), fxType.id);
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


    const KeyNum = (unit,keyword) => {
        let key = unit.keywords.split(",");
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
            for (var i = 1; i <= N; i++) {
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
            this.move = 0;
            this.los = true;
            this.edges = {};
            _.each(DIRECTIONS,a => {
                this.edges[a] = "Open";
            })
            HexMap[this.label] = this;
        }
    }

    class Unit {
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
            


            UnitArray[id] = this;
            //HexMap[label].tokenIDs.push(id);






        }




        Distance = (unit2) => {
            let hex1 = HexMap[this.hexLabel];
            let hex2 = HexMap[unit2.hexLabel];
            let distance = hex1.cube.distance(hex2.cube);
            distance -= (this.size + unit2.size - 1); 
            return distance;
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
        let unit = UnitArray[id];
        if (!unit) {return};
        AddAbilities2(unit);
    }


    const AddAbilities2 = (unit) => {
        let char = getObj("character", unit.charID);   

        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: char.id});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        //Move 
        if (unit.moveMax > 0) {
            abilityName = "0 - Move";
            action = "!Activate;Move;@{selected|token_id}";
            AddAbility(abilityName,action,char.id);
        }

        let systemNum = 0;
        //Use Weapons 
        for (let i=0;i<unit.weapons.length;i++) {
            let weapon = unit.weapons[i];
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
        //AddEdges();
        AddTokens();


        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };







    //terrain that is edges - hedges, walls, barricades and such
    const AddEdges = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let type = EdgeInfo[path.get("stroke").toLowerCase()];
            if (type) {
                let vertices = translatePoly(path);
                //work through pairs of vertices
                for (let i=0;i<(vertices.length -1);i++) {
                    let pt1 = vertices[i];
                    let pt2 = vertices[i+1];
                    let midPt = new Point((pt1.x + pt2.x)/2,(pt1.y + pt2.y)/2);
                    //find nearest hex to midPt
                    let hexLabel = midPt.label();
                    //now run through that hexes neighbours and see what intersects with original line to identify the 2 neighbouring hexes
                    let hex1 = HexMap[hexLabel];
                    if (!hex1) {continue}
                    let pt3 = hex1.centre;
                    let neighbourCubes = hex1.cube.neighbours();
                    for (let j=0;j<neighbourCubes.length;j++) {
                        let k = j+3;
                        if (k> 5) {k-=6};
                        let hl2 = neighbourCubes[j].label();
                        let hex2 = HexMap[hl2];
                        if (!hex2) {continue}
                        let pt4 = hex2.centre;
                        let intersect = lineLine(pt1,pt2,pt3,pt4);
                        if (intersect) {
                            //dont overwrite bridges
                            if (hex1.edges[DIRECTIONS[j]].name !== "Bridge") {
                                hex1.edges[DIRECTIONS[j]] = type;
                            }
                            if (hex2.edges[DIRECTIONS[k]].name !== "Bridge") {
                                hex2.edges[DIRECTIONS[k]] = type;
                            }
                        }
                    }
                }
            }
        })
    }


    const AddTerrain = () => {
        //part 1 - add terrain that is tokens - woods, rubble
        //add terrain using tokens on map page, either on top or under map
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
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





        //part 2 - add buildings
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
            if (path.get("stroke").toLowerCase() === "#ffffff") {
                let vertices = translatePoly(path);
log("Road")
log(vertices)
                for (let i=0;i<vertices.length - 1;i++) {
                    let hl1 = vertices[i].label();
                    let hl2 = vertices[i+1].label();
                    let hex1 = HexMap[hl1];
                    let hex2 = HexMap[hl2];
                    hex1.road = true;
                    hex2.road = true;
                    let cubes = hex1.cube.linedraw(hex2.cube);
                    _.each(cubes,cube => {
                        let hex = HexMap[cube.label()];
                        hex.road = true;
                    })
                }
            }
        });
    }

     
    const AddTokens = () => {
        PlatoonArray = {};
        UnitArray = {};
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
            gmn = gmn.split(";");
            let unit = new Unit(token.get("id"))



        });
        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Unit Array");

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



    const PlaceTarget = (msg) => {
        let Tag = msg.split(";");
        let id = Tag[0];
        let type = Tag[1];
        let unit = UnitArray[id];

        if (type === "Relay") {
            let charID = "-OWqqZirwy4ocuhD9Llb";
            let img = "https://files.d20.io/images/105823565/P035DS5yk74ij8TxLPU8BQ/thumb.png?1582679991";           
            img = getCleanImgSrc(img);
            let newToken = createObj("graphic", {
                left: unit.token.get("left"),
                top: unit.token.get("top"),
                width: 50,
                height: 50, 
                pageid: Campaign().get("playerpageid"),
                imgsrc: img,
                layer: "objects",
                represents: charID,
                name: "Marker",
            })
            let newUnit = new Unit(newToken.id);
            newUnit.targettingUnitID = id;
            log(newUnit)
        }

        




    }

    const SetupGame = (msg) => {
        let Tag = msg.content.split(";");
        let firstFaction = Tag[1];
        let roads = Tag[2];
        let firstPlayer = state.XR.factions[0] === firstFaction ? 0:1;
        state.XR.firstPlayer = firstPlayer;
        state.XR.turn = 0;
        state.XR.activePlayer = 2;
        state.XR.phase = "";
        RemoveMoveMarkers();
        state.XR.moveMarkers = [];
        state.XR.visibility = 70; //can later alter this

        state.XR.roads = (roads === "True") ? true:false;



    }


 
 



    const TokenInfo = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        SetupCard(unit.name,"",unit.faction);
        let hex = HexMap[unit.hexLabel];
log(hex)

        outputCard.body.push("Hex: " + unit.hexLabel);
        outputCard.body.push("Terrain: " + hex.terrain);
        outputCard.body.push("Elevation: " + hex.elevation);
        let cover = (hex.cover === 0) ? "None":(hex.cover === 1) ? "Light":"Hard";
        outputCard.body.push("Cover: " + cover);

        for (let i=0;i<6;i++) {
            let edge = hex.edges[DIRECTIONS[i]];
            if (edge !== "Open") {
                outputCard.body.push(edge.name + " on " + DIRECTIONS[i] + " Edge");
            }
        }




        
        PrintCard();
    }


    const BlastCheck = (targetCentre,unit,radius) => {
        radius = radius * HexInfo.size * 2;
        let unitCentre = HexMap[unit.hexLabel].centre;
        let theta = Angle(unit.token.get("rotation")) * Math.PI/180;
        let w = unit.token.get("width");
        let h = unit.token.get("height");
        let squareTokens = ["Infantry","Mortar"]; //tokens without a direction triangle
        if (squareTokens.includes(unit.type) === false) {
            h -= 10;    
        }
        dXmin = unitCentre.x - (w/2);
        dXmax = unitCentre.x + (w/2);
        dYmin = unitCentre.y - (h/2);
        dYmax = unitCentre.y + (h/2);
        scale = pageInfo.scale;
        cX = (Math.cos(theta) * (targetCentre.x - unitCentre.x)) - (Math.sin(theta)*(targetCentre.y - unitCentre.y)) + unitCentre.x
        cY = (Math.sin(theta) * (targetCentre.x - unitCentre.x)) + (Math.cos(theta)*(targetCentre.y - unitCentre.y)) + unitCentre.y
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
        let id,unit,player;
        if (msg.selected) {
            id = msg.selected[0]._id;
        }
        let faction = "Neutral";

        if (!id && !playerID) {
            log("Back")
            return;
        }
        if (id) {
            unit = UnitArray[id];
            if (unit) {
                faction = unit.faction;
                player = unit.player;
            }
        }
        if ((!id || !unit) && playerID) {
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


    const PlaceArtToken = (spotterID, artilleryID,type) => {
        let spotter = UnitArray[spotterID];
        let artilleryUnit = UnitArray[artilleryID];
        let radius = (artilleryUnit.artsize - 1) * 100;
        let img = getCleanImgSrc("https://files.d20.io/images/105823565/P035DS5yk74ij8TxLPU8BQ/thumb.png?1582679991");
        let name = artilleryUnit.name + " Target";
        let charID = "-OkLrIEzBQrYJMzCEg5H";
        let existing = findObjs({_type:"graphic", represents: charID});
        _.each(existing,tok => {
            let exist = UnitArray[tok.get("id")];
            if (exist) {
                delete UnitArray[tok.get("id")];
            }
            tok.remove();
        })

        let newToken = createObj("graphic", {
            left: spotter.token.get("left"),
            top: spotter.token.get("top"),
            width: 80,
            height: 80, 
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: "objects",
            represents: charID,
            tooltip: name,
            show_tooltip: true,
            name: name,
            showname: true,
            disableTokenMenu: true,
            showplayers_aura1: true,
            aura1_color: "#ffff00",
            aura1_radius: radius,
            gmn: "TargetIcon",
        })
        //redo ability
        let abilArray = findObjs({_type: "ability", _characterid: charID});
        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        
        let abilityName = (type === "HE") ? "Fire for Effect":"Drop Smoke";
        let action = "!ArtilleryTwo;" + newToken.get("id") + ";" + spotterID + ";" + artilleryID + ";" + type
        AddAbility(abilityName,action,charID);
        toFront(newToken);

        let target = new Unit(newToken.get("id"));
log(target)


    }



    const ClearState = (msg) => {
        LoadPage();
        BuildMap();
        //clear arrays
        UnitArray = {};
        PlatoonArray = {};
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
            platoonNum: [0,0],
            platoonInfo: {},
            lines: [],
            turn: 0,
            phase: "Deployment",
            activePlayer: 0,
            firstPlayer: 0,
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
        let shooter = UnitArray[shooterID];
        let coverLevels = ["No","Light","Hard"];
        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        let target = UnitArray[targetID];
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
        for (let i=0;i<interCubes.length - 1;i++) {
            let label = interCubes[i].label();
            let interHex = HexMap[label];
log(label + ": " + interHex.terrain)
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
                cover = Math.max(cover,interHex.cover);
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
        cover = Math.max(cover,targetHex.cover);

log("Cover: " + cover)

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







    const changeGraphic = (tok,prev) => {
        //RemoveLines();
        let unit = UnitArray[tok.id];
        if (unit) {
            let label = (new Point(tok.get("left"),tok.get("top"))).label();
            let prevLabel = (new Point(prev.left,prev.top)).label();
            if (label !== unit.hexLabel || tok.get("rotation") !== prev.rotation) {
                

                log(unit.name + ' is moving from ' + unit.hexLabel + ' to ' + label)
                let index = HexMap[unit.hexLabel].tokenIDs.indexOf(unit.id);
                if (index > -1) {
                    HexMap[unit.hexLabel].tokenIDs.splice(index,1);
                }
                HexMap[label].tokenIDs.push(unit.id);
                unit.hexLabel = label;
                unit.token.set({
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
        if (UnitArray[obj.get("id")]) {
            delete UnitArray[obj.get("id")];
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
                log("Units");
                log(UnitArray);
                log("Platoons");
                log(PlatoonArray)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;

            case '!SetupGame':
                SetupGame(msg);
                break;

            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
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


