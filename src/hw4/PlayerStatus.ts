import Stats from "./status";
import Emitter from "../Wolfie2D/Events/Emitter";
import { Project_Events } from "./project_constants";

export default class CharacterStat{
    
    emitter: Emitter;

    stats: Stats;

    weaponCoolDown: number;

    level: number = 1;

    experience: number = 0;

    constructor(maxHealth: number, attack: number, defense: number, speed: number){
        this.stats = new Stats(maxHealth, maxHealth, attack, defense, speed);
        this.emitter = new Emitter();
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

    gainedExperience(experience: number) {
        let factor = Math.pow(this.level, 1.5);
        const prevLevl = this.level;
        this.experience += experience;
        //Check if the player leveled up
        this.level += Math.floor(this.experience / (factor * 500));
        console.log(prevLevl + " | " + this.level);
        this.experience = (this.experience / (factor * 500) >= 1) ? this.experience % (factor * 500) : this.experience
        if(this.level - prevLevl) this.emitter.fireEvent(Project_Events.LEVELUP, {levelChange: this.level - prevLevl});
    }
}