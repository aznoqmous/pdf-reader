export default class MathUtils {
    static minmax(value, min, max){
        return Math.max(Math.min(value, max), min)
    }
}