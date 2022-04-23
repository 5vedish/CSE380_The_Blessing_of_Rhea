import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class SplashScreen extends Scene {

  private splashScreen: Layer;
  private bg: Sprite;
  private startLabel: Sprite;
  private flash: Timer;

  loadScene() {
    this.load.image("splash_screen", "project_assets/screens/Splash.png");
    this.load.image("start_label", "project_assets/sprites/start_label.png");
  }

  startScene() {
    this.splashScreen = this.addUILayer("splashScreen");
    this.bg = this.add.sprite("splash_screen", "splashScreen");
    this.bg.position.copy(this.viewport.getCenter());
    this.flash = new Timer(1000, null, true);
    this.flash.start();

    // Add click-to-start button
    const clickStart = this.add.uiElement(
      UIElementType.BUTTON,
      "splashScreen",
      { position: new Vec2(800, 450), text: "" }
    );
    clickStart.size.set(1600, 900);
    clickStart.borderWidth = 2;
    clickStart.borderColor = Color.TRANSPARENT;
    clickStart.backgroundColor = Color.TRANSPARENT;
    clickStart.onClickEventId = "start";

    this.startLabel = this.add.sprite("start_label", "splashScreen");
    this.startLabel.position = new Vec2(800, 675);
    
    this.receiver.subscribe("start");
  }

  updateScene() {

    this.startLabel.alpha = 2* Math.abs(this.flash.getTimeLeft()/1000 - .5);

    while (this.receiver.hasNextEvent()) {
      let event = this.receiver.getNextEvent();
      console.log(event);

      if (event.type === "start") {
        this.sceneManager.changeToScene(MainMenu, {});
      }
    }
  }
}
