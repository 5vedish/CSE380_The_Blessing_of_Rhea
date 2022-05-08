import Cutscene from "./Cutscene";
import level_h3 from "../GameLevels/Level_H3";


export default class H3_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelH3", "project_assets/tilemaps/LevelH3.json");
        this.load.spritesheet("hades", "project_assets/spritesheets/Hades.json"); 
        this.load.spritesheet("Skull", "project_assets/spritesheets/Skull.json");
        this.load.spritesheet("Cerberus", "project_assets/spritesheets/Cerberus.json");
        this.load.spritesheet("Witch", "project_assets/spritesheets/Witch.json");
        this.load.object("dialogue", "project_assets/data/level_h3_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelH3";
        this.playerName = "hades";
        this.nextScene = {next: level_h3};
        super.startScene();

    }



}