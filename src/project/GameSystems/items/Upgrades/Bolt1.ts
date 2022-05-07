import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import CharacterStat from "../../../PlayerStatus";
import PlayerController from "../../../AI/PlayerController";
import Item from "../Item";
import Weapon from "../Weapon";
import ProjectileAI from "../../../AI/ProjectileAI";
import HadesController from "../../../AI/HadesController";

export default class Bolt1 extends Item {
    
    use(user: GameNode, weapon: Weapon, playerStats: CharacterStat, playerController: PlayerController): void {
        if (playerController.weapon){
            playerController.weapon.type.damage *= 1.3;
        } else {
            const fireballs = (<HadesController> playerController).projectiles;

            for (let f of fireballs){
                const castedF = (<ProjectileAI> f._ai);
                castedF.setDamage(castedF.getDamage() * 1.3);
            }
        }
    }

}