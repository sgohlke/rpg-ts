import {
  assertEquals,
  Battle,
  BattleStatus,
  GamePlayer,
  getDefaultUnit,
  PlayerInBattle,
} from "../index.ts";

const unitOne = getDefaultUnit("1");
const unitTwo = getDefaultUnit("2");

Deno.test("Battle is correctly creaeted", () => {
  const playerOne: PlayerInBattle = new PlayerInBattle(
    new GamePlayer({
      playerId: "p1",
      name: "Test Player",
      units: [unitOne, unitTwo],
    }),
  );
  const playerTwo: PlayerInBattle = new PlayerInBattle(
    new GamePlayer({
      playerId: "p2",
      name: "AI Player",
      units: [unitOne, unitTwo],
    }),
  );
  const battle: Battle = {
    battleId: "p1-p2-1111",
    playerOne,
    playerTwo,
    battleStatus: BattleStatus.ACTIVE,
  };

  assertEquals(battle.battleId, "p1-p2-1111");
  assertEquals(battle.playerOne, playerOne);
  assertEquals(battle.playerTwo, playerTwo);
  assertEquals(battle.battleStatus, BattleStatus.ACTIVE);
});
