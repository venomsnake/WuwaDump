"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.MobVacuum = void 0);
const puerts_1 = require("puerts"),
  UE = require("ue"),
  Info_1 = require("../../../Core/Common/Info"),
  Log_1 = require("../../../Core/Common/Log"),
  TimerSystem_1 = require("../../../Core/Timer/TimerSystem"),
  ModManager_1 = require("../ModManager"),
  ModUtils_1 = require("./ModUtils"),
  ModMenu_1 = require("../../ModMenu"),
  NetDefine_1 = require("../../../Core/Define/Net/NetDefine"),
  Protocol_1 = require("../../../Core/Define/Net/Protocol"),
  Net_1 = require("../../../Core/Net/Net"),
  EntityManager_1 = require("./EntityManager"),
  Global_1 = require("../../Global"),
  GlobalData_1 = require("../../GlobalData"),
  EntityFilter_1 = require("./EntityFilter"),
  UiManager_1 = require("../../../Ui/UiManager");

class MobVacuum extends EntityManager_1.EntityManager {
  static isIndistance(entity) {
    let monsterPos = this.GetPosition(entity.Entity);
    let distance = ModUtils_1.ModUtils.Getdistance2Player(monsterPos);
    if (distance < ModManager_1.ModManager.Settings.VacuumRadius * 100) {
      return true;
    } return false;
  }

  static origPositions = {}
  static async MobVacuum(entity) {
    if (!ModManager_1.ModManager.Settings.MobVacuum) return;
    let comp = entity.Entity.GetComponent(1);
    if (!comp) {
        return;
    }
    if (!(comp.ActorInternal)) return;
    
    if (this.isMonster(entity) && this.isIndistance(entity)) {
        const entityId = entity.Entity.Id;
        if (!(entityId in this.origPositions)) {
            let monsterPos = this.GetPosition(entity.Entity);
            if (!(monsterPos.X)) {
                return;
            }
            this.origPositions[entityId] = monsterPos;
        }

        // confirm TP
        let timer = null
        let its = 0;
        let itsLimit = 5;
        timer = TimerSystem_1.TimerSystem.Forever(() => {
            if (!entity.Entity || its > itsLimit) {
                TimerSystem_1.TimerSystem.Remove(timer);
                return;
            }

            its++;
            let distToPlayer = ModUtils_1.ModUtils.Getdistance2Player(this.GetPosition(entity.Entity));
            if (distToPlayer < 500) {
                TimerSystem_1.TimerSystem.Remove(timer);
                return;
            }
            
            let playerpos = this.GetPlayerPos();
            let playerDistToSpawn = ModUtils_1.ModUtils.Getdistance(this.origPositions[entityId], playerpos)
            if (playerDistToSpawn > ModManager_1.ModManager.Settings.VacuumRadius * 100) {
                TimerSystem_1.TimerSystem.Remove(timer);
                return;
            }

            if (!this.isIndistance(entity)) {
                TimerSystem_1.TimerSystem.Remove(timer);
                return;
            }
            
            playerpos.Z += 100;
            let fv = this.GetPlayerForwardVector();
            playerpos.X = playerpos.X - (fv.X * 200);
            playerpos.Y = playerpos.Y - (fv.Y * 200);

            let ActorComp = entity.Entity.GetComponent(1);
            ActorComp.ActorInternal.K2_SetActorLocation(playerpos);
            this.SyncMonster(entity, playerpos);
        }, 333);
    }
  }

  static async VacuumCollect(entity) {
    if (!ModManager_1.ModManager.Settings.VacuumCollect) return;
    if (
      EntityFilter_1.EntityFilter.isneedLoot(
        this.GetBlueprintType2(entity)
      ) &&
      this.isIndistance(entity)
    ) {
      let playerpos = this.GetPlayerPos();
      let ActorComp = entity.Entity.GetComponent(1);
      ActorComp.ActorInternal.K2_SetActorLocation(playerpos);
    }
  }

  static SyncMonster(entity, pos) {
    let t = entity.Entity.GetComponent(60);
    if (!t.EnableMovementSync) {
        t.SetEnableMovementSync(true, "MonsterBehaviorComponent InFight");
        t.EnableMovementSync = true;
    }

    let i = t.GetCurrentMoveSample();
    i.Location = pos;
    t.PendingMoveInfos.push(i);
    let s = Protocol_1.Aki.Protocol.Yus.create();
    s.WRs.push(t.CollectPendingMoveInfos());
    // see BaseMovementSyncComponent.CollectSampleAndSend
    Net_1.Net.Send(29926 /*NetDefine_1.EPushMessageId.MovePackagePush*/, s);
  }
}
//puerts.logger.info(debug)
exports.MobVacuum = MobVacuum;
