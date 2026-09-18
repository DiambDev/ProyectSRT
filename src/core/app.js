import { Router } from './router.js';
import { SCREENS } from './constants.js';
import { AudioManager } from '../audio/audioManager.js';
import { AnimationManager } from '../animation/animationManager.js';
import { VFXManager } from '../vfx/vfxManager.js';
import { UIManager } from '../ui/uiManager.js';

import { initialLoadingScreen } from '../screens/initialLoading/initialLoading.js';
import { introScreen } from '../screens/intro/intro.js';
import { phase1LoadingScreen } from '../screens/phase1/phase1Loading/phase1Loading.js';
import { phase1GameScreen } from '../screens/phase1/phase1Game/phase1Game.js';
import { phase1DefeatLoadingScreen } from '../screens/phase1/phase1DefeatLoading/phase1DefeatLoading.js';
import { phase1DefeatScreen } from '../screens/phase1/phase1Defeat/phase1Defeat.js';
import { phase2LoadingScreen } from '../screens/phase2/phase2Loading/phase2Loading.js';
import { phase2GameScreen } from '../screens/phase2/phase2Game/phase2Game.js';
import { phase2DefeatLoadingScreen } from '../screens/phase2/phase2DefeatLoading/phase2DefeatLoading.js';
import { phase2DefeatScreen } from '../screens/phase2/phase2Defeat/phase2Defeat.js';
import { phase3LoadingScreen } from '../screens/phase3/phase3Loading/phase3Loading.js';
import { phase3GameScreen } from '../screens/phase3/phase3Game/phase3Game.js';
import { phase3DefeatLoadingScreen } from '../screens/phase3/phase3DefeatLoading/phase3DefeatLoading.js';
import { phase3DefeatScreen } from '../screens/phase3/phase3Defeat/phase3Defeat.js';
import { achievementLoadingScreen } from '../screens/achievement/achievementLoading/achievementLoading.js';
import { achievementScreen } from '../screens/achievement/achievementScreen/achievementScreen.js';

export const App = {
  async init() {
    await AudioManager.init();
    AnimationManager.init();
    VFXManager.init();
    UIManager.init();

    Router.registerAll([
      initialLoadingScreen,
      introScreen,
      phase1LoadingScreen,
      phase1GameScreen,
      phase1DefeatLoadingScreen,
      phase1DefeatScreen,
      phase2LoadingScreen,
      phase2GameScreen,
      phase2DefeatLoadingScreen,
      phase2DefeatScreen,
      phase3LoadingScreen,
      phase3GameScreen,
      phase3DefeatLoadingScreen,
      phase3DefeatScreen,
      achievementLoadingScreen,
      achievementScreen,
    ]);

    await Router.show(SCREENS.INITIAL_LOADING);
  },
};
