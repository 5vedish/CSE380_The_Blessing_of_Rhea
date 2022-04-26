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
    const controlHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(800, 332),
        text: "Controls",
      })
    );
    const movement = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(800, 366),
        text: "WASD - Movement",
      })
    );
    const leftClick = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(800, 400),
        text: "Left Click - Select Tile",
      })
    );
    const rightClick = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(800, 434),
        text: "Right Click - Use Utility",
      })
    );
    const pause = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(800, 468),
        text: "Escape - Pause Game",
      })
    );

    controlHeader.fontSize = 36;
    movement.fontSize =
      leftClick.fontSize =
      rightClick.fontSize =
      pause.fontSize =
        24;

    controlHeader.textColor =
      movement.textColor =
      leftClick.textColor =
      rightClick.textColor =
      pause.textColor =
        Color.WHITE;

    const tutorialLevel = this.add.uiElement(UIElementType.BUTTON, "controls", {position: new Vec2(800, 700), text: "Tutorial Level"});
    tutorialLevel.size.set(256, 128);
    tutorialLevel.borderWidth = 2;
    tutorialLevel.borderColor = Color.BORDERCOLOR;
    tutorialLevel.backgroundColor = Color.GRAYISH;
    tutorialLevel.onClickEventId = "tutorial";
    /* TODO - HAVE TO ADD TUTORIAL ATTACK SPRITES AND DESCRIPTIONS */

    // Back button
    const backControls = this.add.uiElement(UIElementType.BUTTON, "controls", {
      position: new Vec2(66, 815),
      text: "Back",
    });
    backControls.size.set(75, 80);
    backControls.borderWidth = 2;
    backControls.borderColor = Color.BORDERCOLOR;
    backControls.backgroundColor = Color.GRAYISH;
    backControls.onClickEventId = "back";

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
