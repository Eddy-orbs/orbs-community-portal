function computeGuardianRows(s) {
  const eth = s.ethereum?.data?.guardianDetails;
  if (!eth) return null;
  const pol = s.polygon?.data?.guardianDetails,
    byAddress = new Map((pol || []).map((g) => [g.address, g]));
  return eth
    .map((e) => {
      const p = byAddress.get(e.address);
      return {
        address: e.address,
        name: e.name,
        ethereum: e,
        polygon: p,
        polygonKnown: !!pol,
        total:
          pol && e.effectiveStake !== null && (!p || p.effectiveStake !== null)
            ? e.effectiveStake + (p?.effectiveStake || 0)
            : null,
      };
    })
    .sort(
      (a, b) =>
        (b.total ?? -1) - (a.total ?? -1) || a.address.localeCompare(b.address),
    )
    .map((g, i) => ({ ...g, rank: g.total === null ? null : i + 1 }));
}
function computeChartSeries(s, chart, period, now) {
  const get = (key) => {
    const d = s[key]?.data;
    if (!Array.isArray(d?.history)) return null;
    const a = d.history.map((x) => ({ ...x }));
    if (a.length && Number.isFinite(d.refTime) && d.refTime > a.at(-1).time)
      a.push({ time: d.refTime, value: a.at(-1).value });
    return a;
  };
  const eth = get("ethereum"),
    pol = get("polygon");
  let series;
  if (chart === "total") {
    if (!eth || !pol) return null;
    if (!eth.length || !pol.length) return [];
    const start = Math.max(eth[0].time, pol[0].time),
      end = Math.min(eth.at(-1).time, pol.at(-1).time);
    const times = [
      ...new Set(
        [...eth, ...pol, { time: start }, { time: end }].map((x) => x.time),
      ),
    ]
      .filter((t) => t >= start && t <= end)
      .sort((a, b) => a - b);
    let i = 0,
      j = 0;
    series = times.map((time) => {
      while (i + 1 < eth.length && eth[i + 1].time <= time) i++;
      while (j + 1 < pol.length && pol[j + 1].time <= time) j++;
      return { time, value: eth[i].value + pol[j].value };
    });
  } else series = chart === "Ethereum" ? eth : pol;
  if (!series?.length) return series;
  const cutoff = now - Number(period) * 86400;
  const before = series.filter((p) => p.time <= cutoff).at(-1);
  const filtered = series.filter((p) => p.time > cutoff);
  if (before && filtered.length)
    filtered.unshift({ time: cutoff, value: before.value });
  return filtered;
}
export function createPosModelCache() {
  let source = null,
    guardians = null;
  const series = new Map();
  return {
    guardians(data) {
      if (source !== data) {
        source = data;
        guardians = computeGuardianRows(data);
        series.clear();
      }
      return guardians;
    },
    series(data, chart, period, now = Date.now() / 1000) {
      this.guardians(data);
      const key = chart + ":" + period + ":" + Math.floor(now / 60);
      if (!series.has(key)) {
        if (series.size > 12) series.clear();
        series.set(key, computeChartSeries(data, chart, period, now));
      }
      return series.get(key);
    },
  };
}
