export default class gameObject {
    contains(v) {
        const x = this.x + this.r
        const y = this.y + this.r
        const dist = Math.sqrt(Math.pow(v.x - x, 2) + Math.pow(v.y - y, 2))
        if(dist > this.r) return false
        return true
    }

    intersects(aa, bb) {
        const x = this.x + this.r - bb.x 
        const y = this.y + this.r - bb.y 
        const v = {x: aa.y - bb.y , y: aa.x - bb.x }

        if((x > Math.max(v.y, 0) || x < Math.min(v.y, 0)) && (y > Math.max(v.x, 0) || y < Math.min(v.x, 0))) return false;
        
        const dy = Math.abs((v.x * x / v.y) - y)
        const dx = Math.abs((v.y * y / v.x) - x)
        return ((dy*dx)/Math.sqrt(dy*dy + dx*dx)) < this.r
    }
}