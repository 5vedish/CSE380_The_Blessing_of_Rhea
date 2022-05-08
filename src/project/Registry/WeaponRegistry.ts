import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
import Bat from "../GameSystems/items/WeaponTypes/Primary/Bat";
import EchidnaTailWhip from "../GameSystems/items/WeaponTypes/Primary/EchidnaTailwhip";
import Lightning from "../GameSystems/items/WeaponTypes/Primary/Lightning";
import Slice from "../GameSystems/items/WeaponTypes/Primary/Slice";
import Trident from "../GameSystems/items/WeaponTypes/Primary/Trident";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";

export default class WeaponTemplateRegistry extends Registry<WeaponConstructor> {
    
    public preload(): void {
        const rm = ResourceManager.getInstance();

        // Load sprites
        rm.image("knife", "project_assets/sprites/knife.png");
        rm.image("lightning", "project_assets/sprites/lightning.png");
        rm.image("trident", "project_assets/sprites/lightning.png");
        rm.image("tailwhip", "project_assets/sprites/knife.png");
        rm.image("blast", "project_assets/sprites/knife.png");

        // Load spritesheets
        rm.spritesheet("slice", "project_assets/spritesheets/slice.json");
        rm.spritesheet("lightning", "project_assets/spritesheets/lightning.json");
        rm.spritesheet("lightningv2", "project_assets/spritesheets/lightningv2.json");
        rm.spritesheet("trident", "project_assets/spritesheets/waterfall.json");
        rm.spritesheet("tailwhip", "project_assets/spritesheets/tailwhip.json");
        rm.spritesheet("batSwing", "project_assets/spritesheets/tailwhip.json");

        // Register default types
        this.registerItem("slice", Slice);
        this.registerItem("lightning", Lightning);
        this.registerItem("trident", Trident);
        this.registerItem("tailwhip", EchidnaTailWhip);
        this.registerItem("slice", Slice);
        this.registerItem("batSwing", Bat);
    }

    // We don't need this for this assignment
    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;