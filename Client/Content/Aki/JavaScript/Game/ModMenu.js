"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.MainMenu = void 0);
const puerts_1 = require("puerts"),
  UE = require("ue"),
  InputSetting_1 = require("../Game/InputSettings/InputSettings"),
  ResourceSystem_1 = require("../Core/Resource/ResourceSystem"),
  GlobalData_1 = require("../Game/GlobalData"),
  GameProcedure_1 = require("./GameProcedure"),
  ModelManager_1 = require("./Manager/ModelManager"),
  ModManager_1 = require("./Manager/ModManager"),
  ModLanguage_1 = require("./Manager/ModFuncs/ModLanguage"),
  ModMethod_1 = require("./Manager/ModFuncs/ModMethod"),
  EntityManager_1 = require("./Manager/ModFuncs/EntityManager"),
  NoClip_1 = require("./Manager/ModFuncs/NoClip"),
  KillAura_1 = require("./Manager/ModFuncs/KillAura"),
  MobVacuum_1 = require("./Manager/ModFuncs/MobVacuum"),
  AutoDestroy_1 = require("./Manager/ModFuncs/AutoDestroy"),
  EventListener_1 = require("./Manager/ModFuncs/EventListener"),
  UiManager_1 = require("./Ui/UiManager"),
  AutoPuzzle_1 = require("./Manager/ModFuncs/AutoPuzzle"),
  PerceptionRange_1 = require("./Manager/ModFuncs/PerceptionRange"),
  ESP_1 = require("./Manager/ModFuncs/ESP"),
  Http_1 = require("../Core/Http/Http"),
  DiscordGrant_1 = require("./DiscordGrant"),
  ModUtils_1 = require("./Manager/ModFuncs/ModUtils"),
  ModDebuger_1 = require("./Manager/ModFuncs/ModDebuger");

let IS_INVALID = false;
let DCG;
let IS_TESTER;

class MainMenu {
  constructor(arg) {
    if (arg && arg.loadFromLauncher) {
        setTimeout(() => {
            this.LoadMenu();
        }, 10000);
      IS_TESTER = arg.isTester;
    } else {
      UE.KismetSystemLibrary.LaunchURL("https://discord.com/invite/kunmodfans");
      UE.KuroStaticLibrary.ExitGame(true);
    }
  }

  static keyState = false;
  static loadMenuInterval = null;
  static isMenuShow = false;
  static isMenuLoaded = false;
  static Menu = null;

  LoadMenu() {
    MainMenu.loadMenuInterval = setInterval(() => {
      MainMenu.Start();
    }, 3000);
  }

  static IsKey(str) {
    var IsInputKeyDown_1 = InputSetting_1.InputSettings.IsInputKeyDown(str);
    var IsInputKeyDown_LeftControl =
      InputSetting_1.InputSettings.IsInputKeyDown("LeftAlt");
    if (IsInputKeyDown_LeftControl && IsInputKeyDown_1 && !this.keyState) {
      IsInputKeyDown_1 = false;
      IsInputKeyDown_LeftControl = false;
      this.keyState = true;
      return true;
    }
    if (IsInputKeyDown_1 === false) {
      this.keyState = false;
      return false;
    }
    return false;
  }

  static ListenKey() {
    try {
      require("./Manager/ModFuncs/ModTpFile");
      ModManager_1.ModManager.Settings.HasCustomTpFile = true;
    } catch (error) {
      ModManager_1.ModManager.Settings.HasCustomTpFile = false;
    }

    if (IS_INVALID) return;

    ModManager_1.ModManager.listenModsToggle();
    InputSetting_1.InputSettings.AddActionMapping("Hold", "LeftAlt");
    InputSetting_1.InputSettings.AddActionMapping("X", "X");

    if (this.IsKey("X")) {
      if (this.isMenuShow) {
        ModelManager_1.ModelManager.LoadingModel.SetIsLoadingView(false);
        ModelManager_1.ModelManager.LoadingModel.SetIsLoading(false);
        this.Menu.PlayAnimClose();
      } else {
        ModelManager_1.ModelManager.LoadingModel.SetIsLoadingView(true);
        ModelManager_1.ModelManager.LoadingModel.SetIsLoading(true);
        this.Menu.SetVisibility(0);
        this.Menu.PlayAnimOpen();
      }
      this.isMenuShow = !this.isMenuShow;
    }
    this.updateMenuState();
    this.updatePlayerSpeed();
    this.updateWorldSpeed();
    this.updateNoClip();
  }

  static KunLog(string) {
    var info = string.toString();
    // puerts_1.logger.info("[KUNMOD:]" + info);
  }

