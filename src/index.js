import PdfReader from "../index.js"
import { PdfReaderEvents } from "./PdfReaderEvents"

let pdfReader = new PdfReader(
    "tests/test.pdf",
    document.getElementById('book'),
    {
        prevLang: "Page précédente",
        nextLang: "Page suivante",
        downloadLang: "Télécharger",
        searchLang: "Recherche",
        searchEmptyLang: "...",
        searchNotFoundLang: "Aucun élément ne correspond à votre recherche",
        searchMaxResults: 0,
        searchResultsCharacters: 50
    }
)
pdfReader.addEventListener(PdfReaderEvents.loaded, (e)=>{
    console.log(e)
})
pdfReader.addEventListener(PdfReaderEvents.loadProgress, (e)=> console.log("Load : " + e.percent))
pdfReader.addEventListener(PdfReaderEvents.indexationProgress, (e)=> console.log("Indexation : " + e.percent))
pdfReader.addEventListener(PdfReaderEvents.loadPage, (e)=>{
    console.log("Rendered page : " + e.page.pageNumber)
})

pdfReader.load()
