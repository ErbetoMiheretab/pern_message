class DependencyContianer {
    constructor (){
        this.dependencies = new Map()
    }

    register(name, factory, singleton = true){
        this.dependencies.set(name, {
            factory, singleton, instance: null
        })
    }
    resolve(name){
        const dependency = this.dependencies.get(name)
        if(!dependency){
            throw new Error(`Dependency ${name} not found`)
        }
        if(dependency.singleton){
            if(!dependency.instance){
                dependency.instance = dependency.factory(this)
            }
            return dependency.instance

        }
        return dependency.factory(this)
    }
    registerMock(name, mockInstance){
        this.dependencies.set(name, {
            factory: ()=>mockInstance, 
            singleton: true,
            instance: mockInstance
        })
    }
    reset(){
        this.dependencies.forEach(dep =>{
            dep.instance = null
        })
    }
}
module.exports = DependencyContianer