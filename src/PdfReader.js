import FlipBook from "./FlipBook"
import HtmlUtils from "./HtmlUtils"
import Pdf from "./Pdf"

export default class PdfReader {
    constructor(file, container, opts={}){
        this.file = file
        this.container = container
        this.opts = Object.assign({
            prevLang: "prev",
            nextLang: "next"
        }, opts)
        this.reader = new Pdf(this.file, {
            scale: 1
        })
        this.build()
        this.bind()
    }

    build(){
        this.controlsContainer = HtmlUtils.create('div', {className: "controls-container" }, this.container)
        
        this.prevButton = HtmlUtils.create('button', {className: "prev-control", innerHTML: this.opts.prevLang}, this.controlsContainer)
        this.nextButton = HtmlUtils.create('button', {className: "next-control", innerHTML: this.opts.nextLang}, this.controlsContainer)
        this.zoomContainer = HtmlUtils.create('div', {className: "zoom-container"}, this.controlsContainer)
        this.minusZoom = HtmlUtils.create('button', {className: "minus-zoom", innerHTML: "-"}, this.zoomContainer)
        this.zoomValue = HtmlUtils.create('div', {className: "zoom-value", innerHTML: Math.floor(this.reader.opts.scale * 100) + "%"}, this.zoomContainer)
        this.plusZoom = HtmlUtils.create('button', {className: "plus-zoom", innerHTML: "+"}, this.zoomContainer)

        this.flipBookContainer = HtmlUtils.create('div', {className: "flipbook-container" }, this.container)
    }
    
    bind(){
        this.prevButton.addEventListener('click', ()=>{
            this.flipBook.prev()
            this.flipBook.getActivePages().filter(page => page).map(pageContainer => {
                pageContainer.innerHTML = ""
                pageContainer.appendChild(this.reader.createPageCanvas(pageContainer.page))
            })
        })
        this.nextButton.addEventListener('click', ()=>{
            this.flipBook.next()
            this.flipBook.getActivePages().filter(page => page).map(pageContainer => {
                pageContainer.innerHTML = ""
                pageContainer.appendChild(this.reader.createPageCanvas(pageContainer.page))
            })
        })
        this.minusZoom.addEventListener('click', ()=>{
            this.reader.opts.scale -= 0.1
            if(this.reader.opts.scale <= 0) this.reader.opts.scale = 0.1
            this.zoomValue.innerHTML = Math.floor(this.reader.opts.scale * 100) + "%"
            this.flipBook.zoom(this.reader.opts.scale)
            this.flipBook.getActivePages().filter(page => page).map(pageContainer => {
                pageContainer.innerHTML = ""
                pageContainer.appendChild(this.reader.createPageCanvas(pageContainer.page))
            })
        })
        this.plusZoom.addEventListener('click', ()=>{
            this.reader.opts.scale += 0.1
            this.zoomValue.innerHTML = Math.floor(this.reader.opts.scale * 100) + "%"
            this.flipBook.zoom(this.reader.opts.scale)
            this.flipBook.getActivePages().filter(page => page).map(pageContainer => {
                pageContainer.innerHTML = ""
                pageContainer.appendChild(this.reader.createPageCanvas(pageContainer.page))
            })
        })
    }

    async load(){
        await this.reader.loadDocument()
        this.canvas = await this.reader.getPageCanvas(1)
        this.flipBook = new FlipBook(this.flipBookContainer, {
            pageWidth: this.canvas.style.width,
            pageHeight: this.canvas.style.height
        })

        await Promise.allSettled(
            Array.for(this.reader.numPages, async (i)=>{
                let page = await this.reader.loadPage(i+1)
                let pageContainer = HtmlUtils.create('div', {className: "page-container" })
                pageContainer.appendChild(this.reader.createPageCanvas(page))
                this.flipBook.addPage(pageContainer)
                pageContainer.page = page
            })
        )

        this.container.classList.add('active')
    }

    async loadPage(i){
        let page = await this.reader.loadPage(i+1)
        let pageContainer = HtmlUtils.create('div', {className: "page-container" })
        pageContainer.appendChild(this.reader.createPageCanvas(page))
        this.flipBook.addPage(pageContainer)
        pageContainer.page = page
    }
}