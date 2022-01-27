const setting = require("../setting.json");
const NumberHandlers = require("./NumberHandlers");
const Decimal = require("decimal.js");
const Fraction = require("fraction.js");
const StringHandlers = require("./StringHandlers.js");
const IdleCorpConnection = require("./IdleCorpConnection");

module.exports = class calculate {
    static productSpeed(facility, type, num=1, modifer=false, region, icd) {
        let fac = icd["facilities"][facility],
        tya, tyb, ty;
        if (!["consumes", "produces", "all"].includes(type)) return;
        if (type === "all") {
            tya = fac["consumes"], tyb = fac["produces"];
        } else {
            ty = fac[type];
            if (ty === "None") return Promise.resolve(null);
        }
        let speed = fac["speed"];
        let csSpeed = {}, pdSpeed = {},
        modpro;
        if (modifer) {
            if (Array.isArray(speed)) modpro = IdleCorpConnection.getRegionMod(facility, region).then(b => speed = speed.map(a => Math.round(Decimal(b).mul(a).toNumber())));
            else modpro = IdleCorpConnection.getRegionMod(facility, region).then(a => speed = Math.round(Decimal(a).mul(speed).toNumber()));
        } else modpro = Promise.resolve();
        return modpro.then(rs => {
            if (type === "consumes") {
                if (Array.isArray(speed)) {
                    for (const e in speed) for (const a in ty) csSpeed[a] = Fraction(NumberHandlers.DectoInt(ty[a]*num, e)).toString();
                    return rs = csSpeed;
                }
                for (const a in ty) csSpeed[a] = Fraction(NumberHandlers.DectoInt(ty[a]*num, e)).toString();
                return rs(csSpeed);
            } else if (type === "produces") {
                if (Array.isArray(speed)) {
                    for (const e in speed) for (const a in ty) pdSpeed[a] = Fraction(NumberHandlers.DectoInt(ty[a]*num, e)).toString();
                    return rs = pdSpeed;
                }
                for (const a in ty) pdSpeed[a] = Fraction(NumberHandlers.DectoInt(ty[a]*num, e)).toString();
                return rs(pdSpeed);
            } else if (type === "all") {
                if (!(tya === "None")) {
                    if (Array.isArray(speed)) {
                        let i = 0;
                        for (const e of speed) {
                            for (const a in tya) csSpeed[a+`_${(!i)? "Max": "Min"}(${(e.toString().length>10)? (NumberHandlers.formatDecimal(e.toString().slice(0, -3))): (e)})`] = StringHandlers.decimalStringExtract(Fraction(tya[a]*num, e).toString());
                            i++;
                        }
                    } else for (const a in tya) csSpeed[a] = StringHandlers.decimalStringExtract(Fraction(tya[a]*num, speed).toString());
                } else csSpeed = "None";
                if (!(tyb === "None")) {
                    if (Array.isArray(speed)) {
                        let i = 0
                        for (const e of speed) {
                            for (const a in tyb) pdSpeed[a+`_${(!i)? "Max": "Min"}(${(e.toString().length>10)? (NumberHandlers.formatDecimal(e.toString().slice(0, -3))): (e)})`] = StringHandlers.decimalStringExtract(Fraction(tyb[a]*num, e).toString());
                            i++
                        }
                    } else for (const a in tyb) pdSpeed[a] = StringHandlers.decimalStringExtract(Fraction(tyb[a]*num, speed).toString());
                } else pdSpeed = "None";
                return rs = [csSpeed, pdSpeed];
            }
        })
    }
    static productProfit(facility, type, num=1, modifer=false, region, icd) {
        if (!["consumes", "produces", "all"].includes(type)) return;
        let fac = icd["facilities"][facility],
        tya, tyb, ty;
        if (type === "all") {
            tya = fac["consumes"], tyb = fac["produces"];
        } else {
            ty = fac[type];
            if (ty === "None") return Promise.resolve(null);
        }
        let speed = fac["speed"],
        cspfr = {}, pdpfr = {},
        assets, modpro;
        if (modifer) {
            if (Array.isArray(speed)) modpro = IdleCorpConnection.getRegionMod(facility, region).then(b => speed = speed.map(a => Math.round(Decimal(b).mul(a).toNumber())));
            else modpro = IdleCorpConnection.getRegionMod(facility, region).then(a => speed = Math.round(Decimal(a).mul(speed).toNumber()));
        } else modpro = Promise.resolve();
        return modpro.then(() => {
            if (type === "consumes") {
                for (const a in ty) cspfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal(icd["assets"][a]).times(ty[a]*num*2).toNumber(), speed)).toString());
                return spfr;
            } else if (type === "produces") {
                for (const a in ty) pdpfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal(icd["assets"][a]).times(ty[a]*num).toNumber(), speed)).toString());
                return pdpfr;
            } else if (type === "all") {
                if (tya !== "None") {
                    for (const a in tya) {
                        if (Array.isArray(speed)) {
                            let count = false;
                            for (const d of speed) {
                                cspfr[a+`_${(count)? "Min": "Min"}(${(d.toString().length>10)? (NumberHandlers.formatDecimal(d.toString().slice(0, -3))): (d)})`] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1: icd["assets"][a]).times(tya[a]*num*2).toNumber(), d)).toString());
                                count = true;
                            }
                        } else {
                            cspfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1: icd["assets"][a]).times(tya[a]*num*2).toNumber(), speed)).toString());
                        }
                    }
                } else cspfr = "None";
                if (tyb !== "None") {
                    for (const a in tyb) {
                        if (Array.isArray(speed)) {
                            let count = 0
                            for (const d of speed) {
                                pdpfr[a+`_${(count)? "Min": "Max"}(${(d.toString().length>10)? (NumberHandlers.formatDecimal(d.toString().slice(0, -3))): (d)})`] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1:icd["assets"][a]).times(tyb[a]*num).toNumber(), d)).toString());
                                count = 1;
                            }
                        } else {
                            pdpfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1:icd["assets"][a]).times(tyb[a]*num).toNumber(), speed)).toString());
                        }
                    }
                } else pdpfr = "None";
                let pfs;
                if (cspfr === "None") {
                    pfs = Object.values(pdpfr)[0];
                } else {
                    assets = icd["assets"];
                    if (Array.isArray(speed)) {
                        let i = 0, pfss = [];
                        tyb = Object.entries(tyb)[0]
                        for (const r of speed) {
                            let csttm = [];
                            for (const a in tya) csttm.push(Decimal(assets[a]).times(tya[a]*num));
                            pfss.push({[`${(i)? "Min": "Max"}`]: StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((tyb[0] === "money")? 1: assets[tyb[0]]).times(tyb[1]*num).minus(Decimal.sum(...csttm).times(2)).toNumber(), r)).toString())});
                            i += 1
                        }
                        return [cspfr, pdpfr, pfss];
                    }
                    tyb = Object.entries(tyb)[0]
                    let csttm = [];
                    for (const a in tya) csttm.push(Decimal(assets[a]).times(tya[a]*num));
                    pfs = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((tyb[0] === "money")? 1: assets[tyb[0]]).times(tyb[1]*num).minus(Decimal.sum(...csttm).times(2)).toNumber(), speed)).toString());
                }
                return [cspfr, pdpfr, pfs];
            }
        })
    }
    static facratio(fac, num=1, modifer=false, region, icd) {
        let faclist = icd["facilities"],
        faccs = faclist[fac]["consumes"], facspeed = faclist[fac]["speed"],
        modpro;
        if (!Array.isArray(facspeed)) {
            if (modifer) modpro = IdleCorpConnection.getRegionMod(fac, region).then(a => facspeed = Math.round(Decimal(a).mul(facspeed).toNumber()));
            else modpro = Promise.resolve();
        }
        if (faccs === "None") return Promise.resolve([`0:${num}`, `(0:${num}, 0:${num})`, [["N/A", 0]]]);
        let facpd = [];
        for (const a in faccs) for (const b in faclist) for (const c of Object.keys(faclist[b]["produces"])) if (a === c) facpd.push([b, c]);
        let stuff = Object.values(facpd), rep = [];
        for (const a in stuff) if (stuff.filter(b => b===a)>1) rep.push(b);
        const energy = ("energy" in rep)? 1: 0;
        if (energy) facpd = facpd.filter(a => a[0] != "Coal_power_plant");
        let stuff1 = [], depfrac1 = [], depfrac2 = [], firstFacdt = [];
        if (Array.isArray(facspeed)) {
            if (modifer) modpro = IdleCorpConnection.getRegionMod(fac, region).then(b => facspeed = facspeed.map(a => Math.round(Decimal(b).mul(a).toNumber())));
            else modpro = Promise.resolve();
            return modpro.then(() => {
                let prom = Promise.resolve();
                for (const s of facspeed) {
                    for (const [f, g] of facpd) {
                        prom = prom.then(() => {
                            let ty = (facspeed.indexOf(s))? `_Max(${s})`: `_Min(${s})`;
                            let b = Fraction(faccs[g]*num, s), count = 0,
                            whpro = Promise.resolve();
                            const whfunc = () => {
                                return whpro.then(() => {
                                    if (b.compare(0) === 1) {
                                        let r;
                                        if (modifer) whpro = IdleCorpConnection.getRegionMod(f, region).then(a => r = Decimal(a).mul(faclist[f]["speed"]).toNumber())
                                        else whpro.then(() => r = faclist[f]["speed"]);
                                        whpro.then(() => b=b.sub(Fraction(NumberHandlers.DectoInt(faclist[f]["produces"][g], r))));
                                        count++;
                                        return whfunc()
                                    }
                                    return b
                                })
                            }
                            whfunc().then(a => b = a).then(() => {
                                firstFacdt.push([f+ty, count]);
                                stuff1.push(String(count)+ty);
                                let frac = [b, Fraction(faclist[f]["produces"][g], s)];
                                const afrac = [frac[1].div(frac[0]), Fraction(1)];
                                const bfrac = [Fraction(1), frac[0].div(frac[1])];
                                depfrac1.push(this.simratio(frac).join(":")+ty);
                                depfrac2.push([afrac.join(":")+ty, bfrac.join(":")+ty])
                            })
                        })
                    }
                }
                return prom.then(() => [stuff1.join(":")+":1", depfrac1.map((a, b) => `(${a}, ${depfrac2[b].join(",")})`).join(", "), firstFacdt]);
            })
        } else {
            return modpro.then(() => {
                let prom = Promise.resolve();
                for (const [f, g] of facpd) {
                    prom = prom.then(() => {
                        let b = Fraction(faccs[g], facspeed).mul(num), count = 0,
                        whpro = Promise.resolve();
                        const whfunc = () => {
                            return whpro.then(rs => {
                                if (b.compare(0) === 1) {
                                    let r;
                                    if (modifer) whpro = IdleCorpConnection.getRegionMod(f, region).then(a => r = Decimal(a).mul(faclist[f]["speed"]).toNumber())
                                    else whpro.then(() => r = faclist[f]["speed"]);
                                    whpro.then(() => b=b.sub(Fraction(NumberHandlers.DectoInt(faclist[f]["produces"][g], r))));
                                    count++;
                                    return whfunc()
                                }
                                return b
                            })
                        }
                        return whfunc().then(a => b = a).then(() => {
                            firstFacdt.push([f, count]);
                            stuff1.push(count);
                            let r, pro = Promise.resolve();
                            if (modifer) pro = IdleCorpConnection.getRegionMod(f, region).then(a => r = Decimal(a).mul(faclist[f]["speed"]).toNumber());
                            else pro.then(() => r = faclist[f]["speed"]);
                            return pro.then(() => {
                                let frac = [Fraction(faccs[g], facspeed), Fraction(faclist[f]["produces"][g], r)];
                                const afrac = [frac[1].div(frac[0]), Fraction(1)];
                                const bfrac = [Fraction(1), frac[0].div(frac[1])];
                                depfrac1.push(this.simratio(frac).join(":"));
                                depfrac2.push([afrac.join(":"), bfrac.join(":")])
                            })
                        })
                    })
                }
                return prom.then(() => [stuff1.join(":")+":1", depfrac1.map((a, b) => `(${a}, ${depfrac2[b].join(", ")})`).join(", "), firstFacdt]);
            })
        }
    }
    static simratio(nums) {
        let hcf = nums[0].toFraction().split("/")[0],
        lcm = nums[0].toFraction().split("/")[1]??1;
        for (const a of nums) {
            const [nu, de] = [a.toFraction().split("/")[0], a.toFraction().split("/")[1]??1];
            lcm = (de*lcm)/(this.gcd(de, lcm)),
            hcf = this.gcd(nu, hcf);
        }
        return nums.map(a => a.div(Fraction(hcf, lcm)));
    }
    static gcd(...nums) {
        if (nums.length > 2) return this.gcd(nums[0], this.gcd(...nums.filter((a, b) => b>0)));
        let [a, b] = nums;
        while (b !== 0) [a, b] = [b, a%b];
        return a;
    }
    static firstFac(fac, facdt, num=1, sp=false) {
        let e = (!sp)? "**": "",
        f = num+facdt.map(a => a[1]).reduce((a, b) => a+b);
        return [facdt.map(a => `${e}${StringHandlers.capitalize(a[0]).replace(/_/g, " ")}${e} | ${a[1]}`).join("\n"), `Land ${f}`, f];
    }
    static productProfitLand(facility, type, num=1, land=1, modifer=false, region, icd) {
        let fac = icd["facilities"][facility],
        tya, tyb, ty, pfs;
        if (!["consumes", "produces", "all"].includes(type)) return Promise.resolve(undefined);
        if (type === "all") {
            tya = fac["consumes"], tyb = fac["produces"];
        } else {
            ty = fac[type];
            if (ty === "None") return Promise.resolve(null);
        }
        let speed = fac["speed"];
        let modpro;
        if (modifer) {
            if (Array.isArray(speed)) modpro = IdleCorpConnection.getRegionMod(facility, region).then(b => speed = speed.map(a => Math.round(Decimal(b).mul(a).toNumber())));
            else modpro = IdleCorpConnection.getRegionMod(facility, region).then(a => speed = Math.round(Decimal(a).mul(speed).toNumber()));
        } else modpro = Promise.resolve();
        let cspfr = {}, pdpfr = {};
        return modpro.then(rs => {
            if (type === "consumes") {
                for (const a in ty) cspfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal(icd["assets"][a]).times(ty[a]*num*2).toNumber(), speed)).toString());
                return rs = spfr;
            } else if (type === "produces") {
                for (const a in ty) pdpfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal(icd["assets"][a]).times(ty[a]*num).toNumber(), speed*land)).toString());
                return rs = pdpfr;
            } else if (type === "all") {
                if (!(tya === "None")) {
                    for (const a in tya) {
                        if (Array.isArray(speed)) {
                            let speed = fac["speed"], count = 0;
                            for (const d of speed) {
                                cspfr[a+`_${(count)? "Min": "Max"}(${d})`] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1: icd["assets"][a]).times(tya[a]*num*2).toNumber(), d)).toString());
                                count = 1;
                            }
                        } else {
                            cspfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1: icd["assets"][a]).times(tya[a]*num*2).toNumber(), speed)).toString());
                        }
                    }
                } else cspfr = "None";
                if (!(tyb === "None")) {
                    for (const a in tyb) {
                        let speed = fac["speed"];
                        if (Array.isArray(speed)) {
                            let count = 0;
                            for (const d of speed) {
                                pdpfr[a+`_${(count)? "Min": "Max"}(${d})`] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1: icd["assets"][a]).times(tyb[a]*num).toNumber(), d*land)).toString());
                                count = 1;
                            }
                        } else pdpfr[a] = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(Decimal((a === "money")? 1:icd["assets"][a]).times(tyb[a]*num).toNumber(), speed*land)).toString());
                    }
                } else pdpfr = "None";
                if (cspfr === "None") {
                    pfs = Object.values(pdpfr)[0]
                } else {
                    let speed = fac["speed"],
                    assets = icd["assets"],
                    pdttm, csttm;
                    if (Array.isArray(speed)) {
                        let i = 0,
                        pfss = [];
                        for (const r of speed) {
                            for (const a in tyb) pdttm = Decimal((a === "money")? 1: assets[a]).times(tyb[a]*num), csttm = [];
                            for (const a in tya) csttm.push(Decimal(assets[a]).times(tya[a]*num));
                            pfss.push({[(i)? "Min": "Max"]: StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(pdttm.minus(Decimal.sum(...csttm).times(2)).toNumber(), r*land)).toString())});
                            i++;
                        }
                        return rs = [cspfr, pdpfr, pfss];
                    }
                    for (const a in tyb) pdttm = Decimal((a === "money")? 1: assets[a]).times(tyb[a]*num), csttm = [];
                    for (const a in tya) csttm.push(Decimal(assets[a]).times(tya[a]*num));
                    pfs = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(pdttm.minus(Decimal.sum(...csttm)).toNumber(), speed*land)).toString());
                }
                return rs = [cspfr, pdpfr, pfs];
            }
        })
    }
    static produceRemain(fac, facdt, num=1, land=1, modifer=false, region, icd) {
        let faclist = icd["facilities"],
        faccs = faclist[fac]["consumes"],
        facspeed = faclist[fac]["speed"],
        assets = icd["assets"],
        res1 = [],
        res2 = [],
        res3 = [],
        ld = [],
        modpro;
        if (modifer) {
            if (Array.isArray(facspeed)) modpro = IdleCorpConnection.getRegionMod(fac, region).then(b => facspeed = facspeed.map(a => Math.round(Decimal(b).mul(a).toNumber())));
            else modpro = IdleCorpConnection.getRegionMod(fac, region).then(a => facspeed = Math.round(Decimal(a).mul(facspeed).toNumber()));
        } else modpro = Promise.resolve();
        return modpro.then(() => {
            let prom = Promise.resolve();
            if (Array.isArray(facspeed)) {
                for (const s of facspeed) {
                    for (let [a, b] of facdt) {
                        prom = prom.then(() => {
                            let ty = `_${(a.match(/_Max(\d{2})$/))? "Max": "Min"}(${a.slice(-3, -1)})`,
                            pd, sp, f;
                            a = a.slice(0, -8);
                            if (a === "N/A") {
                                pd = a,
                                sp = 1,
                                b = "0";
                            } else {
                                [[pd, f]] = Object.entries(faclist[a]["produces"]);
                                if (pd === "coal_power_plant") return;
                                f = Fraction(NumberHandlers.DectoInt(f*b, (modifer)? Decimal(IdleCorpConnection.getRegionMod(a, region)).mul(faclist[a]["speed"]).toNumber(): faclist[a]["speed"]));
                                sp = f.sub(Fraction(NumberHandlers.DectoInt(faccs[pd]*num), s)),
                                b = StringHandlers.decimalStringExtract(sp.toString());
                            }
                            res1.push([pd+ty, b]);
                            b = (a === "N/A")? Fraction(0): Fraction(assets[pd]).mul(sp)
                            ld.push(b);
                            res2.push([pd+ty, (a === "N/A")? "0": StringHandlers.decimalStringExtract(b.toString())]);
                        })
                    }
                    prom.then(() => res3 = StringHandlers.decimalStringExtract(ld.reduce((a, b) => a.add(b)).div(land.length+1).toString()));
                }
            } else {
                for (let [a, b] of facdt) {
                    prom = prom.then(() => {
                        let pd, sp, f,
                        mod = Promise.resolve();
                        if (a === "N/A") {
                            pd = a,
                            sp = 1,
                            b = "0";
                        } else {
                            [[pd, f]] = Object.entries(faclist[a]["produces"]);
                            if (modifer) mod = IdleCorpConnection.getRegionMod(a, region).then(e => f = StringHandlers.decimalStringExtract(Fraction(NumberHandlers.DectoInt(f*b, Decimal(e).mul(faclist[a]["speed"]).toNumber()))))
                            else f = Fraction(NumberHandlers.DectoInt(f*b, faclist[a]["speed"]));
                            mod.then(() => {
                                sp = f.sub(Fraction(NumberHandlers.DectoInt(faccs[pd]*num, facspeed))),
                                b = StringHandlers.decimalStringExtract(sp.toString());
                            })
                        }
                        return mod.then(() => {
                            res1.push([pd, b]);
                            b = (a === "N/A")? Fraction(0): Fraction(assets[pd]).mul(sp);
                            ld.push(b);
                            res2.push([pd, (a === "N/A")? "0": StringHandlers.decimalStringExtract(b.toString())])
                        })
                    })
                }
                prom.then(() => res3 = ld.reduce((a, b) => a.add(b)).div(land.length+1).toString());
            }
            return prom.then(() => [res1, res2, res3]);
        })
    }
}