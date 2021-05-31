const files = []    // Store all files
let ID = 0

// Add file and integrate id then push it
function addFile(file){
    ID++
    let f = {id: ID, file}
    files.push(f)
    return ID
}

// Get file
function getFile(id){
    return files.filter(file => file.id === id)[0]
}

module.exports = {
    addFile,
    getFile
}