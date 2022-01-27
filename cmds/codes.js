const Discord = require("discord.js");
const setting = require("../setting.json");
const cdslist = require("../codes.json");
const cmdInfo = require("../cmdsinfo.json");
const StringHandlers = require("../funcs/StringHandlers.js");

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Update:
 *   U, perm(D/A/N), {from 0}type(command(Hiperm), command(normal), event(include you_know), codes, alliases, easter eggs), commands(add, change, remove, add(history), change(history), remove(history), codes, aliases, other), size(history(1), statusread(1), status(2), codes(1), aliases(1), you_know(2)), number(two digits)
 * Error:
 *   E, perm(D/A/N), {from 0}type(command(common), command(rare), event handling, search(wiki)),
 *    Common:
 *      {from 0}type(argumenterror, checkerror(permission etc)),
 *        argumenterror:
 *          argumenttype(normal, flag, flagparameter), number(1 digit)
 *        checkerror:
 *          checktype(permission(role), permission(other)), number(1 digit)
 *    Rare and other:
 *      {from 0}type(subcommand),
 *        Subcommand:
 *          type(command, argument), number(1 digit)
 *    Command handling:
 *      {from 0}type(main command handling, after you_know, error situation),
 *        Other:
 *          {from 0}commonness(common, uncommon), number(1 digit),
 *        Error situation:
 *          problemdepth(only command, temporary, permanent), number(1 digit)
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

module.exports = {
    name: "codes",
    execute(message, args) {
        args = args.map((a, b) => (!b)? Object.entries(cmdInfo["aliases"]["codes"]).find(b => b[1].includes(a))?.[0] || a: a);
        if (["update", "error"].includes(args[0])) return require("./expan/codes/"+args[0]).execute(message, args.slice(1));
        if (!args.length) return message.channel.send(`Commands: \`update\`, \`error\`\nThe current Codes version is v.${cdslist["version"]}`)
        if (["version", "v"].includes(args.join(" "))) {
            return message.channel.send(`The currently code version is ${cdslist["version"]}, the valid recorded versions have: ${Object.keys(cdslist["oldver"]).map(a => StringHandlers.capitalize(a)).concat(cdslist["version"]).join(", ")}`)
        } else if (["list", "l"].includes(args.join(" "))) {
            let check = message.member.roles.cache;
            return message.channel.send("The list of codes:`"+((check.has("841622372351344650")||check.has("801052590389329930")||check.has("801052697498746920"))? Object.values(cdslist["codes"]).reduce((a, b) => a+"\n"+Object.keys(b).sort().join("\n"), ""): (check.has("801052514556313620"))? Object.values(cdslist["codes"]).reduce((a, b) => a+"\n"+Object.keys(b).filter(a => !includes("D")).sort().join("\n"), ""): Object.values(cdslist["codes"]).reduce((a, b) => a+"\n"+Object.keys(b).filter(a => !(a.includes("D")||a.includes("A"))).sort().join("\n"), ""))+`\`\n\nCode version: v.${cdslist["version"]}`)
        } else return message.channel.send("`EN1012`: Invalid subcommand.")
    }
}