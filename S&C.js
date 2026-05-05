const Main = (() => {
    const version = '2026.5.5';
    if (!state.SC) {state.SC = {}};

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
    

    let outputCard = {title: "",subtitle: "",side: "",body: [],buttons: [],};

    const Factions = {
        "Wermacht": {
            "image": "",
            "backgroundColour": "#A7A9AC",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px groove",
            dice: "Wermacht",
        },
        "US Army": {
            "image": "",
            "backgroundColour": "#A2B283",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px double",
            dice: "US Army",
        },

        "Neutral": {
            "image": "",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#00FF00",
            "borderStyle": "5px ridge",
            dice: "Neutral",

        },

    };


    const SM = {
        veteran: "status_letters_and_numbers0222::5982341",
        green: "status_letters_and_numbers0057::5982175",
        moved: "status_Advantage-or-Up::2006462",
        flanked1: "status_letters_and_numbers0228::5982146",
        flanked2: "status_letters_and_numbers0229::5982147",
        fired: "status_Shell::5553215",
        supp: "status_yellow",
        rallied: "status_interdiction",
        onfire: "status_Hot-or-On-Fire-2::2006479",
        immobilized: "status_Paralyzed::2006491",
        uncommand: "status_RIP::2006647",
        shaken: "status_Terror::181068",
        zeroed: "status_Bullseye-Red::2006541",
        assault: "status_Fast::5868456",
    }

    const Capit = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }


    const TerrainInfo = {
        "Open": {name: "Open Field", type: "Open", infantry: 0, cover: 0, blockLOS: false},
        "Dugout": {name: "Dugout", type: "Dugout", infantry: 2, cover: -2, blockLOS: false},
        "Ruins": {name: "Ruins", type: "Ruins", infantry: 2, cover: -2, blockLOS: false},
        "Brush": {name: "Brush", type: "Rough", infantry: 0, cover: -1, blockLOS: false},
        "Road": {name: "Road", type: "Road", infantry: 0, cover: 0, blockLOS: false},
        "Orchard": {name: "Orchard", type: "Open", infantry: 1, cover: -1, blockLOS: false},
        "Farmhouse": {name: "Farmhouse", type: "Open", infantry: 2, cover: -3, blockLOS: true},
        "Ploughed": {name: "Ploughed Fields", type: "Soft", infantry: 0, cover: 0, blockLOS: false},
        "Hill Open": {name: "Open Hilltop", type: "Open", infantry: 0, cover: 0, blockLOS: true},
        "Hill Brush": {name: "Hilltop w/ Brush", type: "Rough", infantry: 0, cover: -1, blockLOS: true},
        "Woods": {name: "Woods", type: "Rough", infantry: 1, cover: -2, blockLOS: true},
        "Hill Woods": {name: "Wooded Hilltop", type: "Rough", infantry: 1, cover: -2, blockLOS: true},

    }



    const EdgeInfo = {
        "#93c47d": "Bocage",



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
        return;
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

        linedraw2(b) {
            //returns array of hexes between this hex and hex 'b' incl. hex 'b', nudging other way from above 
            var N = this.distance(b);
            var a_nudge = new Cube(this.q - 1e-06, this.r - 1e-06, this.s + 2e-06);
            var b_nudge = new Cube(b.q - 1e-06, b.r - 1e-06, b.s + 2e-06);
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
            this.name = "Offboard";
            this.type = "Offboard"
            this.cover = 0;
            this.infantry = 0;
            this.blockLOS = false;
            this.edges = {};
            _.each(DIRECTIONS,a => {
                this.edges[a] = "Open";
            });
            HexMap[this.label] = this;
        }
    }

    class Unit {
        constructor(id) {
            let token = findObjs({_type:"graphic", id: id})[0];
            let cube = (new Point(token.get("left"),token.get("top"))).toCube();
            let label = cube.label();
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

            this.faction = aa.faction || "Neutral";
            if (state.SC.factions[0] === "" && this.faction !== "Neutral") {
                state.SC.factions[0] = this.faction;
            } else if (state.SC.factions[0] !== this.faction && state.SC.factions[1] === "" && this.faction !== "Neutral") {
                state.SC.factions[1] = this.faction;
            }
            this.player = (this.faction === "Neutral") ? 2:(state.SC.factions[0] === this.faction)? 0:1;
            this.type = aa.type;
            let experience = "Experienced";
            if (token.get(SM.green) === true) {
                experience = "Green";
            }
            if (token.get(SM.veteran) === true) {
                experience = "Veteran";
            }
            this.experience = experience;
            this.armour = parseInt(aa.armour);
            this.move = parseInt(aa.move);
            let notes = ["radio","deployed","deployed2","indirect","transport","openTopped","airborne","hq","line","sniper","at","skirts","cover1"];
            _.each(notes,note => {
                this[note] = (aa[note] === "1") ? true:false;
            })
            this.mode = aa.mode || "Foot";
            this.zeroLabel = "";

            let weapons = [];
            for (let i=1;i<3;i++) {
                let name = aa["weapon" + i + "Name"];
                if (!name || name === "") {continue};
                let dice = parseInt(aa["weapon" + i + "Dice"]);
                let attack = ["-"];
                for (let j=1;j<6;j++) {
                    let att = aa["weapon" + i + "Attack" + j] || "-";
                    attack.push(att);
                }
                attack[0] = attack[1];
                let notes = aa["weapon" + i + "Notes"] || " ";

                let sound = aa["weapon" + i + "Sound"];
                let weapon = {
                    name: name,
                    dice: dice,
                    attack: attack,
                    notes: notes,
                    sound: sound,
                }
                weapons.push(weapon);
            }
            this.weapons = weapons;
            this.token = token;
            this.cube = cube;
            this.label = label;


            if (this.type.includes("Squad")) {
                this.team1ID = aa.team1ID || ""; //Rifle Team
                this.team2ID = aa.team2ID || ""; //depending on unit, rifle team or MG team
            }

            let keys = Object.keys(state.SC.players);
            for (let i=0;i<2;i++) {
                let playerID = keys[i];
                let player = state.SC.players[i];
                if (player === this.faction) {
                    this.playerID = playerID;
                }
            }


            UnitArray[id] = this;
            HexMap[label].tokenIDs.push(id);


        }


        Suppress(){
            let level = parseInt(this.token.get(SM.supp)) || 0;
            level++;
            this.token.set(SM.supp,false); //zeroes
            this.token.set(SM.supp,level); //sets to new level
        }

        Rally(){
            let level = parseInt(this.token.get(SM.supp)) || 0;
            if (level === 1) {
                this.token.set(SM.rallied,true);
            }
            level--;
            if (level <= 0) {level = false};
            this.token.set(SM.supp,level);
        }

        Flanked(){
            if (this.token.get(SM.flanked1) === true) {  
                this.token.set(SM.flanked1,false);
                this.token.set(SM.flanked2,true);
            } else {
                this.token.set(SM.flanked1,true);
            }
        }

        Split(label){
            //split unit into two teams
            let markers = this.token.get("statusmarkers");
            let token1 = summonToken(this.team1ID,this.token.get("left"),this.token.get("top"),100);
            let token2 = summonToken(this.team2ID,this.token.get("left") + 15,this.token.get("top") + 15,100);
            let unit1 = new Unit(token1.get("id"));
            unit1.token.set("statusmarkers",markers);
            let unit2 = new Unit(token2.get("id"));
            unit2.token.set("statusmarkers",markers);
            this.Casualty(false);
        }

        Half(){
            //squad taked damage and turns into team
            //this.team1ID is char ID
            let markers = this.token.get("statusmarkers");
            let token = summonToken(this.team1ID,this.token.get("left"),this.token.get("top"),100);
            let unit = new Unit(token.get("id"));
            unit.token.set("statusmarkers",markers);
            unit.Suppress();
            this.Casualty(false);
        }

        Casualty(note = true) {
            //send a false if just remove
            if (note === true) {
                this.token.set("layer","map");
                this.token.set("status_dead",true);
            } else {
                this.token.remove();
            }
            delete UnitArray[this.id];
        }

        Damage(ap) {
            //vehicle damage
            let damageRoll = randomInteger(6);
            let damageTip = "<br>Roll: " + damageRoll;
            let damageResult = damageRoll;

            damageResult += ap;
            damageTip += "<br>Weapon AP +" + ap;

            damageResult -= this.armour;
            damageTip += "<br>Armour: -" + this.armour;

            if (this.token.get(SM.flanked1) === true) {
                damageResult++;
                damageTip += "<br>Flanked +1";
            }
            if (this.token.get(SM.flanked2) === true) {
                damageResult += 2;
                damageTip += "<br>Flanked +2";
            }
            if (this.skirts === true) {
                damageResult--;
                damageTip += "<br>Armour Skirting -1";
            }
            damageResult = Math.max(Math.min(5,damageResult),1);

            damageTip = "Net " + damageResult + damageTip;
            damageTip = '[🎲](#" class="showtip" title="' + damageTip + ')';

            switch(damageResult) {
                case 1:
                    if (this.token.get(SM.shaken) === false) {
                        outputCard.body.push(damageTip + ' The Crew is Shaken, the Unit cannot fire this turn');
                        this.token.set(SM.shaken,true);
                    } else {
                        outputCard.body.push(damageTip + " The shot does only superficial damage");
                    }
                    break;
                case 2:
                    if (this.token.get(SM.uncommand) === false) {
                        let roll = randomInteger(2);
                        if (roll === 1 || this.radio === false) {
                            outputCard.body.push(damageTip + " The Vehicle has lost its Commander");
                        } else {
                            outputCard.body.push(damageTip + " The Vehicle has had its radio destroyed");
                        }
                        this.token.set(SM.uncommand,true);
                    } else {
                        outputCard.body.push(damageTip + " The shot does only superficial damage");
                    }
                    break;
                case 3:
                    if (this.token.get(SM.immobilized) === false) {
                        if (this.mode === "Wheeled") {
                            outputCard.body.push(damageTip + " The Vehicle has lost wheel(s) and is Immobilized");
                        } else {
                            outputCard.body.push(damageTip + " The Vehicle has lost a track and is Immobilized");
                        }
                        this.token.set(SM.immobilized,true);
                    } else {
                        outputCard.body.push(damageTip + " The shot does only superficial damage");
                    }
                    break;
                case 4:
                    if (this.token.get(SM.onfire) === false) {
                        outputCard.body.push(damageTip + " The Vehicle is on Fire!");
                        this.token.set(SM.onfire,true);
                    } else {
                        outputCard.body.push(damageTip + " The shot does only superficial damage");
                    }
                    break;
                case 5:
                    outputCard.body.push(damageTip + ' The Vehicle is Destroyed!');
                    this.Casualty();
                    break;
            }
        }

        Fire() {
            if (this.token.get(SM.onfire) === false) {return};
            let roll = randomInteger(6);
            SetupCard(this.name,"Fire",this.faction);
            if (roll === 1) {
                outputCard.body.push("The Crew get the Fire Out");
                this.token.set(SM.onfire,false);
            } else if (roll === 6) {
                outputCard.body.push("The Fire hits Fuel or Ammo, the Vehicle is Destroyed");
                this.Casualty();
            } else {
                outputCard.body.push("The Fire continues to burn");
            }
            PrintCard();
        }

        Smoke(cID) {
            let c = HexMap[this.label].centre;
            let token = summonToken(cID,c.x,c.y,280);
            toFront(token);
            token.set("layer","foreground");
            let unit = new Unit(token.get("id"));
            this.Casualty(false);
        }

        Reveal() {
            let sides = this.token.get("sides").split("|");
            this.token.set({
                currentSide: 0,
                imgsrc: tokenImage(sides[0]),
                controlledby: "all",
            })
        }

        Hide() {
            let sides = this.token.get("sides").split("|");
            this.token.set({
                currentSide: 1,
                imgsrc: tokenImage(sides[1]),
                controlledby: this.playerID,
            })
        }





    }



    const AssignTeams = (msg) => {
        let Tag = msg.content.split(";");
        let parentUnit = UnitArray[Tag[1]];
        let team1Unit = UnitArray[Tag[2]];
        let team2Unit = UnitArray[Tag[3]];
        AttributeSet(parentUnit.charID,"team1ID",team1Unit.charID);
        AttributeSet(parentUnit.charID,"team2ID",team2Unit.charID);
        sendChat("","Teams Set");
    }


    summonToken = function(cID,left,top,size = 70) {
        let character = getObj("character", cID);
        let newToken;
        character.get('defaulttoken',function(defaulttoken){
            const dt = JSON.parse(defaulttoken);
            let img = dt.imgsrc;
            img = tokenImage(img);
            if(dt && img){
                dt.imgsrc=img;
                dt.left=left;
                dt.top=top;
                dt.pageid = pageInfo.page.get('id');
                dt.layer = "objects";
                dt.width = size;
                dt.height = size;
                newToken = createObj("graphic", dt);
            } else {
                sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
            }
        });
        return newToken;
    }


    const CheckVisibility = (unit) => {
        //when move, if hidden
        let u1Sighted = unit.token.get("currentSide") === 0 ? true:false; 
        let flag = false;
        let uIDs = Object.keys(UnitArray);
        for (let i=0;i<uIDs.length;i++) {
            let id = uIDs[i];
            if (id === unit.id) {continue};
            let unit2 = UnitArray[id];
            if (unit2.faction === unit.faction) {continue};
            let u2Sighted = unit2.token.get("currentSide") === 0 ? true:false;
            if (u1Sighted === true && u2Sighted === true) {
                continue;
            }
            let losResult = LOS(unit2,unit);
            if (losResult.los === false) {
                flag = true;
                continue;
            };
            if (u2Sighted === false) {
                unit2.Reveal();
                
            }
            if (u1Sighted === false) {
                unit.Reveal();
                u1Sighted = true;
            }
        }
        if (flag === false) {
            state.SC.hidden = false;
            //no more hidden units
        }
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
        if (!obj) {return "NA"}
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
        AddTerrain();    
        AddTokens();


        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };



    const AddTerrain = () => {
        //part 1 - add hex terrain
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        _.each(tokens,token => {
            let name = token.get("name");
            if (name.includes("Hill") === false) {
                name = name.split(" ")[0];
            }
            let terrain = TerrainInfo[name];
            if (terrain) {
//log(terrain)
                let centre = new Point(token.get("left"),token.get('top'));
                let centreLabel = centre.toCube().label();
                let hex = HexMap[centreLabel];
                hex = Object.assign(hex, terrain);
                HexMap[centreLabel] = hex;
            }
        })

        //part 2 - add hedges and such, defined by paths
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
                            hex1.edges[DIRECTIONS[j]] = type;
                            hex2.edges[DIRECTIONS[k]] = type;
                        }
                    }
                }
            }
        })
    }
     
    const AddTokens = () => {
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
            if (character) {
                let unit = new Unit(token.get("id"));
            }
        });
        let elapsed = Date.now()-start;
        log(`${c} token${s} checked in ${elapsed/1000} seconds - ` + Object.keys(UnitArray).length + " placed in Unit Array");
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
        //!Setup;?{Hidden Units|Yes|No};?{Don is|Wermacht|US Army};?{Ted is|Wermacht|US Army};
        let Tag = msg.content.split(";");
        state.SC.hidden = Tag[1] === "Yes" ? true:false;
        state.SC.players["-OrEQprPPo3w2WOluH58"] = Tag[2];
        //state.SC.players[""] = Tag[3];



    }

    const NextTurn = () => {
        let turn = state.SC.turn;

        turn++;
        state.SC.turn = turn;

        SetupCard("Turn " + turn,"","Neutral");
        PrintCard();

        let removals = ["shaken","fired","moved","flanked1","flanked2","assault","shaken","rallied"];
        _.each(UnitArray,unit => {
            _.each(removals,marker => {
                unit.token.set(SM[marker],false);
                unit.Fire();
                unit.Rally();
                if (unit.name.includes("Smoke") || unit.name.includes("Phosphorus")) {
                    unit.Casualty(false);
                }
            })
        })

        //minefields/engineers
        //artillery placed in prev rounds






    }
 

    const InitiativeCheck = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        SetupCard(unit.name,"Command Initiative",unit.faction);
        let pass = false;
        let line = false;
        if ((unit.hq === true || unit.radio === true) && unit.token.get(SM.uncommand) === false) {
            pass = true;
        } else {
            let hex = HexMap[unit.label];
            let ids = hex.tokenIDs;
            _.each(ids,id2 => {
                if (id2 !== id) {
                    let unit2 = UnitArray[id2];
                    if (unit2.hq === true) {
                        outputCard.body.push("In Hex with HQ Unit");
                        pass = true;
                    } else if (unit2.radio === true) {
                        outputCard.body.push("In Hex with Radio Unit");
                        pass = true;
                    } else if (unit2.line === true) {
                        line = id2;
                    }
                }
            })
            let cubes = hex.cube.neighbours();
            _.each(cubes,cube => {
                let hex2 = HexMap[cube.label()];
                let ids = hex2.tokenIDs;
                _.each(ids,id2 => {
                    let unit2 = UnitArray[id2];
                    if (unit2.hq === true) {
                        outputCard.body.push("Adjacent to HQ Unit");
                        pass = true;
                    }            
                })
            })
            if (pass === false) {
                let roll = randomInteger(6);
                let target = 5;
                if (unit.experience === "Experienced") {target = 4};
                if (unit.experience === "Veteran") {target = 3};
                if (unit.token.get(SM.uncommand) === true && unit.radio === false) {
                    outputCard.body.push("Unit's Commander is dead -1");
                    target++;
                }

                outputCard.body.push(DisplayDice(roll,unit.faction,32) + " vs. " + target + "+");
                outputCard.body.push("Experience Level: " + unit.experience);
                if (roll >= target) {
                    pass = true;
                }
            }
        }

        if (pass === true) {
            outputCard.body.push("Passed, Unit and any associated Units can move");
        } else {
            outputCard.body.push("[#ff0000]Failed, Unit cannot move[/#]");
        }
        PrintCard();
    }

    const Split = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        SetupCard(unit.name,"Split into Teams",unit.faction);
        unit.Split();
        outputCard.body.push(unit.name + " has split into its 2 Teams");
        PrintCard();
    }

    const Assault = (msg) => {
        //also use for overrun
        //only add to teams/squads, not D or S and call Assault, for vehicle call Overrun
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        let action = "Assault";
        if (unit.type === "Vehicle") {
            action = "Overrun";            
        }
        SetupCard(unit.name,action,unit.faction);
        if (unit.token.get(SM.fired) === true) {
            outputCard.body.push("Unit has already Attacked");
        } else if (unit.token.get(SM.moved) === true) {
            outputCard.body.push("Unit has already Moved");
        } else {
            outputCard.body.push(unit.name + " can Move into and " + action + " a neighbouring Hex");
            outputCard.body.push("Any Defending Units can Fire First if they have not Fired this Turn");
            unit.token.set(SM.assault,true);
            unit.token.set(SM.moved,false);
        }
        PrintCard();
    }


    const Shoot = (msg) => {    
        let Tag = msg.content.split(";");
        let shooter = UnitArray[Tag[1]];
        let target = UnitArray[Tag[2]];
        let shooterHex = HexMap[shooter.label];
        let targetHex = HexMap[target.label];
        let weapon = shooter.weapons[Tag[3]];
        let errorMsg = [];
        SetupCard(shooter.name,"Direct Fire",shooter.faction);

        if (shooter.token.get(SM.fired) === true) {
            errorMsg.push("Unit already Fired");
        }
        if (shooter.token.get(SM.shaken) === true) {
            errorMsg.push("Unit is unable to attack, the Crew is Shaken this turn");
        }
        if (shooter.sniper === true && target.type === "Vehicle") {
            errorMsg.push("Cannot target Vehicles");
        }
        if (shooter.at === true && target.type.includes("Infantry")) {
            errorMsg.push("Cannot target Infantry");
        }
        if (shooter.token.get(SM.moved) === true && (shooter.deployed === true || shooter.deployed2 === true)) {
            errorMsg.push("Unit just Deployed and cannot attack this turn");
        }
///deployed 2 - both move and prior turn move ? how to track
        let indirect = false;
        let losResult = LOS(shooter,target);
        if (losResult.los === false) {visual = false};

        if ((losResult.distance > 4 || (losResult.distance > 3 && weapon.attack[4] === "-")) && weapon.notes.includes("Indirect")) {
            //allows indirect fire by unit at longer range
            losResult.distance = (weapon.attack[4] === "-") ? 3:4;
            outputCard.subtitle = "Indirect Fire";
            indirect = true;
        }

        if (losResult.los === false) {
            if (weapon.notes.includes("Indirect")) {
                outputCard.subtitle = "Indirect Fire";
                indirect = true;
                if (Indirect(shooter,target) === false) {
                    errorMsg.push("No Observers with LOS");
                }
            } else {
                errorMsg.push("No LOS, " + losResult.losReason);
            }
        }
        
        let attackCombo = false;
        _.each(shooterHex.tokenIDs,tokenID => {
            let u2 = UnitArray[tokenID];
            if (u2.name.includes("Smoke")) {
                errorMsg.push("Cannot Fire due to Smoke");
            }
            if (shooter.type.includes("Infantry") && u2.type === "Vehicle" && u2.armour > 1) {
                attackCombo = true;
            }
        })

        if (weapon.attack[losResult.distance] === "-") {
            errorMsg.push("Not in Weapon's Range");
        }
        if (ErrorMsg(errorMsg) === true) {return};

        shooterNote = "";
        targetNote = "";

        if (shooter.token.get(SM.assault) === true) {
            if (shooter.type === "Vehicle") {
                shooterNote = "Overrun";
            } else {
                shooterNote = "Assaulter";
            }
            targetNote = "Defender";
        }
        if (target.token.get(SM.assault) === true) {
            if (target.type === "Vehicle") {
                targetNote = "Overrun";
            } else {
                targetNote = "Assaulter";
            }
            shooterNote = "Defender";
        }

        let whitePhos = target.name.includes("Phosphorus");
        let smoke = target.name.includes("Smoke");
        if (whitePhos === true || smoke === true) {
            indirect = true;
        }
        if (whitePhos === true) {
            weapon = {
                name: "White Phosphorus",
                dice: 2,
                attack: [1,1,1,1,1],
                notes: "Ignores Terrain",
                sound: "Mortar",
            }
        }

        let smokeInHex = false; //preexisting smoke
        let defenceCombo = false; //check for tank/infantry 

        _.each(targetHex.tokenIDs,tokenID => {
            let u2 = UnitArray[tokenID];
            if (u2.name.includes("Smoke")) {
                smokeInHex = true;
            }
            if (target.type.includes("Infantry") && u2.type === "Vehicle" && u2.armour > 1) {
                defenceCombo = true;
            }
        })

        //check for scatter
        let zeroed = false;
        if (target.token.get(SM.zeroed) === true && shooter.zeroLabel === target.label) {
            zeroed = true;
        }
        if(zeroed === false) {
            let roll1 = randomInteger(6);
            let roll2 = randomInteger(6);
            let scatter = roll1 + roll2;
            outputCard.body.push("Scatter Rolls: " + DisplayDice(roll1,shooter.faction,26) + " " + DisplayDice(roll2,shooter.faction,26));
            if (scatter > 4 && scatter < 10) {
                outputCard.body.push("Fire Zeroed in on Target(s)");
                zeroed = true;
                shooter.zeroLabel = target.label;
            } else {
                let dir = DIRECTIONS[randomInteger(6)];
                let newLabel = targetHex.cube.neighbour(dir).label();
                targetHex = HexMap[newLabel];
                if (targetHex && targetHex.name !== "Offboard") {
                    outputCard.body.push("Fire Scatters to the " + dir);
                    outputCard.body.push("Landing in Hex " + newLabel);
                } else {
                    outputCard.body.push("Fire Scatters Offboard");
                }
            } 
        } else {
            outputCard.body.push("Fire is Already Zeroed In");
        }

        outputCard.body.push("[hr]")

        //targets in hex
        let targets = [];
        if (targetHex) {
            if (indirect === true || shooterNote === "Overrun") {
                _.each(targetHex.tokenIDs,tokenID => {
                    let t2 = UnitArray[tokenID];
                    if (t2) {
                        targets.push(t2);
                        if (zeroed) {
                            t2.token.set(SM.zeroed,true);
                        }
                    }
                })
            } else {
                targets = [target];
            }
        }

        if (targets.length === 0) {
            outputCard.body.push("No Targets Hit");
            //will skip next bit as length 0
        }

        if (smoke === true && targetHex) {
            target.token.set({
                left: targetHex.centre.x,
                top: targetHex.centre.y
            })
            outputCard.subtitle = "Smoke";
            target.Smoke("-OrZClZHMVrN3_8ZuHzx"); 
        } else {
            for (let t=0;t<targets.length;t++) {
                let target = targets[t];
                if (t>0) {outputCard.body.push([hr])};
                outputCard.body.push("[U]" + target.name + "[/u]");
                if (shooterNote === "Overrun") {
                    let trampleRoll = randomInteger(6);
                    let trampleTip = "Roll: " + trampleRoll;
                    let result = trampleRoll + shooter.armour - 1 + targetHex.cover;
                    trampleTip += "<br>Armour: +" + shooter.armour;
                    trampleTip += "<br>Moving: -1";
                    trampleTip += "<br>Cover: " + targetHex.cover;
                    let need = targetHex.infantry;
                    trampleTip = "Result: " + result + " vs. " + need +"+";
                    trampleTip = '[🎲](#" class="showtip" title="' + trampleTip + ')';
                    if (result >= need) {
                        if (target.type.includes("Squad")) {
                            outputCard.body.push(trampleTip + " " + target.name + " is Supressed and reduced to a Team");
                            target.Half();
                        } else {
                            outputCard.body.push(trampleTip + " " + target.name + " Is Destroyed");
                            target.Casualty();
                        }
                        outputCard.body.push(shooter.name + " must now continue its Move");
                    } else {
                        outputCard.body.push("The Overrun fails, although the target unit is Suppressed");
                        target.Suppress();
                    }
                } else {
                    let dice = weapon.dice;
                    let mod = 0;
                    let cover = targetHex.cover;
                    let noCover = false;
                    let shootTip = "";
                    if (indirect === true) {
                        noCover = true;
                        shootTip += "<br>Indirect Fire, No Terrain Cover";
                    }
                    if (weapon.notes.includes("Ignores Terrain")) {
                        noCover = true;
                        shootTip += "<br>" + weapon.name + " Ignores Cover";
                    }
                    if (targetNote === "Overrun") {
                        noCover = true;
                        shootTip += "<br>Overrunning Unit gets no Terrain Cover";
                    }
                    if (targetNote === "Assaulter") {
                        noCover = true;
                        shootTip += "<br>Assaulting Unit gets no Terrain Cover";
                    }
                    if (targetNote === "Defender") {
                        noCover = true;
                        shootTip += "<br>Defending Unit gets no Terrain Cover";
                    }
                    if (smokeInHex === true) {
                        cover -= 2;
                        shootTip += "<br>Smoke in Hex -2 Cover";
                    }

                    shootTip += (noCover === true) ? "<br>No Terrain Cover":"<br>Terrain Cover " + cover;

                    if (cover === 0 && noCover === false && defenceCombo === true) {
                        cover = -1;
                        shootTip += "<br>Armour Cover -1";
                    }
                    mod += cover;
                
                    if (shooterNote === "Assaulter" && shooter.faction === "US Airborne") {
                        dice++;
                        shootTip += "<br>+1 Dice for Airborne Assault";
                    }


                    if (target.token.get(SM.moved) === true && targetNote !== "Overrun" && targetNote !== "Assaulter") {
                        shootTip += "<br>Target Moved -1";
                        mod--;
                    }
                    if (shooter.token.get(SM.moved) === true && shooterNote !== "Assaulter" && shooterNote !== "Overrun") {
                        shootTip += "<br>Shooter Moved -1";
                        mod--;
                    }
                    if (shooterNote === "Assaulter") {
                        shootTip += "<br>Shooter Assaulting -1";
                        mod--;
                    }
                    if (shooterNote === "Overrun") {
                        shootTip += "<br>Shooter Overrunning -1";
                        mod--;
                    }
                    if (attackCombo === true) {
                        shootTip += "<br>Infantry/Armour Combo -1";
                        mod--;
                    }

                    if (shooter.token.get(SM.supp) !== false) {
                        let supp = parseInt(shooter.token.get(SM.supp));
                        shootTip += "<br>Shooter Suppressed -" + supp;
                        mod-=supp;
                    }
                    if (target.cover1 === true && indirect === false) {
                        shootTip += "<br>Target hard to hit, -1 Cover";
                        mod--;
                    }
                    if (weapon.notes.toLowerCase().includes("+1 to hit")) {
                        shootTip += "<br>Shooter has +1 to Hit";
                        mod++;
                    }
                    if (weapon.notes.toLowerCase().includes("-1 to hit")) {
                        shootTip += "<br>Shooter has -1 to Hit";
                        mod--;
                    }


                    let rolls = [];
                    let hits = 0;
                    for (let i=0;i<dice;i++) {
                        let roll = randomInteger(6);
                        roll += mod;
                        rolls.push(roll);
                        if (roll > losResult.distance) {
                            hits++;
                        }
                    }
                    rolls.sort();
                    rolls.reverse();
                    shootTip = "Results: " + rolls.toString() + " vs. " + (losResult.distance + 1) + "+" + shootTip;

                    if (hits === 0) {
                        shootTip = '[Missed](#" class="showtip" title="' + shootTip + ')';
                    } else {
                        shootTip = '[Hit](#" class="showtip" title="' + shootTip + ')';
                    }
                    outputCard.body.push(shootTip + " with " + weapon.name);

                    if (hits > 0) {
                        let ap = parseInt(weapon.attack[losResult.distance]);
                        let attackTip = "Weapon AP: " + ap + "<br>vs."
                        let armour = DeepCopy(target.armour);
                        if (shooterNote === "Assault" && target.openTopped === true) {
                            armour = 0;
                        }
                        attackTip += "<br>Target's Armour: " + armour;

                        if (target.type.includes("Infantry") && targetNote !== "Defender") {
                            if (weapon.notes.includes("Ignores Terrain")) {
                                attackTip += "<br>" + weapon.name + " Ignores Terrain";
                            } else {
                                armour += targetHex.infantry;
                                attackTip += "<br>Terrain Armour: " + targetHex.infantry;
                            }
                            if (defenceCombo === true && armour < 2) {
                                attackTip += "<br>Friendly Armour: +2";
                            }
                        }

                        if (target.note === "Overrun") {
                            armour--;
                            attackTip += "<br>Overrunning Unit has -1 Armour";
                        }
                        if (target.note === "Assaulter") {
                            armour--;
                            attackTip += "<br>Assaulting Unit has -1 Armour";
                        }

                        armour = Math.max(0,armour);

                        attackTip = '[🎲](#" class="showtip" title="' + attackTip + ')';
                        if (ap >= armour) {
                            if (target.type.includes("Infantry") || target.type === "Gun") {
                                if (shooter.sniper === true) {
                                    if (target.type.includes("Support")) {
                                        outputCard.body.push(attackTip + " " + target.name + " Is Destroyed");
                                        target.Casualty();
                                    } else {
                                        outputCard.body.push(attackTip + " " + target.name + " is Suppressed by Sniper Fire");
                                        target.Suppress();
                                    }
                                } else {
                                    if (target.type.includes("Squad")) {
                                        outputCard.body.push(attackTip + " " + target.name + " is Supressed and reduced to a Team");
                                        target.Half();
                                    } else {
                                        outputCard.body.push(attackTip + " " + target.name + " Is Destroyed");
                                        target.Casualty();
                                    }
                                }
                            } else {
                                outputCard.body.push(attackTip + " " + target.name + " takes Damage");
                                target.Damage(ap);
                            }
                        } else {
                            outputCard.body.push(attackTip + " Target survives the fire");
                            if (target.armour > 0 && ap > 1) {
                                outputCard.body.push("Target is Flanked for rest of the Turn");
                                target.Flanked();
                            }
                            if (target.type.includes("Infantry") || target.type === "Gun") {
                                outputCard.body.push("Target gains a level of Suppression");
                                target.Suppress();
                            }
                        }
                    }
                }
            }
        }

        if (whitePhos === true && targetHex) {
            outputCard.body.push("Any surviving units must exit the Hex");
        }
        log(shooter.token)
        if (shooter.token.get("currentSide") === 1 && losResult.los === true) {
            shooter.Reveal();
        }


        shooter.token.set(SM.fired,true);
        PrintCard();

    }


    const Indirect = (shooter,target) => {
        //does adjacent unit have LOS
        let neighbours = HexMap[shooter.label].cube.neighbours();
        for (let i=0;i<6;i++) {
            let hex2 = HexMap[neighbours[i].label()];
            for (let j=0;j<hex2.tokenIDs.length;j++) {
                let unit2 = UnitArray[hex2.tokenIDs[j]];
                let los = LOS(unit2,target);
                if (los.los === true) {
                    return true;
                }
            }
        }
        //if not, and shooter has radio, does recon/hq with radio have LOS?
        if (shooter.radio === true) {
            _.each(UnitArray,unit2 => {
                if (unit2.faction === shooter.faction && unit2.radio === true && (unit2.recon === true || unit2.hq === true)) {
                    let los = LOS(unit2,target);
                    if (los.los === true) {
                        return true;
                    }
                }
            })
        }
        return false;
    }

    const Overrun = (msg) => {





    }




    const TokenInfo = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        SetupCard(unit.name,"",unit.faction);
        let hex = HexMap[unit.label];
