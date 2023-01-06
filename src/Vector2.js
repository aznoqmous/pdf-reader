export default class Vector2 {
    constructor(x=0, y=0){
        this.x = x
        this.y = y
    }
    
    clone(){
        return new Vector2(this.x, this.y)
    }

    add(vector){
        this.x += vector.x
        this.y += vector.y
        return this
    }

    substract(vector){
        this.x -= vector.x
        this.y -= vector.y
        return this
    }

    multiply(vector){
        this.x *= vector.x
        this.y *= vector.y
        return this
    }

    divide(vector){
        this.x /= vector.x
        this.y /= vector.y
        return this
    }

    abs(){
        this.x = Math.abs(this.x)
        this.y = Math.abs(this.y)
        return this
    }

    multiplyBy(value){
        this.x *= value
        this.y *= value
        return this
    }

    divideBy(value){
        this.x /= value
        this.y /= value
        return this
    }

    normalize(){
        let magnitude = this.magnitude
        this.x /= magnitude
        this.y /= magnitude
        return this
    }

    get normalized(){
        return this.clone().normalize()
    }

    get magnitude(){
        return Math.pow(this.x, 2) + Math.pow(this.y, 2)
    }

    get sqrMagnitude(){
        return Math.sqrt(this.magnitude)
    }
}