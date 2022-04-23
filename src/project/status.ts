export default class Stats {
    maxHealth: number;
    health: number;
    attack: number;
    defense: number;
    speed: number;

    constructor(maxHealth: number, health: number, attack: number, defense: number, speed: number){
        this.maxHealth = maxHealth;
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
    }
}