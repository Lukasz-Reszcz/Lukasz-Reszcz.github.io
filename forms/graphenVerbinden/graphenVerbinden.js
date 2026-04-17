import Graph from "../../graph_class.js";
import Node from "../../node_class.js";
import "../../graph.js";
import {setOptionalenKnoten} from "../../menueOptionen/knotenMenue.js"

document.getElementById("formGraphenVerbinden_GraphenVerbinden").addEventListener("click", () => {
    const graphID1 = parseInt(document.getElementById("formGraphenVerbinden_GraphID1").value);
    const graphID2 = parseInt(document.getElementById("formGraphenVerbinden_GraphID2").value);

    // Debug
    console.log(graphID1, graphID2);

    // Prüfen, ob die Graphen existieren
    if(Graph.getByID(graphID1) == undefined || Graph.getByID(graphID2) == undefined){
        alert("Das Aufgabenmodell exitiert nicht");
        return;
    }

    // Teilgraphen finden
    // let gemeinsamerGraph = findTeilgraphen();
    
    let graphOption = document.getElementById("zusammensetzungsart").value;
    if(graphOption == "gemeinsameKnoten")
        findeGemeinsamenTeilgraphen(graphID1, graphID2);

    // Sequenzverbinden
    if(graphOption == "optionalSequenz")
        sequenzVerbinden(graphID1, graphID2);

    // bloße Zusammensetzung
    if(graphOption == "einfacheZusammensetzung")
        graphenZusammenstellen(graphID1, graphID2);
    
});

document.getElementById("formGraphenVerbinden_Schliessen").addEventListener("click", () => {
    document.getElementById("formGraphenVerbinden").style.visibility = "hidden";
})

function sequenzVerbinden(graphID1, graphID2){
    const graph1 = Graph.getByID(graphID1);
    const graph2 = Graph.getByID(graphID2);

    let graph1_unterknoten = [];
    let graph2_unterknoten = [];
    let optionaleKnoten = [[],[]];

    for(let i=1; i<graph1.size; i++){
        if(graph1.kanten[0][i] == 1){
            graph1_unterknoten.push(Node.getByID(graph1.knoten[i]));
        }
    }

    for(let i=1; i<graph2.size; i++){
        if(graph2.kanten[0][i] == 1)
            graph2_unterknoten.push(Node.getByID(graph2.knoten[i]));
    }

    function knotenVorhanden(knoten){
        for(const obj of graph2_unterknoten){
            if(obj.info == knoten.info)
                return true;
        }

        return false;
    }

    for(let i=0; i<graph1_unterknoten.length; i++){
        if(!knotenVorhanden(graph1_unterknoten[i])){
            optionaleKnoten[0].push(graph1_unterknoten[i]);
        }
    }

    console.log(optionaleKnoten);

    let graphSeq = new Graph();
    graphSeq.knoten_h.el.style.left = graph1.knoten_h.el.style.left;
    graphSeq.knoten_h.el.style.top = graph1.knoten_h.el.style.top;

    graphSeq.knoten_h.set_info(graph1.knoten_h.info);    

    let knotenAnfang = Node.clone(graph1_unterknoten[0].id);
    let knotenEnde = Node.clone(graph1_unterknoten[graph1_unterknoten.length-1].id);

    graphSeq.addKnoten(knotenAnfang.id);
    graphSeq.addKnoten(knotenEnde.id);

    graphSeq.addConnection(graphSeq.knoten_h.id, knotenAnfang.id, 1);
    graphSeq.addConnection(graphSeq.knoten_h.id, knotenEnde.id, 1);

    if(optionaleKnoten[0].length == 1){
        let optKnoten = Node.clone(optionaleKnoten[0][0].id);

        graphSeq.addKnoten(optKnoten.id);

        graphSeq.addConnection(graphSeq.knoten_h.id, optKnoten.id, 1);
        graphSeq.addConnection(knotenAnfang.id, optKnoten.id, 2);
        graphSeq.addConnection(optKnoten.id, knotenEnde.id, 2);
        
        setOptionalenKnoten(optKnoten);
    }
    if(optionaleKnoten[0].length > 1){
        let optKnoten = new Node("Optional");

        graphSeq.addKnoten(optKnoten.id);

        graphSeq.addConnection(graphSeq.knoten_h.id, optKnoten.id, 1);
        graphSeq.addConnection(knotenAnfang.id, optKnoten.id, 2);
        graphSeq.addConnection(optKnoten.id, knotenEnde.id, 2);
        
        setOptionalenKnoten(optKnoten);

        // Optionale Aufgaben unter der abstrakten Aufgabe
        let unterknotenIDs = [];
        for(let i=0; i<optionaleKnoten[0].length; i++){
            let unterknoten = Node.clone(optionaleKnoten[0][i].id);
            unterknotenIDs.push(unterknoten.id);

            graphSeq.addKnoten(unterknoten.id);
            graphSeq.addConnection(optKnoten.id, unterknoten.id, 1);
        }

        for(let i=1; i<unterknotenIDs.length; i++){
            graphSeq.addConnection(unterknotenIDs[i-1], unterknotenIDs[i], 2);
        }
    }
}