log(hex)
        outputCard.body.push("Hex: " + unit.label);
        outputCard.body.push("Terrain Name: " + hex.name);
        outputCard.body.push("Movement Type: " + hex.type);
        outputCard.body.push("Elevation: " + hex.elevation);
        outputCard.body.push("Infantry Armour: " + hex.infantry);
        outputCard.body.push("Cover Modifier: " + hex.cover);
        if (hex.blockLOS === true) {
            outputCard.body.push("Hex Blocks LOS");
        }
        _.each(DIRECTIONS,a => {
            if (hex.edges[a] !== "Open") {
                outputCard.body.push("The " + a + " Edge has " + hex.edges[a]);
            }
        });
        PrintCard();
    }

    const AddHiddenSide = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        let token = unit.token;
        let side2;
        if (unit.faction === "Wermacht") {
            side2 = "https://files.d20.io/images/485724322/sxYKpRjfXnz2Jvy4_A9O3Q/thumb.png?1777837809";
        }
        if (unit.faction === "US Army") {
            side2 = "https://files.d20.io/images/485724905/l08my_W6sSXr0q7YHUbx5A/thumb.png?1777838018";
        }
        let side1 = token.get("imgsrc");
        let sides = side1 + "|" + side2;
log(sides)
        token.set({
            sides: sides,
            currentSide: 0,
            disableSnapping: true,
            disableTokenMenu: true,
        })
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

    const RollDice = (msg) => {
        PlaySound("Dice");
        let roll = randomInteger(6);
        let playerID = msg.playerid;
log(playerID);
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
            unit = UnitArray[id];
            if (unit) {
                faction = unit.faction;
                player = unit.player;
            }
        }
        if ((!id || !unit) && playerID) {
            faction = state.SC.players[playerID];
            player = (state.SC.factions[0] === faction) ? 0:1;
        }

        if (!state.SC.players[playerID] || state.SC.players[playerID] === undefined) {
            if (faction !== "Neutral") {    
                state.SC.players[playerID] = faction;
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
        UnitArray = {};

    
        //RemoveDead("All");

        state.SC = {
            players: {},
            factions: ["",""],
            turn: 0,
            hidden: false,
        }
        BuildMap();
        sendChat("","Cleared State/Arrays");
    }


    const RemoveDepLines = () => {
        for (let i=0;i<state.SC.deployLines.length;i++) {
            let id = state.SC.deployLines[i];
            let path = findObjs({_type: "path", id: id})[0];
            if (path) {
                path.remove();
            }
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
   




    const CheckLOS = (msg) => {
        let Tag = msg.content.split(";");
        let shooter = UnitArray[Tag[1]];
        let target = UnitArray[Tag[2]];
        let targetHex = HexMap[target.label];

        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        if (!target) {
            sendChat("","Not valid target");
            return;
        }
        SetupCard(shooter.name,"LOS",shooter.faction);

        let losResult = LOS(shooter,target);
        outputCard.body.push("Distance: " + losResult.distance + " Hexes");
        if (losResult.los === false) {
            outputCard.body.push("No LOS to Target");
            outputCard.body.push(losResult.losReason);
        } else {
            outputCard.body.push("There is LOS to Target");
            if (targetHex.cover === 0) {
                outputCard.body.push("Target has no Terrain Cover");
            } else {
                outputCard.body.push("Target has Cover of " + targetHex.cover);
            }
            if (target.cover1 === true) {
                outputCard.body.push("Target is hard to hit, -1 Cover");
            }

            if (target.type.includes("Infantry") && targetHex.infantry > 0) {
                outputCard.body.push("Target has Armour Bonus of " + targetHex.infantry);
            }
        }
        
        PrintCard();
    }


    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.label];
        let targetHex = HexMap[target.label];
        let distance = targetHex.cube.distance(shooterHex.cube);
        let finalLOS = true;
        let finalLOSReason = "";
        let ignoreEdge = (shooterHex.name.includes("Hill")) ? [1,1]:[0,0];
 
        let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
        let labels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];

        let len = labels[0].length;
        let los = [true,true];
        let losReason = ["",""];
        for (let side=0;side<2;side++) {
            for (let i=0;i<len;i++) {
                let interHex = HexMap[labels[side][i]];
                let lastHex = shooterHex;
                if (i>0) {
                    lastHex = HexMap[labels[side][i-1]];
                }
                //does hex block LOS (unless is targetHex)
                if (interHex.blockLOS === true && i<(len-1)) {
                    los[side] = false;
                    losReason[side] = interHex.name;
                    break;
                }
                //smoke or white phosphorus
                _.each(interHex.tokenIDs,tokenID => {
                    let u2 = UnitArray[tokenID];
                    if ((u2.name.includes("Smoke") || u2.name.includes("Phosphorus")) && u2.name.includes("Ammo") === false) {
                        los[side] = false;
                        losReason[side] = "Smoke";
                    }
                })
                //does edge between hex and prior hex block LOS
                let dir = lastHex.cube.whatDirection(interHex.cube);
                let edge = lastHex.edges[dir];
                if (edge === "Bocage") {
                    if (ignoreEdge[side] === 0) {
                        los[side] = false;
                        losReason[side] = "Bocage";
                        break;
                    } else {
                        ignoreEdge[side] = 0;
                    }
                }
            }
        }

        if (los[0] === false && los[1] === false) {
            finalLOS = false;
            finalLOSReason = losReason[0];
            if (losReason[0] !== losReason[1]) {
                finalLOSReason += " / " + losReason[1];
            }
            finalLOSReason = "Blocked by " + finalLOSReason;
        }

        let result = {
            los: finalLOS,
            losReason: finalLOSReason,
            distance: distance,
        }

        return result;
    }




    const ErrorMsg = (msgs) => {
        if (msgs.length === 0) {return false};
        _.each(msgs,msg => {
            outputCard.body.push(msg);
        })
        PrintCard();
        return true;
    }





    const changeGraphic = (tok,prev) => {
        let unit = UnitArray[tok.id];
        if (unit) {
            let cube = (new Point(tok.get("left"),tok.get("top"))).toCube();
            let label = cube.label();
            let prevLabel = (new Point(prev.left,prev.top)).label();
            if (label !== prevLabel) {
                if (unit.token.get(SM.immobilized) === true) {
                    label = prevLabel;
                    sendChat("",unit.name + " Is Immobilized");
                }
                if (unit.token.get(SM.supp) > 0 && unit.token.get(SM.assault) === false) {
                    label = prevLabel;
                    sendChat("",unit.name + " Is Suppressed");
                }
                if (unit.token.get(SM.rallied) === true) {
                    label = prevLabel;
                    sendChat("",unit.name + " Just Rallied");
                }

                log(unit.name + ' is moving from ' + prevLabel + ' to ' + label)
                //remove old occupied hexes
                let index = HexMap[prevLabel].tokenIDs.indexOf(unit.id);
                if (index > -1) {
                    HexMap[prevLabel].tokenIDs.splice(index,1);
                }
                //place in new hex
                if (HexMap[label].tokenIDs.includes(unit.id) === false) {
                    HexMap[label].tokenIDs.push(unit.id);
                }
                unit.label = label;
                unit.cube = cube;
                if (state.SC.turn > 0 && label !== prevLabel && unit.token.set(SM.assault) === false) {
                    unit.token.set(SM.moved,true);
                }
                if (label === prevLabel) {
                    unit.token.set({
                        left: prev.left,
                        top: prev.top,
                    })
                } else {
                    unit.token.set(SM.zeroed,false);
                    PlaySound(unit.mode);
                    if (state.SC.hidden === true) {
                        CheckVisibility(unit);
                    }
                }
            }
        } else {
            let character = getObj("character", tok.get("represents"));   
            if (character) {
                let unit = new Unit(tok.get("id"));
                log(unit.name + " was added to array")
            }
        }
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
                log(HexMap)
                log("State");
                log(state.SC);
                log("Units");
                log(UnitArray)
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!AddAbilities':
                AddAbilities(msg);
                break;
            case '!InitiativeCheck':
                InitiativeCheck(msg);
                break;

            case '!SetupGame':
                SetupGame(msg);
                break;
            case '!NextTurn':
                NextTurn();
                break;
            case '!CrossCheck':
                Cross(msg);
                break;

            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!Split':
                Split(msg);
                break;
            case '!Assault':
                Assault(msg);
                break;

            case '!Roll':
                RollDice(msg);
                break;
            case '!Shoot':
                Shoot(msg);
                break;
            case '!AssignTeams':
                AssignTeams(msg);
                break;
            case '!AddHidden':
                AddHiddenSide(msg);
                break;
        }
    };

   



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        //on("add:graphic", addGraphic);
        on('change:graphic',changeGraphic);
        on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===>Stars and Crosses<===");
        log("===> Software Version: " + version + " <===")
        LoadPage();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready at " + new Date().toLocaleTimeString("en-US", {timeZone: "America/Toronto"}) + " EST");
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


