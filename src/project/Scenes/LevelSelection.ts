import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import level_p1 from "./GameLevels/Level_P1";
import level_p2 from "./GameLevels/Level_P2";
import level_p3 from "./GameLevels/Level_P3";
import level_z1 from "./GameLevels/Level_Z1";
import level_z3 from "./GameLevels/Level_Z3";
import level_z2 from "./GameLevels/Level_Z2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import level_h1 from "./GameLevels/Level_H1";
import level_h2 from "./GameLevels/Level_H2";
import level_h3 from "./GameLevels/Level_H3";
import Z1_Cutscene from "./Cutscenes/Z1_Cutscene";
import Z2_Cutscene from "./Cutscenes/Z2_Cutscene";
import P1_Cutscene from "./Cutscenes/P1_Cutscene";
import Z3_Cutscene from "./Cutscenes/Z3_Cutscene";

export default class LevelSelection extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;
  private poseidon1 : Sprite;
  private poseidon2: Sprite;
  private poseidon3: Sprite;

  private zeus1 : Sprite;
  private zeus2: Sprite;
  private zeus3: Sprite;

  private levelSelect: Layer;
  private invincible: boolean;
  private unlockAll: boolean;
  private instant_kill: boolean;
  private speedUp: boolean;
  
  private unlockedLevels: boolean[];

  initScene(init: Record<string, any>): void {
    console.log("LEVEL SELECT INIT: ", init)
    this.invincible = init.invincible;
    this.unlockAll = init.unlockAll;
    this.instant_kill = init.instant_kill;
    this.speedUp = init.speedUp;
    this.unlockedLevels = init.unlockedLevels;
  }

  loadScene() {
    this.load.image("splash_screen", "project_assets/screens/Splash.png");
    // Poseidon previews
    this.load.image("level_p1", "project_assets/tilemaps/p1_preview.png");
    this.load.image("level_p2", "project_assets/tilemaps/p2_preview.png");
    this.load.image("level_p3", "project_assets/tilemaps/p3_preview.png");

    // Zeus previews
    this.load.image("level_z1", "project_assets/tilemaps/z1_preview.png");
    this.load.image("level_z2", "project_assets/tilemaps/z2_preview.png");
    this.load.image("level_z3", "project_assets/tilemaps/z3_preview.png");

    this.load.audio("click", "project_assets/sounds/click.wav");
  }

  startScene() {
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "click", loop: false, holdReference: false});

    const origin = new Vec2(192, 64);

    // this.addLayer("unlock", 12);

    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.levelSelect = this.addUILayer("levelSelect");

    // Add Poseidon level buttons
    const levelp1 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(400, origin.y + 135),
      text: "Level 1",
    });
    levelp1.size.set(256, 128);
    levelp1.borderWidth = 2;
    levelp1.borderColor = Color.WHITE;
    levelp1.backgroundColor = (this.unlockedLevels[3] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelp1.onClickEventId = "poseidon1";

    if(this.unlockedLevels[3] || this.unlockAll){
    this.poseidon1 = this.add.sprite("level_p1", "splashScreen");
    this.poseidon1.position.copy(levelp1.position);
    }

    const levelp2 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(400, origin.y + 361),
      text: "Level 2",
    });
    levelp2.size.set(256, 128);
    levelp2.borderWidth = 2;
    levelp2.borderColor = Color.WHITE;
    levelp2.backgroundColor = (this.unlockedLevels[4] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelp2.onClickEventId = "poseidon2";

    if(this.unlockedLevels[4] || this.unlockAll){
    this.poseidon2 = this.add.sprite("level_p2", "splashScreen");
    this.poseidon2.position.copy(levelp2.position);
    }

    const levelp3 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(400, origin.y + 587),
      text: "Level 3",
    });
    levelp3.size.set(256, 128);
    levelp3.borderWidth = 2;
    levelp3.borderColor = Color.WHITE;
    levelp3.backgroundColor = (this.unlockedLevels[5] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelp3.onClickEventId = "poseidon3";

    if(this.unlockedLevels[5] || this.unlockAll){
    this.poseidon3 = this.add.sprite("level_p3", "splashScreen");
    this.poseidon3.position.copy(levelp3.position);
    }

    // Add Zeus level buttons
    const levelz1 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(800, origin.y + 135),
      text: "Level 1",
    });
    levelz1.size.set(256, 128);
    levelz1.borderWidth = 2;
    levelz1.borderColor = Color.WHITE;
    levelz1.backgroundColor = (this.unlockedLevels[0] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelz1.onClickEventId = "zeus1";

    if(this.unlockedLevels[0] || this.unlockAll){
    // Add preview of zeus1
    this.zeus1 = this.add.sprite("level_z1", "splashScreen");
    this.zeus1.position.copy(levelz1.position);
    }
    

    const levelz2 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(800, origin.y + 361),
      text: "Level 2",
    });
    levelz2.size.set(256, 128);
    levelz2.borderWidth = 2;
    levelz2.borderColor = Color.WHITE;
    levelz2.backgroundColor = (this.unlockedLevels[1] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelz2.onClickEventId = "zeus2";

    if(this.unlockedLevels[1] || this.unlockAll){
    this.zeus2 = this.add.sprite("level_z2", "splashScreen");
    this.zeus2.position.copy(levelz2.position);
    }

    const levelz3 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(800, origin.y + 587),
      text: "Level 3",
    });
    levelz3.size.set(256, 128);
    levelz3.borderWidth = 2;
    levelz3.borderColor = Color.WHITE;
    levelz3.backgroundColor = (this.unlockedLevels[2] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelz3.onClickEventId = "zeus3";

    if(this.unlockedLevels[2] || this.unlockAll){
    this.zeus3 = this.add.sprite("level_z3", "splashScreen");
    this.zeus3.position.copy(levelz3.position);
    }
    // Add Hades level buttons
    const levelh1 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(1200, origin.y + 135),
      text: "Level 1",
    });
    levelh1.size.set(256, 128);
    levelh1.borderWidth = 2;
    levelh1.borderColor = Color.WHITE;
    levelh1.backgroundColor = (this.unlockedLevels[6] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelh1.onClickEventId = "hades1";
    if(this.unlockedLevels[6]){
      //ADD PREVIEW
    }


    const levelh2 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(1200, origin.y + 361),
      text: "Level 2",
    });
    levelh2.size.set(256, 128);
    levelh2.borderWidth = 2;
    levelh2.borderColor = Color.WHITE;
    levelh2.backgroundColor = (this.unlockedLevels[7] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelh2.onClickEventId = "hades2";
    if(this.unlockedLevels[7] || this.unlockAll){
      //ADD PREVIEW
    }

    const levelh3 = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(1200, origin.y + 587),
      text: "Level 3",
    });
    levelh3.size.set(256, 128);
    levelh3.borderWidth = 2;
    levelh3.borderColor = Color.WHITE;
    levelh3.backgroundColor = (this.unlockedLevels[8] || this.unlockAll) ? Color.TRANSPARENT : Color.GRAY;
    levelh3.onClickEventId = "hades3";
    if(this.unlockedLevels[8] || this.unlockAll){
      //ADD PREVIEW
    }

    // Back button
    const backLevel = this.add.uiElement(UIElementType.BUTTON, "levelSelect", {
      position: new Vec2(66, 815),
      text: "Back",
    });
    backLevel.size.set(75, 80);
    backLevel.borderWidth = 2;
    backLevel.borderColor = Color.BORDERCOLOR;
    backLevel.backgroundColor = Color.GRAYISH;
    backLevel.onClickEventId = "back";

    this.receiver.subscribe("back");
    this.receiver.subscribe("poseidon1");
    this.receiver.subscribe("poseidon2");
    this.receiver.subscribe("poseidon3");
    this.receiver.subscribe("zeus1");
    this.receiver.subscribe("zeus2");
    this.receiver.subscribe("zeus3");
    this.receiver.subscribe("hades1");
    this.receiver.subscribe("hades2");
    this.receiver.subscribe("hades3");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();

      let options = {
        invincible: this.invincible, 
        unlockAll: this.unlockAll,
        instant_kill: this.instant_kill,
        speedUp: this.speedUp, 
        unlockedLevels: this.unlockedLevels
      }
      
      
      if (event.type === "back") {
        this.sceneManager.changeToScene(MainMenu, options);
      }

      let physicsOptions = {
        physics: {
          groupNames: ["wall", "player", "enemy", "projectile"],
          collisions:
          [
            [0, 1, 1, 0],
            [1, 0, 0, 0],
            [1, 0, 1, 0],
            [0, 0, 0, 0]
          ]
        }
      }

      /* TODO - ADD REST OF STAGES */
      if (event.type === "poseidon1") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[3] || this.unlockAll) this.sceneManager.changeToScene(P1_Cutscene, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "poseidon2") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[4] || this.unlockAll) this.sceneManager.changeToScene(level_p2, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "poseidon3" ) {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[5] || this.unlockAll) this.sceneManager.changeToScene(level_p3, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "zeus1") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        this.sceneManager.changeToScene(Z1_Cutscene, options, physicsOptions);
      }

      if (event.type === "zeus2") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[1] || this.unlockAll) this.sceneManager.changeToScene(Z2_Cutscene, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "zeus3") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[2] || this.unlockAll) this.sceneManager.changeToScene(Z3_Cutscene, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "hades1") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[6] || this.unlockAll) this.sceneManager.changeToScene(level_h1, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "hades2") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[7] || this.unlockAll) this.sceneManager.changeToScene(level_h2, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

      if (event.type === "hades3") {
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        if (this.unlockedLevels[7] || this.unlockAll) this.sceneManager.changeToScene(level_h3, options, physicsOptions);
        else console.log("STAGE NOT UNLOCKED YET");
      }

    }
  }
}