function findeGemeinsamenTeilgraphen(graphID1, graphID2){
    const graph1 = Graph.getByID(graphID1);
    const graph2 = Graph.getByID(graphID2);
    let gemeinsameKnoten = [];

    console.log(graph2);

    // Gemeinsame Knoten finden
    for(let i=0; i < graph1.knoten.length; i++){
        for(let j=0; j < graph2.knoten.length; j++){
            const knoten1 = Node.getByID(graph1.knoten[i]);
            const knoten2 = Node.getByID(graph2.knoten[j]);

            if(knoten1.info === knoten2.info){
                gemeinsameKnoten.push([knoten1, knoten2]);
            }
        }
    }

    let teilgraph = new Graph();
    let graphenMap = new Map();

    teilgraph.loescheKnoten(teilgraph.knoten_h.id);

    for(let i=0; i<gemeinsameKnoten.length; i++){
        const knoten = Node.clone(gemeinsameKnoten[i][0].id);
        knoten.el.style.backgroundColor = "yellow";
        teilgraph.addKnoten(knoten.id);
        graphenMap.set(gemeinsameKnoten[i][0].id, knoten.id);
    }

    // Gemeinsame Kanten finden
    for(let i=0; i<gemeinsameKnoten.length; i++){
        for(let j=i+1; j<gemeinsameKnoten.length; j++){

            console.log(i, j);
            console.log(graph1.getVerbindung(gemeinsameKnoten[i][0].id, gemeinsameKnoten[j][0].id));
            console.log(graph2.getVerbindung(gemeinsameKnoten[i][1].id, gemeinsameKnoten[j][1].id));
            
            if(graph1.getVerbindung(gemeinsameKnoten[i][0].id, gemeinsameKnoten[j][0].id) === 
               graph2.getVerbindung(gemeinsameKnoten[i][1].id, gemeinsameKnoten[j][1].id)){             

                teilgraph.addConnection(graphenMap.get(gemeinsameKnoten[i][0].id), 
                    graphenMap.get(gemeinsameKnoten[j][0].id), 
                    graph1.getVerbindung(gemeinsameKnoten[i][0].id, gemeinsameKnoten[j][0].id))
            }
        }
    }

    // Debug
    // Die gemeinsamen Knoten werden abgebildet
    let kMap = new Map();

    for(let i=0; i<gemeinsameKnoten.length; i++){
        kMap.set(gemeinsameKnoten[i][0].id, gemeinsameKnoten[i][1].id);
    }

    console.log(kMap);


    // Den Knoten Finden, zu dem dieselbe Kanten zukommen
    let verb1 = [];
    let verb2 = [];
    
    let graph1_gemeinsameKnoten = new Set();
    let graph2_gemeinsameKnoten = new Set();
    
    
    gemeinsameKnoten.forEach(function(value){
        graph1_gemeinsameKnoten.add(value[0].id);
    })

    gemeinsameKnoten.forEach(function(value){
        graph2_gemeinsameKnoten.add(value[1].id);
    })

    console.log(graph2_gemeinsameKnoten);
    
    console.log("Länge: " + graph1.knoten.length);
    for(let i=0; i<graph1.knoten.length; i++){
        let xID = graph1.knoten[i];

        for(let j=0; j<graph1.knoten.length; j++){
            let yID = graph1.knoten[j];

            console.log(yID);

            // Debug
            console.log(xID, yID, graph1.getVerbindung(xID, yID));

            if(graph1_gemeinsameKnoten.has(xID) && graph1_gemeinsameKnoten.has(yID))
                continue;

            if(graph1.getVerbindung(xID, yID) > 0)
                verb1.push([xID, yID, graph1.getVerbindung(xID, yID)]);
        }
    }

    for(let i=0; i<graph2.knoten.length; i++){
        let xID = graph2.knoten[i];

        for(let j=0; j<graph2.knoten.length; j++){
            let yID = graph2.knoten[j];

            if(graph2_gemeinsameKnoten.has(xID) && graph2_gemeinsameKnoten.has(yID))
                continue;

            if(graph2.getVerbindung(xID, yID) > 0)
                verb2.push([xID, yID, graph2.getVerbindung(xID, yID)]);
        }
    }

    console.log(verb1, verb2);

    let knotenAequivalent = true;
    let mapKnoten = new Map();
    for(let i=0; i<verb1.length; i++){
        if(!mapKnoten.has(verb1[i][1])){
            mapKnoten.set(verb1[i][1], verb2[i][1]);
        }

        
        if(!(kMap.get(verb1[i][0]) == verb2[i][0] && mapKnoten.get(verb1[i][1]) == verb2[i][1] && 
                verb1[i][2] == verb1[i][2]) && 
                !(mapKnoten.get(verb1[i][0]) == verb2[i][0] && kMap.get(verb1[i][1]) == verb2[i][1] &&
                    verb1[i][2] == verb1[i][2]))
            knotenAequivalent = false;
    }

    // Debug
    if(knotenAequivalent){
        const knoten_aequivalent_alt_ID = mapKnoten.entries().next().value[0];
        
        alert("Knoten Äquivalent: " + mapKnoten.entries().next().value[0] + " -> " + 
            mapKnoten.entries().next().value[1]);

        // Den äquivalenten Knoten anbinden
        let knoten_aequivalent = Node.clone(knoten_aequivalent_alt_ID);
        knoten_aequivalent.set_info("Fantasma");
        const knoten_aequivalentID = knoten_aequivalent.id;

        const mapFantasma = new Map();
        mapFantasma.set(knoten_aequivalent_alt_ID, knoten_aequivalentID);

        teilgraph.addKnoten(knoten_aequivalentID);
        teilgraph.addConnection

        // Kanten hinzufügen
        // verb1[][] 
        for(let i=0; i<verb1.length; i++){
            if(mapFantasma.get(verb1[i][1]) == knoten_aequivalentID)
            teilgraph.addConnection(graphenMap.get(verb1[i][0]), knoten_aequivalentID, verb1[i][2]);     
        }   

        for(let i=0; i<verb1.length; i++){
            if(mapFantasma.get(verb1[i][0]) == knoten_aequivalentID)
            teilgraph.addConnection(knoten_aequivalentID, graphenMap.get(verb1[i][1]), verb1[i][2]);     
        } 

        // Auswahl zwischen den äquivalenten Knoten hinzufügen
        let knot1 = Node.clone(knoten_aequivalent_alt_ID);
        let knot2 = Node.clone(mapKnoten.entries().next().value[1]);

        teilgraph.addKnoten(knot1.id);
        teilgraph.addKnoten(knot2.id);

        teilgraph.addConnection(knoten_aequivalentID, knot1.id, 1);
        teilgraph.addConnection(knoten_aequivalentID, knot2.id, 1);
        teilgraph.addConnection(knot1.id, knot2.id, 3);
        
    }
    else{
        alert("Keinen äquivalenten Knoten gefunden");
    }

    
    // Debug
    return;





    

    // Den Knoten finden, der nur hierarchische Verbindungen hat
    let hauptknotenGefunden = false;
    let hauptknotenID = 0;
    for(let i=0; i<teilgraph.knoten.length; i++){
        for(let j=0; j<teilgraph.knoten.length; j++){
            if(teilgraph.kanten[i][j] > 1){
                break;
            }
            if(j === teilgraph.knoten.length-1){
                hauptknotenGefunden = true;
                hauptknotenID = teilgraph.knoten[i];
            }
        }
        if(hauptknotenGefunden){
            break;
        }
    }

    // Prüfen, ob die Verbindungen zu dem Knoten rein- oder rausgehen
    // Als eine Funktion schreiben
    let verbindungsart1 = null;
    let verbindungsart2 = null
    for(const knoten1 of graph1.knoten){
        if(Node.getByID(hauptknotenID).info === Node.getByID(knoten1).info){
            hauptknotenID = knoten1;
        }
    }

    const knotenPosition = graph1.knoten.indexOf(hauptknotenID);
    for(let i=0; i<graph1.knoten.lenght; i++){
        if(graph1.kanten[i][knotenPosition] >= 2){
            verbindungsart1 = "rein";
            break;
        }
    }

    for(let i=0; i<graph1.knoten.lenght; i++){
        if(graph1.kanten[knotenPosition][i] >= 2){
            verbindungsart1 = "raus";
            break;
        }
    }

    for(const knoten2 of graph2.knoten){
        if(Node.getByID(hauptknotenID).info === Node.getByID(knoten2).info){
            hauptknotenID = knoten2;
        }
    }

    const knotenPosition1 = graph2.knoten.indexOf(hauptknotenID);

    for(let i=0; i<graph2.knoten.lenght; i++){
        if(graph2.kanten[i][knotenPosition1] >= 2){
            verbindungsart2 = "rein";
            break;
        }
    }

    for(let i=0; i<graph2.knoten.lenght; i++){
        if(graph2.kanten[knotenPosition1][i] >= 2){
            verbindungsart2 = "raus";
            break;
        }
    }

    console.log(verbindungsart1, verbindungsart2);
    
    



    teilgraph.zeichneVerbindungen();
}

