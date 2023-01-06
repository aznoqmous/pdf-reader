import { build } from "../dist/pdf.min"
import HtmlUtils from "./HtmlUtils"
import MathUtils from "./MathUtils"

const pdfjsLib = window['pdfjs-dist/build/pdf']

export default class Pdf {
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
        page.cleanup()
        page.canvas = HtmlUtils.create("canvas")
        page.ctx = page.canvas.getContext("2d")
        page.viewport = page.getViewport({ scale: this.opts.scale })
        page.canvas.width = Math.floor(page.viewport.width)
        page.canvas.height = Math.floor(page.viewport.height)
        page.canvas.style.width = Math.floor(page.viewport.width) + "px"
        page.canvas.style.height = Math.floor(page.viewport.height) + "px"
        page.renderContext = {
            canvasContext: page.ctx,
            viewport: page.viewport
        }
        page.renderTask = page.render(page.renderContext).promise
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
}