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

// document.getElementById()