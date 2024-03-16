export default class gameObject {
    contains(v) {
        const x = this.x + this.r
        const y = this.y + this.r
        const dist = Math.sqrt(Math.pow(v.x - x, 2) + Math.pow(v.y - y, 2))
        if(dist > this.r) return false
        return true
    }
}