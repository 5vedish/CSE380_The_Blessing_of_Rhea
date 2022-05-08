import Cutscene from "./Cutscene";
import level_h1 from "../GameLevels/Level_H1";


export default class H1_Cutscene extends Cutscene{

    loadScene(): void {
        // load tilemap + dialogue object + player + displayed sprites
        this.load.tilemap("levelH1", "project_assets/tilemaps/LevelH1.json");
        this.load.spritesheet("hades", "project_assets/spritesheets/Hades.json"); 
        this.load.spritesheet("Skull", "project_assets/spritesheets/Skull.json");
        this.load.object("dialogue", "project_assets/data/level_h1_dialogue.json");
    }

    startScene(): void {

        // simply specify the name of the tile map and the name of the character sprite
        this.tileMapName = "levelH1";
        this.playerName = "hades";
        this.nextScene = {next: level_h1};
        super.startScene();

    }



}