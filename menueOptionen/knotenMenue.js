import { zeichneVerbindung } from "../graph.js";
import Graph from "../graph_class.js";
import Node from "../node_class.js";

document.getElementById("knoteninfo").addEventListener('click', (event) => { 
    // document.getElementById("knoteninfo").style.backgroundColor = "rgb(144, 238, 144)";
    const aktiverKnoten = Node.aktiverKnoten;
    
    aktiverKnoten.showInfo();
    document.getElementById("knoteninfo").style.backgroundColor = null;
})

document.getElementById("knotenLoeschen").addEventListener('click', () => {
    const aktiverKnoten = Node.aktiverKnoten;
    const graphID = aktiverKnoten.graph_id;

    // Debug
    alert("graphID: " + graphID);

    if(graphID == 0){
        aktiverKnoten.el.style.visibility = "hidden";
    }

    const warnung = "Wenn der Wurzelknoten gelöscht wird, wird das ganze Aufgabemodell gelöscht." +
        "\nSoll das ganze Aufgabemodell gelöscht werden?";
    if(aktiverKnoten.wurzelknoten && confirm(warnung)){
        const knotenZuLoeschen = Graph.getByID(graphID).knoten;
        for(let i=knotenZuLoeschen.length-1; i>=0; i--){
            console.log(Graph.getByID(graphID).knoten[i]);
            console.log("KID: ", knotenZuLoeschen[i]);
            Graph.getByID(graphID).loescheKnoten(knotenZuLoeschen[i]);
        }
    }
    else if(!aktiverKnoten.wurzelknoten){
        Graph.getByID(graphID).loescheKnoten(aktiverKnoten.id);
    }

    Node.aktiverKnoten = null;

    zeichneVerbindung();
})

document.getElementById("knotenNamenAendern").addEventListener('click', () => {
    let anforderungsname = prompt("Gib den Anforderungsnamen an: ", "Anforderung");
    if((anforderungsname !== "") && (anforderungsname !== null)){
        Node.aktiverKnoten.set_info(anforderungsname);

        console.log(Node.aktiverKnoten);

        Node.aktiverKnoten.par.textContent = anforderungsname;
    }
})
//---
document.getElementById("quelleHinzufuegen").addEventListener("click", () => {
    const anforderungsquelle = prompt("Gib die Anforderungsquelle an, z.B. einen Dateinamen", "anforderungsquelle.txt");
    Node.aktiverKnoten.anforderungsquelle = anforderungsquelle;
})

document.getElementById("optionalerKnoten").addEventListener("click", () => {
    let knoten = Node.aktiverKnoten;
    
    knotennameBereinigen(knoten);
    let kennzeichnungOptional = "[" + knoten.info + "]";
    
    knoten.set_info(kennzeichnungOptional);
})

document.getElementById("schleifeKnoten").addEventListener("click", () => {
    let knoten = Node.aktiverKnoten;
    
    knotennameBereinigen(knoten);
    let kennzeichnungSchleife = "[" + knoten.info + "]*";

    knoten.set_info(kennzeichnungSchleife);
})

document.getElementById("operatorLoeschen").addEventListener("click", () => {
    let knoten = Node.aktiverKnoten;

    knotennameBereinigen(knoten);
})

// return int
// 0 - werden optional noch Schleife
// 1 - optional
// 2 - schleife

// Knotennamen von den Operatoren bereinigen
function knotennameBereinigen(knoten){
    let knotenname = knoten.info;
    let letzterIndex = knotenname.length-1;
    if(knotenname[0] == "[" && knotenname[letzterIndex] == "]"){
        knoten.set_info(knotenname.substring(1, letzterIndex));
    }
    
    if(knotenname[0] == "[" && knotenname[letzterIndex-1] == "]" && knotenname[letzterIndex] == "*")
        knoten.set_info(knotenname.substring(1, letzterIndex-1));
}

// Anhand der Kennzeichnung oder neues Eigenschaft
// Unzulässigen Namen bei der Knoteerstellung