  static async Start() {
    if (!this.isMenuLoaded) {
        this.Menu = UE.UMGManager.CreateWidget(
            GlobalData_1.GlobalData.World,
            ResourceSystem_1.ResourceSystem.Load(
                "/Game/Aki/ModMenu.ModMenu_C",
                UE.Class
            )
        );

        if (this.Menu) {
            // DCG = UE.UMGManager.CreateWidget(
            //     GlobalData_1.GlobalData.World,
            //     ResourceSystem_1.ResourceSystem.Load("/Game/Aki/DCG.DCG_C", UE.Class)
            // );

            // 确保必要的UI组件和资源加载
            // if (this.Menu && DCG) {
            this.isMenuLoaded = true;
            clearInterval(this.loadMenuInterval);

            setInterval(() => {
                MainMenu.ListenKey();
            }, 1);
            setInterval(() => {
                ModEntityListener.Runtime();
            }, 500);
            setInterval(() => {
                ModEntityListener.FasterRuntime();
            }, 100);
            setInterval(() => {
                ESP_1.ESP.RuntimeESP();
            }, ESP_1.ESP.ESP_INTERVAL);
            // setTimeout(() => {
            //     const Listener = new EventListener_1.EventListener();
            //     Listener.Setup();
            // }, 30000);

            // 加载必要的资源和设置

            // DCG.ErrorMessage.SetText("");

            // 直接加载真实菜单
            this.LoadRealMenu();
            // } else {
            //     // 若必要组件未加载，则记录错误
            //     console.error("必要的UI组件或资源加载失败。");
            //     this.isMenuLoaded = true;
            //     clearInterval(this.loadMenuInterval);
            // }
        }
    }
}




  static GrantError(text) {
    DCG.ErrorMessage.SetText(text);
  }

  static LaunchDiscordServer() {
    UE.KismetSystemLibrary.LaunchURL("https://discord.com/invite/kunmodfans");
  }

  static ShowDiscordGrant() {
    this.LaunchDiscordServer();
    DCG.AddToViewport();
    DCG.SetVisibility(0);
    DiscordGrant_1.DiscordGrant.GetToken();
  }

  static LoadRealMenu() {
    ModelManager_1.ModelManager.LoadingModel.SetIsLoadingView(false);
    ModelManager_1.ModelManager.LoadingModel.SetIsLoading(false);
    DiscordGrant_1.DiscordGrant.SaveToken();
    // DCG.SetVisibility(2);
    IS_INVALID = false;

    //check if config exists
    if (!ModManager_1.ModManager.CheckConfigExists()) {
      ModManager_1.ModManager.SaveConfig();
    } else {
      ModManager_1.ModManager.LoadConfig();
    }

    this.Menu.DiscordLink.SetVisibility(0);
    this.Menu.DisclaimerText.SetVisibility(0);

    ESP_1.ESP.ESPCanvas = UE.UMGManager.CreateWidget(
      GlobalData_1.GlobalData.World,
      ResourceSystem_1.ResourceSystem.Load("/Game/Aki/ESP.ESP_C", UE.Class)
    );

    ESP_1.ESP.ESPCanvas.AddToViewport();
    ESP_1.ESP.ESPCanvas.SetVisibility(0);

    try {
      this.updateMenuState();
      this.getTranslation();

      for (const option in ModLanguage_1.ModLanguage.Langs) {
        this.Menu.LanguageValue.AddOption(ModLanguage_1.ModLanguage.Langs[option]);
      }

      this.Menu.LanguageValue.SetSelectedOption(ModManager_1.ModManager.Settings.Language);

      this.Menu.LanguageValue.OnSelectionChanged.Add((selectedItem) => {
        if (selectedItem && this.isMenuLoaded) {
          ModManager_1.ModManager.Settings.Language = selectedItem;
          this.KunLog("Language: " + selectedItem);
          this.getTranslation();

          // update kill aura selection
          this.Menu.KillAuraValue.ClearOptions();
          for (const option in this.killAura()) {
            this.Menu.KillAuraValue.AddOption(this.killAura()[option]);
          }
          this.Menu.KillAuraValue.SetSelectedIndex(
            ModManager_1.ModManager.Settings.killAuraState
          );

          // update weather selection
          this.Menu.WeatherValue.ClearOptions();
          for (const option in this.WeatherValue()) {
            this.Menu.WeatherValue.AddOption(this.WeatherValue()[option]);
          }
          this.Menu.WeatherValue.SetSelectedIndex(
            ModManager_1.ModManager.Settings.WeatherType
          );
        }
      });

      this.Menu.GodModeCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.GodMode = isChecked;
        this.KunLog("God Mode: " + isChecked);
      });

