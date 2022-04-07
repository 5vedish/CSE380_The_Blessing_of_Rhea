import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";

export default class ControlScreen extends Scene {
  private splashScreen: Layer;
  private bg: Sprite;

  private controlScreen: Layer;

  loadScene() {
    this.load.image("splash_screen", "project_assets/Screens/Splash.png");
  }

  startScene() {
    // add splash (filler)
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());

    this.controlScreen = this.addUILayer("controls");

    // Controls Border
    const controlBorder = this.add.uiElement(
      UIElementType.TEXT_INPUT,
      "controls",
      { position: new Vec2(285, 279), text: "" }
    );
    controlBorder.size.set(385, 227);
    controlBorder.borderWidth = 5;
    controlBorder.borderRadius = 0;
    controlBorder.borderColor = Color.GRAY;
    controlBorder.backgroundColor = Color.BROWN;
    // No click event

    // Text in controls box
    const controlHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(285, 209),
        text: "Controls",
      })
    );
    const movement = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(285, 245),
        text: "WASD - Movement",
      })
    );
    const leftClick = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(285, 279),
        text: "Left Click - Select Tile",
      })
    );
    const rightClick = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(285, 315),
        text: "Right Click - Use Utility",
      })
    );
    const pause = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(285, 350),
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

    // Tutorial Border
    const tutorial = this.add.uiElement(UIElementType.TEXT_INPUT, "controls", {
      position: new Vec2(1006, 429),
      text: "",
    });
    tutorial.size.set(870, 730);
    tutorial.borderWidth = 5;
    tutorial.borderRadius = 0;
    tutorial.borderColor = Color.GRAY;
    tutorial.backgroundColor = Color.BROWN;
    // No click event

    const tutorialHeader = <Label>(
      this.add.uiElement(UIElementType.LABEL, "controls", {
        position: new Vec2(1006, 112),
        text: "Tutorial",
      })
    );
    tutorialHeader.fontSize = 36;
    tutorialHeader.textColor = Color.GRAY;

    /* TODO - HAVE TO ADD TUTORIAL ATTACK SPRITES AND DESCRIPTIONS */

    // Back button
    const backControls = this.add.uiElement(UIElementType.BUTTON, "controls", {
      position: new Vec2(66, 815),
      text: "Back",
    });
    backControls.size.set(75, 80);
    backControls.borderWidth = 2;
    backControls.borderColor = Color.GRAY;
    backControls.backgroundColor = Color.BROWN;
    backControls.onClickEventId = "back";

    this.receiver.subscribe("back");
  }

  updateScene() {
    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      console.log(event);

      if (event.type === "back") {
        this.sceneManager.changeToScene(MainMenu, {});
      }
    }
  }
}
