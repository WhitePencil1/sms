const paths = ["A", "B"];
const fs = require('fs/promises');
const path = require('path');
const exmplDir = path.resolve('example');


async function main() {
    const result = [];

    const stack = paths.map(p => path.join(exmplDir, p));

    while(stack.length !== 0) {
        let curDir = stack.pop();
        let entries = await fs.readdir(curDir, { withFileTypes: true });
        
        if (entries.length === 0) continue;

        if(entries[0].isFile()) {
            const jsCount = entries.filter(file => file.name.endsWith('.js')).length;
            if(jsCount > 0) {
                result.push({
                    path: curDir,
                    jsFiles: jsCount
                });
            }
        }

        else {
            for(let item of entries) stack.push(path.join(curDir, item.name));
        }
    }
    console.log(result);
}

main()
