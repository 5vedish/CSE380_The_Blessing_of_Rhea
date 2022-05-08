import Cutscene from "./Cutscene";
import level_p3 from "../GameLevels/Level_P3";


export default class P3_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelP3", "project_assets/tilemaps/LevelP3.json");
        this.load.spritesheet("poseidon", "project_assets/spritesheets/Poseidon.json"); 
        this.load.spritesheet("leviathan", "project_assets/spritesheets/Leviathan.json");
        this.load.object("dialogue", "project_assets/data/level_p3_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelP3";
        this.playerName = "poseidon";
        this.nextScene = {next: level_p3};
        super.startScene();

    }
}