function graphenZusammenstellen(graphID1, graphID2){
    const graph1 = Graph.getByID(graphID1);
    const graph2 = Graph.getByID(graphID2);

    let unterziel1 = Graph.getByID(graphID1).clone();
    let unterziel2 = Graph.getByID(graphID2).clone();

    // Die 2 WKnoten entwurzeln
    unterziel1.knoten_h.el.className = "draggable-el";
    unterziel2.knoten_h.el.className = "draggable-el";

    unterziel1.knoten_h.wurzelknoten = false;
    unterziel2.knoten_h.wurzelknoten = false;

    // Graphen aus dem Register entfernen
    Graph.register.delete(unterziel1.id);
    Graph.register.delete(unterziel2.id);
    

    let gemeinsamGraph = new Graph();
    gemeinsamGraph.knoten_h.set_info(graph1.knoten_h.info);


    for(const knot of unterziel1.knoten.concat(unterziel2.knoten)){
        Node.getByID(knot).graph_id = gemeinsamGraph.id;
        gemeinsamGraph.addKnoten(knot);   
    }

    function verbindungVomUnterzielUebernehmen(unterziel){
        for(let i=0; i<unterziel.size; i++){
            for(let j=0; j<unterziel.size; j++){
                if(unterziel.kanten[i][j] > 0){
                    // Indizes von den Knoten in dem neuen Graphen
                    let idxVon;
                    let idxBis;
                    for(const knotMap of Node.mapKopie){
                        // Debug
                        console.log(knotMap, unterziel.knoten[i], unterziel.knoten[j]);

                        if(knotMap[1] == unterziel.knoten[i])
                            idxVon = knotMap[0];

                        if(knotMap[1] == unterziel.knoten[j])
                            idxBis = knotMap[0];

                        console.log(idxVon, idxBis);
                    }

                    console.log(idxVon, idxBis);

                    gemeinsamGraph.addConnection(idxVon, idxBis, unterziel.kanten[i][j]);
                }
            }
        }
    }

    verbindungVomUnterzielUebernehmen(graph1);
    verbindungVomUnterzielUebernehmen(graph2);



    
    




    gemeinsamGraph.addConnection(gemeinsamGraph.knoten_h.id, unterziel1.knoten_h.id, 1);
    gemeinsamGraph.addConnection(gemeinsamGraph.knoten_h.id, unterziel2.knoten_h.id, 1);
    gemeinsamGraph.addConnection(unterziel1.knoten_h.id, unterziel2.knoten_h.id, 3);


    // Verbindungen kopieren


    // Auch eltern?
}