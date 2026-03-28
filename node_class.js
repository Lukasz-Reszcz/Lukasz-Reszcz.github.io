import {zeichneVerbindung} from "./graph.js";
import Graph from "./graph_class.js";

let lastX = 0;
let lastY = 0;

export default class Node {
    // Hilft, um später die Knoten aus IDs zu finden
    static register = new Map();
    static aktiverKnoten = null;

    // Zum Verbinden
    static verbindenVon = null;
    static verbindungAktiv = false;

    // Map zum kopieren
    static mapKopie = new Map();

	constructor(info){
        // ID
        nodeMaxID += 1;
    	this.id = nodeMaxID;
        this.graph_id = 0;
        Node.register.set(this.id, this);
        
        // Blätter
		this.left = null;
        this.right = null;

        // Info
        this.info = info; //"Anforderung";  
        this.anforderungsquelle = null;
        this.wurzelknoten = false;

        // Der Stand
        // Ist-Konstrekt - 1
        // Ist-Abstrakt - 2
        // Soll-Abstrakt -3
        this.stand = 1;

        // ElternID für die Verbindung
        this.elternID = null;


        // DeKnoten
        this.make_knoten();
        this.make_draggable();

        this.isDragging = false;
        this.activeElement = null;

        // aktiver Knoten
        this.make_aktiverKnoten();
    }

    static getByID(id){
        return Node.register.get(id);
    }

    static clone(knotenID){
        // Weitere Infos kopieren
        let knoten = Node.getByID(knotenID);
        let knoten_ergebnis = new Node(knoten.info);
        knoten_ergebnis.wurzelknoten = knoten.wurzelknoten;

        // Position kopieren
        knoten_ergebnis.el.style.top = knoten.el.style.top;
        knoten_ergebnis.el.style.left = knoten.el.style.left;

        // Den Stand kopieren
        knoten_ergebnis.stand = knoten.stand;

        //Node.mapKopie.set(knotenID, knoten_ergebnis.id);
        Node.mapKopie.set(knoten_ergebnis.id, knotenID);
    
        return knoten_ergebnis;
    }

    set_graph_id(gid){
        this.graph_id = gid; 
    }

    set_info(info){
        this.info = info;
        this.par.textContent = info;
    }

    set_anforgerungsquelle(aquelle){
        this.anforderungsquelle = aquelle;
    }

    // Noch nötig?
    /*
    search(text){
        // Debug
        // console.log("Text: " + text + " Info: " + this.info);

        if(this.info == text){
            return  this.id;
        }

        let result = null;
        
        if(this.left != null){
            result = this.left.search(text);
            if (result != null)  return result;
        }
        if(this.right != null){
            result = this.right.search(text);
            if (result != null)  return result;
        }

        // Der Text wurde nicht gefunden
        return -1;
    }
    */

    make_knoten(){
        // Den Knoten auf einer Stelle setzen (oben links)
        this.el = document.createElement("div");
        this.el.className = "draggable-el";
        this.el.id = this.id;

        const graphContainer = document.getElementById("hauptcontainer");
        
        this.el.style.position = "absolute";
        this.el.style.left = "50px";
        this.el.style.top = "50px"; 

        // Textfeld
        this.par = document.createElement("p");
        this.par.textContent = this.info;
        this.el.appendChild(this.par);

        this.parGleichung = document.createElement("p");
        this.el.appendChild(this.parGleichung);

        graphContainer.appendChild(this.el);
    }

    make_draggable(){
        this.el.addEventListener('mousedown', (event) => {
            // Wenn der Knoten zwar angeclicked wurde, aber mit dem Zweck um zwei Knoten
            // zu verbinden
            if(event.target.nodeName == "A") {
                return;
            }

            this.activeElement = event.currentTarget;
            this.activeElement.style.zIndex = 100;
            this.isDragging = true;
            lastX = event.target.clientX;
            lastY = event.target.clientY;
            this.computedStyleMap.cursor = "grabbing";
        })

        this.el.addEventListener('mouseup', (event) => {
            this.activeElement = null;
            this.isDragging = false;

            event.currentTarget.style.zIndex = 1;
        })

        this.el.addEventListener('mousemove', (event) =>{ // Target hinzugefügt
            if(this.activeElement == null) {
                return;
            }

            // Die Rahmen des zuständigen Bereiches nicht überschreiten
            const breite = document.getElementById("myCanvas").clientWidth/3;
            const rect = document.getElementById("myCanvas").getBoundingClientRect();

            if(event.clientX >= this.stand*breite || event.clientX <= (this.stand-1)*breite){
                return;
            }

            // Die obere und untere Schranke nicht überschreiten
            if(event.clientY <= rect.top || event.clientY > rect.bottom){
                return;
            }

            // Die Kanten von den Boxen erreicht
            // Zustand hinzufügen
            // const graphDiv = document.getElementById('nodec');
            // if(event.clientX > parseInt(graphDiv.clientLeft) + parseInt(graphDiv.clientWidth)){
            //     return;
            // }

            const deltaX = event.clientX - lastX;
            const deltaY = event.clientY - lastY;
        
            const elementX = parseInt(window.getComputedStyle(this.el).getPropertyValue('left'));
            const elementY = parseInt(window.getComputedStyle(this.el).getPropertyValue('top'));
        
            this.el.style.left = `${elementX + deltaX}px`;
            this.el.style.top = `${elementY + deltaY}px`;

            lastX = event.clientX;
            lastY = event.clientY;

            zeichneVerbindung()
        })
    }

