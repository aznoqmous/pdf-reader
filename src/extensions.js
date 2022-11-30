Array.for = function(iterations, callback){
    return Array(iterations).fill().map((x,i) => callback(i))
}