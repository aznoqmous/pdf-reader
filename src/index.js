import "./extensions"
import FlipBook from "./FlipBook.js"
import PdfReader from "./PdfReader.js"
import "../scss/style.scss"
import HtmlUtils from "./HtmlUtils"

async function sleep(ms){
    return new Promise(res => {
        setTimeout(()=> res(), ms)
    })
}
async function main(){
    let reader = new PdfReader("astrid.pdf", {
        scale: 1.1
    })
    await reader.loadDocument()
    
    let canvas = await reader.getPageCanvas(1)

    let fb = new FlipBook(document.getElementById('book'), {
        pageWidth: canvas.style.width,
        pageHeight: canvas.style.height,
    })
    document.getElementById('next').addEventListener('click', ()=> fb.next())
    document.getElementById('prev').addEventListener('click', ()=> fb.prev())

    fb.addEventListener('showPage', async (e)=> {
        await sleep(fb.opts.transition)

        let pageContainer = e.page
        let page = e.page.page
        page.getAnnotations()
        .then(content => {
            content.map(annotation => {
                let marker = document.createElement('i')
                let rect = pageContainer.getBoundingClientRect()
                let annotationRect= {
                    x: annotation.rect[0],
                    y: annotation.rect[1],
                    width: annotation.rect[2],
                    height: annotation.rect[3],
                }
                marker.style.position = "absolute"
                marker.style.left = (annotationRect.x * reader.opts.scale) + "px"
                marker.style.top = (rect.height - annotationRect.y * reader.opts.scale) + "px"
                marker.style.width = (annotationRect.width - annotationRect.x - 8) * reader.opts.scale + "px"
                marker.style.height = (annotationRect.height - annotationRect.y - 3) * reader.opts.scale + "px"
                marker.style.fontSize = 0.5 * reader.opts.scale + "rem"
                marker.innerHTML = annotation.fieldName
                pageContainer.appendChild(marker)
            })
        })
       
        page.getTextContent()
        .then(content => {
            let textItems = content.items
            if(page.markers) return;
            let markers = []
            textItems = textItems.filter(item => item.str.match(/[A-Z][0-9][0-9][0-9][0-9][0-9]/))
            textItems.map(textItem => {
                let marker = document.createElement('i')
                let rect = pageContainer.getBoundingClientRect()
                marker.style.position = "absolute"
                marker.style.left = (textItem.transform[4] * reader.opts.scale) + "px"
                marker.style.top = (rect.height - textItem.transform[5] * reader.opts.scale) + "px"
                marker.style.fontSize = 0.5 * reader.opts.scale + "rem"
                marker.innerHTML = textItem.str
                pageContainer.appendChild(marker)
                markers.push(marker)
            })
            page.markers = markers
        })
    })
    fb.addEventListener('hidePage', (e)=> {
    })

    Promise.allSettled(
        Array.for(reader.numPages, async (i)=>{
            let page = await reader.loadPage(i+1)
            let pageContainer = HtmlUtils.create('div', {className: "page-container" })
            pageContainer.appendChild(reader.createPageCanvas(page))
            fb.addPage(pageContainer)
            pageContainer.page = page
        })
    )
    .then(()=>{
        fb.container.classList.add('active')
    })
        

}

main()