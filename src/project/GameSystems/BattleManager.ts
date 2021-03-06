import Emitter from "../../Wolfie2D/Events/Emitter";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import BattlerAI from "../AI/BattlerAI";
import PlayerController from "../AI/PlayerController";
import { Project_Events } from "../project_constants";
import Weapon from "./items/Weapon";

export default class BattleManager {
    players: Array<BattlerAI>;

    enemies: Array<BattlerAI>;

    handleInteraction(attackerType: string, weapon: Weapon) {
        if((this.enemies != undefined && this.enemies.length>0)){
            if (attackerType === "player") {

                const critHit: boolean = Math.random() <= (<PlayerController>this.players[0].owner._ai).playerStats.stats.critRate;

                // Check for collisions with enemies
                for (let enemy of this.enemies) {
                    if (weapon.hits(enemy.owner)) {

                        enemy.damage(weapon.type.damage, critHit); // pass in whether the hit crit
                    }
                }
            } else {
                // Check for collision with player
                for (let player of this.players) {
                    if (weapon.hits(player.owner)) {
                        player.damage(weapon.type.damage);
                    }
                }
            }
        }
    }

    setPlayers(player: Array<BattlerAI>): void {
        this.players = player;
    }

    setEnemies(enemies: Array<BattlerAI>): void {
        this.enemies = enemies;
    }
}