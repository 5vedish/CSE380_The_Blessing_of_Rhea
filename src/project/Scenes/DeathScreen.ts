import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";

export default class DeathScreen extends Scene{
    private bg: Sprite;

    loadScene(): void {
        this.load.image("splash_screen", "project_assets/screens/Splash.png");
    }

    startScene(): void {
    this.addUILayer("death");
    this.bg = this.add.sprite("splash_screen", "death");
    this.viewport.setSize(1600, 900);
    this.bg.position = new Vec2(800, 450);

    // Add return button
    const returnToMainMenu = this.add.uiElement(
        UIElementType.BUTTON,
        "death",
        { position: new Vec2(800, 450), text: "" }
      );
      returnToMainMenu.size.set(1600, 900);
      returnToMainMenu.borderWidth = 2;
      returnToMainMenu.borderColor = Color.TRANSPARENT;
      returnToMainMenu.backgroundColor = Color.TRANSPARENT;
      returnToMainMenu.onClickEventId = "returnToMainMenu";

      const returnLabel = <Label>this.add.uiElement(UIElementType.LABEL, "death", {position: new Vec2(800, 675), text: "Return to Main Menu"})
      returnLabel.textColor = Color.GRAYISH;

  
      this.receiver.subscribe("returnToMainMenu");
    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            console.log(event);
      
            if (event.type === "returnToMainMenu") {
              this.sceneManager.changeToScene(MainMenu);
            }
          }
    }
}