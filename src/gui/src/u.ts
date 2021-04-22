function createShiftArr(step: any) {

    var space = '    ';

    if (isNaN(parseInt(step))) {  // argument is string
        space = step;
    } else { // argument is integer
        switch (step) {
            case 1: space = ' '; break;
            case 2: space = '  '; break;
            case 3: space = '   '; break;
            case 4: space = '    '; break;
            case 5: space = '     '; break;
            case 6: space = '      '; break;
            case 7: space = '       '; break;
            case 8: space = '        '; break;
            case 9: space = '         '; break;
            case 10: space = '          '; break;
            case 11: space = '           '; break;
            case 12: space = '            '; break;
        }
    }

    var shift = ['\n']; // array of shifts
    for (var ix = 0; ix < 100; ix++) {
        shift.push(shift[ix] + space);
    }
    return shift;
}

const u = {
    STRING: "string",
    HASH: "hash",
    LIST: "list",
    SET: "set",
    ZSET: "zset",
    DefaultQuery: {
        serverID: '',
        nodeID: '',
        key: '',
        type: '',
        db: 0,
        cursor: 0,
        count: 50,
        keyword: '',
        all: false,
    },
    LocalRootURL: () => {
        const r = process.env.NODE_ENV === "production" ? "/" : "http://localhost:16379/";
        return r;
    },
    IsXml: (str: string) => {
        const startPattern = /^\s*<[^>]+>/;
        const endPattern = /<\/[^>]+>\s*$/;
        return startPattern.test(str) && endPattern.test(str);
    },
    IsJson: (str: string) => {
        const pattern = /(^\s*\[[\s\S]*\]\s*$)|(^\s*\{[\s\S]*\}\s*$)/;
        return pattern.test(str);
    },
    FormatJson: (text: string) => {
        try {
            const step = '    ';

            if (typeof JSON === 'undefined') return text;

            if (typeof text === "string") return JSON.stringify(JSON.parse(text), null, step);
            if (typeof text === "object") return JSON.stringify(text, null, step);

            return text; // text is not string nor object
        } catch (err) {
            console.error(err);
            return text;
        }
    },
    MinifyJson: (text: string) => {
        try {
            if (typeof JSON === 'undefined') return text;

            return JSON.stringify(JSON.parse(text), null, 0);
        } catch (err) {
            console.error(err);
            return text;
        }
    },
    FormatXml: (text: string) => {
        try {
            const step = '    ';
            const shift1 = createShiftArr(step);

            var ar = text.replace(/>\s{0,}</g, "><")
                .replace(/</g, "~::~<")
                .replace(/\s*xmlns\:/g, "~::~xmlns:")
                .replace(/\s*xmlns\=/g, "~::~xmlns=")
                .split('~::~'),
                len = ar.length,
                inComment = false,
                deep = 0,
                str = '',
                ix = 0,
                shift = step ? createShiftArr(step) : shift1;

            for (ix = 0; ix < len; ix++) {
                // start comment or <![CDATA[...]]> or <!DOCTYPE //
                if (ar[ix].search(/<!/) > -1) {
                    str += shift[deep] + ar[ix];
                    inComment = true;
                    // end comment  or <![CDATA[...]]> //
                    if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
                        inComment = false;
                    }
                } else
                    // end comment  or <![CDATA[...]]> //
                    if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
                        str += ar[ix];
                        inComment = false;
                    } else
                        // <elm></elm> //
                        if (
                            /^<\w/.exec(ar[ix - 1])
                            &&
                            /^<\/\w/.exec(ar[ix])
                            // &&
                            // /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')
                        ) {
                            str += ar[ix];
                            if (!inComment) deep--;
                        } else
                            // <elm> //
                            if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
                                str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
                            } else
                                // <elm>...</elm> //
                                if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
                                    str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
                                } else
                                    // </elm> //
                                    if (ar[ix].search(/<\//) > -1) {
                                        str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
                                    } else
                                        // <elm/> //
                                        if (ar[ix].search(/\/>/) > -1) {
                                            str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
                                        } else
                                            // <? xml ... ?> //
                                            if (ar[ix].search(/<\?/) > -1) {
                                                str += shift[deep] + ar[ix];
                                            } else
                                                // xmlns //
                                                if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
                                                    str += shift[deep] + ar[ix];
                                                }

                                                else {
                                                    str += ar[ix];
                                                }
            }

            return (str[0] == '\n') ? str.slice(1) : str;
        } catch (err) {
            console.error(err);
            return text;
        }
    },
    MinifyXml: (text: string, preserveComments: boolean) => {
        var str = preserveComments ? text
            : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "")
                .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
        return str.replace(/>\s{0,}</g, "><");
    },
}
export default u