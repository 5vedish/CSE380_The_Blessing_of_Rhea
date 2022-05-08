import Cutscene from "./Cutscene";
import level_h2 from "../GameLevels/Level_H2";


export default class H2_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelH2", "project_assets/tilemaps/LevelH2.json");
        this.load.spritesheet("hades", "project_assets/spritesheets/Hades.json"); 
        this.load.spritesheet("Witch", "project_assets/spritesheets/Witch.json");
        this.load.spritesheet("Hellhound", "project_assets/spritesheets/Hellhound.json");
        this.load.object("dialogue", "project_assets/data/level_h2_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelH2";
        this.playerName = "hades";
        this.nextScene = {next: level_h2};
        super.startScene();

    }



}