import Cutscene from "./Cutscene";
import level_p2 from "../GameLevels/Level_P2";


export default class P2_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelP2", "project_assets/tilemaps/LevelP2.json");
        this.load.spritesheet("poseidon", "project_assets/spritesheets/Poseidon.json"); 
        this.load.spritesheet("octopus", "project_assets/spritesheets/Octopus.json");
        this.load.spritesheet("cyclops", "project_assets/spritesheets/Cyclops.json");
        this.load.object("dialogue", "project_assets/data/level_p2_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelP2";
        this.playerName = "poseidon";
        this.nextScene = {next: level_p2};
        super.startScene();

    }
}