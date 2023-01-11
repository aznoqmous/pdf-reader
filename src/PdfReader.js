import FlipBook from "./FlipBook"
import HtmlUtils from "./HtmlUtils"
import Pdf from "./Pdf"
import { 
    PdfReaderLoadedEvent,
    PdfReaderLoadProgress,
    PdfReaderIndexationProgress,
    PdfReaderIndexationCompleted,
    PdfReaderZoomEvent,
    PdfReaderLoadPageEvent
} from "./PdfReaderEvents"
import Vector2 from "./Vector2"

export default class PdfReader extends EventTarget {
    constructor(file, container, opts={}){
        super()
        this.file = file
        this.container = container
        this.opts = Object.assign({
            prevLang: "Previous page",
            nextLang: "Next page",
            downloadLang: "Download",
            searchLang: "Search",
            searchEmptyLang: "Search inside the document",
            searchNotFoundLang: "No element found matching your request",
            searchMinCharacters: 3,
            searchMaxResults: 0,
            searchResultsCharacters: 50
        }, opts)
        this.reader = new Pdf(this.file, {
            scale: 1
        })
        this.build()
    }

    build(){
        this.container.classList.add('pdf-reader')

        /* Controls */
        this.controlsContainer = HtmlUtils.create('div', {className: "controls-container" }, this.container)
        
        this.pageContainer = HtmlUtils.create('div', {className: "page-container"}, this.controlsContainer)
        this.prevButton = HtmlUtils.create('button', {className: "prev-control", innerHTML: this.opts.prevLang}, this.pageContainer)
        this.pageValue =  HtmlUtils.create('span', {className: "page-value", innerHTML: "/"}, this.pageContainer)
        this.nextButton = HtmlUtils.create('button', {className: "next-control", innerHTML: this.opts.nextLang}, this.pageContainer)

        this.zoomContainer = HtmlUtils.create('div', {className: "zoom-container"}, this.controlsContainer)
        this.minusZoom = HtmlUtils.create('button', {className: "minus-zoom", innerHTML: "-"}, this.zoomContainer)
        this.zoomValue = HtmlUtils.create('div', {className: "zoom-value", innerHTML: Math.floor(this.reader.opts.scale * 100) + "%"}, this.zoomContainer)
        this.plusZoom = HtmlUtils.create('button', {className: "plus-zoom", innerHTML: "+"}, this.zoomContainer)

        /* Search */
        this.searchContainer = HtmlUtils.create('div', {className: "search-container"}, this.controlsContainer)
        this.searchInput = HtmlUtils.create('input', {className: "search-input", placeholder: this.opts.searchLang}, this.searchContainer)
        this.searchResults = HtmlUtils.create('div', {className: "search-results"}, this.searchContainer)
        this.clearSearchResult()

        /* Download */
        this.downloadButton = HtmlUtils.create('a', {className: "download", href: this.file, download: this.file, innerHTML: this.opts.downloadLang }, this.controlsContainer)

        /* View */
        this.viewContainer = HtmlUtils.create('div', {className: "view-container" }, this.container)
        this.flipBookContainer = HtmlUtils.create('div', {className: "flipbook-container" }, this.viewContainer)
    }
    
    bind(){
        this.prevButton.addEventListener('click', ()=>{
            this.flipBook.prev()
            this.reloadActivePages()
        })
        this.nextButton.addEventListener('click', ()=>{
            this.flipBook.next()
            this.reloadActivePages()
        })

        this.minusZoom.addEventListener('click', ()=>{
            this.zoom(-0.1)
        })
        this.plusZoom.addEventListener('click', ()=>{
            this.zoom(0.1)
        })

        this.searchInput.addEventListener('input', ()=>{
            this.search(this.searchInput.value)
        })
        this.searchInput.addEventListener('focus', ()=>{
            this.searchResults.classList.add('active')
        })

        this.viewContainer.addEventListener('mousedown', this.handleDragStart.bind(this))
        this.viewContainer.addEventListener('mousemove', this.handleDrag.bind(this))
        this.viewContainer.addEventListener('mouseup', this.handleDragEnd.bind(this))
        this.viewContainer.addEventListener('mouseleave', this.handleDragEnd.bind(this))

        this.flipBook.addEventListener('showPage', (e)=>{
            let pageIndex = this.flipBook.currentIndex * 2 || 1
            if(pageIndex > 1) pageIndex = `${pageIndex} - ${pageIndex + 1}`
            this.pageValue.innerHTML = `${pageIndex}/${this.reader.numPages}`
        })
    }

