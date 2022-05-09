import Stats from "./status";
import Emitter from "../Wolfie2D/Events/Emitter";
import { Project_Events } from "./project_constants";

export default class CharacterStat{
    
    emitter: Emitter;

    stats: Stats;

    weaponCoolDown: number;

    level: number = 1;

    experience: number = 0;

    constructor(maxHealth: number, attack: number, defense: number, speed: number, weaponCooldown: number, critRate: number){
        this.stats = new Stats(maxHealth, maxHealth, attack, defense, speed, critRate);
        this.weaponCoolDown = weaponCooldown;
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
        const prevLevl = this.level; // save previous level
        this.experience += experience; // add experience
        const reqExp = 1000 * Math.pow(this.level, 1.3); // divisor = 1000, scaling factor = 1.3 (required exp to level up)
        console.log("EXP: ", experience, " | REQ EXP: ", reqExp);
        this.level += Math.floor(this.experience / reqExp); // calculate new level
        this.experience = (this.level - prevLevl) ? this.experience % reqExp : this.experience // set remainder of exp
        if (this.level - prevLevl) this.emitter.fireEvent(Project_Events.LEVELUP, {levelChange: this.level - prevLevl}); // fire level up event if leveled up
    }
}