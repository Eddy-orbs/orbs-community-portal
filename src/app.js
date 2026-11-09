import { participationSince } from "../participation-model.mjs";
import { committeeColorMap, guardianColor, guardianInitials } from "../guardian-colors.mjs";
import { createViews } from "./views.js";
import { metricLogos, stakingAppIcons, icons } from "./assets.js";
import { patchContent } from "./ui/dom.js";
import { createAddressFitter } from "./ui/address.js";
import { createPosModelCache } from "./pos-models.js";
const posModels = createPosModelCache();
let colorSnapshot, colors = new Map();
function guardianColorFor(address) {
  const snapshot = posSources().ethereum?.data?.committeeSnapshot;
  if (snapshot !== colorSnapshot) {colorSnapshot = snapshot; colors = committeeColorMap(snapshot ? [snapshot] : []);}
  return guardianColor(colors, address);
}
function guardianAvatar(address, name) {
  return `<span class="guardian-icon" data-guardian-color="${escapeHTML(address)}" style="background-color:${guardianColorFor(address)}" aria-hidden="true">${escapeHTML(guardianInitials(name))}</span>`;
}
function refreshGuardianColors() {
  document.querySelectorAll('[data-guardian-color]').forEach(el => el.style.backgroundColor = guardianColorFor(el.dataset.guardianColor));
}
function guardianRows() {
  return posModels.guardians(posSources());
}
function chartSeries() {
  return posModels.series(posSources(), state.chart, state.period);
}
const $ = (s) => document.querySelector(s);
const state = { connected: false, chart: "total", period: "30", search: "" };

const icon = (name) =>
  `<span class="metric-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.stake}</svg></span>`;
const ext = (url, label) => {
  let href;
  try {
    const u = new URL(String(url));
    if (!["https:", "http:", "mailto:"].includes(u.protocol))
      return escapeHTML(label);
    href = u.href;
  } catch {
    return escapeHTML(label);
  }
  return `<a class="text-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>`;
};
const heading = (tag, title, extra = "") =>
  `<div class="section-head"><div><div class="eyebrow">${tag}</div><h1>${title}</h1></div>${extra}</div>`;
const pill = (text, kind = "") => `<span class="pill ${kind}">${text}</span>`;
const stat = (name, value, unit, kind, sub = "") =>
  `<div class="big-stat">${icon(kind)}<span class="metric-label">${name}</span><div class="metric-value">${value} <small>${unit}</small></div>${sub ? `<span class="muted">${sub}</span>` : ""}</div>`;

let overviewData = null,
  overviewLoading = false,
  overviewFetched = 0,
  overviewError = false;
const escapeHTML = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const liveNumber = (v) =>
  Number.isFinite(v) ? v.toLocaleString("en-US") : "—";
