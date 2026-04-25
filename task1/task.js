const fs = require('fs/promises');
const path = require('path');

const rootPaths = ["A", "B"];
const n = 2;
const exampleDir = path.resolve('example');

async function getJsDirs(rootPaths) {
    const result = [];
    const stack = rootPaths.map(p => path.join(exampleDir, p));

    while(stack.length !== 0) {
        const curDir = stack.pop();
        const entries = await fs.readdir(curDir, { withFileTypes: true });

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
            for(const item of entries) stack.push(path.join(curDir, item.name));
        }
    }
    return result;
}

function divideGroups(n, folders) {
    const groups = [];
    for(let i = 0; i < n; i++) {
        groups.push({
            dirs: [],
            total: 0
        });
    }

    const sorted = [...folders].sort((a, b) => b.jsFiles - a.jsFiles)

    for (const entry of sorted) {
        groups.sort((a, b) => a.total - b.total)

        groups[0].dirs.push(entry.path);
        groups[0].total += entry.jsFiles;
    }
    return groups;
}


async function main() {
    const jsFolders = await getJsDirs(rootPaths);
    console.log(jsFolders);

    const groups = divideGroups(n, jsFolders)
    console.log(groups);
}
main();
