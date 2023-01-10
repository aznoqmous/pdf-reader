
export const PdfReaderEvents = {

    loadProgress: "onPdfReaderLoadProgress",
    loaded: "onPdfReaderLoaded",

    indexationProgress: "onPdfReaderIndexationProgress",
    indexationCompleted: "onPdfReaderIndexationCompleted",

    zoom: "onPdfReaderZoom",

    loadPage: "onPdfReaderLoadPage"

}

export class PdfReaderLoadedEvent extends Event {
    constructor(pdfReader){
        super(PdfReaderEvents.loaded)
        this.pdfReader = pdfReader
    }
}

export class PdfReaderLoadProgress extends Event {
    constructor(pdfReader, current, total){
        super(PdfReaderEvents.loadProgress)
        this.pdfReader = pdfReader
        this.current = current
        this.total = total
        this.progress = current/total
        this.percent = (current/total * 100).toFixed(2) + "%"
    }
}

export class PdfReaderIndexationProgress extends Event {
    constructor(pdfReader, current, total){
        super(PdfReaderEvents.indexationProgress)
        this.pdfReader = pdfReader
        this.current = current
        this.total = total
        this.progress = current/total
        this.percent = (current/total * 100).toFixed(2) + "%"
    }
}

export class PdfReaderIndexationCompleted extends Event {
    constructor(pdfReader){
        super(PdfReaderEvents.indexationCompleted)
        this.pdfReader = pdfReader
    }
}

export class PdfReaderZoomEvent extends Event {
    constructor(pdfReader, currentZoom){
        super(PdfReaderEvents.zoom)
        this.pdfReader = pdfReader
        this.currentZoom = currentZoom
    }
}

export class PdfReaderLoadPageEvent extends Event {
    constructor(pdfReader, pageContainer, page){
        super(PdfReaderEvents.loadPage)
        this.pdfReader = pdfReader
        this.pageContainer = pageContainer
        this.page = page
    }
}