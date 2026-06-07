import {costs,milestones,passivePerSecond,upgradeNames} from './config.js';
import {handleDev,resetRuntimeForNewGame} from './devtools.js';
import {drawBackground,drawClouds,drawDrops,drawGarden,drawMist,drawRipples,drawSpecial,drawWindowGlow,resize,spawnDrops,trimActiveDrops} from './render.js';
import {loadGame,maybeAutoSave,saveGame} from './save.js';
import {milestoneLevel,runtime,state} from './state.js';
import {closePanel,enableDevToolsIfRequested,pulseHud,setOpenPanel,showToast,ui,updateUI} from './ui.js';

function checkMilestoneUnlocks(){const current=milestoneLevel();if(current<=runtime.seenMilestoneLevel)return;for(let level=runtime.seenMilestoneLevel+1;level<=current;level++){const milestone=milestones[level-1];if(milestone)showToast(milestone.message)}runtime.seenMilestoneLevel=current;pulseHud()}
function addWater(amount,trackRate=true,checkMilestones=true){state.water+=amount;state.lifetimeWater+=amount;if(trackRate)runtime.recentWater.push({amount,time:performance.now()});if(checkMilestones)checkMilestoneUnlocks()}
function buyUpgrade(key){const cost=costs[key](state);if(state.water<cost)return;state.water-=cost;state.upgrades[key]+=1;trimActiveDrops();saveGame();updateUI();pulseHud();showToast(`${upgradeNames[key]} grew stronger.`)}
function resetGame(skipConfirm=false){if(!skipConfirm&&!window.confirm('Reset your rain garden progress?'))return;resetRuntimeForNewGame();saveGame();showToast('The garden has been reset.');updateUI()}
let last=performance.now();
function animate(now){const delta=Math.min((now-last)/1000,.033);last=now;addWater(passivePerSecond(state)*delta);spawnDrops(delta);drawBackground(now);drawClouds(now);drawWindowGlow(now);drawMist(delta);drawGarden(now);drawDrops(delta,addWater);drawSpecial(delta,addWater,pulseHud);drawRipples(delta);updateUI(now);maybeAutoSave();requestAnimationFrame(animate)}
function bindEvents(){ui.buttons.forEach(button=>button.addEventListener('click',()=>buyUpgrade(button.dataset.upgrade)));ui.panelButtons.forEach(button=>button.addEventListener('click',()=>setOpenPanel(button.dataset.panel)));ui.closeButtons.forEach(button=>button.addEventListener('click',()=>closePanel(button.dataset.close)));ui.devToggle.addEventListener('click',()=>ui.devPanel.classList.toggle('open'));ui.devButtons.forEach(button=>button.addEventListener('click',()=>handleDev(button.dataset.dev,addWater,resetGame)));ui.reset.addEventListener('click',()=>resetGame());window.addEventListener('resize',resize,{passive:true});window.addEventListener('pagehide',saveGame);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame()})}
function startGame(){loadGame(addWater,showToast);runtime.seenMilestoneLevel=milestoneLevel();resize();updateUI();enableDevToolsIfRequested();bindEvents();saveGame();requestAnimationFrame(animate)}
startGame();
