import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Tutorial from "./Tutorial";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

export default class ControlScreen extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;

  private controlScreen: Layer;
  private controlsText: Sprite;
  private WASD: Sprite;
  private click: Sprite;
  private escape: Sprite;
  private tutorial: Sprite;
  private back: Sprite;

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
    this.load.image("splash_screen", "project_assets/screens/Splash.png");
    this.load.image("controlsText", "project_assets/sprites/controlsText.png");
    this.load.image("wasd", "project_assets/sprites/WASD.png");
    this.load.image("click", "project_assets/sprites/click.png");
    this.load.image("escape", "project_assets/sprites/escape.png");
    this.load.image("tutorialLevel", "project_assets/sprites/tutorialLevel.png");
    this.load.image("back", "project_assets/sprites/back.png");
    this.load.audio("click", "project_assets/sounds/click.wav");
  }

  startScene() {
    this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "click", loop: false, holdReference: false});
    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.controlScreen = this.addUILayer("controls");

    // Controls Border
    const controlBorder = this.add.uiElement(
      UIElementType.LABEL,
      "controls",
      { position: new Vec2(800, 400), text: "" }
    );
    controlBorder.size.set(800, 400);
    controlBorder.borderWidth = 5;
    controlBorder.borderRadius = 0;
    controlBorder.borderColor = Color.BORDERCOLOR;
    controlBorder.backgroundColor = Color.GRAYISH;
    // No click event

    // Text in controls box
    this.controlsText = this.add.sprite("controlsText", "controls");
    this.controlsText.position = new Vec2(800, 264);

    this.WASD = this.add.sprite("wasd", "controls");
    this.WASD.position = new Vec2(800, 360);
    
    this.click = this.add.sprite("click", "controls");
    this.click.position = new Vec2(800, 424);

    this.escape = this.add.sprite("escape", "controls");
    this.escape.position = new Vec2(800, 488);

    const tutorialLevel = this.add.uiElement(UIElementType.BUTTON, "controls", {
      position: new Vec2(800, 700), 
      text: ""
    });
    tutorialLevel.size.set(256, 128);
    tutorialLevel.borderWidth = 2;
    tutorialLevel.borderColor = Color.BORDERCOLOR;
    tutorialLevel.backgroundColor = Color.GRAYISH;
    tutorialLevel.onClickEventId = "tutorial";
    
    this.tutorial = this.add.sprite("tutorialLevel", "controls");
    this.tutorial.position.copy(tutorialLevel.position);

    // Back button
    const backControls = this.add.uiElement(UIElementType.BUTTON, "controls", {
      position: new Vec2(66, 815),
      text: "",
    });
    backControls.size.set(75, 80);
    backControls.borderWidth = 2;
    backControls.borderColor = Color.BORDERCOLOR;
    backControls.backgroundColor = Color.GRAYISH;
    backControls.onClickEventId = "back";

    this.back = this.add.sprite("back", "controls");
    this.back.position.copy(backControls.position);
    this.back.position.x += 5;

    this.receiver.subscribe("back");
    this.receiver.subscribe("tutorial");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      console.log(event);

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
      
      if (event.type === "tutorial") {
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
        this.sceneManager.changeToScene(Tutorial, options, physicsOptions);
      }
    }
  }
}
