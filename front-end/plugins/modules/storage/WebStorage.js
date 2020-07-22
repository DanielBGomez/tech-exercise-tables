const merge = require('deepmerge')

const StorageOptions = {
    'local': window.localStorage,
    'session': window.sessionStorage
}

const DefaultStorageOption = 'local'

class WebStorage {
    constructor(storage = DefaultStorageOption){
        // Set Storage option
        this.storage = StorageOptions[storage] || StorageOptions[DefaultStorageOption]
        if(!this.storage) throw "Storage option isn't working"
    }
    static Local(){
        return new WebStorage('local')
    }
    static Session(){
        return new WebStorage('session')
    }
    /**
     * Get data by key.
     * 
     * @param {string} key  Data key name
     */
    get(key){
        // Exists?
        if(typeof this.storage[key] == "undefined") return undefined

        // Is object?
        let object = this._isObject(key)
        if(object) return object

        // return data
        return this.storage.getItem(key)
    }
    /**
     * Store data as provided key.
     * 
     * If the data is an object, it will be stringified as JSON.
     * 
     * If the replace param is set to false and already exists the key will throw an error.
     * 
     * @param {String} key          Data key name 
     * @param {*} data              Data
     * @param {boolean} replace     Replace data if exists?
     * 
     * @throws {Log} Already exists (if replace set to false), JSON.stringify error, Storage.setItem error.
     */
    save(key, data = '', replace = true) {
        // Exists?
        if(typeof this.storage[key] != "undefined" && !replace) throw `The key: "${key}" already exists in the storage. Try setting the replace param to: "true" or using the "update" method.`
        // Is object?
        if(typeof data == "object"){
            data = this._stringify(data)
        }
        // Store
        return this._store(key, data)
    }
    /**
     * Updates stored data by key. 
     * 
     * If the data is an object, the update will do a deepmerge.
     * 
     * @param {String} key  Data key name
     * @param {*} data      New data
     */
    update(key, data){
        // Save if doesn't exists
        if(typeof this.storage[key] == "undefined") return this.save(key, data)

        // Is object?
        let object = this._isObject(key)
        // Was object?
        if(object){
            // Update object
            data = merge(object, data)
            // Stringify
            data = this._stringify(data)
        } 
        // Store
        return this._store(key, data)
    }
    /**
     * Delete stored data by key.
     * 
     * The key will be have an undefined state.
     * 
     * @param {string} key Data key name
     * 
     * @throws {Log} Invalid key, unavailable storage or unknown errors 
     */
    delete(key){
        // Izi pizi
        this.storage.removeItem(key)
    }
    /**
     * Clear all items in storage
     */
    clear(){
        // Izi pizi
        this.storage.clear()
    }
    _isObject(key){
        try {
            return JSON.parse(this.storage[key])
        } catch(err) {
            // it was not
            return false
        }
    }
    _stringify(object){
        try {
            return JSON.stringify(object)
        } catch(err) {
            throw "Something went wrong while trying to Strinfigy JSON"
        }
    }
    _store(key, data){
        try {
            return this.storage.setItem(key, data)
        } catch(err) {
            throw "Something went wrong while storing the data"
        }
    }
}


module.exports = params => new WebStorage(params)
module.exports.Class = WebStorage

module.exports.Local = WebStorage.Local
module.exports.Session = WebStorage.Session