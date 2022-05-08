import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";
import { Project_Events } from "../../../project_constants";
import HadesController from "../../../AI/HadesController";
import ProjectileAI from "../../../AI/ProjectileAI";

export default class PoisonedGoblet extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        let half = playerStats.stats.maxHealth / 2;
        playerStats.stats.health = (playerStats.stats.health > half) ? half : playerStats.stats.health;
        playerStats.stats.maxHealth = half;
        this.emitter.fireEvent(Project_Events.HEALTHCHANGED);

        if (playerController.weapon){
            playerController.weapon.type.damage *= 1.5;
        } else {
            const fireballs = (<HadesController> playerController).projectiles;

            for (let f of fireballs){
                const castedF = (<ProjectileAI> f._ai);
                castedF.setDamage(castedF.getDamage() * 1.5);
            }
        }
    }

}