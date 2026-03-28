import Node from "./node_class.js"
import {getVerbindungsarten} from "./forms/verbindungsartform/verbindungsartform.js"

export default class Graph {
    static register = new Map();

    constructor(){
        graphMaxID += 1;
        this.id = graphMaxID;
        this.knoten = new Array();
        this.kanten = new Array();
        this.size = 0;
        
        this.phase = 1;

        Graph.register.set(this.id, this);

        // Als Wurzelknoten kennzeichnen
        this.knoten_h = new Node("Knotenbezeichnung");
        this.knoten_h.el.className = "draggable-el-wurzelknoten";
        this.knoten_h.wurzelknoten = true;

        this.addKnoten(this.knoten_h.id);
    }

    static getByID(id){
        return Graph.register.get(id);
    }

    addKnoten(nodeID){
        // Die Menge der Knoten
        if(this.knoten.includes(nodeID)){
            return;
        }
        this.knoten.push(nodeID);

        // Kanten
        this.size++;
        this.kanten.push([0]);

        // Die letzte Reihe
        for(let i=2; i<this.size; i++){
            this.kanten[this.size-1].push(0);
        }

        // Die Reihe rechts hinzufügen
        for(let i=0; i<this.size; i++){
            // Sonst wird die erste Reihe um ein 0 mehr haben
            if(this.size == 1)  continue;
            this.kanten[i].push(0);
        }

        // Knoten mit dem Graphen verbinden
        // node.graph_id = this.id;
        let gegebenKnoten = Node.getByID(nodeID);
        gegebenKnoten.set_graph_id(this.id);             
    }

    clone(){
        let graphClone = new Graph();

        // Knoten kopieren
        for(const knotenid of this.knoten){
            let knotenClone = Node.clone(knotenid);
            if(knotenClone.wurzelknoten){
                graphClone.knoten_h.set_info(knotenClone.info + " - Kopie");
                // graphClone.knoten_h.el.par.textContent = knotenClone.info;

                // Warum muss der Wurzelknoten extra eingestellt werden
                // weil es ein neuer Knoten ist, der mit dem Graphen
                graphClone.knoten_h.el.style.top = knotenClone.el.style.top;
                graphClone.knoten_h.el.style.left = knotenClone.el.style.left;

                graphClone.knoten_h.stand = knotenClone.stand;

                // Node.mapKopie.set(this.knoten_h.id, graphClone.knoten_h.id);
                Node.mapKopie.set(graphClone.knoten_h.id, this.knoten_h.id );


                // Den Kopierten Knoten löschen
                knotenClone.loesche_Knoten();
            }
            else{
                graphClone.addKnoten(knotenClone.id);
            }   
        }


        // Verbindungen kopieren
        for(let i=0; i<this.knoten.length; i++){
            for(let j=0; j<this.knoten.length; j++){

                // Verbindungen suchen
                let knotenVonKopieID;
                let knotenNachKopieID;
                
                for(const [knotenKopieID, knotenID] of Node.mapKopie.entries()){
                    if(knotenID == this.knoten[i])
                        knotenVonKopieID = knotenKopieID;
                    
                    if(knotenID == this.knoten[j])
                        knotenNachKopieID = knotenKopieID;
                }

                graphClone.addConnection(knotenVonKopieID, knotenNachKopieID, this.kanten[i][j]);
            }
        }

        return graphClone;
    }

    loescheKnoten(knotenid){
        // const knotenid = knoten.id;
        const knotenindex = this.knoten.indexOf(knotenid);
        this.size--;

        // Knoten unsichtbar machen
        let knoten = Node.getByID(knotenid);
        knoten.el.style.visibility = "hidden";

        // Knoten aus der Liste loeschen
        this.knoten.splice(knotenindex, 1);
        
        // Verbindungen loeschen
        for(let zeile of this.kanten){
            zeile.splice(knotenindex, 1);
        }
        
        this.kanten.splice(knotenindex, 1);


        // Debug
        console.log(this);

    }
    // addVerbindung
    addConnection(nodexid, nodeyid, con){
        const knotenx = this.knoten.indexOf(nodexid);
        const knoteny = this.knoten.indexOf(nodeyid);

        // ElternID aktualisieren
        /*
        if(con == 1){
            // Bei einer hierarchischen Verbindung kann der Knoten
            // keine verschiedene Elternknoten haben 
            let knotenNach = Node.getByID(nodeyid)
            if(knotenNach.elternID > 0){
                alert("Unzulässige Verbindung");
                return;
            }

            knotenNach.elternID = nodexid;
        }
        if(con > 1){
            let elternID1 = Node.getByID(nodexid).elternID;
            let elternID2 = Node.getByID(nodeyid).elternID;

            if(elternID1 != elternID2){
                alert("Unzulässige Verbindung");
                return;
            }
        }
            */

        this.kanten[knotenx][knoteny] = con;
    }

    zeichneVerbindungen(){
        let canvas = document.getElementById("myCanvas"); //
        let ctx = canvas.getContext("2d");
    

        let verschiebung = 0;
        let paragraphenhoehe = parseInt(document.getElementById("menue").clientHeight) + 
            parseInt(document.getElementById("ausgabetest").clientHeight) +
            parseInt(document.getElementById("ueberschriften").clientHeight);

        // Einmalig bei der Etappenwechseln von einem Graphen
        /*
        if(graphenVerbindenZustand){
            const knoten = document.querySelectorAll(".draggable-el");
            verschiebung = parseInt(document.getElementById('nodec').clientWidth);
            for(const element of knoten){
                element.style.left = `${parseInt(element.style.left) + verschiebung}px`;
            }

            graphenVerbindenZustand = false;
        }
        */


        // Einstellungen bzgl. Verbindungsarten von einer json-Datei lesen
        let obj = getVerbindungsarten();

        // Es wird nur ein Graph gezeichnet
        for (let i=0; i<this.knoten.length; i++){
            for (let j=0; j<this.knoten.length; j++){
                if(this.kanten[i][j] > 0){ // Ist diese Bedingung noch nötig?
                    // If in effizientere Struktur umwandeln, wie z.B. switch
                    
                    ctx.strokeStyle = obj.verbindungsarten[this.kanten[i][j]-1].farbe;

                    const knotenx = Node.getByID(this.knoten[i]);
                    const knoteny = Node.getByID(this.knoten[j]);

                    ctx.beginPath();

                    // Die Paragraphenhöhe anpassen
                    const pos_x1 = parseInt(knotenx.el.style.left) - verschiebung;
                    const pos_y1 = parseInt(knotenx.el.style.top) - paragraphenhoehe;
                    const pos_x2 = parseInt(knoteny.el.style.left) - verschiebung;
                    const pos_y2 = parseInt(knoteny.el.style.top) - paragraphenhoehe;

                    ctx.moveTo(pos_x1, pos_y1);
                    ctx.lineTo(pos_x2, pos_y2);
                    
                    ctx.stroke();

                    ctx.fillText(obj.verbindungsarten[this.kanten[i][j]-1].bezeichnung, 
                        (pos_x1+pos_x2)/2, (pos_y1+pos_y2)/2);
                }
            }
        }
    }

    getVerbindung(id1, id2){
        let indx1 = this.knoten.indexOf(id1);
        let indx2 = this.knoten.indexOf(id2);

        return this.kanten[indx1][indx2];
    }
}