const crypto = require('crypto'),
    fs = require('fs'),
	path = require('path')

const IGNORED_FILES = [
    'manifest.json',
    'manifest-generator.js',
    'manifest-generator.bat',
    'manifest-generator.exe',
    'node.exe'
]

// force \n instead of \r\n
const forceUnixLineEndings = true

// filetypes to force unix line ending if enabled
const forceUnixFileTypes = [
    '.txt',
    '.text',
    '.js',
    '.json',
    '.jsn',
    '.xml',
    '.md',
    '.htm',
    '.html',
    '.css',
    '.csv',
    '.php',
    '.cfg',
    '.ini',
    '.list',
    '.lst'
]

// set directory to launch argument or local directory
let directory = __dirname
if (process.argv[2]) {
    directory = process.argv[2]
    // check if valid directory
    try {
        fs.readdirSync(directory, 'utf8')
    }
    catch (err) {
        console.log(`"${directory}" is not a valid folder.`)
        return
    }
}

// read existing manifest.json
let manifest
try {
    // sanitize input
    manifest = require(path.join(directory, 'manifest.json'))
    if (manifest && typeof manifest === 'object') {
        if (!manifest.files) manifest.files = {}
    }
    else {
        manifest = {
            files: {}
        }
    }
}
catch (error) {
    // make new manifest
    manifest = {
        files: {}
    }
}

let checking = 0
// delete removed file entries
for (let entry of Object.keys(manifest.files)) {
    // check if file exists
    checking  += 1
    fs.access(path.join(directory, entry), fs.constants.F_OK, (err) => {
        checking -= 1
        if (err) delete manifest.files[entry]
        checkProg()
        return
    })
}

let reading = 0
getFiles()

// get all files in folder and subfolder
function getFiles(relativePath = '', files) {
    let dir = path.join(directory, relativePath)
    if (!files) files = fs.readdirSync(dir, 'utf8')
    for (let file of files) {
        // if not ignored file or begins with . or _
        if (!IGNORED_FILES.includes(file) && !['.', '_'].includes(file[0])) {
            reading += 1
            fs.readdir(path.join(dir, file), 'utf8', (err, moreFiles) => {
                if (moreFiles) {
                    getFiles(path.join(relativePath, file), moreFiles)
                }
                else {
                    getHash(path.join(relativePath, file))
                }
                reading -= 1
                checkProg()
            })
        }
    }
}

// get sha256 hash
function getHash(file, type = 'sha256') {
    file = file.replace(/\\/g, '/')
    if (forceUnixLineEndings) forceUnix(file)
    if (manifest.files[file] && typeof manifest.files[file] === 'object') {
        manifest.files[file].hash = crypto.createHash(type).update(fs.readFileSync(path.join(directory, file))).digest('hex')
    }
    else {
        manifest.files[file] = crypto.createHash(type).update(fs.readFileSync(path.join(directory, file))).digest('hex')
    }
}

// force unix line endings
function forceUnix(file) {
    // check if read and writable
    for (let type of forceUnixFileTypes) {
        if (file.slice(-6).includes(type)) {
            try {
                let data = fs.readFileSync(path.join(directory, file), 'utf8')
                data = data.replace(/\r\n/g, '\n')
                fs.writeFileSync(path.join(directory, file), data, 'utf8')
            }
            catch (err) {
                //console.log(err)
                console.log('Cannot edit protected file: ' + file)
            }
            return
        }
    }
}

// check if process completed
function checkProg() {
    if (reading === 0 && checking === 0) {
        fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, '\t'), 'utf8')
        console.log('"manifest.json" generation complete.')
    }
}
