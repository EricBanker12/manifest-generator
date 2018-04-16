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

// read existing manifest.json
let manifest
try {
    manifest = require('./manifest.json')
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
    manifest = {
        files: {}
    }
}

let checking = 0
// delete removed file entries
for (let entry of Object.keys(manifest.files)) {
    // check if file exists
    checking  += 1
    fs.access(path.join(__dirname, entry), fs.constants.F_OK, (err) => {
        checking -= 1
        if (err) delete manifest.files[entry]
        return
    })
}

let reading = 0
getFiles()

// get all files in folder and subfolder
function getFiles(relativePath = '', files) {
    let dir = path.join(__dirname, relativePath)
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
    if (manifest.files[file] && typeof manifest.files[file] === 'object') {
        manifest.files[file].hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, file), 'utf8')).digest('hex')
    }
    else {
        manifest.files[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, file), 'utf8')).digest('hex')
    }
}

function checkProg() {
    if (reading === 0 && checking === 0) {
        fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, '\t'), 'utf8')
        console.log('"manifest.json" generation complete.')
    }
}