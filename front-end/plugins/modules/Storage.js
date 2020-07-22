const StorageOptions = {
    // 'file': require('./storage/file'),
    'webstorage': require('./storage/WebStorage')
}

class Storage {
    constructor(params = {}){
        // Set storage option
        this.storage = StorageOptions[params.storage](params.storageOptions)
        if(!this.storage) throw "Storage option isn't working"
    }
    // Storage aliases
    get(key){
        return this.storage.get(key)
    }
    save(key, data, replace = true){
        return this.storage.save(key, data, replace)
    }
    update(key, data){
        return this.storage.update(key, data)
    }
    delete(key){
        return this.storage.delete(key)
    }
    clear(){
        return this.storage.clear()
    }
    // Aditional functions
    // Constructors
    static LocalStorage(params = {}){
        params.storage = 'webstorage'
        params.storageOptions = 'local'
        return new Storage(params)
    }
    static SessionStorage(params = {}){
        params.storage = 'webstorage'
        params.storageOptions = 'session'
        return new Storage(params)
    }
}
module.exports = (params = {}) => {
    if(!params.storage) return Storage.LocalStorage(params)
    return new Storage(params)
}
module.exports.Class = Storage

// module.exports.File = params => Storage.file(params)
module.exports.Local = Storage.LocalStorage
module.exports.Session = Storage.SessionStorage