    async search(value){
        if(!value.length || value.length < this.opts.searchMinCharacters){
            this.clearSearchResult()
            return
        }
        this.searchResults.innerHTML = ""
        let results = []
        this.pages
            .filter(page => page.textContent)
            .some(page => {
                if(page.textContent.match(RegExp(value, "i"))) results.push(page)
                return this.opts.searchMaxResults && results.length >= this.opts.searchMaxResults
            })
        
        for(let page of results){
            if(!page.canvasClone) {
                if(!page.canvas) {
                    this.reader.createPageCanvas(page) 
                    await page.renderTask
                }
                page.canvasClone = HtmlUtils.create('img', { src: page.canvas.toDataURL() })
            }
            let result = HtmlUtils.create('li', {className:"search-result"}, this.searchResults)
            result.appendChild(page.canvasClone)
            HtmlUtils.create('span', { innerHTML: page.pageNumber }, result)
            let matchingText = HtmlUtils.create('p', {}, result)
            let matches = page.textContent.match(RegExp(`.{0,${this.opts.searchResultsCharacters}}${value}.{0,${this.opts.searchResultsCharacters}}`, "i"))
            let resultText =  matches.map(text => `...${text}...`).join('<br>')
            matchingText.innerHTML = resultText.replace(RegExp(`(${value})`, 'gi'), "<strong>$1</strong>")

            result.addEventListener('click', ()=>{
                this.flipBook.goToPage(Math.floor(page.pageNumber/2))
                this.reloadActivePages()
            })
        }
        
        if(!results.length) this.notFoundSearchResult()
    }

    clearSearchResult(){
        this.searchResults.innerHTML = ""
        HtmlUtils.create('p', {innerHTML: this.opts.searchEmptyLang}, this.searchResults)
    }
    notFoundSearchResult(){
        this.searchResults.innerHTML = ""
        HtmlUtils.create('p', {innerHTML: this.opts.searchNotFoundLang}, this.searchResults)
    }

    handleDragStart(e){
        this.searchResults.classList.remove('active')
        if(!this.viewContainer.classList.contains('draggable')) return;
        this.startDragPosition = new Vector2(e.pageX, e.pageY)
    }
    handleDrag(e){
        if(!this.startDragPosition) return;
        let currentPosition = new Vector2(e.pageX, e.pageY)
        let offset = this.startDragPosition.clone().substract(currentPosition)
        this.viewContainer.scrollLeft += offset.x
        this.viewContainer.scrollTop += offset.y
        this.startDragPosition = currentPosition
    }
    handleDragEnd(){
        this.startDragPosition = null
    }

    async reloadActivePages(){
        let timeQueried = Date.now()
        this.lastReloadQuery = timeQueried

        await Promise.allSettled(
            this.flipBook.getActivePages()
            .filter(page => page)
            .map(async pageContainer => {
                let canvas = this.reader.createPageCanvas(pageContainer.page)
                await pageContainer.page.renderTask
                if(this.lastReloadQuery != timeQueried) return;
                pageContainer.appendChild(canvas)
                if(pageContainer.children.length > 1) pageContainer.children[0].remove()
                ;[...pageContainer.children].map((canvas, i)=> { if(i) canvas.remove() })
                pageContainer.classList.remove('zooming')
                this.dispatchEvent(new PdfReaderLoadPageEvent(this, pageContainer, pageContainer.page))
            })
        )
    }

    async zoom(value){
        this.reader.opts.scale += value
        if(this.reader.opts.scale <= 0) this.reader.opts.scale = 0.1
        this.zoomValue.innerHTML = Math.floor(this.reader.opts.scale * 100) + "%"

        this.flipBook.getActivePages().filter(page => page).map(pageContainer => {
            pageContainer.classList.add('zooming')
        })

        await this.flipBook.zoom(this.reader.opts.scale)

        this.viewContainer.classList.toggle('draggable', this.viewContainer.scrollHeight > this.viewContainer.clientHeight)
        
        await this.reloadActivePages()

        this.dispatchEvent(new PdfReaderZoomEvent(this, this.reader.opts.scale))
    }

    async load(){
        this.pages = []
        this.indexed = 0

        await this.reader.loadDocument()
        this.canvas = await this.reader.getPageCanvas(1)
        this.flipBook = new FlipBook(this.flipBookContainer, {
            pageWidth: this.canvas.style.width,
            pageHeight: this.canvas.style.height
        })
        this.pageValue.innerHTML = `1/${this.reader.numPages}`
        await Promise.allSettled(
            Array.for(this.reader.numPages, async (i)=>{
                let page = await this.reader.loadPage(i+1)
                this.pages.push(page)
                let pageContainer = HtmlUtils.create('div', {className: "page-container" })
                this.flipBook.addPage(pageContainer)
                pageContainer.page = page
                page.pageContainer = pageContainer
                this.dispatchEvent(new PdfReaderLoadProgress(this, this.pages.length, this.reader.numPages))
            })
        )
        this.bind()
        
        this.dispatchEvent(new PdfReaderLoadedEvent(this))

        await this.updateSearchIndex()

        await this.reloadActivePages()

        this.container.classList.add('active')
    }

    async updateSearchIndex(){
        await Promise.allSettled(
            this.pages.map(async page => {
                let content = await page.getTextContent()
                this.indexed++
                page.textContent = content.items.map(item => item.str).join(' ')
                this.dispatchEvent(new PdfReaderIndexationProgress(this, this.indexed, this.reader.numPages))
            })
        )
        this.dispatchEvent(new PdfReaderIndexationCompleted(this))
    }

}
