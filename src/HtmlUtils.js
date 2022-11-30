export default class HtmlUtils {
    static create(tagName="div", attributes={}, parent=null){
        let element = document.createElement(tagName)
        for(let key in attributes) element[key] = attributes[key]
        if(parent) parent.appendChild(element)
        return element
    }
}