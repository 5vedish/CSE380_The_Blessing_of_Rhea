import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";

export default class GameOver extends Scene {

    private bg: Sprite;

    loadScene(): void {
        this.load.image("splash_screen", "project_assets/screens/Splash.png")
    }

    startScene() {

        
        const center = this.viewport.getCenter();
        
        this.addUILayer("gameOver");
        this.bg = this.add.sprite("splash_screen", "gameOver");
        this.bg.position.copy(this.viewport.getCenter());

        const gameOver = <Label>this.add.uiElement(UIElementType.LABEL, "gameOver", 
            {position: new Vec2(center.x, center.y), text: "You're not immortal"});
            gameOver.textColor = Color.WHITE;
            
        // Add return to menu button
        const returnToMenu = this.add.uiElement(UIElementType.BUTTON, "gameOver", {
            position: new Vec2(center.x, center.y + 100),
            text: "Return to Main Menu",
        });
        returnToMenu.size.set(384, 128);
        returnToMenu.borderWidth = 4;
        returnToMenu.borderRadius = 0;
        returnToMenu.borderColor = Color.GRAY;
        returnToMenu.backgroundColor = Color.BROWN;
        returnToMenu.onClickEventId = "return";
        
        this.receiver.subscribe("return");
    }

    updateScene(){
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            if(event.type === "return"){
                this.sceneManager.changeToScene(MainMenu, {});
            }
        }
    
    }
}