      this.Menu.NoCDCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.NoCD = isChecked;
        this.KunLog("No Cooldown: " + isChecked);
      });

      // this.Menu.AutoPickTreasureCheck.bIsEnabled = false;
      this.Menu.AutoPickTreasureCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AutoPickTreasure = isChecked;
        this.KunLog("Auto Pick Treasure: " + isChecked);
      });

      this.Menu.HitMultiplierCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.HitMultiplier = isChecked;
        this.KunLog("Hit Multiplier: " + isChecked);
      });

      this.Menu.HitMultiplierSlider.OnValueChanged.Add((value) => {
        value = value.toFixed();
        this.Menu.HitMultiplierValue.SetText(value);
        ModManager_1.ModManager.Settings.Hitcount = value;
        this.KunLog("Hit Multiplier Count: " + value);
      });

      this.Menu.KillAuraCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.HitAll = isChecked;
        this.KunLog("Hit All: " + isChecked);
      });

      for (const option in this.killAura()) {
        this.Menu.KillAuraValue.AddOption(this.killAura()[option]);
      }

      this.Menu.KillAuraValue.OnSelectionChanged.Add((selectedItem) => {
        if (selectedItem) {
          ModManager_1.ModManager.Settings.killAuraState =
            this.killAura().indexOf(selectedItem);
          this.KunLog("Kill Aura Value: " + selectedItem);
        }
      });

      for (const option in this.WeatherValue()) {
        this.Menu.WeatherValue.AddOption(this.WeatherValue()[option]);
      }

      this.Menu.WeatherValue.OnSelectionChanged.Add((selectedItem) => {
        if (selectedItem) {
          ModManager_1.ModManager.Settings.WeatherType =
            this.WeatherValue().indexOf(selectedItem);
          this.KunLog("Weather Type: " + selectedItem);
        }
      });

      this.Menu.AntiDitherCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AntiDither = isChecked;
        this.KunLog("Anti Dither: " + isChecked);
      });

      this.Menu.InfiniteStaminaCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.InfiniteStamina = isChecked;
        this.KunLog("Inifnite Stamina: " + isChecked);
      });

      this.Menu.AutoLootCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AutoLoot = isChecked;
        this.KunLog("Auto Loot: " + isChecked);
      });

      this.Menu.KillAnimalCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.KillAnimal = isChecked;
        this.KunLog("Kill Animal: " + isChecked);
      });

      this.Menu.PerceptionRangeCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.PerceptionRange = isChecked;
        this.KunLog("Perception Range: " + isChecked);
      });

      this.Menu.PlayerSpeedCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.PlayerSpeed = isChecked;
        if (ModManager_1.ModManager.Settings.PlayerSpeed) {
          EntityManager_1.EntityManager.SetPlayerSpeed(ModManager_1.ModManager.Settings.playerSpeedValue);
        } else {
          EntityManager_1.EntityManager.SetPlayerSpeed(1);
        }
        this.KunLog("Player Speed: " + isChecked);
      });

      this.Menu.PlayerSpeedSlider.OnValueChanged.Add((value) => {
        value = value.toFixed(1);
        this.Menu.PlayerSpeedValue.SetText(value);
        ModManager_1.ModManager.Settings.playerSpeedValue = value;
        this.KunLog("Player Speed Value: " + value);
      });

      this.Menu.CustomUidSubmit.OnClicked.Add(() => {
        const UID = this.Menu.CustomUidValue.GetText();
        ModManager_1.ModManager.ChangeUid(UID);
        this.KunLog("UID Changed: " + UID);
      });

      this.Menu.SaveConfigButton.OnClicked.Add(() => {
        ModManager_1.ModManager.SaveConfig();
        this.KunLog("Config Saved!");
      });

      this.Menu.HideHUDCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.HideHUD = isChecked;
        if (isChecked) {
          UiManager_1.UiManager.CloseView("BattleView");
          UiManager_1.UiManager.CloseView("UidView");
        } else {
          UiManager_1.UiManager.OpenView("BattleView");
          UiManager_1.UiManager.OpenView("UidView");
        }
        this.KunLog("UID Hide: " + isChecked);
      });

      this.Menu.HideDmgCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.HideDmgUi = isChecked;
        this.KunLog("Hide Damage Text: " + isChecked);
      });

      this.Menu.MarkTPCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.MarkTp = isChecked;
        this.KunLog("Mark Teleport: " + isChecked);
      });

      this.Menu.DebugEntityCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.DebugEntity = isChecked;
        this.KunLog("Debug Entity: " + isChecked);
      });

      this.Menu.AutoDestroyCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AutoDestroy = isChecked;
        this.KunLog("Auto Destroy: " + isChecked);
      });

      this.Menu.NewAutoAbsorbCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AutoAbsorbnew = isChecked;
        this.KunLog("New Auto Absorb: " + isChecked);
      });

      this.Menu.NewKillAuraCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.killAuranew = isChecked;
        this.KunLog("New Kill Aura: " + isChecked);
      });

      this.Menu.NewKillAuraSlider.OnValueChanged.Add((value) => {
        value = value.toFixed(1);
        this.Menu.NewKillAuraValue.SetText(value);
        ModManager_1.ModManager.Settings.killAuraRadius = value;
        this.KunLog("Hit Multiplier Count: " + value);
      });

      this.Menu.WorldSpeedCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.WorldSpeed = isChecked;
        if (ModManager_1.ModManager.Settings.WorldSpeed) {
          ModMethod_1.ModMethod.SetWorldTimeDilation(
            ModManager_1.ModManager.Settings.WorldSpeedValue
          );
        } else {
          ModMethod_1.ModMethod.SetWorldTimeDilation(1);
        }
        this.KunLog("World Speed: " + isChecked);
      });

      this.Menu.WorldSpeedSlider.OnValueChanged.Add((value) => {
        value = value.toFixed(1);
        this.Menu.WorldSpeedValue.SetText(value);
        ModManager_1.ModManager.Settings.WorldSpeedValue = value;
        this.KunLog("World Speed: " + value);
      });

      this.Menu.ESPCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ESP = isChecked;
        this.KunLog("ESP: " + isChecked);
      });

      this.Menu.ESPShowNameCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowName = isChecked;
        this.KunLog("ESP Show Name: " + isChecked);
      });

      this.Menu.ESPShowDistanceCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowDistance = isChecked;
        this.KunLog("ESP Show Distance: " + isChecked);
      });

      this.Menu.ESPShowBoxCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowBox = isChecked;
        this.KunLog("ESP Show Box: " + isChecked);
      });

      this.Menu.ESPMonsterCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowMonster = isChecked;
        this.KunLog("ESP Monster: " + isChecked);
      });

      this.Menu.ESPCollectionCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowCollect = isChecked;
        this.KunLog("ESP Collection: " + isChecked);
      });

      this.Menu.ESPTreasureCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowTreasure = isChecked;
        this.KunLog("ESP Treasure: " + isChecked);
      });

      this.Menu.ESPAnimalCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowAnimal = isChecked;
        this.KunLog("ESP Animal: " + isChecked);
      });

      this.Menu.ESPPuzzleCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowPuzzle = isChecked;
        this.KunLog("ESP Puzzle: " + isChecked);
      });

      this.Menu.ESPCasketCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowCasket = isChecked;
        this.KunLog("ESP Sonance Casket: " + isChecked);
      });

      this.Menu.ESPRockCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowRock = isChecked;
        this.KunLog("ESP Rock: " + isChecked);
      });

      this.Menu.ESPMutterflyCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowMutterfly = isChecked;
        this.KunLog("ESP Mutterfly: " + isChecked);
      });

      this.Menu.ESPBlobflyCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowBlobfly = isChecked;
        this.KunLog("ESP Blobfly: " + isChecked);
      });

      this.Menu.ESPRadiusSlider.OnValueChanged.Add((value) => {
        value = value.toFixed(0);
        this.Menu.ESPRadiusValue.SetText(value);
        ModManager_1.ModManager.Settings.ESPRadius = value;
        this.KunLog("ESP Radius: " + value);
      });

      this.Menu.ConsoleCommandSet.OnClicked.Add(() => {
        const Command = this.Menu.ConsoleCommandValue.GetText();
        ModDebuger_1.ModDebuger.ConsoleCommand(Command);
        this.KunLog("Execute Command: " + Command);
      });

      this.Menu.MobVacuumCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.MobVacuum = isChecked;
        this.KunLog("Mob Vacuum: " + isChecked);
      });

      this.Menu.VacuumCollectCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.VacuumCollect = isChecked;
        this.KunLog("Vacuum Collect: " + isChecked);
      });

      this.Menu.WeatherCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.WeatherChanger = isChecked;
        if (isChecked) {
          ModMethod_1.ModMethod.ChangWeather(
            ModManager_1.ModManager.Settings.WeatherType + 1
          ); //Because it starts from 0
        } else {
          ModMethod_1.ModMethod.FPSUnlocker(
            ModManager_1.ModManager.Settings.WeatherType + 1
          );
        }

        this.KunLog("Weather Changer: " + isChecked);
      });

      this.Menu.FPSUnlockerCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.FPSUnlocker = isChecked;
        if (isChecked) {
          ModMethod_1.ModMethod.FPSUnlocker(true);
        } else {
          ModMethod_1.ModMethod.FPSUnlocker(false);
        }
        this.KunLog("FPS Unlocker: " + isChecked);
      });

      if (ModManager_1.ModManager.Settings.FPSUnlocker) {
        ModMethod_1.ModMethod.FPSUnlocker(true);
      }

      this.Menu.FPSShowCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.ShowFPS = isChecked;
        ModMethod_1.ModMethod.ShowFPS();
        this.KunLog("Show FPS: " + isChecked);
      });

      if (ModManager_1.ModManager.Settings.ShowFPS) {
        ModMethod_1.ModMethod.ShowFPS();
      }

      this.Menu.FOVCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.FOV = isChecked;
        const value = ModManager_1.ModManager.Settings.FOVValue;
        if (isChecked) {
          ModMethod_1.ModMethod.SetFOV(value);
        } else {
          ModMethod_1.ModMethod.SetFOV(60);
        }
        this.KunLog("FOV: " + isChecked);
      });

      if (ModManager_1.ModManager.Settings.FOV) {
        const value = ModManager_1.ModManager.Settings.FOVValue;
        this.Menu.FOVValue.SetText(value);
        ModMethod_1.ModMethod.SetFOV(value);
      }

      this.Menu.FOVSlider.OnValueChanged.Add((value) => {
        value = value.toFixed(0);
        this.Menu.FOVValue.SetText(value);
        ModManager_1.ModManager.Settings.FOVValue = value;
        if (ModManager_1.ModManager.Settings.FOV) {
          ModMethod_1.ModMethod.SetFOV(value);
        }
        this.KunLog("FOV Value: " + value);
      });

      this.Menu.NoClipCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.NoClip = isChecked;
        if (isChecked) {
          NoClip_1.NoClip.NoClip(true);
        } else {
          NoClip_1.NoClip.NoClip(false);
        }
        this.KunLog("No Clip: " + isChecked);
      });

      if (ModManager_1.ModManager.Settings.NoClip) {
        NoClip_1.NoClip.NoClip(true);
      }

      this.Menu.PlotSkipCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.PlotSkip = isChecked;
        this.KunLog("Plot Skip: " + isChecked);
      });

      this.Menu.AutoPuzzleCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AutoPuzzle = isChecked;
        this.KunLog("Auto Puzzle: " + isChecked);
      });

      this.Menu.AlwaysCritCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.AlwaysCrit = isChecked;
        this.KunLog("Always Critical: " + isChecked);
      });

      this.Menu.QuestTPCheck.OnCheckStateChanged.Add((isChecked) => {
        ModManager_1.ModManager.Settings.QuestTp = isChecked;
        this.KunLog("Quest Teleport: " + isChecked);
      });

      this.Menu.KillAuraValue.SetSelectedIndex(
        ModManager_1.ModManager.Settings.killAuraState
      );
      this.Menu.WeatherValue.SetSelectedIndex(ModManager_1.ModManager.Settings.WeatherType);
      this.Menu.CustomUidValue.SetText(ModManager_1.ModManager.Settings.Uid);

      this.Menu.PlayerSpeedSlider.SetValue(
        ModManager_1.ModManager.Settings.playerSpeedValue
      );
      this.Menu.HitMultiplierSlider.SetValue(ModManager_1.ModManager.Settings.Hitcount);
      this.Menu.NewKillAuraSlider.SetValue(ModManager_1.ModManager.Settings.killAuraRadius);
      this.Menu.WorldSpeedSlider.SetValue(ModManager_1.ModManager.Settings.WorldSpeedValue);
      this.Menu.ESPRadiusSlider.SetValue(ModManager_1.ModManager.Settings.ESPRadius);
      this.Menu.FOVSlider.SetValue(ModManager_1.ModManager.Settings.FOVValue);

      this.Menu.PlayerSpeedValue.SetText(ModManager_1.ModManager.Settings.playerSpeedValue);
      this.Menu.HitMultiplierValue.SetText(ModManager_1.ModManager.Settings.Hitcount);
      this.Menu.NewKillAuraValue.SetText(ModManager_1.ModManager.Settings.killAuraRadius);
      this.Menu.WorldSpeedValue.SetText(ModManager_1.ModManager.Settings.WorldSpeedValue);
      this.Menu.ESPRadiusValue.SetText(ModManager_1.ModManager.Settings.ESPRadius);
      this.Menu.FOVValue.SetText(ModManager_1.ModManager.Settings.FOVValue);
    } catch (e) {
      this.KunLog(e);
    }

    this.Menu.AddToViewport();
    this.Menu.SetVisibility(2);
    ModManager_1.ModManager.ShowTip(ModLanguage_1.ModLanguage.ModTr("KUN_MOD_LOADED"));
    this.KunLog("KUN-MOD Menu Loaded!");
  }

  static getTranslation() {
    if (this.Menu) {
      this.Menu.PlayerSwitchText.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_PLAYER"));
      this.Menu.WorldSwitchText.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_WORLD"));
      this.Menu.ESPSwitchText.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_ESP"));
      this.Menu.UISwitchText.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_VISUAL"));
      this.Menu.DebugSwitchText.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_DEBUG"));

      this.Menu.HeadingPlayer.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_PLAYER"));
      this.Menu.HeadingWorld.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_WORLD"));
      this.Menu.HeadingESP.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_ESP"));
      this.Menu.HeadingESPFilter.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_FILTER"));
      this.Menu.HeadingUI.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_VISUAL"));
      this.Menu.HeadingTeleport.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_TELEPORT"));
      this.Menu.HeadingDebug.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_DEBUG"));

      this.Menu.SaveConfigText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_SAVE_CONFIG"));

      // player
      this.Menu.GodModeText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_GOD_MODE"));
      this.Menu.PlayerSpeedText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_PLAYER_SPEED"));
      this.Menu.NoCDText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_NO_COOLDOWN"));
      this.Menu.HitMultiplierText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_HIT_MULTIPLIER")
      );
      this.Menu.InfiniteStaminaText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_INFINITE_STAMINA")
      );
      this.Menu.AntiDitherText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_ANTI_DITHER"));
      this.Menu.NoClipText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_NOCLIP"));
      this.Menu.AlwaysCritText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_ALWAYS_CRIT"));

      // teleport
      this.Menu.MarkTPText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_MARK_TELEPORT"));
      this.Menu.CustomTPText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_CUSTOM_TP"));
      this.Menu.QuestTPText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_QUEST_TP"));

      // world
      this.Menu.WorldSpeedText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_WORLD_SPEED"));
      this.Menu.NewAutoAbsorbText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_AUTO_ABSORB")
      );
      this.Menu.AutoPickTreasureText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_AUTO_PICK_TREASURE")
      );
      this.Menu.KillAuraText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_HIT_ALL"));
      this.Menu.PerceptionRangeText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_PERCEPTION_RANGE")
      );
      this.Menu.AutoLootText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_AUTO_LOOT"));
      this.Menu.AutoDestroyText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_AUTO_DESTROY"));
      this.Menu.KillAnimalText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_KILL_ANIMAL"));
      this.Menu.NewKillAuraText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_NEW_KILL_AURA")
      );
      this.Menu.MobVacuumText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_MOB_VACUUM"));
      this.Menu.VacuumCollectText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_VACUUM_COLLECT")
      );
      this.Menu.WeatherText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_WEATHER"));
      this.Menu.PlotSkipText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_PLOT_SKIP"));
      this.Menu.AutoPuzzleText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_AUTO_PUZZLE"));

      // esp
      this.Menu.ESPText.SetText(ModLanguage_1.ModLanguage.ModTr("HEADING_ESP"));
      this.Menu.ESPShowNameText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_SHOW_NAME"));
      this.Menu.ESPShowDistanceText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_SHOW_DISTANCE")
      );
      this.Menu.ESPShowBoxText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_SHOW_BOX"));
      this.Menu.ESPMonsterText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_MONSTER"));
      this.Menu.ESPCollectionText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_COLLECTION"));
      this.Menu.ESPTreasureText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_TREASURE"));
      this.Menu.ESPAnimalText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_ANIMAL"));
      this.Menu.ESPPuzzleText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_PUZZLE"));
      this.Menu.ESPCasketText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_SONANCE_CASKET"));
      this.Menu.ESPRockText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_ROCK"));
      this.Menu.ESPMutterflyText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_MUTTERFLY"));
      this.Menu.ESPBlobflyText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_BLOBFLY"));

      // visual
      this.Menu.CustomUidText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_CUSTOM_UID"));
      this.Menu.HideHUDText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_HIDE_HUD"));
      this.Menu.HideDmgText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_HIDE_DAMAGE_TEXT"));
      this.Menu.FPSUnlockerText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_FPS_UNLOCKER"));
      this.Menu.FPSShowText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_SHOW_FPS"));
      this.Menu.FOVText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_FOV"));

      // debug
      this.Menu.DebugEntityText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_DEBUG_ENTITY"));
      this.Menu.ConsoleCommandText.SetText(
        ModLanguage_1.ModLanguage.ModTr("TEXT_CONSOLE_COMMAND")
      );

      this.Menu.DisclaimerText.SetText(this.Getfreetip());
      this.Menu.LanguageText.SetText(ModLanguage_1.ModLanguage.ModTr("TEXT_LANGUAGE"));
    }
  }

  static Getfreetip() {
    let lang = ModLanguage_1.ModLanguage.GetCurrLang();
    switch (lang) {
      case "chs":
        return "免费软件，如果你是付费获得，那你被骗了";
      case "en":
        return "This hack is completely free, if you paid to get this, you have been scammed.";
      case "es":
        return "Este hack es completamente gratuito, si pagaste por obtenerlo, has sido estafado.";
      case "id":
        return "Hack ini sepenuhnya gratis, jika Anda membayar untuk mendapatkan ini, Anda telah tertipu.";
      case "ja":
        return "このハックは完全に無料です。これにお金を払ったのなら、あなたはだまされています。";
      case "ko":
        return "이 해킹은 완전히 무료입니다. 이것을 얻기 위해 돈을 지불했다면 당신은 베코 사기를 당한 것입니다.";
      case "vi":
        return "Bản hack này hoàn toàn miễn phí, nếu bạn đã mua nó từ ai, bạn đã bị lừa đảo.";
      default:
        return "This hack is completely free, if you paid to get this, you have been scammed.";
    }
  }

  static updateMenuState() {
    if (this.Menu) {
      // player
      this.Menu.GodModeCheck.SetIsChecked(ModManager_1.ModManager.Settings.GodMode);
      this.Menu.NoCDCheck.SetIsChecked(ModManager_1.ModManager.Settings.NoCD);
      this.Menu.HitMultiplierCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.HitMultiplier
      );
      this.Menu.AntiDitherCheck.SetIsChecked(ModManager_1.ModManager.Settings.AntiDither);
      this.Menu.InfiniteStaminaCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.InfiniteStamina
      );
      this.Menu.PlayerSpeedCheck.SetIsChecked(ModManager_1.ModManager.Settings.PlayerSpeed);
      this.Menu.NoClipCheck.SetIsChecked(ModManager_1.ModManager.Settings.NoClip);
      this.Menu.AlwaysCritCheck.SetIsChecked(ModManager_1.ModManager.Settings.AlwaysCrit);

      // world
      this.Menu.AutoPickTreasureCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.AutoPickTreasure
      );
      this.Menu.KillAuraCheck.SetIsChecked(ModManager_1.ModManager.Settings.HitAll);
      this.Menu.AutoLootCheck.SetIsChecked(ModManager_1.ModManager.Settings.AutoLoot);
      this.Menu.KillAnimalCheck.SetIsChecked(ModManager_1.ModManager.Settings.KillAnimal);
      this.Menu.PerceptionRangeCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.PerceptionRange
      );
      this.Menu.AutoDestroyCheck.SetIsChecked(ModManager_1.ModManager.Settings.AutoDestroy);
      this.Menu.NewAutoAbsorbCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.AutoAbsorbnew
      );
      this.Menu.NewKillAuraCheck.SetIsChecked(ModManager_1.ModManager.Settings.killAuranew);
      this.Menu.WorldSpeedCheck.SetIsChecked(ModManager_1.ModManager.Settings.WorldSpeed);
      this.Menu.MobVacuumCheck.SetIsChecked(ModManager_1.ModManager.Settings.MobVacuum);
      this.Menu.VacuumCollectCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.VacuumCollect
      );
      this.Menu.VacuumCollectCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.VacuumCollect
      );
      this.Menu.WeatherCheck.SetIsChecked(ModManager_1.ModManager.Settings.WeatherChanger);
      this.Menu.PlotSkipCheck.SetIsChecked(ModManager_1.ModManager.Settings.PlotSkip);
      this.Menu.AutoPuzzleCheck.SetIsChecked(ModManager_1.ModManager.Settings.AutoPuzzle);

      // visual
      this.Menu.HideHUDCheck.SetIsChecked(ModManager_1.ModManager.Settings.HideHUD);
      this.Menu.HideDmgCheck.SetIsChecked(ModManager_1.ModManager.Settings.HideDmgUi);
      this.Menu.FPSUnlockerCheck.SetIsChecked(ModManager_1.ModManager.Settings.FPSUnlocker);
      this.Menu.FPSShowCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowFPS);
      this.Menu.FOVCheck.SetIsChecked(ModManager_1.ModManager.Settings.FOV);

      // teleport
      this.Menu.MarkTPCheck.SetIsChecked(ModManager_1.ModManager.Settings.MarkTp);
      this.Menu.QuestTPCheck.SetIsChecked(ModManager_1.ModManager.Settings.QuestTp);

      // esp
      this.Menu.ESPCheck.SetIsChecked(ModManager_1.ModManager.Settings.ESP);
      this.Menu.ESPShowNameCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowName);
      this.Menu.ESPShowDistanceCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.ShowDistance
      );
      this.Menu.ESPShowBoxCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowBox);
      this.Menu.ESPMonsterCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowMonster);
      this.Menu.ESPCollectionCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.ShowCollect
      );
      this.Menu.ESPTreasureCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowTreasure);
      this.Menu.ESPAnimalCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowAnimal);
      this.Menu.ESPPuzzleCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowPuzzle);
      this.Menu.ESPCasketCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowCasket);
      this.Menu.ESPRockCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowRock);
      this.Menu.ESPMutterflyCheck.SetIsChecked(
        ModManager_1.ModManager.Settings.ShowMutterfly
      );
      this.Menu.ESPBlobflyCheck.SetIsChecked(ModManager_1.ModManager.Settings.ShowBlobfly);

      // debug
      this.Menu.DebugEntityCheck.SetIsChecked(ModManager_1.ModManager.Settings.DebugEntity);
    }
  }

  static updatePlayerSpeed() {
    if (ModManager_1.ModManager.Settings.PlayerSpeed) {
      EntityManager_1.EntityManager.SetPlayerSpeed(ModManager_1.ModManager.Settings.playerSpeedValue);
    }
  }

  static updateWorldSpeed() {
    if (ModManager_1.ModManager.Settings.WorldSpeed) {
      ModMethod_1.ModMethod.SetWorldTimeDilation(
        ModManager_1.ModManager.Settings.WorldSpeedValue
      );
    }
  }

  static updateNoClip() {
    if (ModManager_1.ModManager.Settings.NoClip) {
      NoClip_1.NoClip.NoClip(true);
    }
  }

  static killAura() {
    return [
      ModLanguage_1.ModLanguage.ModTr("TEXT_ONLY_HATE"),
      ModLanguage_1.ModLanguage.ModTr("TEXT_INFINITY"),
    ];
  }

  static WeatherValue() {
    return [
      ModLanguage_1.ModLanguage.ModTr("TEXT_SUNNY"),
      ModLanguage_1.ModLanguage.ModTr("TEXT_CLOUDY"),
      ModLanguage_1.ModLanguage.ModTr("TEXT_THUNDER_RAIN"),
      ModLanguage_1.ModLanguage.ModTr("TEXT_SNOW"),
      ModLanguage_1.ModLanguage.ModTr("TEXT_RAIN"),
    ];
  }
}
class ModEntityListener {
  static Runtime() {
    if (!ModUtils_1.ModUtils.isInGame()) return;

    ModelManager_1.ModelManager.CreatureModel.GetAllEntities().forEach(entity => {
        MobVacuum_1.MobVacuum.MobVacuum(entity);
        AutoDestroy_1.AutoDestroy.AutoDestroy(entity);
        MobVacuum_1.MobVacuum.VacuumCollect(entity);
        AutoPuzzle_1.AutoPuzzle.AutoPuzzle(entity);
        KillAura_1.KillAura.killAura(entity);
        KillAura_1.KillAura.KillAnimal(entity);
    });
  }

  static FasterRuntime() {
    if (!ModUtils_1.ModUtils.isInGame()) return;

    ModelManager_1.ModelManager.CreatureModel.GetAllEntities().forEach(entity => {
        if (ModManager_1.ModManager.Settings.PerceptionRange) {
            PerceptionRange_1.PerceptionRange.SetAll(entity);
        }
        if (ModManager_1.ModManager.Settings.AutoPickTreasure) {
            PerceptionRange_1.PerceptionRange.SetTreasure(entity);
        }
        if (ModManager_1.ModManager.Settings.AutoTeleport) {
            PerceptionRange_1.PerceptionRange.SetTeleport(entity);
        }
        if (ModManager_1.ModManager.Settings.AutoLoot) {
            PerceptionRange_1.PerceptionRange.SetCollection(entity);
        }
        if (ModManager_1.ModManager.Settings.AutoAbsorbnew) {
            PerceptionRange_1.PerceptionRange.SetVision(entity);
        }
        if (ModManager_1.ModManager.Settings.AutoSonanceCasket) {
            PerceptionRange_1.PerceptionRange.SetSonanceCasket(entity);
        }
    });
  }
}

exports.MainMenu = MainMenu;
//# sourceMappingURL=Main.js.map
