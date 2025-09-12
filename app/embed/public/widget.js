(function () {
  if (window.__bloomWidgetLoaded) return;
  window.__bloomWidgetLoaded = true;

  var host = window.BLOOM_WIDGET_ORIGIN || (location.origin.includes("vercel.app") ? location.origin : "https://YOUR-VERCEL-DOMAIN.vercel.app");

  // container
  var c = document.createElement("div");
  c.id = "bloom-widget-container";
  c.style.position = "fixed";
  c.style.right = "16px";
  c.style.bottom = "16px";
  c.style.width = "420px";
  c.style.maxWidth = "92vw";
  c.style.height = "0"; // start collapsed; the iframe will auto-size
  c.style.zIndex = "2147483000";
  c.style.pointerEvents = "none";
  document.body.appendChild(c);

  // iframe
  var f = document.createElement("iframe");
  f.src = host + "/embed";
  f.title = "Bloom Chatbot";
  f.style.width = "100%";
  f.style.height = "0";  // collapsed initial
  f.style.border = "0";
  f.style.background = "transparent";
  f.style.pointerEvents = "auto";
  f.allow = "clipboard-read; clipboard-write";
  c.appendChild(f);

  // listen for height messages from inside iframe (postMessage from ChatWidget)
  window.addEventListener("message", function (e) {
    if (!String(e.origin).includes(host.replace(/^https?:\/\//, ""))) return;
    var data = e.data || {};
    if (data.type === "bloom:resize") {
      f.style.height = data.height + "px";
      c.style.height = data.height + "px";
    }
  });
})();
