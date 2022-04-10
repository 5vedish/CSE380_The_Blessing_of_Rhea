import Stats from "./status";

export default class CharacterStat{
    stats: Stats;
    constructor(maxHealth: number, attack: number, defense: number, speed: number){
        this.stats = new Stats(maxHealth, maxHealth, attack, defense, speed);
    }

    editHealth(health: number){
        //Check if adding health would go over maxHealth
        if(this.stats.health + health > this.stats.maxHealth){
            this.stats.health = this.stats.maxHealth;
        } else if(this.stats.health + health < 0) {
            this.stats.health = 0;
        } else {
            this.stats.health += health;
        }
    }
}