import MathUtils from "./MathUtils"

export const FlipBookMode = {
    DESKTOP: "desktop",
    MOBILE: "mobile"
}
export default class FlipBook extends EventTarget {
    
    constructor(container, opts={}){
        super()
        this.container = container
        this.opts = Object.assign({
            pageWidth: "10rem",
            pageHeight: "15rem",
            transition: 500,
            zoom: 1,
            mode: FlipBookMode.DESKTOP
        }, opts)
        this.mode = this.opts.mode
        window.flipBook = this
        this.currentIndex = 0
        this.build()
    }

    set mode(mode){
        this.container.dataset.mode = mode
    }
    get mode(){
        return this.container.dataset.mode
    }

    build(){
        this.observer = new IntersectionObserver((entries, observer)=>{
            if(this.mode != FlipBookMode.MOBILE) return;
            let activePages = [...entries]
            .filter(e => e.isIntersecting)
            .sort((a,b)=> b.intersectionRatio - a.intersectionRatio)
            if(!activePages.length) return

            this.currentIndex = [...this.container.children].indexOf(activePages[0].target)
            this.dispatchEvent(new ShowPageEvent(this.pages[this.currentIndex]))
        }, {
            root: this.container
        })
        this.container.classList.add('flip-book')
        this.pages = [...this.container.children]
        this.resize(this.opts.pageWidth, this.opts.pageHeight)
        if(this.pages.length){
            this.pages[0].classList.add('active')
            this.pages[0].classList.add('transition')
        }
    }

    async resize(width, height){
        this.width = width
        this.height = height

        this.container.style.width = this.mode == FlipBookMode.DESKTOP ? `calc(${width} * ${2*this.opts.zoom})` : `calc(${width} * ${this.opts.zoom})`
        this.container.style.height = `calc(${height} * ${this.opts.zoom})`
        
        await sleep(this.opts.transition + 100)

        //this.container.style.width = this.mode == FlipBookMode.DESKTOP ? Math.floor(this.container.getBoundingClientRect().width/2)*2 + "px" : Math.floor(this.container.getBoundingClientRect().width) + "px"
        //this.container.style.height = Math.floor(this.container.getBoundingClientRect().height) + "px"
    }
    async zoom(value){
        this.opts.zoom = value
        await this.resize(this.width, this.height)
    }

    goToPage(index){
        if(this.mode == FlipBookMode.MOBILE){
            let rectTop = this.container.getBoundingClientRect().top
            this.container.scrollTo({
                top: this.pages[index].getBoundingClientRect().top + this.container.scrollTop - rectTop,
                behavior: "smooth"
            })
        }

        if(index == this.currentIndex) return;
        let isNext = index > this.currentIndex
        this.clear()

        if(isNext) this.clearNext()
        else this.clearPrev()

        this.currentIndex = index
        this.currentIndex = MathUtils.minmax(this.currentIndex, 0, Math.ceil(this.pages.length / 2))

        if(isNext) this.showNext()
        else this.showPrev()
    }

    clearNext(){
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
    }
    showNext(){
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

    clearPrev(){
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
    }
    showPrev(){
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

    next(){
        this.clear()

        this.clearNext()

        this.currentIndex++
        this.currentIndex = MathUtils.minmax(this.currentIndex, 0, Math.ceil(this.pages.length / 2))

        this.showNext()
    }
    prev(){
        if(!this.currentIndex) return;
        this.clear()

        this.clearPrev()

        this.currentIndex--
        this.currentIndex = MathUtils.minmax(this.currentIndex, 0, Math.ceil(this.pages.length / 2))
        
        this.showPrev()
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
        if(this.mode == FlipBookMode.MOBILE){
            return [this.pages[index]]
        }
        if(index == 0) return [null, this.pages[0]]
        let activePages = []
        if(this.pages[index*2-1]) activePages.push(this.pages[index*2-1])
        if(this.pages[index*2]) activePages.push(this.pages[index*2])
        return activePages
    }

    addPage(page){
        this.container.appendChild(page)
        this.pages = [...this.container.children]
        this.observer.observe(page)
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