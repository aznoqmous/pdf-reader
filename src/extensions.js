Array.for = function(iterations, callback){
    return Array(iterations).fill().map((x,i) => callback(i))
}

window.sleep = async function(ms){
    return new Promise(res => {
        setTimeout(()=> res(), ms)
    })
}