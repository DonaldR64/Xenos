const XR = (() => {
    const version = '2026.4.27';
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

        },

    };


    const SM = {
        veteran: "status_letters_and_numbers0222::5982341",
        green: "status_letters_and_numbers0057::5982175",
        moved: "status_Advantage-or-Up::2006462",
        flanked1: "status_letters_and_numbers0228::5982146",
        flanked2: "status_letters_and_numbers0229::5982147",
        shot: "status_Shell::5553215",

    }

    const Capit = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }


    const TerrainInfo = {
        "Open": {name: "Open Field", type: "Open", infantry: 0, cover: 0, blockLOS: false},
        "Dugout": {name: "Dugout", type: "Dugout", infantry: 2, cover: -2, blockLOS: false},
        "Ruins": {name: "Ruins", type: "Ruins", infantry: 2, cover: -2, blockLOS: false},
        "Brush": {name: "Brush", type: "Brush", infantry: 0, cover: -1, blockLOS: false},
        "Road": {name: "Road", type: "Road", infantry: 0, cover: 0, blockLOS: false},
        "Orchard": {name: "Orchard", type: "Open", infantry: 1, cover: -1, blockLOS: false},
        "Farmhouse": {name: "Farmhouse", type: "Open", infantry: 2, cover: -3, blockLOS: true},
        "Ploughed": {name: "Ploughed Fields", type: "Soft", infantry: 0, cover: 0, blockLOS: false},




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
            if (state.SC.factions[0] === "") {
                state.SC.factions[0] = this.faction;
            } else if (state.SC.factions[0] !== this.faction && state.SC.factions[1] === "") {
                state.SC.factions[1] = this.faction;
            }
            this.player = (this.faction === "Neutral") ? 2:(state.SC.factions[0] === this.faction)? 0:1;
            this.type = aa.type;
            this.experience = aa.experience || "Experienced";
            this.armour = parseInt(aa.armour);
            this.move = parseInt(aa.move);
            let notes = ["radio","deployed","deployed2","indirect","transport","openTopped","airborne"];
            _.each(notes,note => {
                this[note] = (aa[note] === "1") ? true:false;
            })

            let weapons = [];
            for (let i=1;i<3;i++) {
                let name = aa["weapon" + i + "Name"];
                if (!name || name === "") {continue};
                let dice = parseInt(aa["weapon" + i + "Dice"]);
                let attack = aa["weapon" + i + "Attack"];


                let sound = aa["weapon" + i + "Sound"];
                let weapon = {
                    name: name,
                    dice: dice,
                    attack: attack,
                    sound: sound,
                }
                weapons.push(weapon);
            }

            this.token = token;
            this.cube = cube;
            this.label = label;

            UnitArray[id] = this;
            HexMap[label].tokenIDs.push(id);


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
        //AddElevations();
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
            name = name.split(" ")[0];
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
        //!Setup;?{Game Points|0}
        let Tag = msg.content.split(";");
        state.SC.gamePoints = Tag[1];

    }

    const NextTurn = () => {
        //is really next players turn
        let turn = state.SC.turn;
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
                if (unit.faction === state.SC.activePlayer) {
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
            if (state.SC.activePlayer !== state.SC.firstPlayer) {
                turn++
            } 
            state.SC.activePlayer = (state.SC.activePlayer === 0) ? 1:0;
            let faction = state.SC.factions[state.SC.activePlayer];
            SetupCard(faction,"Turn " + turn,faction);
            outputCard.body.push("Start with Rallying Suppressed Units (Yellow)");
            outputCard.body.push("Then activate any units with Wild Charge active (Red)");
            outputCard.body.push("Finally can activate remaining Units (Green)");
            SetAuras(faction); //set to green or red, those that arent yellow/suppressed







        }

        state.SC.turn = turn;
        PrintCard();


    }
 

    const InitiativeCheck = (msg) => {
        //HQ and Radio dont have this macro
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let unit = UnitArray[id];
        if (!unit) {return};
        SetupCard(unit.name,"Command Initiative",unit.faction);
        let pass = false;
        let line = false;

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
        let hexes = hex.cube.neighbours();
        _.each(hexes,hex2 => {
            let ids = hex2.tokenIDs;
            _.each(ids,id2 => {
                let unit2 = UnitArray[id2];
                if (unit2.hq === true) {
                    outputCard.body.push("Adjacent to HQ Unit");
                    pass = true;
                }            
            })
        })

        // in hex iwth field line marker with link



        
        




        if (pass === false) {
            let roll = randomInteger(6);
            let target = 5;
            if (unit.experience === "Experienced") {target = 4};
            if (unit.experience === "Veteran") {target = 3};
            outputCard.body.push(DisplayDice(roll,unit.faction,32) + " vs. " + target + "+");
            outputCard.body.push("Experience Level: " + unit.experience);
            if (roll >= target) {
                pass = true;
            }
        }

        if (pass === true) {
            outputCard.body.push("Passed, Unit and any associated Units can move");
        } else {
            outputCard.body.push("[#ff0000]Failed, Unit cannot move[/#]");
        }
        PrintCard();
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

    
        RemoveDead("All");

        state.SC = {
            playerIDs: ["",""],
            players: {},
            factions: ["",""],
            turn: 0,


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
        let startTime = Date.now();
        let Tag = msg.content.split(";");
        let shooter = ModelArray[Tag[1]];
        let shooterUnit = UnitArray[shooter.unitID];
        let target = ModelArray[Tag[2]];
        let targetUnit = UnitArray[target.unitID];
        let coverLevels = ["No","Light","Hard"];
        if (!shooter) {
            sendChat("","Not valid shooter");
            return;
        }
        if (!target) {
            sendChat("","Not valid target");
            return;
        }
        SetupCard(shooter.name,"LOS",shooter.faction);

        let losResult = GroupLOS(shooterUnit,targetUnit);
        
        //outputCard.body.push("Distance: " + distance + " Hex" + s);
        if (losResult.los === false) {
            outputCard.body.push("[#ff0000]No LOS to Target Unit[/#]");
            //outputCard.body.push(losResult.losReason);
        } else {
            outputCard.body.push("LOS to Target");
            outputCard.body.push("Distance between Units: " + losResult.distance + "  Hexes");
            outputCard.body.push("Target Unit has " + coverLevels[losResult.cover] + " Cover");
        }


        let elapsed = Date.now()-startTime;
        log("Check Group LOS in " + elapsed/1000 + " seconds");


        PrintCard();
    }


    const LOS = (shooter,target) => {
        let los = true;
        let losReason = "";
        let cover = 0;
        let coverTerrain = "";
        let shooterHex = HexMap[shooter.label];
        let targetHex = HexMap[target.label];
        let distance = shooter.ClosestHex(target).distance;
        //firing arc on weapon
        let angle = TargetAngle(shooter,target);
        let angleT = TargetAngle(target,shooter);
        let shooterFacing = (angle <= 60 || angle >= 300) ? "Front":"Side/Rear";
        let targetFacing = (angleT <= 60 || angleT >= 300) ? "Front":"Side/Rear";

        //check lines
        let pt1 = new Point(0,shooterHex.elevation);
//log("Pt1: " + pt1.x + " / " + pt1.y);

        let woodhexes = 0;
        let startInWoods = (shooterHex.los === "Woods") ? true:false;
//log("Start in Woods: " + startInWoods);

        let interCubes = shooterHex.cube.linedraw(targetHex.cube)
        let interLabels = [];
//log("Length: " + interCubes.length)
        let pt2 = new Point(interCubes.length + 1,targetHex.elevation);
//log("Pt2: " + pt2.x + " / " + pt2.y);

        mainLoop:
        for (let i=0;i<interCubes.length;i++) {
            let label = interCubes[i].label();
            interLabels.push(label);
            let interHex = HexMap[label];

            if (interHex.tokenIDs.length > 0) {
                for (let y=0;y<interHex.tokenIDs.length;y++) {
                    let model3 = ModelArray[interHex.tokenIDs[y]];
                    if (model3.unitID !== shooter.unitID && model3.unitID !== target.unitID) {
                        los = false;
                        losReason = "Blocked by an Intervening Unit";
                        break mainLoop;
                    }
                }
            }

//log("I: " + i + ": " + label + ": " + interHex.terrain)
            let interHexHeight = interHex.height + interHex.elevation;
            let pt3 = new Point(i,0);
            let pt4 = new Point(i,interHexHeight);
//log("Pt3: " + pt3.x + " / " + pt3.y);
//log("Pt4: " + pt4.x + " / " + pt4.y);


            let intersect = lineLine(pt1,pt2,pt3,pt4);
//log("Intersect: " + intersect)
            if (intersect) {
                if (interHex.los === false) {
                    los = false;
                    losReason = "Blocked by " +  interHex.terrain;
                    break mainLoop;
                }
                if (interHex.los === "Woods") {
                    woodhexes += 1;
                    if (woodhexes > 3) {
                        los = false;
                        losReason = "Blocked by Depth of Woods";
                        break mainLoop;
                    }
                }
                if (interHex.los === true) {
                    if (woodhexes > 0) {
                        if (startInWoods === false) {
                            los = false;
                            losReason = "On Other Side of Woods";
                            break mainLoop;
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
                        break mainLoop;
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

//log("Cover: " + cover)


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


