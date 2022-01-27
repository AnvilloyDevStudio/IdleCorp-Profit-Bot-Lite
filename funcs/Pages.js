module.exports = class {
    constructor(elements=[], limit=10) {
        this.pages = [];
        this.limit = limit;
        for (let a = 0; a<elements.length; a++) {
            if ((a)%limit===0) this.pages.push([])
            this.pages[this.pages.length-1].push(elements[a])
        }
        if (!this.pages.length) this.pages = [[]];
    }
    page(page) {
        return this.pages[page-1];
    }
    addpage(elements) {
        for (let a = 0; a<elements.length; a++) {
            if (this.pages[this.pages.length-1].length%this.limit===0) this.pages.push([])
            this.pages[this.pages.length-1].push(elements[a])
        }
        return this
    }
    length = () => this.pages.length;
}