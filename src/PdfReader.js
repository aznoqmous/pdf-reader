import { build } from "../dist/pdf.min"
import HtmlUtils from "./HtmlUtils"
import MathUtils from "./MathUtils"

const pdfjsLib = window['pdfjs-dist/build/pdf']

export default class PdfReader {
    constructor(filePath, opts={}){
        this.filePath = filePath
        this.pageIndex = 0
        this.pdf = null
        this.pages = {}
        this.opts = Object.assign({
            container: document.body,
            scale: 1,
            outputScale: window.devicePixelRatio || 1
        },
        opts)

        this.build()
        this.bind()
    }

    build(){
        this.toolBar = HtmlUtils.create("div", {class: "pdf-toolbar"}, this.opts.container)
        //this.prevButton = HtmlUtils.create("button", {class: "pdf-prev", innerHTML: "Prev"}, this.toolBar)
        //this.nextButton = HtmlUtils.create("button", {class: "pdf-next", innerHTML: "Next"}, this.toolBar)
        this.pageContainer = HtmlUtils.create("div", {class: "pdf-container"}, this.opts.container)
    }

    bind(){
        //this.prevButton.addEventListener('click', ()=>{ this.prevPage() })
        //this.nextButton.addEventListener('click', ()=>{ this.nextPage() })
    }

    get numPages(){
        return this.pdf.numPages || 0
    }

    /* symlink */
    async loadDocument(){
        return await this.getDocument()
    }
    async getDocument(){
        return new Promise(res => {
            if(this.pdf) return res(this.pdf)
            pdfjsLib.getDocument(this.filePath).promise.then(pdf => {
                this.pdf = pdf
                res(this.pdf)
            })
        })
    }

    async getPage(index){
        let pdf = await this.getDocument()
        return pdf.getPage(index)
    }

    async getPageCanvas(index){
        let page = await this.getPage(index)
        return new Promise(res => {
            if(page.canvas) return res(page.canvas)
            res(this.createPageCanvas(page))
        })
    }

    createPageCanvas(page){
        page.canvas = HtmlUtils.create("canvas")
        page.ctx = page.canvas.getContext("2d")
        page.viewport = page.getViewport({ scale: this.opts.scale })
        page.canvas.width = Math.floor(page.viewport.width * this.opts.outputScale)
        page.canvas.height = Math.floor(page.viewport.height * this.opts.outputScale)
        page.canvas.style.width = Math.floor(page.viewport.width) + "px"
        page.canvas.style.height = Math.floor(page.viewport.height) + "px"
        page.renderContext = {
            canvasContext: page.ctx,
            viewport: page.viewport
        }
        page.render(page.renderContext)
        return page.canvas
    }

    async loadPage(index){
        return new Promise(res => {
            if(this.pages[index]) return res(this.pages[index])
            this.getPage(index).then(page => {
                this.pages[index] = page
                return res(this.pages[index])
            })
        })
    }

    async nextPage(){
        this.pageIndex++
        this.pageIndex = MathUtils.minmax(this.pageIndex, 0, this.numPages)
        let canvas = await this.getPageCanvas(this.pageIndex+1)
        this.pageContainer.appendChild(canvas)
    }
    async prevPage(){
        this.pageIndex--
        this.pageIndex = MathUtils.minmax(this.pageIndex, 0, this.numPages)
        let canvas = await this.getPageCanvas(this.pageIndex+1)
        this.pageContainer.appendChild(canvas)

    }
}