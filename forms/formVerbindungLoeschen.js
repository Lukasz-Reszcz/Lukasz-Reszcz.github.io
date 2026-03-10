import Graph from "../graph_class.js";
import Node from "../node_class.js";

let mapBtnVerbindung = new Map();

document.getElementById("verbindungLoeschen").addEventListener("click", () => {
    document.getElementById("formVerbindungLoeschen").style.visibility = "visible";

    const aktiverKnoten = Node.aktiverKnoten;
    const aktiverGraphID = Node.aktiverKnoten.graph_id;
    let aktiverGraph = Graph.getByID(aktiverGraphID);

    formReset();

    document.getElementById("titelVerbindungLoeschen").textContent = 
        aktiverKnoten.info + " - Verbindung löschen";

    let knotenInx = aktiverGraph.knoten.indexOf(aktiverKnoten.id);
    // Verbindungen nach
    for(let i=0; i<aktiverGraph.size; i++){
        if(aktiverGraph.kanten[knotenInx][i] == 0 || knotenInx == i) continue;

        let zeile = document.createElement("div");
        zeile.style = "display: flex; gap: 10px;";

        let par = document.createElement("p");
        par.textContent = aktiverKnoten.info + " - " + Node.getByID(aktiverGraph.knoten[i]).info; 

        let button = document.createElement("button");
        button.textContent = "Verbindung löschen";
        button.id = "btnVerbindungloeschen-" + aktiverKnoten.id + "-" + aktiverGraph.knoten[i];

        mapBtnVerbindung.set(button.id, [aktiverKnoten.id, aktiverGraph.knoten[i]]);

        zeile.appendChild(par);
        zeile.appendChild(button);

        document.getElementById("formVerbindungLoeschen").appendChild(zeile);

        // Höhe anpassen
        document.getElementById("formVerbindungLoeschen").style.height = 
            parseInt(document.getElementById("formVerbindungLoeschen").clientHeight) + 
            parseInt(zeile.clientHeight) + "px";

    }

    // Verbindungen nach

});

document.getElementById("formVerbindungLoeschenschliessen").addEventListener("click", () => {
    document.getElementById("formVerbindungLoeschen").style.visibility = "hidden";
})

document.getElementById("formVerbindungLoeschen").addEventListener("click", (event) => {
    if(event.target.tagName === "BUTTON"){

        // Debug
        console.log(mapBtnVerbindung);

        const knotenVonID = mapBtnVerbindung.get(event.target.id)[0];
        const knotenNachID = mapBtnVerbindung.get(event.target.id)[1];

        const aktiverGraphID = Node.aktiverKnoten.graph_id;
        let aktiverGraph = Graph.getByID(aktiverGraphID);

        aktiverGraph.addConnection(knotenVonID, knotenNachID, 0);
    }
})

function formReset(){
    mapBtnVerbindung.clear();
    const parentDiv = document.getElementById("formVerbindungLoeschen");

    parentDiv.querySelectorAll("div").forEach(div => div.remove());

    document.getElementById("formVerbindungLoeschen").style.height = "150px";
}