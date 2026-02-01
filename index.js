const DependencyContianer = require("./src/config/container");

class MessagingModule {
    constructor(options = {}){
        this.container = new DependencyContianer()
        this.setupDependencies(options)
    }
    
}