# aznoqmous/pdf-reader

`mozilla/pdf` implementation with flipbook capability


## Get started
Start by installing the package inside your project :  
`npm install aznoqmous/pdf-reader`  

```js
import PdfReader from "pdf-reader"

// Create and configure your PdfReader instance
let pdfReader = new PdfReader(
    "test.pdf", // path to your .pdf file
    document.getElementById('book'), // PdfReader container element
    { // optionnal configuration options
        prevLang: "Page précédente",
        nextLang: "Page suivante",
        downloadLang: "Télécharger",
        searchLang: "Recherche",
        searchEmptyLang: "...",
        searchNotFoundLang: "Aucun élément ne correspond à votre recherche",
        searchMaxResults: 10,
        searchResultsCharacters: 50
    }
)
// Load your PDF content (async)
pdfReader.load()
```

## Events
`PdfReader` inherits from the `EventTarget` class, and uses events defined in `src/PdfReaderEvents.js`.

```js
pdfReader.addEventListener(PdfReaderEvents.loaded, (e)=> {
    console.log(e.pdfReader) // pdfReader instance is passed to every PdfReader event
})
```

```js
// src/PdfReaderEvents.js
export const PdfReaderEvents = {
    // called during pdfReader.load(), each time a page is loaded
    loadProgress: "onPdfReaderLoadProgress",
    
    // called when pdfReader.load() ends
    loaded: "onPdfReaderLoaded",

    // called during pdfReader.updateSearchIndex, each time a page textContent is loaded
    indexationProgress: "onPdfReaderIndexationProgress",

    // called when pdfReader.updateSearchIndex ends
    indexationCompleted: "onPdfReaderIndexationCompleted",

    // called when a zoom action ends
    zoom: "onPdfReaderZoom",

    // called when a page is reloaded (ie: each time a page is rendered)
    loadPage: "onPdfReaderLoadPage"
}
```

## Features
- Zoom
- Drag move
- Search
- Download