    // Den Knoten aktivieren
    make_aktiverKnoten(){
        this.el.addEventListener('dblclick', (event) => {
            for(let knotenh of Node.register){
                knotenh[1].el.style.backgroundColor = null;
            }

            // Die Auswahl zurücksetzen
            if(this == Node.aktiverKnoten){
                Node.aktiverKnoten = null;
                return;
            }

            if(!Node.verbindungAktiv){
                Node.aktiverKnoten = this;
            }

            this.el.style.backgroundColor = "#00e6e6";
            // alle Kopien markieren
            for(let knotenKop of Node.mapKopie){
                console.log(knotenKop)
                if(knotenKop[0] != Node.aktiverKnoten.id)   continue;

                Node.getByID(knotenKop[1]).el.style.backgroundColor = "#34aab7"
            }


            // Für verbinden mit
            if(Node.verbindungAktiv){
                Node.verbindungAktiv = false;
                Node.verbindenVon = Node.aktiverKnoten;
                Node.aktiverKnoten = this;

                // const verbindungsart = parseInt(document.getElementById("verbindungsarten").value);
                const verbindungsart = window.optionnummer;

                document.getElementById("ausgabetest").textContent += " - verbunden mit " + this.info;
                            // verbinden->Menü->Knoten
                            // event.target.parentElement.parentElement.id;

                // Knoten aus verschiedenen Graphen
                // Keiner der Knoten gehört einem Graphen
                const knotenVon = Node.verbindenVon;
                const knotenNach = Node.aktiverKnoten;

                // Verbindung
                verbindungVon = knotenVon.id;
                verbindungNach = this.id;
                
                if(((knotenVon.graph_id !== 0 && knotenNach.graph_id !== 0) && 
                        (knotenVon.graph_id != knotenNach.graph_id)) || 
                    (knotenVon.graph_id === 0 && knotenNach.graph_id === 0)){
                        alert("Die Verbindung kann nicht hergestellt werden");

                        // reset
                        verbinden_graph_id = null;
                        verbindungVon = 0;
                        verbindungNach = 0;
                        Node.verbindungAktiv = false;
                        verbindungKnotenHinzugefuegt = false;
                        
                        return;
                }

                // Im welchen Graphen - anhand der zwei Knoten bestimmt
                // Eins von denen existiert (ID != 0)
                let graphVon = Graph.getByID(knotenVon.graph_id);
                let graphNach = Graph.getByID(knotenNach.graph_id);

                let aktuellerGraph = knotenVon.graph_id > 0 ? Graph.getByID(knotenVon.graph_id) :
                    Graph.getByID(knotenNach.graph_id);


                if(aktuellerGraph.knoten.includes(verbindungVon)){

                    // ElternID aktualisieren
                    if(verbindungsart == 1){
                        // Bei einer hierarchischen Verbindung kann der Knoten
                        // keine verschiedene Elternknoten haben 
                        if(knotenNach.elternID > 0){
                            alert("Unzulässige Verbindung");
                            return;
                        }

                        knotenNach.elternID = verbindungVon;
                    }
                    if(verbindungsart > 1){
                        let elternID1 = knotenVon.elternID;
                        let elternID2 = knotenNach.elternID;

                        if(elternID1 != elternID2){
                            alert("Unzulässige Verbindung");
                            return;
                        }
                    }

                    aktuellerGraph.addKnoten(knotenNach.id);
                    aktuellerGraph.addConnection(verbindungVon, verbindungNach, verbindungsart);

                    knotenNach.el.className = "draggable-el";
                }
                else if(aktuellerGraph.knoten.includes(knotenNach.id)){
                    alert("Die Verbindung sollte in dem Knoten anfangen, der schon in einem Graphen ist.");
                }

                // verbindung zeichnen
                zeichneVerbindung();

                // Reset von verbindungsvariablen
                verbinden_graph_id = null;
                verbindungVon = 0;
                verbindungNach = 0;
                Node.verbindungAktiv = false;
                verbindungKnotenHinzugefuegt = false;
            }
        })
    }

    showInfo(){
        let infoString = "GraphID: " + this.graph_id +
                        "\nKnotenID: " + this.id + 
                        "\nAnforderung: " + this.info +
                        "\nQuelle: " + this.anforderungsquelle;
        alert(infoString);
    }

    loesche_Knoten(){
        this.el.style.visibility = "hidden";
    }
}
