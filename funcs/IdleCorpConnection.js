const https = require("https");
const Decimal = require("decimal.js");
const fetch = require("node-fetch")

module.exports = class IdleCorpConnection {
    static getRegionMod(fac, region) {
        return new Promise(rsd => new Promise((rs, rj) => https.request("https://ic-hg-service.teemaw.dev/corporation/@me/regions", {headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer ShR3GK1NmdWXAY6ESmkCCjwJYbaABC"}}, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            })
            resp.on("end", () => {
                try {
                    rs(JSON.parse(data));
                } catch {
                    rs(data)
                }
            })
        }).on("error", (err) => {
            rj("Error: "+err.message);
        }).end()).then((d) => {
            if (typeof d === "string") {
                
                fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "UPDATE \"BenChueng0422/IdleCorp-Profit\".\"tokens\" SET token = \'"+token+"\' WHERE name = \'IdleCorp\'"})})
                return this.getRegionMod(fac, region)
            }
            region = (region === "icp")? "801019800682758145": "602704690219843584";
            const production = [
                ["CAR_FACTORY", ["car_factory"]],
                ["IRON_CONCENTRATION", ["iron_mine"]],
                ["TELEVISION_FACTORY", ["television_factory"]],
                ["SOIL_HEALTH", [""]],
                ["GOLD_CONCENTRATION", ["gold_mine"]],
                ["SOLAR_IRRADIANCE", ["solar_power_plant"]],
                ["LAPTOP_FACTORY", ["laptop_factory"]],
                ["DIGITAL_CAMERA_FACTORY", ["digital_camera_factory"]],
                ["OIL_CONCENTRATION", ["oil_well"]],
                ["TRUCK_FACTORY", ["truck_factory"]],
                ["PRESCRIPTION_DRUG_FACTORY", ["prescription_drug_factory"]],
                ["GASOLINE_ENGINE_FACTORY", ["gasoline_engine_factory"]],
                ["BAUXITE_CONCENTRATION", ["bauxite_mine"]],
                ["COAL_PLANT", ["coal_power_plant"]],
                ["COAL_CONCENTRATION", ["coal_mine"]],
                ["SILICON_CONCENTRATION", ["silicon_mine"]]
            ].find(a => a[1].includes(fac))?.[0];
            const mod = d[region]["region"]["productionCoeffs"][production] || 1;
            return rsd(Decimal(mod).mul(Decimal(100).div(100+d[region]["region"]["happiness"])).toNumber());
        }))
    }
}