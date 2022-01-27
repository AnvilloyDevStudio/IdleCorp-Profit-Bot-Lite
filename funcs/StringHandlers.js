module.exports = class StringHandlers {
    static capitalize(str) {
        return str[0].toUpperCase()+str.slice(1);
    }
    static decimalStringExtract(str) {
        let a = str.match(/^(\d+\.\d*\(\d{1,15})(\d*)/);
        return (a)? a[1]+((a[2])? "...": "")+")": str
    }
    static fillZeros(num, digit) {
        const str = num.toString();
        const n = digit-num.length;
        return "0".repeat((n<0)? 0: n)+str;
    }
}