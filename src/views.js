import { overviewSymbols } from "./overview-symbols.js";
// Page markup is isolated from loading, wallet and navigation side effects.
export function createViews(context) {
  const {
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
  } = context;
  function loadingValue(label) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    return `<span class="loading-value" role="status"><span class="overview-skeleton" aria-hidden="true"></span><span class="loading-caption">${label}</span></span>`;
  }
  function overviewValue(value, kind = "reading", compact = false) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    if (Number.isFinite(value))
      return compact ? stakeNumber(value) : liveNumber(value);
    return overviewLoading
      ? loadingValue(kind === "calculating" ? t("Calculating…") : t("Reading…"))
      : '<span class="loading-caption">' + t("Unavailable") + "</span>";
  }
  function proposalSkeleton() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    return `<article class="proposal-card proposal-loading" aria-busy="true" aria-label="${t("Latest Snapshot proposal loading")}"><span class="muted">${t("Latest Snapshot proposal")}</span><div class="proposal-heading-placeholder"><span class="overview-skeleton" aria-hidden="true"></span><span class="loading-caption" role="status">${t("Reading proposal…")}</span></div><div class="results-loading" role="status"><span class="loading-caption">${t("Loading results…")}</span><div aria-hidden="true">${Array.from({ length: 3 }, () => '<div class="result-placeholder"><span class="overview-skeleton result-label-placeholder"></span><span class="overview-skeleton result-bar-placeholder"></span></div>').join("")}</div></div></article>`;
  }
  function proposalPreview(p) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const template = document.createElement("template");
    template.innerHTML = (p.bodyHtml || "").replace(
      /<\/(?:p|h[1-6]|li|blockquote|pre|tr|td|th)>|<br\s*\/?>/gi,
      " ",
    );
    const text = (template.content.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 260) + (text.length > 260 ? "…" : "");
  }
  function liveProposal(
    source,
    label = t("Latest Snapshot proposal"),
    details = false,
  ) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    if (!source?.data)
      return overviewLoading
        ? proposalSkeleton()
        : '<p class="muted">' +
            t("Latest proposal temporarily unavailable.") +
            "</p>";
    const p = source.data.proposal;
    if (!p) return "<h2>" + t("No proposals yet") + "</h2>";
    return `<article class="proposal-card ${p.state === "active" ? "active-vote" : ""}">${details ? `<div class="proposal-title-row"><h2>${escapeHTML(p.title)}</h2>${pill(escapeHTML(p.state === "active" ? t("Active") : p.state === "closed" ? t("Closed") : p.state === "pending" ? t("Upcoming") : p.state))}</div>` : `<div class="section-head"><span class="muted">${escapeHTML(label)}</span>${pill(escapeHTML(p.state === "active" ? t("Active") : p.state === "closed" ? t("Closed") : p.state === "pending" ? t("Upcoming") : p.state))}</div><h2>${escapeHTML(p.title)}</h2>`}${details && p.body ? `<p class="proposal-excerpt">${escapeHTML(proposalPreview(p))}</p>` : ""}<p class="muted">${new Date(p.start * 1000).toLocaleDateString(portalLocale())} – ${new Date(p.end * 1000).toLocaleDateString(portalLocale())}</p><div class="live-results">${p.choices
      .map((choice, i) => {
        const pct =
          p.scores_total > 0
            ? Math.min(100, (p.scores[i] / p.scores_total) * 100)
            : 0;
        return `<div class="live-choice"><div><span>${escapeHTML(choice)}</span><span>${pct.toFixed(1)}%</span></div><progress value="${pct}" max="100" aria-label="${escapeHTML(choice)}"></progress><small class="muted">${liveNumber(p.scores[i])} ${t("voting power")}</small></div>`;
      })
      .join(
        "",
      )}</div><div class="proposal-bottom"><span class="muted">${liveNumber(p.votes)} ${t("voters")} · ${p.state === "closed" ? t("Final scores") : t("Current scores")}</span>${details ? `<button class="text-button" data-live-proposal="${p.id}">${t("View summary →")}</button>` : ""}${ext("https://snapshot.org/#/s:orbs-network.eth/proposal/" + p.id, t("View on Snapshot"))}</div></article>`;
  }
  function stakingStat(label, value, unit, kind) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    return `<div class="staking-stat" aria-busy="${value.includes("loading-value")}"><span class="staking-watermark staking-watermark-${kind}" aria-hidden="true">${overviewSymbols[kind]}</span><div class="staking-stat-label"><span>${label}</span></div><div class="metric-value">${value}${unit && !value.includes("loading-caption") ? ` <small>${unit}</small>` : ""}</div></div>`;
  }
  function overview() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const sources = overviewData?.sources || {},
      eth = sources.ethereum,
      pol = sources.polygon,
      del = sources.delegators;
    const total =
      eth?.data && pol?.data ? eth.data.stake + pol.data.stake : null;
    return `<section class="section network-overview">${heading(t("Orbs network"), t("Staking status"), '<a class="button outline" href="#pos">' + t("Explore POS →") + "</a>")}${overviewError || Object.values(sources).some((s) => s.error || s.data?.stale) ? '<p class="muted">' + t("Some data is temporarily unavailable or delayed.") + "</p>" : ""}<div class="hero-stats">${stakingStat(t("Total staked"), overviewValue(total, "calculating", true), "ORBS", "orbs")}${stakingStat("Ethereum", overviewValue(eth?.data?.stake, "calculating", true), "ORBS", "ethereum")}${stakingStat("Polygon", overviewValue(pol?.data?.stake, "calculating", true), "ORBS", "polygon")}${stakingStat(t("Registered guardians"), overviewValue(eth?.data?.guardians), "", "guardian")}</div></section><section class="section dao-overview">${heading(t("Community governance"), t("DAO operation"), '<a class="button outline" href="#dao">' + t("Explore DAO →") + "</a>")}<div class="grid dao-grid"><div class="card participant-card">${stat(t("DAO participants"), overviewValue(del?.data?.count), "", "people")}<p class="muted">${t("Unique delegators across Ethereum and Polygon")}</p></div><div class="card">${liveProposal(sources.snapshot)}</div></div></section>`;
  }
  function chart() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const series = chartSeries();
    const controls = `<div class="section-head"><div><h2>${t("Staked ORBS over time")}</h2><span class="muted">${t("Committee effective stake · ORBS")}</span></div><div class="tabs">${["7", "30", "60"].map((n) => `<button data-period="${n}" aria-pressed="${n === state.period}" class="${n === state.period ? "active" : ""}">${t("{days}d", { days: n })}</button>`).join("")}</div></div><div class="tabs chart-networks" aria-label="${t("Chart network")}">${[
      ["total", t("Combined")],
      ["Ethereum", "Ethereum"],
      ["Polygon", "Polygon"],
    ]
      .map(
        ([v, l]) =>
          `<button data-chart="${v}" aria-pressed="${state.chart === v}" class="${state.chart === v ? "active" : ""}">${l}</button>`,
      )
      .join("")}</div>`;
    if (!series)
      return (
        controls +
        `<div class="pos-chart-placeholder" role="status">${overviewLoading ? '<span class="overview-skeleton" aria-hidden="true"></span>' + t("Loading chart…") + "" : t("Chart temporarily unavailable.")}</div>`
      );
    if (!series.length)
      return (
        controls +
        ('<div class="pos-chart-placeholder">' +
          t("No history available for this period.") +
          "</div>")
      );
    const low = Math.min(...series.map((p) => p.value)),
      high = Math.max(...series.map((p) => p.value)),
      pad = Math.max((high - low) * 0.12, high * 0.002, 1),
      min = low - pad,
      max = high + pad,
      first = series[0].time,
      last = series.at(-1).time;
    const x = (t) => 60 + ((t - first) / Math.max(1, last - first)) * 530,
      y = (v) => 185 - ((v - min) / (max - min)) * 160;
    let path = `M${x(first)},${y(series[0].value)}`;
    for (const p of series.slice(1)) path += `H${x(p.time)}V${y(p.value)}`;
    const date = (t) =>
      new Date(t * 1000).toLocaleDateString(portalLocale(), {
        month: "short",
        day: "numeric",
      });
    return (
      controls +
      `<svg class="chart pos-chart" data-stake-chart viewBox="0 0 610 210" role="img" aria-label="${t("{network} committee effective stake from {start} to {end}", { network: state.chart === "total" ? t("Combined") : state.chart, start: date(first), end: date(last) })}"><title class="chart-point-title"></title><defs><linearGradient id="area" x2="0" y2="1"><stop stop-opacity=".22"/><stop offset="1" stop-opacity="0"/></linearGradient></defs>${[min, (min + max) / 2, max].map((v) => `<line x1="60" y1="${y(v)}" x2="590" y2="${y(v)}" stroke-dasharray="4 6"/><text x="52" y="${y(v) + 4}" text-anchor="end" fill="currentColor" font-size="10">${stakeNumber(v)}</text>`).join("")}<path d="${path}L${x(last)},195L60,195Z" fill="url(#area)"/><path d="${path}" fill="none" stroke="var(--blue)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="chart-labels"><span>${date(first)}</span><span>${date(last)} · ${stakeNumber(series.at(-1).value)} ORBS</span></div>`
    );
  }
  function guardianList() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const all = guardianRows();
    if (!all)
      return `<div class="pos-chart-placeholder" role="status">${overviewLoading ? loadingValue(t("Reading guardians…")) : t("Guardian directory temporarily unavailable.")}</div>`;
    const list = all.filter((g) =>
      (g.name + " " + g.address)
        .toLowerCase()
        .includes(state.search.toLowerCase()),
    );
    return `<p class="muted">${list.length} ${t("guardians · Ethereum registry · Ranked by combined effective stake")}</p>${!posSources().polygon?.data ? '<p class="muted">' + t("Polygon data unavailable. Combined rankings cannot be calculated.") + "</p>" : ""}<div class="guardian-table"><div class="guardian-table-head"><span>${t("Rank / Guardian")}</span><span>${t("Effective stake")}</span><span>${t("Self Stake ratio")}</span><span>${votedLabel()}</span><span>${t("Profile")}</span></div>${list.map((g) => `<article class="guardian-row"><div class="guardian-name"><span class="rank">${g.rank ? "#" + g.rank : "—"}</span>${guardianAvatar(g.address, g.name)}<div><h3>${escapeHTML(g.name)}</h3><span class="muted guardian-address"><span class="guardian-address-text" data-full-address="${escapeHTML(g.address)}" title="${escapeHTML(g.address)}">${escapeHTML(g.address)}</span>${copyAddressButton(g.address)}</span></div></div><div class="guardian-stakes"><span class="mobile-label">${t("Effective stake")}</span><div>${networkSymbol("Ethereum")}<span>${stakeNumber(g.ethereum.effectiveStake)} ORBS</span></div>${g.polygon ? `<div>${networkSymbol("Polygon")}<span>${stakeNumber(g.polygon.effectiveStake)} ORBS</span></div>` : !g.polygonKnown ? '<span class="muted">' + t("Polygon unavailable") + "</span>" : ""}</div><div class="guardian-ratios"><span class="mobile-label">${t("Self Stake ratio")}</span><div>${networkSymbol("Ethereum")}<span>${guardianSelfStakeRatio(g.ethereum)}</span></div>${g.polygon ? `<div>${networkSymbol("Polygon")}<span>${guardianSelfStakeRatio(g.polygon)}</span></div>` : !g.polygonKnown ? `<span class="muted">${t("Polygon unavailable")}</span>` : ""}</div><div class="guardian-voted"><span class="mobile-label">${votedLabel()}</span><span>${guardianParticipation(g.address)}</span></div><button class="button outline small" data-guardian="${g.address}" data-network="Ethereum">${t("Guardian Profile")}</button></article>`).join("") || '<div class="empty">' + t("No guardians match your search.") + "</div>"}</div>`;
  }
  function pos() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const s = posSources(),
      e = s.ethereum?.data,
      p = s.polygon?.data,
      total = e && p ? e.stake + p.stake : null;
    return `${heading(t("Proof of stake"), t("POS Dashboard"))}${overviewError || Object.values(s).some((x) => x.error || x.data?.stale) ? '<p class="muted">' + t("Some data is temporarily unavailable or delayed.") + "</p>" : ""}<section class="grid pos-hero section"><div class="card" id="chart-content">${chart()}</div><div class="card pos-totals"><div class="total-stake"><img class="pos-orbs-logo" src="${metricLogos.orbs}" alt="" width="36" height="36"><span class="metric-label">${t("Total staked")}</span><div class="metric-value">${overviewValue(total, "calculating", true)}${total !== null ? " <small>ORBS</small>" : ""}</div></div><dl class="detail-list"><div><dt>${t("Registered guardians")}</dt><dd>${overviewValue(e?.guardians)}</dd></div><div><dt>${t("Number of Delegators")}</dt><dd>${overviewValue(s.delegators?.data?.count)}</dd></div></dl></div></section><section class="card section pos-join"><h2>${t("Join Orbs PoS Universe")}</h2><div class="pos-join-actions"><a class="button outline guardian-join-button" href="https://orbs-doc.gitbook.io/pos/orbs-pos-universe/becoming-the-guardian" target="_blank" rel="noopener noreferrer">${t("Become a Guardian")} ↗</a><a class="button outline guardian-join-button" href="https://orbs-doc.gitbook.io/pos/orbs-pos-universe/becoming-the-delegator" target="_blank" rel="noopener noreferrer">${t("Become a Delegator")} ↗</a></div></section><section class="card"><div class="section-head"><div><div class="eyebrow">${t("Guardian directory")}</div><h2>${t("Explore the operators")}</h2></div></div><div class="toolbar"><input type="search" id="guardian-search" placeholder="${t("Search guardians or address")}" aria-label="${t("Search guardians")}"></div><div id="guardian-list">${guardianList()}</div></section>`;
  }
  function dao() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const source = posSources().snapshot,
      data = source?.data;
    const intro = heading(t("DAO governance"), t("VOTE, Make together"));
    if (!data)
      return `${intro}<section class="card">${overviewLoading ? proposalSkeleton() : '<p class="muted">' + t("Proposals temporarily unavailable.") + "</p>"}</section>`;
    const active = data.activeProposals || [],
      latest = data.proposals || [];
    return `${intro}${source.error || overviewError ? '<p class="muted">' + t("Unable to refresh proposals. Showing last available results.") + "</p>" : ""}${active.length ? `<section class="section dao-active-section"><div class="section-head"><div><div class="eyebrow">${t("Voting is open")}</div><h2>${t("Active proposals")}</h2></div></div><div class="dao-proposal-cards">${active.map((p) => liveProposal({ data: { proposal: p } }, t("Active proposal"), true).replace('class="proposal-card ', 'class="card dao-proposal-card proposal-card ')).join("")}</div></section>` : '<p class="muted dao-no-active">' + t("No active proposals at the moment.") + "</p>"}<section class="section dao-latest-section"><div class="section-head"><h2>${t("Latest 6 proposals")}</h2>${ext("https://snapshot.org/#/s:orbs-network.eth", t("See all proposals"))}</div><div class="proposal-list dao-proposal-cards">${latest.length ? latest.map((p) => liveProposal({ data: { proposal: p } }, "Snapshot proposal", true).replace('class="proposal-card ', 'class="card dao-proposal-card proposal-card ')).join("") : '<p class="muted">' + t("No proposals yet") + ".</p>"}</div></section>`;
  }
  function carousel(kind, title, source, url) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const feed = communityData?.sources?.[kind],
      posts = feed?.posts || [];
    const loading = communityLoading && !feed;
    return `<section class="section"><div class="section-head"><div><div class="eyebrow">${source}</div><h2>${title}</h2></div>${posts.length ? `<div class="carousel-controls"><button class="button outline small" data-slide="${kind}" data-direction="-1" aria-label="${t("Previous")} ${title}">←</button><button class="button outline small" data-slide="${kind}" data-direction="1" aria-label="${t("Next")} ${title}">→</button></div>` : ""}</div>${(feed?.error || communityError) && !posts.length ? `<p class="muted">${t("This feed is temporarily unavailable.")} ${ext(url, t("Visit official channel"))}</p>` : ""}<div class="carousel" id="carousel-${kind}" role="region" aria-label="${title}" tabindex="0">${loading ? Array.from({ length: 3 }, () => '<article class="card social-card" aria-busy="true"><div class="overview-skeleton social-image-skeleton" aria-hidden="true"></div><span class="loading-caption" role="status">' + t("Reading posts…") + '</span><div class="overview-skeleton" aria-hidden="true"></div></article>').join("") : posts.map((post, i) => `<article class="card social-card live-social-card"><div class="section-head"><span class="social-icon">${kind === "blog" ? `<img src="${metricLogos.orbs}" width="28" height="28" alt="Orbs">` : '<svg class="telegram-logo" viewBox="0 0 24 24" role="img" aria-label="Telegram"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path d="M5.1 11.8 18 6.9c.6-.2 1.1.1.9.9l-2.2 10.4c-.2.7-.6.9-1.2.5l-3.4-2.5-1.6 1.5c-.2.2-.3.3-.6.3l.2-3.5 6.4-5.8c.3-.2-.1-.4-.4-.2l-7.9 5-3.4-1.1c-.7-.2-.7-.6.3-.6Z" fill="white"/></svg>'}</span>${pill(`${i + 1} / ${posts.length}`, "gray")}</div><time class="muted" datetime="${escapeHTML(post.date)}">${new Date(post.date).toLocaleDateString(portalLocale(), { year: "numeric", month: "short", day: "numeric" })}${post.repost ? " · Repost" : ""}</time>${post.image ? `<a class="social-thumbnail ${post.imageSource === "logo" ? "social-logo-thumbnail" : ""}" data-social-kind="${kind}" href="${escapeHTML(post.url)}" target="_blank" rel="noopener noreferrer" aria-label="${t("Open post image")}"><img src="${escapeHTML(post.image)}" alt="${escapeHTML(source + " post image")}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${post.imageCount > 1 ? `<span class="social-image-count">+${post.imageCount - 1}</span>` : ""}</a>` : ""}<p class="social-post-text">${escapeHTML(post.text)}</p><div class="social-footer">${ext(post.url, kind === "blog" ? t("Read article") : t("Read on Telegram"))}</div></article>`).join("")}${!loading && posts.length ? `<a class="card social-card social-more-card" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="${t("View more on")} ${kind === "blog" ? "Orbs Blog" : "Telegram"}"><span>${t("View more ↗")}</span></a>` : ""}</div></section>`;
  }
  function community() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    return `${heading(t("Orbs community"), t("Stay connected"))}<section class="card section join-community"><div><div class="eyebrow">${t("Join the conversation")}</div><h2>${t("There is a place for every voice.")}</h2><p class="muted">${t("Ask questions, exchange ideas and help shape the Orbs community.")}</p></div><div class="community-links"><div class="community-language-group"><h3><span aria-hidden="true">🇬🇧</span> ${t("Global")}</h3>${ext("https://t.me/OrbsNetwork", t("Global Telegram"))}${ext("https://t.me/OrbsAnnouncements", t("Global announcements"))}${ext("https://discord.gg/sswGDYGBt5", "Discord")}${ext("https://twitter.com/orbs_network", t("Official X"))}</div><div class="community-language-group"><h3><span aria-hidden="true">🇰🇷</span> 한국어</h3>${ext("https://t.me/orbskr", t("Korean Telegram"))}${ext("https://t.me/orbskrannouncement", t("Korean announcements"))}</div><div class="community-language-group"><h3><span aria-hidden="true">🇯🇵</span> 日本語</h3>${ext("https://t.me/orbsjpannouncements", t("Japanese announcements"))}</div></div><div class="community-all-channels">${ext("https://www.orbs.com/contact/", t("All community channels"))}</div></section>${carousel("announcements", t("Latest announcements"), "Orbs Announcements", "https://t.me/OrbsAnnouncements")}${carousel("blog", t("Latest from the blog"), "Orbs Blog", "https://www.orbs.com/blog/")}`;
  }
  function accountStatus(part) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    return accountParts[part]?.error
      ? '<p class="muted">' +
          t("Unable to read this data.") +
          ' <button class="text-button" data-account-retry="' +
          part +
          ('">' + t("Retry") + "</button></p>")
      : '<div class="skeleton short"></div><p class="muted" role="status">' +
          t("Reading…") +
          "</p>";
  }
  function accountAmount(v) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    if (v == null) return '<span class="muted">' + t("Unavailable") + "</span>";
    return `<span title="${escapeHTML(v)} ORBS">${stakeNumber(Number(v))} <small>ORBS</small></span>`;
  }
  function accountGuardian(d, network) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    if (!d.guardian) return t("Unavailable");
    if (/^0x0{40}$/.test(d.guardian)) return t("Not delegated");
    if (
      d.guardian === accountAddress &&
      !guardianRows()?.some((g) => g.address === d.guardian)
    )
      return t("No delegated guardian");
    const g = guardianRows()?.find((g) => g.address === d.guardian);
    if (g)
      return `<button class="text-button" data-guardian="${d.guardian}" data-network="${network}">${guardianAvatar(g.address, g.name)}${escapeHTML(g.name)} ↗</button>`;
    return ext(
      `https://analytics.orbs.network/${network.toLowerCase()}/guardians/stake/${d.guardian}`,
      shortAddress(d.guardian),
    );
  }
  function accountChain(network) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const key = network.toLowerCase(),
      d = accountParts[key]?.data;
    return `<article class="card wallet-chain"><div class="section-head"><h3>${networkSymbol(network)} ${network}</h3></div>${!d ? accountStatus(key) : `<span class="metric-label">${t("Staked ORBS")}</span><div class="metric-value">${accountAmount(d.staked)}</div><dl class="detail-list"><div><dt>${t("Unlocking")}</dt><dd>${accountAmount(d.unlocking)}</dd></div><div><dt>${t("Available to withdraw")}</dt><dd>${d.unlocking == null ? t("Unavailable") : Number(d.unlocking) > 0 ? (d.unlockTime * 1000 <= Date.now() ? t("Ready to withdraw") : escapeHTML(new Date(d.unlockTime * 1000).toLocaleString(portalLocale()))) : t("No pending unlock")}</dd></div><div><dt>${t("Wallet balance")}</dt><dd>${accountAmount(d.balance)}</dd></div><div><dt>${t("Delegated guardian")}</dt><dd>${accountGuardian(d, network)}</dd></div><div><dt>${t("Current rewards")}</dt><dd>${accountAmount(d.currentRewards)}</dd></div><div><dt>${t("Claimed rewards")}</dt><dd>${accountAmount(d.claimedRewards)}</dd></div><div><dt>${t("Total rewards")}</dt><dd>${accountAmount(d.totalRewards)}</dd></div></dl>`}</article>`;
  }
  function voteChoice(v) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const choices = v.proposal.choices || [],
      name = (i) => choices[Number(i) - 1] || String(i);
    if (Array.isArray(v.choice)) return v.choice.map(name).join(", ");
    if (v.choice && typeof v.choice === "object")
      return Object.entries(v.choice)
        .map(([i, n]) => `${name(i)}: ${n}`)
        .join(", ");
    return name(v.choice);
  }
  function accountVoting() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const votes = accountParts.votes?.data;
    return `<section class="card section"><div class="section-head"><h2>${t("My voting participation")}</h2>${ext("https://snapshot.org/#/profile/" + accountAddress, t("View more on Snapshot"))}</div><p class="muted">${t("Your latest 5 votes in Orbs governance")}</p>${!votes ? accountStatus("votes") : votes.length ? votes.map((v) => `<article class="account-vote"><div class="section-head"><h3>${escapeHTML(v.proposal.title)}</h3>${pill(escapeHTML(t({ active: "Active", closed: "Closed", pending: "Upcoming" }[v.proposal.state] || v.proposal.state)))}</div><p>${t("Your choice:")} ${escapeHTML(voteChoice(v))}</p><div class="section-head"><span class="muted">${escapeHTML(new Date(v.created * 1000).toLocaleDateString(portalLocale()))} · ${t("Voting power:")} ${liveNumber(v.vp)}</span>${ext("https://snapshot.org/#/s:orbs-network.eth/proposal/" + encodeURIComponent(v.proposal.id), t("View proposal"))}</div></article>`).join("") : '<p class="muted">' + t("No votes found for this address in Orbs governance.") + "</p>"}</section>`;
  }
  function accountHistorySection(network) {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    const part = "history-" + network.toLowerCase(),
      d = accountParts[part]?.data;
    return `<article class="card"><h3>${networkSymbol(network)} ${network}</h3>${!d ? accountStatus(part) : d.events.length ? `<div class="account-history">${d.events.map((e) => `<div class="account-event"><div><span>${escapeHTML(t(e.type))}</span><small class="muted">${escapeHTML(new Date(Number(e.blockTimestamp) * 1000).toLocaleDateString(portalLocale()))}</small></div><div>${e.amount != null ? accountAmount(e.amount) : escapeHTML(shortAddress(e.to))}<small>${ext("https://" + (network === "Ethereum" ? "etherscan.io" : "polygonscan.com") + "/tx/" + e.transactionHash, t("Transaction"))}</small></div></div>`).join("")}</div>` : '<p class="muted">' + t("No indexed staking activity found for this address.") + "</p>"}</article>`;
  }
  function mypage() {
    const {
      state,
      overviewData,
      overviewLoading,
      overviewError,
      communityData,
      communityLoading,
      communityError,
      accountAddress,
      accountParts,
    } = context;

    if (!state.connected)
      return `${heading(t("My page"), t("Your place in the network."))}<section class="locked-page"><div class="skeleton-layout" aria-hidden="true"><div class="grid resource-grid">${Array.from({ length: 4 }, () => '<div class="card"><div class="skeleton short"></div><div class="skeleton tall"></div><div class="skeleton"></div></div>').join("")}</div></div><div class="connect-prompt">${icon("stake")}<h2>${t("Connect your wallet to see your participation.")}</h2><p>${t("Use Connect Wallet in the top-right corner.")}</p><span class="muted">${t("Read-only access. No signature or transaction required.")}</span></div></section>`;
    return `${heading(t("My page"), t("Welcome to Orbs Universe"))}<div class="account-address account-address-pill"><span class="account-address-label">My Address:</span><span class="account-address-value guardian-address-text" data-full-address="${escapeHTML(accountAddress)}" title="${escapeHTML(accountAddress)}">${escapeHTML(accountAddress)}</span>${copyAddressButton(accountAddress)}</div><section class="section"><div class="section-head"><h2>${t("My staking")}</h2></div><div class="grid resource-grid">${accountChain("Ethereum")}${accountChain("Polygon")}</div><button class="button stake-cta" data-stake><span class="stake-orbs-logo" aria-hidden="true"></span><span>${t("Stake ORBS now!")}</span><span aria-hidden="true">↗</span></button></section>${accountVoting()}<section class="section"><div class="section-head"><h2>${t("My staking activity")}</h2><span class="muted">${t("Latest 50 indexed events per network")}</span></div><div class="grid resource-grid">${accountHistorySection("Ethereum")}${accountHistorySection("Polygon")}</div></section>`;
  }
  return {
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
  };
}
