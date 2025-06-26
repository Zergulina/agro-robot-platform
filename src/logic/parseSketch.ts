import { SketchData, SketchFullInfo, SketchParam, SketchProcedure } from "../types/api/sketch"

const parseParam = (line: string, lineIndex: number): SketchParam => {
    const sketchParam: SketchParam = {
        id: 0,
        macros_name: "",
        default_value: "",
        name: "",
        regex: "",
        value_list: []
    };
    const splitLine = [...line.matchAll(/NAME=(("([^"]|\\")*")|[^\s"]+)|REGEX=\\.*\\|LIST=\[[^\]]*\]|"(\\"|[^"])*"|[^\s]+/gi)].map(match => match[0]);
    if (splitLine.length > 7) throw new Error(`Неверный формат параметра в строке ${lineIndex + 1}: слишком много составляющих (${splitLine.length}), максимум - 7`)
    if (splitLine[0] != "#define") throw new Error(`Неверный формат параметра в строке ${lineIndex + 1}: в начале строки должен быть #define`);
    if (splitLine[1] == "//@ARP_PARAM") throw new Error(`Неверный формат параметра в строке ${lineIndex + 1}: после #define должно быть название макроса`);
    if (splitLine[1].includes(" ") || splitLine[1].includes("\"")) throw new Error(`Неверный формат параметра в строке ${lineIndex + 1}: название макроса должно быть непрерывным словом`);
    sketchParam.macros_name = splitLine[1];
    const defaultValueFlag = splitLine[2] != "//@ARP_PARAM";
    sketchParam.default_value = defaultValueFlag ? splitLine[2] : "";
    for (let i = defaultValueFlag ? 4 : 3; i < splitLine.length; i++) {
        if (splitLine[i].toUpperCase().startsWith("REGEX")) {
            let regexString = splitLine[i].substring(6);
            regexString = regexString.substring(1, regexString.length - 1);
            sketchParam.regex = regexString;
        }
        else if (splitLine[i].toUpperCase().startsWith("NAME")) {
            let name = splitLine[i].substring(5);
            if(name[0] == '"') sketchParam.name = name.substring(1, name.length - 1);
            else sketchParam.name = name;
        }
        else if (splitLine[i].toUpperCase().startsWith("LIST")) {
            let listValues = splitLine[i].substring(5);
            const values = [...listValues.substring(1, listValues.length - 1).matchAll(/[^(,\s*)]+/g)].map(match => match[0])
            values.forEach(value => {
                sketchParam.value_list.push({ id: 0, value });
            });
        }
    }
    if (sketchParam.name == "") {
        sketchParam.name = sketchParam.macros_name;
    }

    return sketchParam;
}

const parseData = (line: string, nextLine: string, lineIndex: number): SketchData => {
    const sketchData: SketchData = {
        id: 0,
        data_name: "",
        data_type: "",
        name: "",
    }
    const splitLine = line.match(/NAME=(("([^"]|\\")*")|[^\s]+)/gi) || []
    if (splitLine.length > 1) throw new Error(`Нельзя задать несколько названий для данных, строка ${lineIndex + 1}`);
    if (splitLine.length == 1) sketchData.name = splitLine[0][5] == '"' ? splitLine[0].substring(6, splitLine[0].length - 1) : splitLine[0].substring(5);
    if (!/(?:int|bool|float)\s+[a-zA-Z_]\w*\s*\(\s*\)\s*/g.test(nextLine)) {
        throw new Error(`Некорректное определение геттера данных, строка ${lineIndex + 2}`);
    }
    const splitNextLine = (nextLine.match(/[A-Za-z_]\w+/gi) || []).map(word => word.toString());

    sketchData.data_type = splitNextLine[0];
    sketchData.data_name = splitNextLine[1];

    if (sketchData.name == "") sketchData.name = sketchData.data_name;

    return sketchData;
}

const parseProcedure = (line: string, nextLine: string, lineIndex: number): SketchProcedure => {
    const sketchProcedure: SketchProcedure = {
        id: 0,
        procedure_name: "",
        name: "",
        args: []
    }

    const funcRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)/;
    let match = nextLine.match(funcRegex);

    let args: { type: string, name: string }[];

    if (match) {
        const procedureName = match[2];
        const argsString = match[3];

        sketchProcedure.procedure_name = procedureName

        args = argsString
            .split(',')
            .map(arg => arg.trim())
            .filter(arg => arg.length > 0)
            .map(arg => {
                const argMatch = arg.match(/(\w+)\s+(\w+)/);
                if (argMatch) {
                    return {
                        type: argMatch[1],
                        name: argMatch[2]
                    };
                }
                return null;
            })
            .filter(arg => arg != null);
    } else {
        throw new Error(`Неверное определение сигнатуры процедуры, строка ${lineIndex + 2}`)
    }

    const annotationRegex = /(\w+)(?:_(?:i)NAME)?\s*=\s*(?:"([^"]+)"|([^\s"]+))/g;

    let nameValue: string | null = null;
    const paramNames: Record<string, string> = {};
    const usedParams = new Set<string>();

    while ((match = annotationRegex.exec(line)) !== null) {
        const rawKey = match[1];
        const value = match[2] || match[3];

        const keyUpper = rawKey.toUpperCase();

        if (keyUpper === "NAME") {
            if (nameValue !== null) {
                console.error("Ошибка: дублирующийся параметр NAME.");
            } else {
                nameValue = value;
            }
        } else if (keyUpper.endsWith("_NAME")) {
            const paramKey = rawKey.slice(0, -5);
            if (args.map(arg => arg.name).includes(paramKey)) {
                paramNames[paramKey] = value;
                usedParams.add(paramKey);
            } else {
                console.warn(`Предупреждение: аргумент "${paramKey}" не найден в объявлении функции.`);
            }
        }
    }

    sketchProcedure.name = nameValue ? nameValue : sketchProcedure.procedure_name;

    for (const arg of args) {
        sketchProcedure.args.push({
            id: 0,
            name: paramNames[arg.name] ? paramNames[arg.name]: arg.name,
            arg_name: arg.name,
            arg_type: arg.type
        }); 
    }

    return sketchProcedure;
}

export const parseSketch = (code: string): SketchFullInfo => {
    const sketch: SketchFullInfo = {
        id: 0,
        name: "",
        file_name: "",
        description: "",
        params: [],
        procedures: [],
        datas: []
    }

    const allLines = code.toString().split(/\r?\n/);
    for (let index = 0; index < allLines.length - 1; index++) {
        if (allLines[index].includes("//@ARP_PARAM")) {
            sketch.params.push(parseParam(allLines[index], index));
        } else if (allLines[index].includes("//@ARP_DATA")) {
            sketch.datas.push(parseData(allLines[index], allLines[index + 1], index));
        } else if (allLines[index].includes("//@ARP_PROCEDURE")) {
            sketch.procedures.push(parseProcedure(allLines[index], allLines[index + 1], index));
        }
    }

    console.log(sketch);
    return sketch;
}