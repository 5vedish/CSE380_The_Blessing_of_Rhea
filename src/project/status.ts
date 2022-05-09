export default class Stats {
    maxHealth: number;
    health: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number;

    constructor(maxHealth: number, health: number, attack: number, defense: number, speed: number, critRate: number){
        this.maxHealth = maxHealth;
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.critRate = critRate;
    }
}