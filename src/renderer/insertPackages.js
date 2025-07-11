// insertPackages.js
import service from "./usePackages.js";

function doInsert() {
  const pkgs = service.getAllPackages();
  if (!pkgs.length || typeof currentAlg === "undefined") return false;

  const cmds = pkgs.flatMap((pkg) =>
    currentAlg.insertElement(pkg.senderPhone.toString())
  );
  currentAlg.commands = cmds;
  currentAlg.animationManager.StartNewAnimation(cmds);
  currentAlg.animationManager.skipForward();
  currentAlg.animationManager.clearHistory();
  return true;
}

function scheduleInsert() {
  // сразу попытаться
  if (doInsert()) return;
  // иначе — каждые 500 мс пока не получится
  const id = setInterval(() => {
    if (doInsert()) clearInterval(id);
  }, 500);
}

if (typeof window.init === "function") {
  const orig = window.init;
  window.init = function () {
    orig();
    scheduleInsert();
  };
} else {
  console.error("init() не найден — вставка не будет работать");
}
