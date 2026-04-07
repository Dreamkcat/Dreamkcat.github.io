// random-bg-var.js
document.addEventListener('DOMContentLoaded', function () {
  // 1. 定义要随机的背景变量名列表
  const bgVarList = ['--bg1', '--bg2',]; // 可扩展：['--bg1', '--bg2', '--bg3']

  // 2. 随机选一个变量名
  const randomVarName = bgVarList[Math.floor(Math.random() * bgVarList.length)];

  // 3. 获取根元素的该变量值（getComputedStyle 读取CSS变量实际值）
  const rootStyle = getComputedStyle(document.documentElement);
  const randomBgValue = rootStyle.getPropertyValue(randomVarName).trim();

  // 4. 找到目标元素，赋值背景（保留 !important 优先级）
  const targetElement = document.querySelector('.bg'); // 替换成你的目标元素选择器
  if (targetElement) {
    // 用 setProperty 强制设置，或直接写 style（两种方式都支持 !important）
    targetElement.style.setProperty('background', randomBgValue, 'important');
    // 也可以这样写：targetElement.style.background = `${randomBgValue} !important`;
  } else {
    console.warn('未找到目标元素，请检查选择器！');
  }
});