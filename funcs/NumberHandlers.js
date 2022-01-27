const Decimal = require("decimal.js");

module.exports = class NumberHandlers {
    static RecurringDecimal(numerator, denominator) {
        let negative = false;
        if (denominator === 0) return "Undefined";
        if (numerator === 0) return "0";
        if (numerator*denominator < 0) negative = true;
        if (numerator%denominator === 0) return String(numerator/denominator);
        
        let num = Math.abs(numerator), den = Math.abs(denominator);
        let result = String(~~(num/den))+".", quotient_num = [];
        while (num) {
            let remainder = num % den;
            if (remainder === 0) {
                for (const i of quotient_num) {
                    result += String(i.slice(-1)[0]);
                break
                }
            }
            num = remainder*10;
            let quotient = ~~(num/den);
            if (!([num, quotient] in quotient_num)) {
                quotient_num.push([num, quotient]);
            } else if ([num, quotient] in quotient_num) {
                index = quotient_num.indexOf([num, quotient]);
                for (i in quotient_num.slice(0, index-1)) result += String(i.slice(-1)[0]);
                result += "("
                for (i in quotient_num.slice(index-1)) result += str(i.slice(-1)[0]);
                result += ")"
                break
            }
            if (negative) {
                if (result[0] === "-") continue;
                result = "-" + result;
            }
        }
        return result;
    }
    static numalias(num) {
        return ((["k", "m", "b"].some(a => num.endsWith(a)))?
            Decimal(num.slice(0, -1)).mul((num.endsWith("k"))? 1000: (num.endsWith("m"))? 1000000: 1000000000).toNumber():
            Number.parseFloat(num)
        )
    }
    static DectoInt(...a) {
        if (a.some(a => !Number.isInteger(a))) return this.DectoInt(...a.map(a => Decimal(a).mul(10).toNumber()));
        return a
    }
    static toTime(num=0) {
        let result = [];
        result.push(num%60);
        num = ~~(num/60);
        result.push(num%60);
        num = ~~(num/60);
        result.push(num);
        return result.reverse();
    }
    static formatDecimal(str) {
        let comma, times, repeat;
        if (-1 === (comma = str.indexOf("."))) return str;
        const pre = str.substr(0, comma + 1);
        str = str.substr(comma + 1);
        for (var i = 0; i < str.length; i++) {
            const offset = str.substr(0, i);
            for (let j = 0; j < 5; j++) {
                const pad = str.substr(i, j + 1);
                times = Math.ceil((str.length-offset.length)/pad.length);
                repeat = new Array(times+1).join(pad); // Silly String.repeat hack
                if (0 === (offset+repeat).indexOf(str)) return pre+offset+"("+pad+")";
            }
        }
        return null;
    }
    static timeAlias(str, defa=0, ret=0) {//-1: minisecond, 0: second, 1: minute, 2: hour
        const timetable = {"-1": 0.001, 0: 1, 1: 60, 2: 60*60};
        const ttable = {"ms": 0.001, "s": 1, "sec": 1, "m": 60, "min": 60, "h": 60*60, "hr": 60*60, "d": 60*60*24, "w": 60*60*24*7};
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(str)) return parseFloat(str)*timetable[defa]/timetable[ret];
        const [time, unit] = str.match(/^([0-9]+)([a-z]+)/i).slice(1);
        if (!["ms", "s", "sec", "m", "min", "h", "hr", "d", "w"].includes(unit)||!time) return false;
        return parseFloat(time)*ttable[unit]/timetable[ret];
    }
}