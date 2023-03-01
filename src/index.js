import PdfReader from "../index.js"
import { FlipBookMode } from "./FlipBook.js"
import { PdfReaderEvents } from "./PdfReaderEvents"

let pdfReader = new PdfReader(
    "tests/test-1.pdf",
    document.getElementById('book'),
    {
        prevLang: "Page précédente",
        nextLang: "Page suivante",
        downloadLang: "Télécharger",
        searchLang: "Recherche",
        searchEmptyLang: "...",
        searchNotFoundLang: "Aucun élément ne correspond à votre recherche",
        searchMaxResults: 0,
        searchResultsCharacters: 50,
        mode: FlipBookMode.MOBILE
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

pdfReader.addEventListener(PdfReaderEvents.loadPage, async (e)=>{
    await sleep(1000)

    let page = e.page
    if(page.markers) return;

    let annotations = await page.getAnnotations()
    console.log(annotations)
    annotations.map(annotation => {
        let marker = document.createElement('i')
        let rect = page.pageContainer.getBoundingClientRect()
        marker.style.position = "absolute"
        marker.style.left = (annotation.rect[0] * pdfReader.reader.opts.scale / rect.width)  * 100 + "%"
        marker.style.top = (1 - annotation.rect[1] * pdfReader.reader.opts.scale / rect.height) * 100 + "%";
        marker.style.width = ((annotation.rect[2] - annotation.rect[0]) * pdfReader.reader.opts.scale / rect.width) * 100 + "%";
        marker.style.height = ((annotation.rect[3] - annotation.rect[1]) * pdfReader.reader.opts.scale / rect.height) * 100 + "%";
        marker.style.fontSize = 0.5 * pdfReader.reader.opts.scale + "rem"
        marker.innerHTML = "Je découvre le produit"
        if(annotation.fieldType) marker.classList.add(annotation.fieldType)
        marker.classList.add("annotation")
        page.pageContainer.appendChild(marker)
    })


    let content = await page.getTextContent()
    let textItems = content.items
    let markers = []
    console.log(textItems)
    textItems = textItems.filter(item => item.str.match(/[A-Z][0-9]{4,5}/))
    textItems.map(textItem => {
        let marker = document.createElement('i')
        let rect = page.pageContainer.getBoundingClientRect()
        marker.style.position = "absolute"
        marker.style.left = (textItem.transform[4] * pdfReader.reader.opts.scale / rect.width)  * 100 + "%"
        marker.style.top = (1 - textItem.transform[5] * pdfReader.reader.opts.scale / rect.height) * 100 + "%";
        marker.style.fontSize = 0.5 * pdfReader.reader.opts.scale + "rem"
        marker.innerHTML = textItem.str.replace(/[^A0-9]*/, "")
        page.pageContainer.appendChild(marker)
        markers.push(marker)
    })
    page.markers = markers
})

pdfReader.load()
