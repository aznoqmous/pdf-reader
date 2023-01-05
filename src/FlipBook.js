import MathUtils from "./MathUtils"

export default class FlipBook extends EventTarget {
    
    constructor(container, opts={}){
        super()
        this.container = container
        this.opts = Object.assign({
            pageWidth: "10rem",
            pageHeight: "15rem",
            transition: "1000",
            zoom: 1
        }, opts)
        window.flipBook = this
        this.currentIndex = 0
        this.build()
    }

    build(){
        this.container.classList.add('flip-book')
        this.pages = [...this.container.children]
        this.resize(this.opts.pageWidth, this.opts.pageHeight)
        if(this.pages.length){
            this.pages[0].classList.add('active')
            this.pages[0].classList.add('transition')
        }
    }

    resize(width, height){
        this.width = width
        this.height = height
        this.container.style.width = `calc(${width} * ${2*this.opts.zoom})`
        this.container.style.height = `calc(${height} * ${this.opts.zoom})`
    }
    zoom(value){
        this.opts.zoom = value
        this.resize(this.width, this.height)
    }

    next(){
        this.clear()

        let previousPages = this.getActivePages()
        if(previousPages && previousPages.length){
            if(previousPages[0]) {
                previousPages[0].classList.add('active')
                this.dispatchEvent(new HidePageEvent(previousPages[0]))
            }
            if(previousPages[1]) {
                previousPages[1].classList.add('transition')
                this.dispatchEvent(new HidePageEvent(previousPages[1]))
            }
        }

        this.currentIndex++
        this.currentIndex = MathUtils.minmax(this.currentIndex, 0, Math.ceil(this.pages.length / 2))

        let activePages = this.getActivePages()
        if(activePages && activePages.length){
            if(activePages[0]) {
                activePages[0].classList.add('active')
                activePages[0].classList.add('transition')
                this.dispatchEvent(new ShowPageEvent(activePages[0]))
            }
            if(activePages[1]) {
                setTimeout(()=>{
                    activePages[1].classList.add('active')
                    setTimeout(()=> activePages[1].classList.add('transition'), 100)
                    this.dispatchEvent(new ShowPageEvent(activePages[1]))
                }, 100)
            }
        }
    }
    prev(){
        if(!this.currentIndex) return;
        this.clear()

        let previousPages = this.getActivePages()
        if(previousPages && previousPages.length){
            if(previousPages[0]) {
                previousPages[0].classList.add('transition')
                this.dispatchEvent(new HidePageEvent(previousPages[0]))
            }
            if(previousPages[1]) {
                previousPages[1].classList.add('active')
                setTimeout(()=> previousPages[1].classList.remove('active'), this.opts.transition - 100)
                this.dispatchEvent(new HidePageEvent(previousPages[1]))
            }
        }

        this.currentIndex--
        this.currentIndex = MathUtils.minmax(this.currentIndex, 0, Math.ceil(this.pages.length / 2))
        let activePages = this.getActivePages()
        if(activePages && activePages.length){
            if(activePages[0]) {
                activePages[0].classList.add('active')
                this.dispatchEvent(new ShowPageEvent(activePages[0]))
            }
            if(activePages[1]) {
                activePages[1].classList.add('transition')
                activePages[1].classList.add('active')
                this.dispatchEvent(new ShowPageEvent(activePages[1]))
            }
        }
    }

    clear(){
        this.pages.map(p => {
            p.classList.remove('transition')
            p.classList.remove('active')
        })
    }

    getPreviousPages(){
        return this.getPagesAtIndex(this.currentIndex-1)
    }
    getNextPages(){
        return this.getPagesAtIndex(this.currentIndex+1)
    }
    getActivePages(){
        return this.getPagesAtIndex(this.currentIndex)
    }

    getPagesAtIndex(index){
        if(index == 0) return [null, this.pages[0]]
        let activePages = []
        if(this.pages[index*2-1]) activePages.push(this.pages[index*2-1])
        if(this.pages[index*2]) activePages.push(this.pages[index*2])
        return activePages
    }

    addPage(page){
        this.container.appendChild(page)
        this.pages = [...this.container.children]
        this.dispatchEvent(new AddPageEvent(page))
        if(this.pages.length == 1){
            page.classList.add('active')
            page.classList.add('transition')
        }
    }
}

export class AddPageEvent extends Event {
    constructor(page){
        super("addPage")
        this.page = page
    }
}

export class ShowPageEvent extends Event {
    constructor(pages){
        super("showPage")
        this.page = pages
    }
}
export class HidePageEvent extends Event {
    constructor(pages){
        super("hidePage")
        this.page = pages
    }
}