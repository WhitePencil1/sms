const fs = require('fs/promises');
const path = require('path');

const rootPaths = ["A", "B"];
const n = 2;
const exampleDir = path.resolve('example');

async function getJsDirs(rootPaths) {
    const jsDirs = [];
    const stack = rootPaths.map(p => path.join(exampleDir, p));

    while(stack.length !== 0) {
        const curDir = stack.pop();
        const entries = await fs.readdir(curDir, { withFileTypes: true });

        if (entries.length === 0) continue;
        
        if(entries[0].isFile()) {
            const jsCount = entries.filter(file => file.name.endsWith('.js')).length;
            if(jsCount > 0) {
                jsDirs.push({
                    path: curDir,
                    jsFiles: jsCount
                });
            }
        }
        
        else {
            for(const item of entries) stack.push(path.join(curDir, item.name));
        }
    }
    return jsDirs;
}

function divideGroups(n, folders) {
    const groups = [];
    for(let i = 0; i < n; i++) {
        groups.push({
            dirs: [],
            total: 0
        });
    }

    const sorted = [...folders].sort((a, b) => b.jsFiles - a.jsFiles);

    for (const entry of sorted) {
        groups.sort((a, b) => a.total - b.total);

        groups[0].dirs.push(entry.path);
        groups[0].total += entry.jsFiles;
    }
    return groups;
}

function printJsDirs(jsDirs) {
    for (const dir of jsDirs) {
        const relativePath = path.relative(exampleDir, dir.path);
        const prettyPath = relativePath.split(path.sep).join(' \\ ');
        console.log(`${prettyPath} (${dir.jsFiles})`);
    }
}

function printGroups(groups, jsDirs) {
    for (let i = 0; i < groups.length; i++) {
        console.log(`[${i + 1}]`);
        for (const dirPath of groups[i].dirs) {
            const folder = jsDirs.find(item => item.path === dirPath);
            const relativePath = path.relative(exampleDir, folder.path);
            const prettyPath = relativePath.split(path.sep).join(' \\ ');
            console.log(`${prettyPath} (${folder.jsFiles})`);
        }
    }
}

async function main() {
    const jsFolders = await getJsDirs(rootPaths);
    console.log('Задание 1');
    printJsDirs(jsFolders);
    
    const groups = divideGroups(n, jsFolders);
    console.log('\n\nЗадание 2');
    printGroups(groups, jsFolders);
}
main();
