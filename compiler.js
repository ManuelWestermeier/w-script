const { log } = require("console")
const fs = require("fs")
const _path = require("path")
var global = ""

const inpPath = _path.join(__dirname, "code/index.w")
const outPath = "C:\\Users\\Manuel Westermeier\\source\\repos\\cpp-server-script\\cpp-server-script.cpp"

const parsed = parseFile(inpPath)

//setInterval(Update)

function Update() {
    console.clear()
    fs.writeFileSync(outPath,
        `${fs.readFileSync("std/std.cpp", "utf-8")}
${global}
int main(int argc, char* argv[]) {
    //user from code
    ${parsed}
    //usercode end
}`
        , "utf-8")
    log("[compiled]")
}

Update()

function parseFile(path = "") {

    const inp = fs.readFileSync(path, "utf-8").replace(/\r/, "")
    const dir = _path.dirname(path)
    var out = ""

    out += inp.split("\n").map((line, i) => {

        const tokens = line.split(/\s/).filter(t => t != "" && t != "\t" && t != "\r" && t != "")
        var lineOut = ""

        if (tokens[0] == "fn") {

            const name = tokens[1]
            const args = []

            if (tokens.length - 4 > 0) {

                const unparsedArgs = tokens.slice(2, tokens.length - 2)

                for (let index = 0; index < unparsedArgs.length; index++) {

                    const [name, type] = unparsedArgs[index].split("#")

                    if (!name || !type) {
                        log(`wrong argument syntax : ${path}:${i} -> '${line}'`)
                    }

                    args.push(`${type} ${name}`)

                }

            }

            lineOut = `auto ${name} = [&](${args.join(",")}) {`;

        }
        else if (tokens[0] == "var") {
            const [before, value] = tokens.slice(1, tokens.length).filter(t => t != "").join(" ").split("=")
            const [name, type] = before.split("#")
            return `${type} ${name} = ${value}`
        }
        else if (tokens[0] == "const") {
            const [before, value] = tokens.slice(1, tokens.length).filter(t => t != "").join(" ").split("=")
            const [name, type] = before.split("#")
            return `const ${type} ${name} = ${value}`
        }
        else if (tokens[0] == "imp") {
            if (!fs.existsSync(_path.join(dir, tokens[1]))) {
                return log(`import file doesn't exists : ${path}:${i} -> '${line}'`)
            }
            return parseFile(_path.join(dir, tokens[1]));
        }
        else if (tokens?.[0]?.[0] == "#") {
            global += line
            return ""
        }
        else return line

        return lineOut

    }).join("\n")

    return out;

}

process.on("uncaughtException", err => log(err))