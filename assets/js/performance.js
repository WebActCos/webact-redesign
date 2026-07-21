(function(){"use strict";
function loadFrames(){document.querySelectorAll("iframe[data-webact-src]").forEach(function(f){if(!f.src)f.src=f.dataset.webactSrc;f.removeAttribute("data-webact-src")})}
function init(){
var imgs=[].slice.call(document.images||[]);
imgs.forEach(function(img,i){img.decoding="async";if(i===0){img.loading="eager";img.fetchPriority="high"}else if(!img.hasAttribute("loading"))img.loading="lazy"});
document.querySelectorAll("a[href]").forEach(function(a){if(!(a.textContent||"").trim()&&!a.getAttribute("aria-label")){var im=a.querySelector("img[alt]");a.setAttribute("aria-label",im&&im.alt?im.alt:"Open "+(a.getAttribute("href")||"link").replace(/[-_/]+/g," ").trim())}});
["pointerdown","keydown","touchstart","scroll"].forEach(function(e){addEventListener(e,loadFrames,{once:true,passive:true})});
if("requestIdleCallback"in window)requestIdleCallback(loadFrames,{timeout:3500});else setTimeout(loadFrames,3500);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init,{once:true}):init();
})();