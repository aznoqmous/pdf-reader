import "./extensions"
import FlipBook from "./FlipBook.js"
import PdfReader from "./PdfReader.js"
import "../scss/style.scss"
import HtmlUtils from "./HtmlUtils"


async function main(){
    let reader = new PdfReader("astrid.pdf", {
        scale: 1
    })
    await reader.loadDocument()
    
    let canvas = await reader.getPageCanvas(1)

    let fb = new FlipBook(document.getElementById('book'), {
        pageWidth: canvas.style.width,
        pageHeight: canvas.style.height,
    })
    document.getElementById('next').addEventListener('click', ()=> fb.next())
    document.getElementById('prev').addEventListener('click', ()=> fb.prev())

    fb.addEventListener('showPage', (e)=> {
        let pageContainer = e.page
        let page = e.page.page
        pageContainer.page.getTextContent()
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