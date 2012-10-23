describe("Class", function(){
    var Animal, Dog;

    beforeEach(function(){
        Animal = Class('Animal').extend({
            animalType:function(){
                return "Animal";
            }
        }).include({
            type:"Animal",
            makeNoise:function(){
                return 'parent';
            }
        });
        Dog = Class('Dog','Animal').include({
            init:function(name){
                this.name = name;
            },
            bark:function(){
                return this.name;
            },
            getName:function(){
                return this.name;
            },
            callSuper:function(){
                return this._super.makeNoise();
            }
        });
        spyOn(Animal, 'animalType');
    });

    it("is there", function(){
        expect(Class).toBeTruthy();
    });

    it("can create classes",function(){
        expect(Animal).toBeTruthy();
    });

    it("classes have a magic name propertie",function(){
        var k9 = new Animal();
        expect(Animal.__name__ === "Animal").toBeTruthy(); 
        expect(Animal.__name__ === k9.__name__).toBeTruthy();
    })

    it("can create subclasses", function(){
        var dog = new Dog();
        expect(dog).toBeTruthy();
        expect(dog instanceof Animal).toBeTruthy();
    });

    it("subclasses respect instanceof",function(){
        // var dog = new Dog();
        var A = Class('A');
        var B = Class('B',A);
        var C = Class('C',B);
        var ci = new C();
        expect(ci instanceof A).toBeTruthy();
        expect(ci instanceof B).toBeTruthy();
        expect(ci instanceof C).toBeTruthy();
    });

    it("constructor method gets called, with parameters",function(){
        var milu = new Dog('milu');
        expect(milu.name).toBe('milu');
    });

    it("subclasses inherit instance properties",function(){
        var milu = new Dog('milu');
        var animal = new Animal()
        expect(milu.type).toBe(animal.type);
    });

    it("we can call super on methods",function(){      
        var milu = new Dog("milu");
        expect(milu.callSuper()).toBe(milu.makeNoise());
        //expect(milu.name).toBe("parent: milu");
    });

    it("we can extend classes with static properties",function(){
        
        expect(Animal.animalType()).toBe(Animal.__class__);
    });

    it("subclasses inherit static properties",function(){
        var Cat = Class('Cat',Animal);
        expect(Cat.animalType()).toBe(Animal.__class__);
    });



});