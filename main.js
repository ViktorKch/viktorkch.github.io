window.onload = function () {
    let indexes = [];
    let uniqColors = [];
    let buffer = [];
    function rulesCollector() {
        const pool = [];
        const sheets = document.styleSheets[0].cssRules;
        for (let i = 0; i < sheets.length; i++) {
            pool.push(sheets[i].cssText);
            let rule = sheets[i].cssText;//
            let rules = rule.split('{')[1].split('}')[0].trim();
            let selectors = rule.split('{')[0].trim();
            let colors = colorExtractor(rules);
            indexes.push({ 'colors': colors, 'selector': selectors, 'position': i, 'rules': rules });
        }
    }
    function colorExtractor(rules) {
        const colorTypes = [
            '#',
            'hsl',
            'hsla',
            'rgba',
            'rgb'
        ];
        let tar = rules;
        let colors = [];
        for (let type = 0; type < colorTypes.length; type++) {
            for (let p = 0; p < tar.length; p++) {
                let stoppos = 0;
                let startpos = tar.indexOf(colorTypes[type].toLowerCase(), p);
                if (startpos == -1) break;
                switch (colorTypes[type]) {
                    case colorTypes[0]: stoppos = tar.indexOf(';', p); break
                    case colorTypes[1]: stoppos = tar.indexOf(')', p); break
                    case colorTypes[2]: stoppos = tar.indexOf(')', p); break
                    case colorTypes[3]: stoppos = tar.indexOf(')', p); break
                    case colorTypes[4]: stoppos = tar.indexOf(')', p); break
                }
                if (startpos != -1) {
                    if (type != 0) {
                        colors.push(tar.slice(startpos, stoppos + 1));
                        let trim_waste = tar.indexOf(';', stoppos + 1);
                        tar = tar.slice(trim_waste);
                    }
                    if (type === 0) {
                        colors.push(tar.slice(startpos, stoppos));
                        tar = tar.slice(stoppos);
                    }
                }
            }
        }
        let colorsIsNotNull = colors.filter((color) => color != '');
        let delImportantTag = colorsIsNotNull.map((clr) => {
            if (clr.includes('!important')) {
                return clr.replace(new RegExp('!important', 'g'), '');
            }
            return clr;
        })
        return delImportantTag;
    }
    function declOfNum(number) {
        let titles = ['плитка', 'плитки', 'плиток'];
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }
    function flatter(arr) {
        const flatColors = [];
        arr.map((val) => {
            if (typeof (val) !== "string") {
                val.map((lv2) => {
                    flatColors.push(lv2);
                })
            } else {
                flatColors.push(val);
            }
        })

        return flatColors;
    }
    function searching() {
        destroyTable(); 
        destroyTiles();
        const lg = [];
        let q = "";
        let str = document.querySelector("[type='search']").value;
        buffer.splice(0, buffer.length);
        if (str.length === 0) {
            destroyTable();
        } else {
            for (var i = 0; i < str.length; i++) { q += str.charAt(i) };
            for (let inx = 0; inx < indexes.length; inx++) {
                const regEx = new RegExp(q, "i");
                if (indexes[inx].selector.search(regEx) != -1) {
                    buffer.push(flatter(indexes[inx].colors));
                }
                if (indexes[inx].colors.join(',').search(regEx) != -1) {
                    indexes[inx].colors.map((cl) => {
                        if (cl.search(regEx) != -1) {
                            buffer.push(cl);
                        }
                    });
                }
                if (indexes[inx].rules.search(regEx) != -1) {
                    indexes[inx].colors.map((cl) => {
                        if (cl.search(regEx) != -1) {
                            buffer.push(cl);
                        }
                    });
                }
            }

            const flatColors = flatter(buffer);
            uniqColors = flatColors.filter((color, index, self) => self.indexOf(color.trim()) === index);
            lg[0] = uniqColors.length;
            insertQueryToTable(q, uniqColors.join('","'), lg[0]);
            insertTiles(uniqColors);
        }

    }
    function qlistener() {
        const eventList = ["keyup", "paste"];
        for (event of eventList) {
            document.querySelector("[type='search']").addEventListener(event, () => {
                searching();
            });
        }
    }
    function destroyTiles() {
        const parrent = document.querySelector(".uniqtiles");
        while (parrent.firstChild) {
            parrent.firstChild.remove();
        }
    }
    function newTile(color) {
        const parrent = document.querySelector(".uniqtiles");
        const _newtile = document.createElement("div");
        _newtile.className = 'uniqtile';
        _newtile.style.backgroundColor = color;
        parrent.append(_newtile);
    }
    function insertTiles(colors) {
        destroyTiles();
        colors.map((c) => {
            newTile(c);
        });
    }
    function insertQueryToTable(q, r, l) {
        const _tbody = document.querySelector("[class*='table-dark'] tbody");
        const _line = document.createElement("tr");
        _tbody.appendChild(_line);
        const _Qrow = document.createElement("td");
        const _Rrow = document.createElement("td");
        const _tr = document.querySelector("[class*='table-dark'] tbody tr:last-child");
        _Qrow.textContent = q;
        if (l > 0) {
            _Rrow.textContent = l + " " + declOfNum(l) + ' : "' + r + '"';
        } else {
            _Rrow.textContent = l + " " + declOfNum(l);
        }
        _tr.appendChild(_Qrow);
        _tr.appendChild(_Rrow);
    }
    function destroyTable() {
        const _tbody = document.querySelector("[class*='table-dark'] tbody");
        while (_tbody.firstChild) {
            _tbody.firstChild.remove();
        }
    }
    rulesCollector();
    qlistener();
}