
import Game from "./Wolfie2D/Loop/Game";
import SplashScreen from "./project/Scenes/SplashScreen";
import WeaponTemplateRegistry from "./project/Registry/WeaponRegistry";
import WeaponTypeRegistry from "./project/Registry/WeaponTypeRegistry";
import RegistryManager from "./Wolfie2D/Registry/RegistryManager";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1600, y: 900},          // The size of the game (1600 x 900)
        clearColor: {r: 0, g: 0, b: 0},         // The color the game clears to
        inputs: [
            {name: "up", keys: ["w"]},
            {name: "left", keys: ["a"]},
            {name: "down", keys: ["s"]},
            {name: "right", keys: ["d"]},
            {name: "pause", keys: ["escape"]}
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                        // Whether to show debug messages. You can change this to true if you want
    }

    // Set up custom registries
    let weaponTemplateRegistry = new WeaponTemplateRegistry();
    RegistryManager.addCustomRegistry("weaponTemplates", weaponTemplateRegistry);
    
    let weaponTypeRegistry = new WeaponTypeRegistry();
    RegistryManager.addCustomRegistry("weaponTypes", weaponTypeRegistry);

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(SplashScreen, {});
})();

function runTests(){};