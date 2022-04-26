import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import LevelSelection from "./LevelSelection";
import ControlScreen from "./ControlScreen";
import HelpScreen from "./HelpScreen";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import level_z1 from "./GameLevels/Level_Z1";
import Timer from "../../Wolfie2D/Timing/Timer";
import Level_Z1_Cutscene from "./Cutscenes/Level_Z1_Cutscene";
import Tutorial from "./Tutorial";
import level_z2 from "./GameLevels/Level_Z2";
import CharacterStat from "../PlayerStatus";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class MainMenu extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;
  private logo: Sprite;

  private mainMenu: Layer;
  private flash: Timer;

  private playButton: Sprite;
  private selectButton: Sprite;
  private controlsButton: Sprite;
  private helpButton: Sprite;

  private invincible: boolean;
  private unlockAll: boolean;
  private instant_kill: boolean;
  private speedUp: boolean;
  private unlockedLevels: boolean[];

  initScene(init: Record<string, any>): void {
    this.invincible = init.invincible;
    this.unlockAll = init.unlockAll;
    this.instant_kill = init.instant_kill;
    this.speedUp = init.speedUp;
    this.unlockedLevels = init.unlockedLevels;
  }

  loadScene() {
    this.load.image("rhea", "project_assets/screens/Rhea.png");
    this.load.image("logo", "project_assets/screens/Logo.png");
    this.load.image("start", "project_assets/sprites/start.png");
    this.load.image("select", "project_assets/sprites/select.png");
    this.load.image("controls", "project_assets/sprites/controls.png");
    this.load.image("help", "project_assets/sprites/help.png");
    this.load.audio("click", "project_assets/sounds/click.wav");
  }
  
  startScene() {
    // Came from splash screen
    if (this.unlockedLevels === undefined) {
      this.unlockedLevels = [true, false, false, false, false, false, false, false, false];
    }

    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "click", loop: false, holdReference: false});
    const origin = new Vec2(192, 64);
    this.flash = new Timer(1000, null, true);
    this.flash.start(); 

    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("rhea", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());
    this.logo = this.add.sprite("logo", "splashScreen");
    this.logo.position.set(this.viewport.getCenter().x + 300, this.viewport.getCenter().y - 300);

    /* ########## MAIN MENU  ########## */
    this.mainMenu = this.addUILayer("mainMenu");

    // Add start game button
    const play = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 144),
      text: "",
    });
    play.size.set(384, 128);
    play.borderWidth = 10;
    play.borderRadius = 10;
    play.borderColor = Color.BORDERCOLOR;
    play.backgroundColor = Color.GRAYISH;
    play.onClickEventId = "play";
    play.onEnter = () => {
      play.borderColor = Color.WHITE;
      this.playButton.alpha = 2* Math.abs(this.flash.getTimeLeft()/1000 - .5);
    }
    play.onLeave = () => {
      play.borderColor = Color.BORDERCOLOR;
      this.playButton.alpha = 1;
    }

    this.playButton = this.add.sprite("start", "mainMenu");
    this.playButton.position = play.position;
    

    // Add level select button
    const levels = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 305),
      text: "",
    });
    levels.size.set(384, 128);
    levels.borderWidth = 10;
    levels.borderRadius = 10;
    levels.borderColor = Color.BORDERCOLOR;
    levels.backgroundColor = Color.GRAYISH;
    levels.onClickEventId = "select_levels";
    levels.onEnter = () => {
      levels.borderColor = Color.WHITE;
      this.selectButton.alpha = 2* Math.abs(this.flash.getTimeLeft()/1000 - .5);
    }
    levels.onLeave = () => {
      levels.borderColor = Color.BORDERCOLOR;
      this.selectButton.alpha = 1;
    }

    this.selectButton = this.add.sprite("select", "mainMenu");
    this.selectButton.position = levels.position;

    // Add controls button
    const controls = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 466),
      text: "",
    });
    controls.size.set(384, 128);
    controls.borderWidth = 10;
    controls.borderRadius = 10;
    controls.borderColor = Color.BORDERCOLOR;
    controls.backgroundColor = Color.GRAYISH;
    controls.onClickEventId = "control";
    controls.onEnter = () => {
      controls.borderColor = Color.WHITE;
      this.controlsButton.alpha = 2* Math.abs(this.flash.getTimeLeft()/1000 - .5);
    }
    controls.onLeave = () => {
      controls.borderColor = Color.BORDERCOLOR;
      this.controlsButton.alpha = 1;
    }

    this.controlsButton = this.add.sprite("controls", "mainMenu");
    this.controlsButton.position = controls.position;

    // Add help button
    const help = this.add.uiElement(UIElementType.BUTTON, "mainMenu", {
      position: new Vec2(origin.x + 94, origin.y + 627),
      text: "",
    });
    help.size.set(384, 128);
    help.borderWidth = 10;
    help.borderRadius = 10;
    help.borderColor = Color.BORDERCOLOR;
    help.backgroundColor = Color.GRAYISH;
    help.onClickEventId = "help";
    help.onEnter = () => {
      help.borderColor = Color.WHITE;
      this.helpButton.alpha = 2* Math.abs(this.flash.getTimeLeft()/1000 - .5);
    }
    help.onLeave = () => {
      help.borderColor = Color.BORDERCOLOR;
      this.helpButton.alpha = 1;
    }

    this.helpButton = this.add.sprite("help", "mainMenu");
    this.helpButton.position = help.position;

    // Subscribe events
    this.receiver.subscribe("start");
    this.receiver.subscribe("play");
    this.receiver.subscribe("select_levels");
    this.receiver.subscribe("control");
    this.receiver.subscribe("help");
    this.receiver.subscribe("back");
  }

  updateScene() {

    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      
      let options = {
          invincible: this.invincible, 
          unlockAll: this.unlockAll,
          instant_kill: this.instant_kill,
          speedUp: this.speedUp, 
          unlcokedLevels: this.unlockedLevels
      }

      /* TODO - CHANGE TO SPECIFIED SCENE */
      if (event.type === "play") {
        
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
        //TO DO replace with tutorial stage
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: "main_menu"});
        // this.sceneManager.changeToScene(Level_Z1_Cutscene, options, physicsOptions);
        this.sceneManager.changeToScene(level_z1, options, physicsOptions);

      }

      if (event.type === "select_levels") {
        this.sceneManager.changeToScene(LevelSelection, options);
      }

      if (event.type === "control") {
        this.sceneManager.changeToScene(ControlScreen, options);
      }

      if (event.type === "help") {
        this.sceneManager.changeToScene(HelpScreen, options);
      }
      
    }
  }
}