const stakeNumber = (v) =>
  !Number.isFinite(v)
    ? "—"
    : v >= 1e9
      ? (v / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "B"
      : v >= 1e6
        ? (v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "M"
        : liveNumber(v);

async function loadOverview() {
  if (overviewLoading || Date.now() - overviewFetched < 600000) return;
  overviewLoading = true;
  try {
    const response = await fetch("/api/overview?v=8", {
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw Error("Overview unavailable");
    const data = await response.json();
    if (!data.sources) throw Error("Invalid overview");
    overviewData = data;
    refreshGuardianColors();
    document.querySelectorAll("[data-guardian-voted]").forEach(el=>{el.innerHTML=guardianParticipation(el.dataset.guardianVoted);});
    overviewError = false;
  } catch {
    overviewError = true;
  } finally {
    overviewLoading = false;
    overviewFetched = Date.now();
    if (
      ["overview", "pos", "dao", "mypage"].includes(
        location.hash.slice(1) || "overview",
      )
    )
      render();
  }
}
setInterval(() => {
  if (
    !document.hidden &&
    ["overview", "pos", "dao", "mypage"].includes(
      location.hash.slice(1) || "overview",
    )
  )
    loadOverview();
}, 30000);
const networkSymbol = (network) =>
  `<img class="network-symbol" src="${metricLogos[network.toLowerCase()]}" alt="${network}" width="18" height="18">`;
function posSources() {
  return overviewData?.sources || {};
}

function guardianSelfStakeRatio(d) {
  return Number.isFinite(d.selfStake) && Number.isFinite(d.effectiveStake)
    ? d.effectiveStake > 0
      ? ((d.selfStake / d.effectiveStake) * 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "%"
      : "N/A"
    : t("Unavailable");
}

function liveGuardianModal(id) {
  loadParticipation();
  const g = guardianRows()?.find((g) => g.address === id);
  if (!g) return;
  const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
  const website = (() => {
    try {
      const u = new URL(g.ethereum.website);
      return ["https:", "http:"].includes(u.protocol) ? u.href : null;
    } catch {
      return null;
    }
  })();
  openModal(
    `<div class="guardian-modal-header"><div class="eyebrow">${t("Guardian profile")}</div><div class="guardian-profile-identity">${guardianAvatar(g.address, g.name)}<h2 id="dialog-title">${escapeHTML(g.name)}</h2></div><p class="guardian-full-address"><span class="guardian-address-text" data-full-address="${escapeHTML(g.address)}" title="${escapeHTML(g.address)}">${escapeHTML(g.address)}</span>${copyAddressButton(g.address)}</p></div><div class="guardian-modal-details" tabindex="0"><dl class="detail-list">${row(t("Rank"), g.rank ? "#" + g.rank : t("Unavailable"))}${row(t("Effective stake"), g.total !== null ? liveNumber(g.total) + " ORBS" : t("Unavailable"))}${row(t("Certified"), g.ethereum.certified === null ? t("Unavailable") : g.ethereum.certified ? t("Yes") : t("No"))}${website ? row(t("Website"), ext(website, t("Visit website"))) : ""}${row(votedLabel(), `<span data-guardian-voted="${escapeHTML(g.address)}">${guardianParticipation(g.address)}</span>`)}</dl>${[
      ["Ethereum", g.ethereum],
      ["Polygon", g.polygon],
    ]
      .map(([network, d]) =>
        d
          ? `<section class="guardian-chain-profile"><h3>${networkSymbol(network)} ${network}</h3><dl class="detail-list">${row(t("Effective stake"), liveNumber(d.effectiveStake) + " ORBS")}${row(t("Self stake"), liveNumber(d.selfStake) + " ORBS")}${row(t("Self stake ratio"), guardianSelfStakeRatio(d))}${row(t("Delegated stake"), liveNumber(d.delegatedStake) + " ORBS")}${row(t("Number of Delegators"), Number.isSafeInteger(posSources().status?.data?.[network.toLowerCase()]?.[g.address]) ? liveNumber(posSources().status.data[network.toLowerCase()][g.address]) : "0")}${row(t("Committee"), d.inCommittee ? t("Participating") : t("Not in committee"))}${row(t("Registered"), d.registrationTime ? new Date(d.registrationTime * 1000).toLocaleDateString(portalLocale()) : t("Unavailable"))}</dl></section>`
          : "",
      )
      .join(
        "",
      )}${!g.polygonKnown ? '<p class="muted">' + t("Polygon data temporarily unavailable.") + "</p>" : ""}${ext("https://analytics.orbs.network/ethereum/guardians/stake/" + g.address, t("Open Analytics"))}</div>`,
    true,
  );
}

function liveProposalModal(id) {
  const data = posSources().snapshot?.data;
  const p = [...(data?.proposals || []), ...(data?.activeProposals || [])].find(
    (p) => p.id === id,
  );
  if (!p) return;
  openModal(
    `<div class="eyebrow">${t("ORBS IMPROVEMENT PROPOSAL")}</div><h2 id="dialog-title">${escapeHTML(p.title)}</h2><div class="proposal-body">${p.bodyHtml || escapeHTML(p.body || t("No description provided."))}</div>${ext("https://snapshot.org/#/s:orbs-network.eth/proposal/" + p.id, t("Read and vote on Snapshot"))}`,
  );
}
let communityData = null,
  communityLoading = false,
  communityFetched = 0,
  communityError = false;
async function loadCommunity() {
  if (communityLoading || Date.now() - communityFetched < 600000) return;
  communityLoading = true;
  try {
    const response = await fetch("/api/community?v=3", {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw Error();
    const data = await response.json();
    if (!data.sources) throw Error();
    communityData = data;
    communityError = false;
  } catch {
    communityError = true;
  } finally {
    communityLoading = false;
    communityFetched = Date.now();
    if (location.hash === "#community") render();
  }
}
setInterval(() => {
  if (!document.hidden && location.hash === "#community") loadCommunity();
}, 30000);

let accountAddress = null,
  accountParts = {},
  accountGeneration = 0,
  accountAbort = null,
  walletImport = null;
const accountPartNames = [
  "ethereum",
  "polygon",
  "votes",
  "history-ethereum",
  "history-polygon",
];
function shortAddress(a) {
  return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
}
function loadWallet() {
  return (walletImport ??= import("/wallet.js").catch((e) => {
    walletImport = null;
    throw e;
  }));
}
async function connectWallet() {
  try {
    await loadWallet();
    await window.portalWallet.open();
  } catch {
    openModal(
      '<h2 id="dialog-title">' +
        t("Unable to open wallet connection") +
        "</h2><p>" +
        t("Please try again. Check that your browser can access Reown.") +
        "</p>",
    );
  }
}
async function loadAccountPart(part) {
  if (!accountAddress) return;
  const address = accountAddress,
    generation = accountGeneration;
  if (accountParts[part]?.loading) return;
  accountParts[part] = { ...accountParts[part], loading: true };
  try {
    const r = await fetch(`/api/account?address=${address}&part=${part}`, {
      signal: accountAbort.signal,
    });
    if (!r.ok) throw Error();
    const d = await r.json();
    if (generation !== accountGeneration || d.address !== accountAddress)
      return;
    accountParts[part] = { data: d.data, fetchedAt: Date.now() };
  } catch (e) {
    if (generation !== accountGeneration || e.name === "AbortError") return;
    accountParts[part] = { ...accountParts[part], loading: false, error: true };
  }
  if (location.hash === "#mypage") scheduleRender();
}
function setWalletAccount(address, userInitiated = false) {
  address = /^0x[0-9a-f]{40}$/i.test(address || "")
    ? address.toLowerCase()
    : null;
  if (address === accountAddress) return;
  accountAbort?.abort();
  accountGeneration++;
  accountAddress = address;
  state.connected = !!address;
  try {
    if (address) localStorage.setItem("orbs-portal-wallet-connected", "true");
    else localStorage.removeItem("orbs-portal-wallet-connected");
  } catch {}
  accountParts = {};
  accountAbort = new AbortController();
  document.querySelector("#wallet-dropdown")?.remove();
  if (address) {
    accountPartNames.forEach(loadAccountPart);
    loadOverview();
    if (userInitiated) location.hash = "mypage";
  }
  render();
}
window.addEventListener("portal-wallet-account", (e) =>
  setWalletAccount(e.detail.address, e.detail.userInitiated === true),
);

function toggleWalletMenu() {
  const old = $("#wallet-dropdown");
  if (old) {
    old.remove();
    $("#connect-wallet").setAttribute("aria-expanded", "false");
    return;
  }
  const menu = document.createElement("div");
  menu.id = "wallet-dropdown";
  menu.innerHTML =
    '<a href="#mypage">' +
    t("My Page") +
    '</a><button id="disconnect">' +
    t("Disconnect") +
    "</button>";
  $("#connect-wallet").parentElement.append(menu);
  $("#connect-wallet").setAttribute("aria-expanded", "true");
  menu.querySelector("a").focus();
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-account-retry]")) {
    loadAccountPart(
      e.target.closest("[data-account-retry]").dataset.accountRetry,
    );
    render();
  }
  if (
    !e.target.closest("#wallet-dropdown") &&
    !e.target.closest("#connect-wallet")
  ) {
    $("#wallet-dropdown")?.remove();
    $("#connect-wallet").setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#wallet-dropdown")) {
    $("#wallet-dropdown").remove();
    $("#connect-wallet").setAttribute("aria-expanded", "false");
    $("#connect-wallet").focus();
  }
});

let returnFocus;
function openModal(content, guardian = false) {
  returnFocus = document.activeElement;
  $("#portal-dialog").classList.toggle("guardian-modal", guardian);
  $("#dialog-content").innerHTML =
    `<button class="modal-close" data-close aria-label="${t("Close dialog")}">×</button>${content}`;
  $("#portal-dialog").showModal();
  observeGuardianAddresses();
  document.body.classList.add("modal-open");
}
function closeModal() {
  $("#portal-dialog").close();
}
$("#portal-dialog").addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (returnFocus?.isConnected) returnFocus.focus();
});
$("#portal-dialog").addEventListener("click", (e) => {
  if (e.target === $("#portal-dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});

function stakingModal() {
  openModal(
    `<div class="eyebrow">${t("Stake ORBS")}</div><h2 id="dialog-title">${t("Choose how to stake")}</h2><p class="muted">${t("Open Tetra on the web or get the mobile app.")}</p><div class="staking-options">${[
      [
        "Tetra Web",
        t("Open Tetra in your browser"),
        "https://staking.orbs.network/",
        0,
      ],
      [
        "Tetra Mobile for iOS",
        t("Get Tetra Mobile on the App Store"),
        "https://apps.apple.com/kr/app/tetra-mobile/id6453168712?l=en-GB",
        1,
      ],
      [
        "Tetra Mobile for Android",
        t("Get Tetra Mobile on Google Play"),
        "https://play.google.com/store/apps/details?id=com.orbs.pos.klip",
        2,
      ],
    ]
      .map(
        ([name, description, url, symbol]) =>
          `<a class="staking-option" href="${url}" target="_blank" rel="noopener noreferrer"><span class="platform-icon" aria-hidden="true">${stakingAppIcons[symbol]}</span><span><strong>${name}</strong><small>${description}</small></span><span aria-hidden="true">↗</span></a>`,
      )
      .join(
        "",
      )}</div><p class="muted staking-note">${t("Connect your wallet and select Ethereum or Polygon in Tetra. Tetra will ask you to connect separately.")}</p>`,
  );
}
let scheduledRender = 0;
function scheduleRender() {
  if (!scheduledRender)
    scheduledRender = requestAnimationFrame(() => {
      scheduledRender = 0;
      render();
    });
}
let participationData = null, participationLoading = false, participationFetched = 0, participationError = false;
async function loadParticipation() {
  if (participationLoading || Date.now()-participationFetched<600000) return;
  participationLoading=true;
  try {const r=await fetch('/api/participation?v=2',{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error();const data=await r.json();if(!Number.isInteger(data.total)||!data.counts)throw Error();participationData=data;participationError=false;}
  catch {participationError=true;}
  finally {participationLoading=false;participationFetched=Date.now();document.querySelectorAll('[data-guardian-voted]').forEach(el=>{el.innerHTML=guardianParticipation(el.dataset.guardianVoted);});if(location.hash==='#pos')scheduleRender();}
}
function guardianParticipation(address) {
  if(participationError)return `<span class="muted">${t("Unavailable")}</span>`;
  if(!participationData)return `<span class="muted">${t("Reading…")}</span>`;
  const guardian=guardianRows()?.find(g=>g.address===address.toLowerCase());
  const times=[guardian?.ethereum?.registrationTime,guardian?.polygon?.registrationTime].filter(time=>Number.isFinite(time)&&time>0);
  const result=participationSince(participationData,address,times.length?Math.min(...times):null);
  return result ? `${result.count} / ${result.total}` : `<span class="muted">${t("Unavailable")}</span>`;
}
setInterval(()=>{if(!document.hidden&&location.hash==='#pos')loadParticipation();},30000);
function render() {
  const route = location.hash.slice(1) || "overview";
  if (route === "community") loadCommunity();
  if (route === "pos") loadParticipation();
  if (["overview", "pos", "dao", "mypage"].includes(route)) loadOverview();
  const pages = { overview, pos, dao, community, mypage };
  const aliases = {
    dashboard: "mypage",
    guardians: "pos",
    governance: "dao",
    analysis: "pos",
    resources: "community",
    news: "community",
  };
  if (aliases[route]) {
    location.replace("#" + aliases[route]);
    return;
  }
  patchContent(
    $("#main"),
    pages[route]
      ? pages[route]()
      : heading(
          t("Page not found"),
          t("This page is not available."),
          '<a class="button" href="#overview">' +
            t("Back to Overview") +
            "</a>",
        ),
  );
  document.title = `${{ overview: t("Overview"), pos: "POS", dao: "DAO", community: t("Community"), mypage: t("My Page") }[route] || t("Not found")} · ORBS ${t("Community")} Portal`;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === route);
    if (a.dataset.nav === route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#connect-wallet").textContent = state.connected
    ? shortAddress(accountAddress) + " ▾"
    : t("Connect Wallet");
  $("#connect-wallet").setAttribute(
    "aria-label",
    state.connected
      ? t("Connected wallet: open account menu")
      : t("Connect Wallet"),
  );
  if ($("#guardian-search")) $("#guardian-search").value = state.search;
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("button");
  if (!el) return;
  if (el.id === "connect-wallet") {
    if (state.connected) toggleWalletMenu();
    else connectWallet();
  }
  if (el.id === "disconnect") {
    window.portalWallet
      ?.disconnect()
      .then(() => setWalletAccount(null))
      .catch(() =>
        openModal(
          '<h2 id="dialog-title">' +
            t("Unable to disconnect") +
            "</h2><p>" +
            t("Please try again.") +
            "</p>",
        ),
      );
  }
  if (el.hasAttribute("data-close")) closeModal();
  if (el.hasAttribute("data-stake")) stakingModal();
  if (el.dataset.guardian) liveGuardianModal(el.dataset.guardian);
  if (el.dataset.liveProposal) liveProposalModal(el.dataset.liveProposal);
  if (el.dataset.chart || el.dataset.period) {
    if (el.dataset.chart) state.chart = el.dataset.chart;
    if (el.dataset.period) state.period = el.dataset.period;
    patchContent($("#chart-content"), chart());
    $(
      `[data-${el.dataset.chart ? "chart" : "period"}="${el.dataset.chart || el.dataset.period}"]`,
    ).focus();
  }
  if (el.dataset.slide) {
    const track = $("#carousel-" + el.dataset.slide);
    track.scrollBy({
      left:
        Number(el.dataset.direction) *
        (track.firstElementChild.getBoundingClientRect().width + 18),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "guardian-search") {
    state.search = e.target.value;
    patchContent($("#guardian-list"), guardianList());
  }
});
const {
  overview,
  pos,
  dao,
  community,
  mypage,
  accountChain,
  accountVoting,
  accountHistorySection,
  accountStatus,
  accountAmount,
  accountGuardian,
  voteChoice,
  carousel,
  chart,
  guardianList,
  proposalSkeleton,
  proposalPreview,
  liveProposal,
  stakingStat,
  overviewValue,
  loadingValue,
} = createViews({
  t,
  icon,
  heading,
  ext,
  pill,
  stat,
  escapeHTML,
  liveNumber,
  stakeNumber,
  guardianRows,
  guardianAvatar,
  guardianParticipation,
  votedLabel,
  chartSeries,
  guardianSelfStakeRatio,
  shortAddress,
  copyAddressButton,
  metricLogos,
  networkSymbol,
  posSources,
  get state() {
    return state;
  },
  get overviewData() {
    return overviewData;
  },
  get overviewLoading() {
    return overviewLoading;
  },
  get overviewError() {
    return overviewError;
  },
  get communityData() {
    return communityData;
  },
  get communityLoading() {
    return communityLoading;
  },
  get communityError() {
    return communityError;
  },
  get accountAddress() {
    return accountAddress;
  },
  get accountParts() {
    return accountParts;
  },
});
let previousRoute = location.hash;
window.addEventListener("hashchange", () => {
  if ($("#portal-dialog").open) closeModal();
  if (location.hash === "#pos" && previousRoute !== "#pos") {
    state.search = "";
  }
  previousRoute = location.hash;
  render();
  window.scrollTo(0, 0);
  $("#main").focus({ preventScroll: true });
});
render();
// Theme and language preferences are stored locally; account data is not persisted here.
const themeMedia = matchMedia("(prefers-color-scheme: dark)");
let explicitTheme = false;
try {
  explicitTheme = ["light", "dark"].includes(
    localStorage.getItem("orbs-portal-theme"),
  );
} catch {}
function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === "dark";
  const label = dark ? t("Switch to light mode") : t("Switch to dark mode");
  $("#theme-toggle").setAttribute("aria-label", label);
  $("#theme-toggle").title = label;
}
$("#theme-toggle").addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  explicitTheme = true;
  try {
    localStorage.setItem("orbs-portal-theme", next);
  } catch {}
  updateThemeLabel();
});
themeMedia.addEventListener("change", (e) => {
  if (!explicitTheme) {
    document.documentElement.dataset.theme = e.matches ? "dark" : "light";
    updateThemeLabel();
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === "orbs-portal-theme") {
    explicitTheme = ["light", "dark"].includes(e.newValue);
    document.documentElement.dataset.theme = explicitTheme
      ? e.newValue
      : themeMedia.matches
        ? "dark"
        : "light";
    updateThemeLabel();
  }
});
updateThemeLabel();

document.addEventListener(
  "error",
  (e) => {
    if (e.target.matches?.(".social-thumbnail img")) {
      const a = e.target.closest(".social-thumbnail");
      if (
        ["announcements", "blog"].includes(a.dataset.socialKind) &&
        !e.target.dataset.logoFallback
      ) {
        e.target.dataset.logoFallback = "true";
        e.target.src =
          "https://www.orbs.com/marketing/brand-assets/orbs-logo-vertical.svg";
        e.target.alt = "Orbs logo";
        a.classList.add("social-logo-thumbnail");
        return;
      }
      a.classList.add("image-unavailable");
      a.textContent = t("View image in original post ↗");
    }
  },
  true,
);

function shouldRestoreWallet() {
  try {
    return (
      localStorage.getItem("orbs-portal-wallet-connected") === "true" ||
      localStorage.getItem("@appkit/connection_status") === "connected" ||
      !!localStorage.getItem("@appkit/eip155:connected_connector_id")
    );
  } catch {
    return false;
  }
}
if (shouldRestoreWallet()) loadWallet().catch(() => {});

setInterval(() => {
  if (state.connected && location.hash === "#mypage" && !document.hidden)
    accountPartNames.forEach((part) => {
      const p = accountParts[part];
      if (p?.data && Date.now() - p.fetchedAt >= 600000) loadAccountPart(part);
    });
}, 30000);

function copyAddressButton(address) {
  return `<button type="button" class="copy-address" data-copy-address="${escapeHTML(address)}" aria-label="${t("Copy address")}" title="${t("Copy address")}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button>`;
}
let addressToastTimer;
function addressToast(key) {
  document.querySelector("#address-toast")?.remove();
  clearTimeout(addressToastTimer);
  const toast = document.createElement("div");
  toast.id = "address-toast";
  toast.className = "address-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = t(key);
  const dialog = document.querySelector("#portal-dialog");
  (dialog.open
    ? document.querySelector("#dialog-content")
    : document.body
  ).append(toast);
  addressToastTimer = setTimeout(() => toast.remove(), 3000);
}
document.addEventListener("click", async (e) => {
  const button = e.target.closest("[data-copy-address]");
  if (!button) return;
  const address = button.dataset.copyAddress;
  if (!/^0x[0-9a-f]{40}$/i.test(address)) return;
  try {
    await navigator.clipboard.writeText(address);
    addressToast("Address copied to clipboard.");
  } catch {
    addressToast("Unable to copy. Please copy the address manually.");
  }
});

// Address observation is scoped and batched by the shared fitter.
const addressFitter = createAddressFitter();
function observeGuardianAddresses() {
  addressFitter.observe(document.querySelector("#main"));
  addressFitter.observe(document.querySelector("#dialog-content"));
}
observeGuardianAddresses();
new MutationObserver((records) => {
  if (
    records.some((r) =>
      [...r.addedNodes, ...r.removedNodes].some((n) => n.nodeType === 1),
    )
  )
    observeGuardianAddresses();
}).observe(document.querySelector("#main"), { childList: true, subtree: true });
document
  .querySelector("#portal-dialog")
  .addEventListener("close", () =>
    addressFitter.release(document.querySelector("#dialog-content")),
  );

// One title node instead of an SVG circle/title pair for each historical sample.
document.addEventListener("pointermove", (event) => {
  const chart = event.target.closest?.("[data-stake-chart]");
  if (!chart) return;
  const series = chartSeries();
  if (!series?.length) return;
  const box = chart.getBoundingClientRect(),
    x = ((event.clientX - box.left) / box.width) * 610,
    time =
      series[0].time +
      Math.max(0, Math.min(1, (x - 60) / 530)) *
        (series.at(-1).time - series[0].time);
  let lo = 0,
    hi = series.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (series[mid].time <= time) lo = mid;
    else hi = mid - 1;
  }
  const point = series[lo];
  const title = chart.querySelector(".chart-point-title");
  const text =
    new Date(point.time * 1000).toLocaleString(portalLocale()) +
    ": " +
    liveNumber(point.value) +
    " ORBS";
  if (title.textContent !== text) title.textContent = text;
});


function votedLabel() {
  return `${t("Voted")} <button type="button" class="voted-info" data-voted-info aria-label="${t("About voting participation")}" aria-expanded="false">i</button>`;
}
let votedInfoButton = null;
function closeVotedInfo() {
  document.getElementById('voted-tooltip')?.remove();
  votedInfoButton?.setAttribute('aria-expanded','false');
  votedInfoButton?.removeAttribute('aria-describedby');
  votedInfoButton = null;
}
document.addEventListener('click', event => {
  const button=event.target.closest('[data-voted-info]');
  if(!button){if(!event.target.closest('#voted-tooltip'))closeVotedInfo();return;}
  const wasOpen=button===votedInfoButton;
  closeVotedInfo();
  if(wasOpen)return;
  votedInfoButton=button;
  const tip=document.createElement('div');
  tip.id='voted-tooltip';tip.className='voted-tooltip';tip.setAttribute('role','tooltip');tip.setAttribute('popover','manual');
  tip.textContent=t("Proposals this guardian voted on / all proposals created since its earliest recorded guardian registration.");
  (button.closest('dialog') || document.body).append(tip);
  tip.showPopover?.();
  const rect=button.getBoundingClientRect(), box=tip.getBoundingClientRect();
  tip.style.left=Math.max(12,Math.min(rect.left,innerWidth-box.width-12))+'px';
  tip.style.top=(rect.bottom+8+box.height<=innerHeight-12?rect.bottom+8:Math.max(12,rect.top-box.height-8))+'px';
  button.setAttribute('aria-expanded','true');button.setAttribute('aria-describedby',tip.id);
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&votedInfoButton){event.preventDefault();event.stopImmediatePropagation();closeVotedInfo();}},true);
window.addEventListener('resize',closeVotedInfo);
document.addEventListener('scroll',closeVotedInfo,true);
document.addEventListener('close',closeVotedInfo,true);
window.addEventListener('hashchange',closeVotedInfo);
