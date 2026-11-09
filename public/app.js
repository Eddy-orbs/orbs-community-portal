// participation-model.mjs
function participationSince(data, address, registeredAt) {
  if (!Number.isFinite(registeredAt) || registeredAt <= 0 || !Array.isArray(data?.proposals) || !data?.votedProposalIds) return null;
  const eligible = new Set(data.proposals.filter((p) => p.created >= registeredAt).map((p) => p.id));
  const voted = new Set(data.votedProposalIds[String(address).toLowerCase()] || []);
  return { total: eligible.size, count: [...voted].filter((id) => eligible.has(id)).length };
}

// guardian-colors.mjs
var GUARDIAN_PALETTE = ["#7A89E9", "#DC8AE0", "#63DDB5", "#49AAFF", "#FFADAE", "#A17AE9", "#2CEDFC", "#3346F2", "#C6DC82", "#AB83B5", "#36C9CA", "#E998BD", "#B99DEE", "#35B8A6", "#6298DD", "#E8AF7D", "#B56BBC", "#A6C98B", "#7DA6BC", "#CC789E", "#92D6C8", "#DDC477"];
var DEFAULT_GUARDIAN_COLOR = "#89849A";
var colorForRank = (rank) => Number.isInteger(rank) && rank > 0 && rank <= 22 ? GUARDIAN_PALETTE[rank - 1] : DEFAULT_GUARDIAN_COLOR;
function committeeColorMap(snapshots = []) {
  const latest = snapshots.filter((s) => Number.isFinite(s.block_time)).sort((a, b) => a.block_time - b.block_time).at(-1);
  const rows = (latest?.data || []).filter((g) => /^0x[a-f0-9]{40}$/i.test(g.address) && Number.isFinite(g.effective_stake) && g.effective_stake >= 0).map((g) => ({ ...g, address: g.address.toLowerCase() })).sort((a, b) => b.effective_stake - a.effective_stake || a.address.localeCompare(b.address));
  let rank = 0;
  return new Map(rows.map((g, i) => {
    if (i === 0 || g.effective_stake !== rows[i - 1].effective_stake) rank = i + 1;
    return [g.address, { rank, color: colorForRank(rank) }];
  }));
}
var guardianColor = (map, address) => map.get(String(address).toLowerCase())?.color || DEFAULT_GUARDIAN_COLOR;
var guardianInitials = (name) => String(name || "").trim().split(/\s+/).filter(Boolean).map((word) => Array.from(word)[0]).join("").slice(0, 2).toUpperCase() || "OR";

// src/overview-symbols.js
var overviewSymbols = {
  "orbs": '<svg viewBox="0 0 34 34" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10.0001 21.619C9.90131 21.9927 9.58009 22.0831 9.29594 21.8179L3.65609 16.6833C3.36576 16.4181 3.42753 16.0866 3.79816 15.942L11.7113 12.8564C12.0819 12.7117 12.2981 12.9046 12.1993 13.2782L10.0001 21.619Z"/><path d="M5.34248 26.5006C5.0398 26.7537 4.73711 26.6512 4.66916 26.2655L3.12484 17.9187C3.05689 17.539 3.23603 17.4426 3.52636 17.7078L8.89442 22.5953C9.18475 22.8605 9.17857 23.2824 8.87588 23.5355L5.34248 26.5006Z"/><path d="M11.8163 11.193C12.0757 11.4883 11.9831 11.8439 11.6186 11.9885L3.74875 15.0561C3.37811 15.2007 3.19279 15.0199 3.32869 14.6583L6.55941 6.18493C6.69531 5.82334 7.0227 5.76307 7.28215 6.05837L11.8163 11.193Z"/><path d="M3.57578 25.0783C3.64373 25.458 3.52636 25.5062 3.31016 25.1807L0.258587 20.5825C0.0423823 20.257 0.060914 19.7387 0.29565 19.4253L1.66083 17.6415C1.89556 17.3341 2.14883 17.3884 2.22296 17.768L3.57578 25.0783Z"/><path d="M2.61213 14.14C2.47623 14.5016 2.26002 14.5016 2.1303 14.134L1.08634 11.0845C0.962796 10.7169 1.0987 10.2047 1.39521 9.94552L5.11392 6.66103C5.41043 6.40189 5.53398 6.48626 5.39808 6.84786L2.61213 14.14Z"/><path d="M1.62994 15.3152C1.75349 15.6828 1.66701 16.2373 1.42609 16.5446L0.363601 17.9428C0.128864 18.2502 -0.031745 18.1899 0.00531862 17.8042L0.518032 12.9588C0.561273 12.5731 0.697173 12.5611 0.820719 12.9287L1.62994 15.3152Z"/><path d="M5.82431 4.40709C5.95403 4.55775 5.82431 4.88922 5.5278 5.15439L3.85994 6.6309C3.56343 6.89004 3.52019 6.84786 3.75492 6.5405L5.15716 4.70239C5.3919 4.38901 5.69459 4.25642 5.82431 4.40709Z"/><path d="M16.3751 30.1888C16.1774 30.5203 15.8253 30.5384 15.6029 30.219L11.2294 24.0116C11.007 23.6922 11.1429 23.3969 11.5383 23.3607L20.3224 22.4748C20.7177 22.4326 20.8783 22.6737 20.6745 23.0112L16.3751 30.1888Z"/><path d="M14.5466 30.1949C14.769 30.5143 14.6455 30.671 14.2748 30.5504L6.04052 27.8204C5.6637 27.6938 5.60193 27.3865 5.90462 27.1334L9.43184 24.1683C9.73453 23.9152 10.1608 23.9694 10.3893 24.2888L14.5466 30.1949Z"/><path d="M20.5077 21.0344C20.7671 21.3297 20.6559 21.6009 20.2606 21.6431L11.3468 22.5411C10.9514 22.5833 10.7105 22.3061 10.8094 21.9324L13.0394 13.4651C13.1382 13.0914 13.4285 13.0251 13.688 13.3144L20.5077 21.0344Z"/><path d="M26.9073 28.2905C27.1668 28.5858 27.0618 28.8871 26.6726 28.9715L17.6044 30.8337C17.2152 30.912 17.0608 30.7071 17.2646 30.3696L21.5393 23.2342C21.737 22.9027 22.1138 22.8665 22.3732 23.1618L26.9073 28.2905Z"/><path d="M12.3228 33.0515C11.9707 33.2323 11.4456 33.172 11.1491 32.9189L6.93622 29.2909C6.63971 29.0317 6.70148 28.9293 7.0783 29.0498L14.281 31.4363C14.6578 31.5629 14.6763 31.81 14.3304 31.9968L12.3228 33.0515Z"/><path d="M22.1014 33.395C21.7926 33.6421 21.2551 33.6963 20.8969 33.5215L17.9627 32.0631C17.6105 31.8883 17.6353 31.6774 18.0244 31.5991L25.8387 29.996C26.2278 29.9176 26.2958 30.0502 25.9869 30.2973L22.1014 33.395Z"/><path d="M13.9227 33.5697C13.5274 33.5517 13.4903 33.389 13.8362 33.2021L15.4114 32.3765C15.7635 32.1957 16.338 32.1897 16.6901 32.3644L18.9881 33.5035C19.3402 33.6782 19.3093 33.8108 18.9078 33.7927L13.9227 33.5697Z"/><path d="M28.3714 29.9417C28.5011 30.0924 28.3281 30.3636 27.976 30.5444L25.9066 31.6232C25.5545 31.804 25.5236 31.7557 25.8263 31.5087L27.5745 30.1165C27.8772 29.8694 28.2355 29.7911 28.3714 29.9417Z"/><path d="M23.133 20.944C22.7624 21.0887 22.5462 20.8958 22.645 20.5222L24.8441 12.1814C24.943 11.8077 25.2642 11.7173 25.5545 11.9825L31.1944 17.1172C31.4847 17.3823 31.4229 17.7138 31.0523 17.8584L23.133 20.944Z"/><path d="M31.7256 15.8817C31.7936 16.2614 31.6144 16.3578 31.3241 16.0926L25.9561 11.2051C25.6657 10.9399 25.6719 10.518 25.9746 10.2649L29.5018 7.29985C29.8045 7.04673 30.1072 7.14919 30.1751 7.53489L31.7256 15.8817Z"/><path d="M28.2849 27.6155C28.149 27.9771 27.8216 28.0373 27.5621 27.742L23.028 22.6074C22.7686 22.3121 22.8612 21.9565 23.2257 21.8119L31.0955 18.7443C31.4662 18.5997 31.6515 18.7805 31.5156 19.1421L28.2849 27.6155Z"/><path d="M34.5857 13.218C34.8019 13.5434 34.7834 14.0617 34.5486 14.3751L33.1835 16.1529C32.9487 16.4603 32.6955 16.406 32.6213 16.0264L31.2685 8.72213C31.2006 8.34245 31.3179 8.29424 31.5341 8.61967L34.5857 13.218Z"/><path d="M33.7518 22.7219C33.8753 23.0895 33.7394 23.6018 33.4429 23.8609L29.7242 27.1454C29.4277 27.4046 29.3041 27.3202 29.44 26.9586L32.226 19.6604C32.3619 19.2988 32.5781 19.2988 32.7078 19.6664L33.7518 22.7219Z"/><path d="M34.3324 20.8356C34.2892 21.2213 34.1533 21.2333 34.0297 20.8657L33.2143 18.4792C33.0908 18.1116 33.1835 17.5571 33.4182 17.2497L34.4869 15.8516C34.7216 15.5442 34.8822 15.6045 34.8451 15.9902L34.3324 20.8356Z"/><path d="M29.6871 29.098C29.4524 29.4114 29.1497 29.538 29.0138 29.3933C28.8841 29.2427 29.0138 28.9112 29.3103 28.646L30.9844 27.1695C31.2809 26.9104 31.3241 26.9526 31.0894 27.2599L29.6871 29.098Z"/><path d="M23.6149 9.78883C23.8372 10.1082 23.7013 10.4035 23.306 10.4397L14.5219 11.3256C14.1266 11.3678 13.966 11.1267 14.1698 10.7892L18.4692 3.61158C18.6669 3.28012 19.019 3.26204 19.2413 3.58145L23.6149 9.78883Z"/><path d="M25.4124 9.63214C25.1098 9.88526 24.6835 9.83102 24.455 9.51161L20.2977 3.60555C20.0753 3.28614 20.1988 3.12945 20.5695 3.24998L28.8038 5.98003C29.1806 6.10659 29.2424 6.41394 28.9397 6.66706L25.4124 9.63214Z"/><path d="M21.8049 20.3354C21.7061 20.709 21.4157 20.7753 21.1563 20.486L14.3428 12.766C14.0833 12.4707 14.1945 12.1995 14.5899 12.1573L23.5037 11.2593C23.899 11.2171 24.1399 11.4944 24.0411 11.868L21.8049 20.3354Z"/><path d="M13.305 10.5723C13.1073 10.9038 12.7305 10.9399 12.4711 10.6446L7.93694 5.50995C7.67749 5.21465 7.78251 4.91332 8.17167 4.82895L17.2399 2.96673C17.6291 2.88839 17.7835 3.09329 17.5797 3.43078L13.305 10.5723Z"/><path d="M20.5633 2.36407C20.1865 2.23752 20.1679 1.99043 20.5139 1.8036L22.5215 0.754975C22.8736 0.574177 23.3987 0.634443 23.7013 0.88756L27.9081 4.51557C28.2046 4.77471 28.1428 4.87716 27.766 4.75663L20.5633 2.36407Z"/><path d="M9.00561 3.80443C8.61644 3.88277 8.54849 3.75019 8.85735 3.5031L12.7367 0.405433C13.0455 0.158343 13.583 0.104103 13.9412 0.278874L16.8816 1.73731C17.2337 1.91208 17.209 2.12301 16.8199 2.20136L9.00561 3.80443Z"/><path d="M19.439 1.4179C19.0869 1.5987 18.5124 1.60472 18.1603 1.42995L15.8624 0.290928C15.5103 0.116157 15.5412 -0.0164284 15.9427 0.0016514L20.9277 0.224635C21.3231 0.242715 21.3602 0.405433 21.0142 0.592257L19.439 1.4179Z"/><path d="M7.27597 3.6839C6.96711 3.93099 6.60883 4.00933 6.4791 3.85867C6.34938 3.708 6.52234 3.43681 6.87445 3.25601L8.94383 2.17725C9.29594 1.99645 9.32683 2.04466 9.02414 2.29175L7.27597 3.6839Z"/><path d="M4.61974 28.2121C4.77417 28.0856 5.11392 28.2121 5.38572 28.5014L6.89916 30.1346C7.16478 30.4239 7.12154 30.4661 6.8065 30.237L4.91625 28.869C4.60121 28.64 4.46531 28.3447 4.61974 28.2121Z"/><path d="M30.7867 6.22109C30.9411 6.09453 31.2191 6.26328 31.4044 6.60679L32.5101 8.6257C32.6955 8.96922 32.646 8.99935 32.3928 8.70405L30.9658 6.99852C30.7187 6.70322 30.6384 6.34765 30.7867 6.22109Z"/><path d="M29.928 4.9314C30.2492 5.16041 30.379 5.45571 30.2307 5.5883C30.0763 5.71486 29.7365 5.5883 29.4647 5.29902L27.9513 3.66582C27.6857 3.37654 27.7289 3.33435 28.044 3.56337L29.928 4.9314Z"/><path d="M3.87847 26.8019C4.13174 27.1032 4.21204 27.4528 4.05761 27.5793C3.90318 27.7059 3.6252 27.5371 3.43988 27.1936L2.33415 25.1747C2.14883 24.8312 2.19825 24.8011 2.45152 25.0964L3.87847 26.8019Z"/><path d="M55.3612 10.2004C56.5868 10.8902 57.5567 11.8244 58.2709 12.9944C58.9851 14.1731 59.3466 15.4653 59.3466 16.871C59.3466 18.2767 58.9851 19.5777 58.2709 20.7651C57.5567 21.9526 56.578 22.8955 55.3612 23.594C54.1356 24.2925 52.7953 24.6417 51.3228 24.6417C49.8592 24.6417 48.5101 24.2925 47.2845 23.594C46.0589 22.8955 45.089 21.9526 44.3748 20.7651C43.6606 19.5777 43.2991 18.2767 43.2991 16.871C43.2991 15.4653 43.6606 14.1731 44.3748 12.9944C45.089 11.8157 46.0677 10.8902 47.2845 10.2004C48.5101 9.51064 49.8503 9.17013 51.3228 9.17013C52.7953 9.1614 54.1356 9.51064 55.3612 10.2004ZM48.0957 11.3617C47.0993 11.9292 46.3058 12.6975 45.7238 13.6667C45.1331 14.6358 44.8421 15.7098 44.8421 16.871C44.8421 18.0323 45.1331 19.1062 45.7238 20.0928C46.3058 21.0794 47.0993 21.8565 48.0957 22.4328C49.092 23.009 50.1766 23.2971 51.3493 23.2971C52.5044 23.2971 53.5801 23.009 54.5676 22.4328C55.5551 21.8565 56.3487 21.0794 56.9306 20.0928C57.5126 19.1062 57.8124 18.0323 57.8124 16.871C57.8124 15.4566 57.3715 14.1731 56.4986 13.038C56.0754 12.488 55.5551 11.999 54.9732 11.6149C53.871 10.8814 52.6631 10.5147 51.3493 10.5147C50.1766 10.5147 49.092 10.7941 48.0957 11.3617Z"/><path d="M75.6057 24.1965L72.502 19.5515C72.0347 19.5777 71.6732 19.5951 71.4263 19.5951H67.2028V23.8036C67.2028 24.1965 66.8854 24.5108 66.4886 24.5108H66.4005C66.0037 24.5108 65.6862 24.1965 65.6862 23.8036V9.29237H71.4263C73.3485 9.29237 74.8298 9.72892 75.8791 10.6108C76.9283 11.4926 77.4486 12.7324 77.4486 14.3477C77.4486 15.6137 77.14 16.6615 76.5227 17.5084C75.9055 18.3466 75.0238 18.9403 73.8864 19.2721L76.7961 23.4019C77.1311 23.8734 76.7873 24.5195 76.2053 24.5195C75.9672 24.5195 75.738 24.3973 75.6057 24.1965ZM71.4263 18.2418C72.89 18.2418 74.0186 17.91 74.8122 17.2552C75.6057 16.5916 76.0025 15.6399 76.0025 14.3914C76.0025 13.169 75.6057 12.2435 74.8122 11.6061C74.0186 10.9687 72.89 10.6457 71.4263 10.6457H67.2028V18.2418H71.4263Z"/><path d="M94.6335 10.2877C95.5064 10.96 95.9385 11.8942 95.9385 13.0817C95.9385 13.981 95.6828 14.7406 95.1802 15.3431C94.6776 15.9542 93.9634 16.3559 93.0552 16.5392C94.1838 16.6877 95.0656 17.098 95.6916 17.7791C96.3176 18.4601 96.6351 19.3245 96.6351 20.3722C96.6351 21.6819 96.1413 22.6947 95.1626 23.4194C94.1838 24.1441 92.8171 24.5108 91.0713 24.5108H84.5641V9.2749H91.0096C92.5526 9.2749 93.7606 9.60668 94.6335 10.2877ZM93.4784 15.2907C94.078 14.8192 94.3778 14.1469 94.3778 13.2738C94.3778 12.4356 94.078 11.7807 93.4784 11.318C92.8789 10.8552 92.0324 10.6282 90.9479 10.6457H86.0895V15.9979H90.9479C92.0324 15.9979 92.8789 15.7622 93.4784 15.2907ZM94.0163 22.3891C94.7393 21.874 95.1008 21.1493 95.1008 20.2238C95.1008 19.307 94.7305 18.5998 93.9987 18.0934C93.2668 17.587 92.244 17.3338 90.9391 17.3338H86.0807V23.1662H90.9391C92.2705 23.1662 93.2933 22.9042 94.0163 22.3891Z"/><path d="M109.843 10.8727C109.094 10.6631 108.389 10.5584 107.736 10.5584C106.678 10.5584 105.832 10.7679 105.197 11.1783C104.562 11.5887 104.244 12.1562 104.244 12.8634C104.244 13.492 104.421 13.9985 104.773 14.3914C105.126 14.7843 105.558 15.0899 106.07 15.3169C106.581 15.5439 107.286 15.7883 108.177 16.0677C109.217 16.3733 110.055 16.6702 110.699 16.9671C111.334 17.2639 111.88 17.7005 112.33 18.2593C112.78 18.8268 113 19.5777 113 20.5032C113 21.3152 112.771 22.0311 112.303 22.6598C111.845 23.2884 111.192 23.7686 110.355 24.1092C109.517 24.4497 108.556 24.6243 107.472 24.6243C106.405 24.6243 105.355 24.4147 104.341 23.9956C103.521 23.6551 102.79 23.2273 102.155 22.7122C101.89 22.4939 101.828 22.1272 101.987 21.8303C102.199 21.4549 102.693 21.3588 103.028 21.6208C103.565 22.0399 104.156 22.3804 104.809 22.651C105.717 23.0265 106.607 23.2186 107.489 23.2186C108.662 23.2186 109.597 22.9828 110.284 22.5113C110.972 22.0399 111.316 21.4025 111.316 20.6079C111.316 19.9706 111.14 19.4467 110.787 19.0363C110.434 18.626 110.002 18.3204 109.491 18.1021C108.979 17.8838 108.256 17.6306 107.339 17.3425C106.299 17.0194 105.461 16.7226 104.835 16.4432C104.2 16.1638 103.671 15.7359 103.23 15.1772C102.79 14.6184 102.569 13.8849 102.569 12.9856C102.569 12.2173 102.79 11.545 103.23 10.96C103.671 10.3838 104.288 9.92973 105.082 9.62414C105.876 9.30982 106.793 9.15266 107.833 9.15266C108.671 9.15266 109.508 9.27489 110.355 9.51936C110.937 9.69399 111.475 9.90354 111.968 10.148C112.321 10.3226 112.462 10.7417 112.286 11.091L112.268 11.1346C112.092 11.4839 111.66 11.6149 111.307 11.4315C110.831 11.2045 110.346 11.0211 109.843 10.8727Z"/></svg>',
  "ethereum": '<svg viewBox="5 1 13 19" fill="currentColor" aria-hidden="true" focusable="false"><path d="M11.498 15.0693V19.5557L17.037 11.8175L11.498 15.0693Z"/><path d="M11.498 8.27081V14.0312L17.037 10.7716L11.498 8.27081Z"/><path d="M11.498 1.6297V8.27082L17.037 10.7716L11.498 1.6297Z"/><path d="M11.498 15.0693V19.5557L5.96289 11.8175L11.498 15.0693Z"/><path d="M11.498 8.27081V14.0312L5.96289 10.7716L11.498 8.27081Z"/><path d="M11.498 1.6297V8.27082L5.96289 10.7716L11.498 1.6297Z"/></svg>',
  "polygon": '<svg viewBox="3.5 4.3 15 13.5" fill="currentColor" aria-hidden="true" focusable="false"><path d="M14.5626 8.62085C14.3094 8.4759 13.9839 8.4759 13.6946 8.62085L11.6692 9.81663L10.2949 10.5776L8.30572 11.7734C8.05256 11.9183 7.72706 11.9183 7.43772 11.7734L5.88255 10.8312C5.62939 10.6863 5.44855 10.3964 5.44855 10.0703V8.25849C5.44855 7.9686 5.59322 7.67871 5.88255 7.49753L7.43772 6.59164C7.69089 6.44669 8.01639 6.44669 8.30572 6.59164L9.86089 7.53377C10.1141 7.67871 10.2949 7.9686 10.2949 8.29472V9.49051L11.6692 8.69332V7.4613C11.6692 7.17141 11.5246 6.88152 11.2352 6.70035L8.34189 4.99726C8.08872 4.85231 7.76322 4.85231 7.47389 4.99726L4.50822 6.73658C4.21889 6.88152 4.07422 7.17141 4.07422 7.4613V10.8675C4.07422 11.1574 4.21889 11.4472 4.50822 11.6284L7.43772 13.3315C7.69089 13.4765 8.01639 13.4765 8.30572 13.3315L10.2949 12.172L11.6692 11.3748L13.6584 10.2152C13.9116 10.0703 14.2371 10.0703 14.5264 10.2152L16.0816 11.1211C16.3347 11.2661 16.5156 11.556 16.5156 11.8821V13.6939C16.5156 13.9838 16.3709 14.2737 16.0816 14.4548L14.5626 15.3607C14.3094 15.5057 13.9839 15.5057 13.6946 15.3607L12.1394 14.4548C11.8862 14.3099 11.7054 14.02 11.7054 13.6939V12.5343L10.3311 13.3315V14.5273C10.3311 14.8172 10.4757 15.1071 10.7651 15.2883L13.6946 16.9913C13.9477 17.1363 14.2732 17.1363 14.5626 16.9913L17.4921 15.2883C17.7452 15.1433 17.9261 14.8534 17.9261 14.5273V11.0849C17.9261 10.795 17.7814 10.5051 17.4921 10.3239L14.5626 8.62085Z"/></svg>',
  "guardian": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/></svg>'
};

// src/views.js
function createViews(context) {
  const {
    t: t2,
    icon: icon2,
    heading: heading2,
    ext: ext2,
    pill: pill2,
    stat: stat2,
    escapeHTML: escapeHTML2,
    liveNumber: liveNumber2,
    stakeNumber: stakeNumber2,
    guardianRows: guardianRows2,
    guardianAvatar: guardianAvatar2,
    guardianParticipation: guardianParticipation2,
    votedLabel: votedLabel2,
    chartSeries: chartSeries2,
    guardianSelfStakeRatio: guardianSelfStakeRatio2,
    shortAddress: shortAddress2,
    copyAddressButton: copyAddressButton2,
    metricLogos: metricLogos2,
    networkSymbol: networkSymbol2,
    posSources: posSources2
  } = context;
  function loadingValue2(label) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    return `<span class="loading-value" role="status"><span class="overview-skeleton" aria-hidden="true"></span><span class="loading-caption">${label}</span></span>`;
  }
  function overviewValue2(value, kind = "reading", compact = false) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    if (Number.isFinite(value))
      return compact ? stakeNumber2(value) : liveNumber2(value);
    return overviewLoading2 ? loadingValue2(kind === "calculating" ? t2("Calculating\u2026") : t2("Reading\u2026")) : '<span class="loading-caption">' + t2("Unavailable") + "</span>";
  }
  function proposalSkeleton2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    return `<article class="proposal-card proposal-loading" aria-busy="true" aria-label="${t2("Latest Snapshot proposal loading")}"><span class="muted">${t2("Latest Snapshot proposal")}</span><div class="proposal-heading-placeholder"><span class="overview-skeleton" aria-hidden="true"></span><span class="loading-caption" role="status">${t2("Reading proposal\u2026")}</span></div><div class="results-loading" role="status"><span class="loading-caption">${t2("Loading results\u2026")}</span><div aria-hidden="true">${Array.from({ length: 3 }, () => '<div class="result-placeholder"><span class="overview-skeleton result-label-placeholder"></span><span class="overview-skeleton result-bar-placeholder"></span></div>').join("")}</div></div></article>`;
  }
  function proposalPreview2(p) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const template = document.createElement("template");
    template.innerHTML = (p.bodyHtml || "").replace(
      /<\/(?:p|h[1-6]|li|blockquote|pre|tr|td|th)>|<br\s*\/?>/gi,
      " "
    );
    const text = (template.content.textContent || "").replace(/\s+/g, " ").trim();
    return text.slice(0, 260) + (text.length > 260 ? "\u2026" : "");
  }
  function liveProposal2(source, label = t2("Latest Snapshot proposal"), details = false) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    if (!source?.data)
      return overviewLoading2 ? proposalSkeleton2() : '<p class="muted">' + t2("Latest proposal temporarily unavailable.") + "</p>";
    const p = source.data.proposal;
    if (!p) return "<h2>" + t2("No proposals yet") + "</h2>";
    return `<article class="proposal-card ${p.state === "active" ? "active-vote" : ""}">${details ? `<div class="proposal-title-row"><h2>${escapeHTML2(p.title)}</h2>${pill2(escapeHTML2(p.state === "active" ? t2("Active") : p.state === "closed" ? t2("Closed") : p.state === "pending" ? t2("Upcoming") : p.state))}</div>` : `<div class="section-head"><span class="muted">${escapeHTML2(label)}</span>${pill2(escapeHTML2(p.state === "active" ? t2("Active") : p.state === "closed" ? t2("Closed") : p.state === "pending" ? t2("Upcoming") : p.state))}</div><h2>${escapeHTML2(p.title)}</h2>`}${details && p.body ? `<p class="proposal-excerpt">${escapeHTML2(proposalPreview2(p))}</p>` : ""}<p class="muted">${new Date(p.start * 1e3).toLocaleDateString(portalLocale())} \u2013 ${new Date(p.end * 1e3).toLocaleDateString(portalLocale())}</p><div class="live-results">${p.choices.map((choice, i) => {
      const pct = p.scores_total > 0 ? Math.min(100, p.scores[i] / p.scores_total * 100) : 0;
      return `<div class="live-choice"><div><span>${escapeHTML2(choice)}</span><span>${pct.toFixed(1)}%</span></div><progress value="${pct}" max="100" aria-label="${escapeHTML2(choice)}"></progress><small class="muted">${liveNumber2(p.scores[i])} ${t2("voting power")}</small></div>`;
    }).join(
      ""
    )}</div><div class="proposal-bottom"><span class="muted">${liveNumber2(p.votes)} ${t2("voters")} \xB7 ${p.state === "closed" ? t2("Final scores") : t2("Current scores")}</span>${details ? `<button class="text-button" data-live-proposal="${p.id}">${t2("View summary \u2192")}</button>` : ""}${ext2("https://snapshot.org/#/s:orbs-network.eth/proposal/" + p.id, t2("View on Snapshot"))}</div></article>`;
  }
  function stakingStat2(label, value, unit, kind) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    return `<div class="staking-stat" aria-busy="${value.includes("loading-value")}"><span class="staking-watermark staking-watermark-${kind}" aria-hidden="true">${overviewSymbols[kind]}</span><div class="staking-stat-label"><span>${label}</span></div><div class="metric-value">${value}${unit && !value.includes("loading-caption") ? ` <small>${unit}</small>` : ""}</div></div>`;
  }
  function overview2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const sources = overviewData2?.sources || {}, eth = sources.ethereum, pol = sources.polygon, del = sources.delegators;
    const total = eth?.data && pol?.data ? eth.data.stake + pol.data.stake : null;
    return `<section class="section network-overview">${heading2(t2("Orbs network"), t2("Staking status"), '<a class="button outline" href="#pos">' + t2("Explore POS \u2192") + "</a>")}${overviewError2 || Object.values(sources).some((s) => s.error || s.data?.stale) ? '<p class="muted">' + t2("Some data is temporarily unavailable or delayed.") + "</p>" : ""}<div class="hero-stats">${stakingStat2(t2("Total staked"), overviewValue2(total, "calculating", true), "ORBS", "orbs")}${stakingStat2("Ethereum", overviewValue2(eth?.data?.stake, "calculating", true), "ORBS", "ethereum")}${stakingStat2("Polygon", overviewValue2(pol?.data?.stake, "calculating", true), "ORBS", "polygon")}${stakingStat2(t2("Registered guardians"), overviewValue2(eth?.data?.guardians), "", "guardian")}</div></section><section class="section dao-overview">${heading2(t2("Community governance"), t2("DAO operation"), '<a class="button outline" href="#dao">' + t2("Explore DAO \u2192") + "</a>")}<div class="grid dao-grid"><div class="card participant-card">${stat2(t2("DAO participants"), overviewValue2(del?.data?.count), "", "people")}<p class="muted">${t2("Unique delegators across Ethereum and Polygon")}</p></div><div class="card">${liveProposal2(sources.snapshot)}</div></div></section>`;
  }
  function chart2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const series = chartSeries2();
    const controls = `<div class="section-head"><div><h2>${t2("Staked ORBS over time")}</h2><span class="muted">${t2("Committee effective stake \xB7 ORBS")}</span></div><div class="tabs">${["7", "30", "60"].map((n) => `<button data-period="${n}" aria-pressed="${n === state2.period}" class="${n === state2.period ? "active" : ""}">${t2("{days}d", { days: n })}</button>`).join("")}</div></div><div class="tabs chart-networks" aria-label="${t2("Chart network")}">${[
      ["total", t2("Combined")],
      ["Ethereum", "Ethereum"],
      ["Polygon", "Polygon"]
    ].map(
      ([v, l]) => `<button data-chart="${v}" aria-pressed="${state2.chart === v}" class="${state2.chart === v ? "active" : ""}">${l}</button>`
    ).join("")}</div>`;
    if (!series)
      return controls + `<div class="pos-chart-placeholder" role="status">${overviewLoading2 ? '<span class="overview-skeleton" aria-hidden="true"></span>' + t2("Loading chart\u2026") : t2("Chart temporarily unavailable.")}</div>`;
    if (!series.length)
      return controls + ('<div class="pos-chart-placeholder">' + t2("No history available for this period.") + "</div>");
    const low = Math.min(...series.map((p) => p.value)), high = Math.max(...series.map((p) => p.value)), pad = Math.max((high - low) * 0.12, high * 2e-3, 1), min = low - pad, max = high + pad, first = series[0].time, last = series.at(-1).time;
    const x = (t3) => 60 + (t3 - first) / Math.max(1, last - first) * 530, y = (v) => 185 - (v - min) / (max - min) * 160;
    let path = `M${x(first)},${y(series[0].value)}`;
    for (const p of series.slice(1)) path += `H${x(p.time)}V${y(p.value)}`;
    const date = (t3) => new Date(t3 * 1e3).toLocaleDateString(portalLocale(), {
      month: "short",
      day: "numeric"
    });
    return controls + `<svg class="chart pos-chart" data-stake-chart viewBox="0 0 610 210" role="img" aria-label="${t2("{network} committee effective stake from {start} to {end}", { network: state2.chart === "total" ? t2("Combined") : state2.chart, start: date(first), end: date(last) })}"><title class="chart-point-title"></title><defs><linearGradient id="area" x2="0" y2="1"><stop stop-opacity=".22"/><stop offset="1" stop-opacity="0"/></linearGradient></defs>${[min, (min + max) / 2, max].map((v) => `<line x1="60" y1="${y(v)}" x2="590" y2="${y(v)}" stroke-dasharray="4 6"/><text x="52" y="${y(v) + 4}" text-anchor="end" fill="currentColor" font-size="10">${stakeNumber2(v)}</text>`).join("")}<path d="${path}L${x(last)},195L60,195Z" fill="url(#area)"/><path d="${path}" fill="none" stroke="var(--blue)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="chart-labels"><span>${date(first)}</span><span>${date(last)} \xB7 ${stakeNumber2(series.at(-1).value)} ORBS</span></div>`;
  }
  function guardianList2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const all = guardianRows2();
    if (!all)
      return `<div class="pos-chart-placeholder" role="status">${overviewLoading2 ? loadingValue2(t2("Reading guardians\u2026")) : t2("Guardian directory temporarily unavailable.")}</div>`;
    const list = all.filter(
      (g) => (g.name + " " + g.address).toLowerCase().includes(state2.search.toLowerCase())
    );
    return `<p class="muted">${list.length} ${t2("guardians \xB7 Ethereum registry \xB7 Ranked by combined effective stake")}</p>${!posSources2().polygon?.data ? '<p class="muted">' + t2("Polygon data unavailable. Combined rankings cannot be calculated.") + "</p>" : ""}<div class="guardian-table"><div class="guardian-table-head"><span>${t2("Rank / Guardian")}</span><span>${t2("Effective stake")}</span><span>${t2("Self Stake ratio")}</span><span>${votedLabel2()}</span><span>${t2("Profile")}</span></div>${list.map((g) => `<article class="guardian-row"><div class="guardian-name"><span class="rank">${g.rank ? "#" + g.rank : "\u2014"}</span>${guardianAvatar2(g.address, g.name)}<div><h3>${escapeHTML2(g.name)}</h3><span class="muted guardian-address"><span class="guardian-address-text" data-full-address="${escapeHTML2(g.address)}" title="${escapeHTML2(g.address)}">${escapeHTML2(g.address)}</span>${copyAddressButton2(g.address)}</span></div></div><div class="guardian-stakes"><span class="mobile-label">${t2("Effective stake")}</span><div>${networkSymbol2("Ethereum")}<span>${stakeNumber2(g.ethereum.effectiveStake)} ORBS</span></div>${g.polygon ? `<div>${networkSymbol2("Polygon")}<span>${stakeNumber2(g.polygon.effectiveStake)} ORBS</span></div>` : !g.polygonKnown ? '<span class="muted">' + t2("Polygon unavailable") + "</span>" : ""}</div><div class="guardian-ratios"><span class="mobile-label">${t2("Self Stake ratio")}</span><div>${networkSymbol2("Ethereum")}<span>${guardianSelfStakeRatio2(g.ethereum)}</span></div>${g.polygon ? `<div>${networkSymbol2("Polygon")}<span>${guardianSelfStakeRatio2(g.polygon)}</span></div>` : !g.polygonKnown ? `<span class="muted">${t2("Polygon unavailable")}</span>` : ""}</div><div class="guardian-voted"><span class="mobile-label">${votedLabel2()}</span><span>${guardianParticipation2(g.address)}</span></div><button class="button outline small" data-guardian="${g.address}" data-network="Ethereum">${t2("Guardian Profile")}</button></article>`).join("") || '<div class="empty">' + t2("No guardians match your search.") + "</div>"}</div>`;
  }
  function pos2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const s = posSources2(), e = s.ethereum?.data, p = s.polygon?.data, total = e && p ? e.stake + p.stake : null;
    return `${heading2(t2("Proof of stake"), t2("POS Dashboard"))}${overviewError2 || Object.values(s).some((x) => x.error || x.data?.stale) ? '<p class="muted">' + t2("Some data is temporarily unavailable or delayed.") + "</p>" : ""}<section class="grid pos-hero section"><div class="card" id="chart-content">${chart2()}</div><div class="card pos-totals"><div class="total-stake"><img class="pos-orbs-logo" src="${metricLogos2.orbs}" alt="" width="36" height="36"><span class="metric-label">${t2("Total staked")}</span><div class="metric-value">${overviewValue2(total, "calculating", true)}${total !== null ? " <small>ORBS</small>" : ""}</div></div><dl class="detail-list"><div><dt>${t2("Registered guardians")}</dt><dd>${overviewValue2(e?.guardians)}</dd></div><div><dt>${t2("Number of Delegators")}</dt><dd>${overviewValue2(s.delegators?.data?.count)}</dd></div></dl></div></section><section class="card section pos-join"><h2>${t2("Join Orbs PoS Universe")}</h2><div class="pos-join-actions"><a class="button outline guardian-join-button" href="https://orbs-doc.gitbook.io/pos/orbs-pos-universe/becoming-the-guardian" target="_blank" rel="noopener noreferrer">${t2("Become a Guardian")} \u2197</a><a class="button outline guardian-join-button" href="https://orbs-doc.gitbook.io/pos/orbs-pos-universe/becoming-the-delegator" target="_blank" rel="noopener noreferrer">${t2("Become a Delegator")} \u2197</a></div></section><section class="card"><div class="section-head"><div><div class="eyebrow">${t2("Guardian directory")}</div><h2>${t2("Explore the operators")}</h2></div></div><div class="toolbar"><input type="search" id="guardian-search" placeholder="${t2("Search guardians or address")}" aria-label="${t2("Search guardians")}"></div><div id="guardian-list">${guardianList2()}</div></section>`;
  }
  function dao2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const source = posSources2().snapshot, data = source?.data;
    const intro = heading2(t2("DAO governance"), t2("VOTE, Make together"));
    if (!data)
      return `${intro}<section class="card">${overviewLoading2 ? proposalSkeleton2() : '<p class="muted">' + t2("Proposals temporarily unavailable.") + "</p>"}</section>`;
    const active = data.activeProposals || [], latest = data.proposals || [];
    return `${intro}${source.error || overviewError2 ? '<p class="muted">' + t2("Unable to refresh proposals. Showing last available results.") + "</p>" : ""}${active.length ? `<section class="section dao-active-section"><div class="section-head"><div><div class="eyebrow">${t2("Voting is open")}</div><h2>${t2("Active proposals")}</h2></div></div><div class="dao-proposal-cards">${active.map((p) => liveProposal2({ data: { proposal: p } }, t2("Active proposal"), true).replace('class="proposal-card ', 'class="card dao-proposal-card proposal-card ')).join("")}</div></section>` : '<p class="muted dao-no-active">' + t2("No active proposals at the moment.") + "</p>"}<section class="section dao-latest-section"><div class="section-head"><h2>${t2("Latest 6 proposals")}</h2>${ext2("https://snapshot.org/#/s:orbs-network.eth", t2("See all proposals"))}</div><div class="proposal-list dao-proposal-cards">${latest.length ? latest.map((p) => liveProposal2({ data: { proposal: p } }, "Snapshot proposal", true).replace('class="proposal-card ', 'class="card dao-proposal-card proposal-card ')).join("") : '<p class="muted">' + t2("No proposals yet") + ".</p>"}</div></section>`;
  }
  function carousel2(kind, title, source, url) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const feed = communityData2?.sources?.[kind], posts = feed?.posts || [];
    const loading = communityLoading2 && !feed;
    return `<section class="section"><div class="section-head"><div><div class="eyebrow">${source}</div><h2>${title}</h2></div>${posts.length ? `<div class="carousel-controls"><button class="button outline small" data-slide="${kind}" data-direction="-1" aria-label="${t2("Previous")} ${title}">\u2190</button><button class="button outline small" data-slide="${kind}" data-direction="1" aria-label="${t2("Next")} ${title}">\u2192</button></div>` : ""}</div>${(feed?.error || communityError2) && !posts.length ? `<p class="muted">${t2("This feed is temporarily unavailable.")} ${ext2(url, t2("Visit official channel"))}</p>` : ""}<div class="carousel" id="carousel-${kind}" role="region" aria-label="${title}" tabindex="0">${loading ? Array.from({ length: 3 }, () => '<article class="card social-card" aria-busy="true"><div class="overview-skeleton social-image-skeleton" aria-hidden="true"></div><span class="loading-caption" role="status">' + t2("Reading posts\u2026") + '</span><div class="overview-skeleton" aria-hidden="true"></div></article>').join("") : posts.map((post, i) => `<article class="card social-card live-social-card"><div class="section-head"><span class="social-icon">${kind === "blog" ? `<img src="${metricLogos2.orbs}" width="28" height="28" alt="Orbs">` : '<svg class="telegram-logo" viewBox="0 0 24 24" role="img" aria-label="Telegram"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path d="M5.1 11.8 18 6.9c.6-.2 1.1.1.9.9l-2.2 10.4c-.2.7-.6.9-1.2.5l-3.4-2.5-1.6 1.5c-.2.2-.3.3-.6.3l.2-3.5 6.4-5.8c.3-.2-.1-.4-.4-.2l-7.9 5-3.4-1.1c-.7-.2-.7-.6.3-.6Z" fill="white"/></svg>'}</span>${pill2(`${i + 1} / ${posts.length}`, "gray")}</div><time class="muted" datetime="${escapeHTML2(post.date)}">${new Date(post.date).toLocaleDateString(portalLocale(), { year: "numeric", month: "short", day: "numeric" })}${post.repost ? " \xB7 Repost" : ""}</time>${post.image ? `<a class="social-thumbnail ${post.imageSource === "logo" ? "social-logo-thumbnail" : ""}" data-social-kind="${kind}" href="${escapeHTML2(post.url)}" target="_blank" rel="noopener noreferrer" aria-label="${t2("Open post image")}"><img src="${escapeHTML2(post.image)}" alt="${escapeHTML2(source + " post image")}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${post.imageCount > 1 ? `<span class="social-image-count">+${post.imageCount - 1}</span>` : ""}</a>` : ""}<p class="social-post-text">${escapeHTML2(post.text)}</p><div class="social-footer">${ext2(post.url, kind === "blog" ? t2("Read article") : t2("Read on Telegram"))}</div></article>`).join("")}${!loading && posts.length ? `<a class="card social-card social-more-card" href="${escapeHTML2(url)}" target="_blank" rel="noopener noreferrer" aria-label="${t2("View more on")} ${kind === "blog" ? "Orbs Blog" : "Telegram"}"><span>${t2("View more \u2197")}</span></a>` : ""}</div></section>`;
  }
  function community2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    return `${heading2(t2("Orbs community"), t2("Stay connected"))}<section class="card section join-community"><div><div class="eyebrow">${t2("Join the conversation")}</div><h2>${t2("There is a place for every voice.")}</h2><p class="muted">${t2("Ask questions, exchange ideas and help shape the Orbs community.")}</p></div><div class="community-links"><div class="community-language-group"><h3><span aria-hidden="true">\u{1F1EC}\u{1F1E7}</span> ${t2("Global")}</h3>${ext2("https://t.me/OrbsNetwork", t2("Global Telegram"))}${ext2("https://t.me/OrbsAnnouncements", t2("Global announcements"))}${ext2("https://discord.gg/sswGDYGBt5", "Discord")}${ext2("https://twitter.com/orbs_network", t2("Official X"))}</div><div class="community-language-group"><h3><span aria-hidden="true">\u{1F1F0}\u{1F1F7}</span> \uD55C\uAD6D\uC5B4</h3>${ext2("https://t.me/orbskr", t2("Korean Telegram"))}${ext2("https://t.me/orbskrannouncement", t2("Korean announcements"))}</div><div class="community-language-group"><h3><span aria-hidden="true">\u{1F1EF}\u{1F1F5}</span> \u65E5\u672C\u8A9E</h3>${ext2("https://t.me/orbsjpannouncements", t2("Japanese announcements"))}</div></div><div class="community-all-channels">${ext2("https://www.orbs.com/contact/", t2("All community channels"))}</div></section>${carousel2("announcements", t2("Latest announcements"), "Orbs Announcements", "https://t.me/OrbsAnnouncements")}${carousel2("blog", t2("Latest from the blog"), "Orbs Blog", "https://www.orbs.com/blog/")}`;
  }
  function accountStatus2(part) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    return accountParts2[part]?.error ? '<p class="muted">' + t2("Unable to read this data.") + ' <button class="text-button" data-account-retry="' + part + ('">' + t2("Retry") + "</button></p>") : '<div class="skeleton short"></div><p class="muted" role="status">' + t2("Reading\u2026") + "</p>";
  }
  function accountAmount2(v) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    if (v == null) return '<span class="muted">' + t2("Unavailable") + "</span>";
    return `<span title="${escapeHTML2(v)} ORBS">${stakeNumber2(Number(v))} <small>ORBS</small></span>`;
  }
  function accountGuardian2(d, network) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    if (!d.guardian) return t2("Unavailable");
    if (/^0x0{40}$/.test(d.guardian)) return t2("Not delegated");
    if (d.guardian === accountAddress2 && !guardianRows2()?.some((g2) => g2.address === d.guardian))
      return t2("No delegated guardian");
    const g = guardianRows2()?.find((g2) => g2.address === d.guardian);
    if (g)
      return `<button class="text-button" data-guardian="${d.guardian}" data-network="${network}">${guardianAvatar2(g.address, g.name)}${escapeHTML2(g.name)} \u2197</button>`;
    return ext2(
      `https://analytics.orbs.network/${network.toLowerCase()}/guardians/stake/${d.guardian}`,
      shortAddress2(d.guardian)
    );
  }
  function accountChain2(network) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const key = network.toLowerCase(), d = accountParts2[key]?.data;
    return `<article class="card wallet-chain"><div class="section-head"><h3>${networkSymbol2(network)} ${network}</h3></div>${!d ? accountStatus2(key) : `<span class="metric-label">${t2("Staked ORBS")}</span><div class="metric-value">${accountAmount2(d.staked)}</div><dl class="detail-list"><div><dt>${t2("Unlocking")}</dt><dd>${accountAmount2(d.unlocking)}</dd></div><div><dt>${t2("Available to withdraw")}</dt><dd>${d.unlocking == null ? t2("Unavailable") : Number(d.unlocking) > 0 ? d.unlockTime * 1e3 <= Date.now() ? t2("Ready to withdraw") : escapeHTML2(new Date(d.unlockTime * 1e3).toLocaleString(portalLocale())) : t2("No pending unlock")}</dd></div><div><dt>${t2("Wallet balance")}</dt><dd>${accountAmount2(d.balance)}</dd></div><div><dt>${t2("Delegated guardian")}</dt><dd>${accountGuardian2(d, network)}</dd></div><div><dt>${t2("Current rewards")}</dt><dd>${accountAmount2(d.currentRewards)}</dd></div><div><dt>${t2("Claimed rewards")}</dt><dd>${accountAmount2(d.claimedRewards)}</dd></div><div><dt>${t2("Total rewards")}</dt><dd>${accountAmount2(d.totalRewards)}</dd></div></dl>`}</article>`;
  }
  function voteChoice2(v) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const choices = v.proposal.choices || [], name = (i) => choices[Number(i) - 1] || String(i);
    if (Array.isArray(v.choice)) return v.choice.map(name).join(", ");
    if (v.choice && typeof v.choice === "object")
      return Object.entries(v.choice).map(([i, n]) => `${name(i)}: ${n}`).join(", ");
    return name(v.choice);
  }
  function accountVoting2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const votes = accountParts2.votes?.data;
    return `<section class="card section"><div class="section-head"><h2>${t2("My voting participation")}</h2>${ext2("https://snapshot.org/#/profile/" + accountAddress2, t2("View more on Snapshot"))}</div><p class="muted">${t2("Your latest 5 votes in Orbs governance")}</p>${!votes ? accountStatus2("votes") : votes.length ? votes.map((v) => `<article class="account-vote"><div class="section-head"><h3>${escapeHTML2(v.proposal.title)}</h3>${pill2(escapeHTML2(t2({ active: "Active", closed: "Closed", pending: "Upcoming" }[v.proposal.state] || v.proposal.state)))}</div><p>${t2("Your choice:")} ${escapeHTML2(voteChoice2(v))}</p><div class="section-head"><span class="muted">${escapeHTML2(new Date(v.created * 1e3).toLocaleDateString(portalLocale()))} \xB7 ${t2("Voting power:")} ${liveNumber2(v.vp)}</span>${ext2("https://snapshot.org/#/s:orbs-network.eth/proposal/" + encodeURIComponent(v.proposal.id), t2("View proposal"))}</div></article>`).join("") : '<p class="muted">' + t2("No votes found for this address in Orbs governance.") + "</p>"}</section>`;
  }
  function accountHistorySection2(network) {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    const part = "history-" + network.toLowerCase(), d = accountParts2[part]?.data;
    return `<article class="card"><h3>${networkSymbol2(network)} ${network}</h3>${!d ? accountStatus2(part) : d.events.length ? `<div class="account-history">${d.events.map((e) => `<div class="account-event"><div><span>${escapeHTML2(t2(e.type))}</span><small class="muted">${escapeHTML2(new Date(Number(e.blockTimestamp) * 1e3).toLocaleDateString(portalLocale()))}</small></div><div>${e.amount != null ? accountAmount2(e.amount) : escapeHTML2(shortAddress2(e.to))}<small>${ext2("https://" + (network === "Ethereum" ? "etherscan.io" : "polygonscan.com") + "/tx/" + e.transactionHash, t2("Transaction"))}</small></div></div>`).join("")}</div>` : '<p class="muted">' + t2("No indexed staking activity found for this address.") + "</p>"}</article>`;
  }
  function mypage2() {
    const {
      state: state2,
      overviewData: overviewData2,
      overviewLoading: overviewLoading2,
      overviewError: overviewError2,
      communityData: communityData2,
      communityLoading: communityLoading2,
      communityError: communityError2,
      accountAddress: accountAddress2,
      accountParts: accountParts2
    } = context;
    if (!state2.connected)
      return `${heading2(t2("My page"), t2("Your place in the network."))}<section class="locked-page"><div class="skeleton-layout" aria-hidden="true"><div class="grid resource-grid">${Array.from({ length: 4 }, () => '<div class="card"><div class="skeleton short"></div><div class="skeleton tall"></div><div class="skeleton"></div></div>').join("")}</div></div><div class="connect-prompt">${icon2("stake")}<h2>${t2("Connect your wallet to see your participation.")}</h2><p>${t2("Use Connect Wallet in the top-right corner.")}</p><span class="muted">${t2("Read-only access. No signature or transaction required.")}</span></div></section>`;
    return `${heading2(t2("My page"), t2("Welcome to Orbs Universe"))}<div class="account-address account-address-pill"><span class="account-address-label">My Address:</span><span class="account-address-value guardian-address-text" data-full-address="${escapeHTML2(accountAddress2)}" title="${escapeHTML2(accountAddress2)}">${escapeHTML2(accountAddress2)}</span>${copyAddressButton2(accountAddress2)}</div><section class="section"><div class="section-head"><h2>${t2("My staking")}</h2></div><div class="grid resource-grid">${accountChain2("Ethereum")}${accountChain2("Polygon")}</div><button class="button stake-cta" data-stake><span class="stake-orbs-logo" aria-hidden="true"></span><span>${t2("Stake ORBS now!")}</span><span aria-hidden="true">\u2197</span></button></section>${accountVoting2()}<section class="section"><div class="section-head"><h2>${t2("My staking activity")}</h2><span class="muted">${t2("Latest 50 indexed events per network")}</span></div><div class="grid resource-grid">${accountHistorySection2("Ethereum")}${accountHistorySection2("Polygon")}</div></section>`;
  }
  return {
    overview: overview2,
    pos: pos2,
    dao: dao2,
    community: community2,
    mypage: mypage2,
    accountChain: accountChain2,
    accountVoting: accountVoting2,
    accountHistorySection: accountHistorySection2,
    accountStatus: accountStatus2,
    accountAmount: accountAmount2,
    accountGuardian: accountGuardian2,
    voteChoice: voteChoice2,
    carousel: carousel2,
    chart: chart2,
    guardianList: guardianList2,
    proposalSkeleton: proposalSkeleton2,
    proposalPreview: proposalPreview2,
    liveProposal: liveProposal2,
    stakingStat: stakingStat2,
    overviewValue: overviewValue2,
    loadingValue: loadingValue2
  };
}

// src/assets.js
var icons = {
  stake: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 4 16 4 16 0V6M4 12v6c0 4 16 4 16 0v-6"/>',
  guardian: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/>',
  chain: '<path d="m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M13 9l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
  vote: '<path d="m7 13-3 4h16l-3-4M4 17v4h16v-4M8 6l5-4 6 7-5 4z"/>'
};
var metricLogos = {
  orbs: "/assets/logo-1.svg",
  ethereum: "/assets/logo-2.svg",
  polygon: "/assets/logo-3.svg"
};
var stakingAppIcons = [
  '<img src="/assets/logo-4.svg" alt="" width="34" height="34">',
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
  '<svg viewBox="0 0 24 24" fill="#3DDC84" aria-hidden="true"><path d="M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 0 0-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 0 0-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 0 0-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z"/></svg>'
];

// node_modules/morphdom/dist/morphdom-esm.js
var DOCUMENT_FRAGMENT_NODE = 11;
function morphAttrs(fromNode, toNode) {
  var toNodeAttrs = toNode.attributes;
  var attr;
  var attrName;
  var attrNamespaceURI;
  var attrValue;
  var fromValue;
  if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
    return;
  }
  for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
    attr = toNodeAttrs[i];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    attrValue = attr.value;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
      if (fromValue !== attrValue) {
        if (attr.prefix === "xmlns") {
          attrName = attr.name;
        }
        fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      fromValue = fromNode.getAttribute(attrName);
      if (fromValue !== attrValue) {
        fromNode.setAttribute(attrName, attrValue);
      }
    }
  }
  var fromNodeAttrs = fromNode.attributes;
  for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
    attr = fromNodeAttrs[d];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
        fromNode.removeAttributeNS(attrNamespaceURI, attrName);
      }
    } else {
      if (!toNode.hasAttribute(attrName)) {
        fromNode.removeAttribute(attrName);
      }
    }
  }
}
var range;
var NS_XHTML = "http://www.w3.org/1999/xhtml";
var doc = typeof document === "undefined" ? void 0 : document;
var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
function createFragmentFromTemplate(str) {
  var template = doc.createElement("template");
  template.innerHTML = str;
  return template.content.childNodes[0];
}
function createFragmentFromRange(str) {
  if (!range) {
    range = doc.createRange();
    range.selectNode(doc.body);
  }
  var fragment = range.createContextualFragment(str);
  return fragment.childNodes[0];
}
function createFragmentFromWrap(str) {
  var fragment = doc.createElement("body");
  fragment.innerHTML = str;
  return fragment.childNodes[0];
}
function toElement(str) {
  str = str.trim();
  if (HAS_TEMPLATE_SUPPORT) {
    return createFragmentFromTemplate(str);
  } else if (HAS_RANGE_SUPPORT) {
    return createFragmentFromRange(str);
  }
  return createFragmentFromWrap(str);
}
function compareNodeNames(fromEl, toEl) {
  var fromNodeName = fromEl.nodeName;
  var toNodeName = toEl.nodeName;
  var fromCodeStart, toCodeStart;
  if (fromNodeName === toNodeName) {
    return true;
  }
  fromCodeStart = fromNodeName.charCodeAt(0);
  toCodeStart = toNodeName.charCodeAt(0);
  if (fromCodeStart <= 90 && toCodeStart >= 97) {
    return fromNodeName === toNodeName.toUpperCase();
  } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
    return toNodeName === fromNodeName.toUpperCase();
  } else {
    return false;
  }
}
function createElementNS(name, namespaceURI) {
  return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name) : doc.createElementNS(namespaceURI, name);
}
function moveChildren(fromEl, toEl) {
  var curChild = fromEl.firstChild;
  while (curChild) {
    var nextChild = curChild.nextSibling;
    toEl.appendChild(curChild);
    curChild = nextChild;
  }
  return toEl;
}
function syncBooleanAttrProp(fromEl, toEl, name) {
  if (fromEl[name] !== toEl[name]) {
    fromEl[name] = toEl[name];
    if (fromEl[name]) {
      fromEl.setAttribute(name, "");
    } else {
      fromEl.removeAttribute(name);
    }
  }
}
var specialElHandlers = {
  OPTION: function(fromEl, toEl) {
    var parentNode = fromEl.parentNode;
    if (parentNode) {
      var parentName = parentNode.nodeName.toUpperCase();
      if (parentName === "OPTGROUP") {
        parentNode = parentNode.parentNode;
        parentName = parentNode && parentNode.nodeName.toUpperCase();
      }
      if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
        if (fromEl.hasAttribute("selected") && !toEl.selected) {
          fromEl.setAttribute("selected", "selected");
          fromEl.removeAttribute("selected");
        }
        parentNode.selectedIndex = -1;
      }
    }
    syncBooleanAttrProp(fromEl, toEl, "selected");
  },
  /**
   * The "value" attribute is special for the <input> element since it sets
   * the initial value. Changing the "value" attribute without changing the
   * "value" property will have no effect since it is only used to the set the
   * initial value.  Similar for the "checked" attribute, and "disabled".
   */
  INPUT: function(fromEl, toEl) {
    syncBooleanAttrProp(fromEl, toEl, "checked");
    syncBooleanAttrProp(fromEl, toEl, "disabled");
    if (fromEl.value !== toEl.value) {
      fromEl.value = toEl.value;
    }
    if (!toEl.hasAttribute("value")) {
      fromEl.removeAttribute("value");
    }
  },
  TEXTAREA: function(fromEl, toEl) {
    var newValue = toEl.value;
    if (fromEl.value !== newValue) {
      fromEl.value = newValue;
    }
    var firstChild = fromEl.firstChild;
    if (firstChild) {
      var oldValue = firstChild.nodeValue;
      if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
        return;
      }
      firstChild.nodeValue = newValue;
    }
  },
  SELECT: function(fromEl, toEl) {
    if (!toEl.hasAttribute("multiple")) {
      var selectedIndex = -1;
      var i = 0;
      var curChild = fromEl.firstChild;
      var optgroup;
      var nodeName;
      while (curChild) {
        nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
        if (nodeName === "OPTGROUP") {
          optgroup = curChild;
          curChild = optgroup.firstChild;
          if (!curChild) {
            curChild = optgroup.nextSibling;
            optgroup = null;
          }
        } else {
          if (nodeName === "OPTION") {
            if (curChild.hasAttribute("selected")) {
              selectedIndex = i;
              break;
            }
            i++;
          }
          curChild = curChild.nextSibling;
          if (!curChild && optgroup) {
            curChild = optgroup.nextSibling;
            optgroup = null;
          }
        }
      }
      fromEl.selectedIndex = selectedIndex;
    }
  }
};
var ELEMENT_NODE = 1;
var DOCUMENT_FRAGMENT_NODE$1 = 11;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
function noop() {
}
function defaultGetNodeKey(node) {
  if (node) {
    return node.getAttribute && node.getAttribute("id") || node.id;
  }
}
function morphdomFactory(morphAttrs2) {
  return function morphdom2(fromNode, toNode, options) {
    if (!options) {
      options = {};
    }
    if (typeof toNode === "string") {
      if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
        var toNodeHtml = toNode;
        toNode = doc.createElement("html");
        toNode.innerHTML = toNodeHtml;
      } else {
        toNode = toElement(toNode);
      }
    } else if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
      toNode = toNode.firstElementChild;
    }
    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
    var onNodeAdded = options.onNodeAdded || noop;
    var onBeforeElUpdated = options.onBeforeElUpdated || noop;
    var onElUpdated = options.onElUpdated || noop;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
    var onNodeDiscarded = options.onNodeDiscarded || noop;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
    var skipFromChildren = options.skipFromChildren || noop;
    var addChild = options.addChild || function(parent, child) {
      return parent.appendChild(child);
    };
    var childrenOnly = options.childrenOnly === true;
    var fromNodesLookup = /* @__PURE__ */ Object.create(null);
    var keyedRemovalList = [];
    function addKeyedRemoval(key) {
      keyedRemovalList.push(key);
    }
    function walkDiscardedChildNodes(node, skipKeyedNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = void 0;
          if (skipKeyedNodes && (key = getNodeKey(curChild))) {
            addKeyedRemoval(key);
          } else {
            onNodeDiscarded(curChild);
            if (curChild.firstChild) {
              walkDiscardedChildNodes(curChild, skipKeyedNodes);
            }
          }
          curChild = curChild.nextSibling;
        }
      }
    }
    function removeNode(node, parentNode, skipKeyedNodes) {
      if (onBeforeNodeDiscarded(node) === false) {
        return;
      }
      if (parentNode) {
        parentNode.removeChild(node);
      }
      onNodeDiscarded(node);
      walkDiscardedChildNodes(node, skipKeyedNodes);
    }
    function indexTree(node) {
      if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = getNodeKey(curChild);
          if (key) {
            fromNodesLookup[key] = curChild;
          }
          indexTree(curChild);
          curChild = curChild.nextSibling;
        }
      }
    }
    indexTree(fromNode);
    function handleNodeAdded(el) {
      onNodeAdded(el);
      var curChild = el.firstChild;
      while (curChild) {
        var nextSibling = curChild.nextSibling;
        var key = getNodeKey(curChild);
        if (key) {
          var unmatchedFromEl = fromNodesLookup[key];
          if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
            curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
            morphEl(unmatchedFromEl, curChild);
          } else {
            handleNodeAdded(curChild);
          }
        } else {
          handleNodeAdded(curChild);
        }
        curChild = nextSibling;
      }
    }
    function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
      while (curFromNodeChild) {
        var fromNextSibling = curFromNodeChild.nextSibling;
        if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
          addKeyedRemoval(curFromNodeKey);
        } else {
          removeNode(
            curFromNodeChild,
            fromEl,
            true
            /* skip keyed nodes */
          );
        }
        curFromNodeChild = fromNextSibling;
      }
    }
    function morphEl(fromEl, toEl, childrenOnly2) {
      var toElKey = getNodeKey(toEl);
      if (toElKey) {
        delete fromNodesLookup[toElKey];
      }
      if (!childrenOnly2) {
        var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
        if (beforeUpdateResult === false) {
          return;
        } else if (beforeUpdateResult instanceof HTMLElement) {
          fromEl = beforeUpdateResult;
          indexTree(fromEl);
        }
        morphAttrs2(fromEl, toEl);
        onElUpdated(fromEl);
        if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
          return;
        }
      }
      if (fromEl.nodeName !== "TEXTAREA") {
        morphChildren(fromEl, toEl);
      } else {
        specialElHandlers.TEXTAREA(fromEl, toEl);
      }
    }
    function morphChildren(fromEl, toEl) {
      var skipFrom = skipFromChildren(fromEl, toEl);
      var curToNodeChild = toEl.firstChild;
      var curFromNodeChild = fromEl.firstChild;
      var curToNodeKey;
      var curFromNodeKey;
      var fromNextSibling;
      var toNextSibling;
      var matchingFromEl;
      outer: while (curToNodeChild) {
        toNextSibling = curToNodeChild.nextSibling;
        curToNodeKey = getNodeKey(curToNodeChild);
        while (!skipFrom && curFromNodeChild) {
          fromNextSibling = curFromNodeChild.nextSibling;
          if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
            continue outer;
          }
          curFromNodeKey = getNodeKey(curFromNodeChild);
          var curFromNodeType = curFromNodeChild.nodeType;
          var isCompatible = void 0;
          if (curFromNodeType === curToNodeChild.nodeType) {
            if (curFromNodeType === ELEMENT_NODE) {
              if (curToNodeKey) {
                if (curToNodeKey !== curFromNodeKey) {
                  if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                    if (fromNextSibling === matchingFromEl) {
                      isCompatible = false;
                    } else {
                      fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                      if (curFromNodeKey) {
                        addKeyedRemoval(curFromNodeKey);
                      } else {
                        removeNode(
                          curFromNodeChild,
                          fromEl,
                          true
                          /* skip keyed nodes */
                        );
                      }
                      curFromNodeChild = matchingFromEl;
                      curFromNodeKey = getNodeKey(curFromNodeChild);
                    }
                  } else {
                    isCompatible = false;
                  }
                }
              } else if (curFromNodeKey) {
                isCompatible = false;
              }
              isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
              if (isCompatible) {
                morphEl(curFromNodeChild, curToNodeChild);
              }
            } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
              isCompatible = true;
              if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
              }
            }
          }
          if (isCompatible) {
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
            continue outer;
          }
          if (curFromNodeKey) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
        if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
          if (!skipFrom) {
            addChild(fromEl, matchingFromEl);
          }
          morphEl(matchingFromEl, curToNodeChild);
        } else {
          var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
          if (onBeforeNodeAddedResult !== false) {
            if (onBeforeNodeAddedResult) {
              curToNodeChild = onBeforeNodeAddedResult;
            }
            if (curToNodeChild.actualize) {
              curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
            }
            addChild(fromEl, curToNodeChild);
            handleNodeAdded(curToNodeChild);
          }
        }
        curToNodeChild = toNextSibling;
        curFromNodeChild = fromNextSibling;
      }
      cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
      var specialElHandler = specialElHandlers[fromEl.nodeName];
      if (specialElHandler) {
        specialElHandler(fromEl, toEl);
      }
    }
    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;
    if (!childrenOnly) {
      if (morphedNodeType === ELEMENT_NODE) {
        if (toNodeType === ELEMENT_NODE) {
          if (!compareNodeNames(fromNode, toNode)) {
            onNodeDiscarded(fromNode);
            morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
          }
        } else {
          morphedNode = toNode;
        }
      } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
        if (toNodeType === morphedNodeType) {
          if (morphedNode.nodeValue !== toNode.nodeValue) {
            morphedNode.nodeValue = toNode.nodeValue;
          }
          return morphedNode;
        } else {
          morphedNode = toNode;
        }
      }
    }
    if (morphedNode === toNode) {
      onNodeDiscarded(fromNode);
    } else {
      if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
        return;
      }
      morphEl(morphedNode, toNode, childrenOnly);
      if (keyedRemovalList) {
        for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
          var elToRemove = fromNodesLookup[keyedRemovalList[i]];
          if (elToRemove) {
            removeNode(elToRemove, elToRemove.parentNode, false);
          }
        }
      }
    }
    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
      if (morphedNode.actualize) {
        morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
      }
      fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }
    return morphedNode;
  };
}
var morphdom = morphdomFactory(morphAttrs);
var morphdom_esm_default = morphdom;

// src/ui/dom.js
function patchContent(target, html) {
  const next = target.cloneNode(false);
  next.innerHTML = html;
  morphdom_esm_default(target, next, {
    childrenOnly: true,
    getNodeKey(node) {
      if (node.nodeType !== 1) return;
      return node.id || node.getAttribute("data-ui-key") || void 0;
    },
    onBeforeElUpdated(from, to) {
      if (from.isEqualNode(to)) return false;
      if (from.matches("input,textarea") && from === document.activeElement)
        return false;
      if (from.matches("[data-full-address]") && from.dataset.fullAddress === to.dataset.fullAddress)
        return false;
      return true;
    }
  });
}

// src/ui/address.js
function createAddressFitter() {
  const parents = /* @__PURE__ */ new Map();
  const known = /* @__PURE__ */ new Map(), pending = /* @__PURE__ */ new Set();
  const canvas = document.createElement("canvas"), context = canvas.getContext("2d");
  let frame = 0;
  const enqueue = (el) => {
    pending.add(el);
    if (!frame) frame = requestAnimationFrame(flush);
  };
  const observer = new ResizeObserver(
    (entries) => entries.forEach(({ target }) => {
      for (const el of known.keys())
        if (el.parentElement === target) enqueue(el);
    })
  );
  function flush() {
    frame = 0;
    const writes = [];
    for (const el of pending) {
      if (!el.isConnected || !el.getClientRects().length) continue;
      const style = getComputedStyle(el), parent = el.parentElement, ps = getComputedStyle(parent);
      const siblings = [...parent.children].filter((n) => n !== el);
      const width = Math.max(
        0,
        parent.clientWidth - parseFloat(ps.paddingLeft || 0) - parseFloat(ps.paddingRight || 0) - siblings.reduce((sum, n) => {
          const st = getComputedStyle(n);
          return sum + n.getBoundingClientRect().width + parseFloat(st.marginLeft || 0) + parseFloat(st.marginRight || 0);
        }, 0) - (parseFloat(ps.columnGap) || 0) * siblings.length
      );
      const full = el.dataset.fullAddress;
      const key = [
        full,
        Math.floor(width),
        style.font,
        style.letterSpacing
      ].join("|");
      if (known.get(el) === key) continue;
      known.set(el, key);
      context.font = style.font;
      const spacing = parseFloat(style.letterSpacing) || 0;
      const fits = (text) => context.measureText(text).width + Math.max(0, text.length - 1) * spacing <= width + 1;
      let value = full;
      if (!fits(full)) {
        let lo = 0, hi = full.length - 1;
        value = "...";
        while (lo <= hi) {
          const count = lo + hi >> 1, right = Math.floor(count / 2);
          const candidate = full.slice(0, Math.ceil(count / 2)) + "..." + (right ? full.slice(-right) : "");
          if (fits(candidate)) {
            value = candidate;
            lo = count + 1;
          } else hi = count - 1;
        }
      }
      writes.push([
        el,
        value,
        Math.ceil(
          context.measureText(full).width + Math.max(0, full.length - 1) * spacing
        )
      ]);
    }
    pending.clear();
    for (const [el, value, naturalWidth] of writes) {
      if (el.style.width !== naturalWidth + "px")
        el.style.width = naturalWidth + "px";
      if (el.textContent !== value) el.textContent = value;
    }
  }
  function release(root) {
    for (const el of known.keys())
      if (root.contains(el) || !el.isConnected) {
        if (parents.has(el)) observer.unobserve(parents.get(el));
        parents.delete(el);
        known.delete(el);
        pending.delete(el);
      }
  }
  function observe(root) {
    for (const el of known.keys())
      if (!el.isConnected) {
        if (parents.has(el)) observer.unobserve(parents.get(el));
        parents.delete(el);
        known.delete(el);
        pending.delete(el);
      }
    root.querySelectorAll("[data-full-address]").forEach((el) => {
      if (!known.has(el)) {
        known.set(el, null);
        parents.set(el, el.parentElement);
        observer.observe(el.parentElement);
      }
      enqueue(el);
    });
  }
  const fontChange = () => {
    for (const el of known.keys()) {
      known.set(el, null);
      enqueue(el);
    }
  };
  document.fonts.ready.then(fontChange);
  document.fonts.addEventListener("loadingdone", fontChange);
  return { observe, release };
}

// src/pos-models.js
function computeGuardianRows(s) {
  const eth = s.ethereum?.data?.guardianDetails;
  if (!eth) return null;
  const pol = s.polygon?.data?.guardianDetails, byAddress = new Map((pol || []).map((g) => [g.address, g]));
  return eth.map((e) => {
    const p = byAddress.get(e.address);
    return {
      address: e.address,
      name: e.name,
      ethereum: e,
      polygon: p,
      polygonKnown: !!pol,
      total: pol && e.effectiveStake !== null && (!p || p.effectiveStake !== null) ? e.effectiveStake + (p?.effectiveStake || 0) : null
    };
  }).sort(
    (a, b) => (b.total ?? -1) - (a.total ?? -1) || a.address.localeCompare(b.address)
  ).map((g, i) => ({ ...g, rank: g.total === null ? null : i + 1 }));
}
function computeChartSeries(s, chart2, period, now) {
  const get = (key) => {
    const d = s[key]?.data;
    if (!Array.isArray(d?.history)) return null;
    const a = d.history.map((x) => ({ ...x }));
    if (a.length && Number.isFinite(d.refTime) && d.refTime > a.at(-1).time)
      a.push({ time: d.refTime, value: a.at(-1).value });
    return a;
  };
  const eth = get("ethereum"), pol = get("polygon");
  let series;
  if (chart2 === "total") {
    if (!eth || !pol) return null;
    if (!eth.length || !pol.length) return [];
    const start = Math.max(eth[0].time, pol[0].time), end = Math.min(eth.at(-1).time, pol.at(-1).time);
    const times = [
      ...new Set(
        [...eth, ...pol, { time: start }, { time: end }].map((x) => x.time)
      )
    ].filter((t2) => t2 >= start && t2 <= end).sort((a, b) => a - b);
    let i = 0, j = 0;
    series = times.map((time) => {
      while (i + 1 < eth.length && eth[i + 1].time <= time) i++;
      while (j + 1 < pol.length && pol[j + 1].time <= time) j++;
      return { time, value: eth[i].value + pol[j].value };
    });
  } else series = chart2 === "Ethereum" ? eth : pol;
  if (!series?.length) return series;
  const cutoff = now - Number(period) * 86400;
  const before = series.filter((p) => p.time <= cutoff).at(-1);
  const filtered = series.filter((p) => p.time > cutoff);
  if (before && filtered.length)
    filtered.unshift({ time: cutoff, value: before.value });
  return filtered;
}
function createPosModelCache() {
  let source = null, guardians = null;
  const series = /* @__PURE__ */ new Map();
  return {
    guardians(data) {
      if (source !== data) {
        source = data;
        guardians = computeGuardianRows(data);
        series.clear();
      }
      return guardians;
    },
    series(data, chart2, period, now = Date.now() / 1e3) {
      this.guardians(data);
      const key = chart2 + ":" + period + ":" + Math.floor(now / 60);
      if (!series.has(key)) {
        if (series.size > 12) series.clear();
        series.set(key, computeChartSeries(data, chart2, period, now));
      }
      return series.get(key);
    }
  };
}

// src/app.js
var posModels = createPosModelCache();
var colorSnapshot;
var colors = /* @__PURE__ */ new Map();
function guardianColorFor(address) {
  const snapshot = posSources().ethereum?.data?.committeeSnapshot;
  if (snapshot !== colorSnapshot) {
    colorSnapshot = snapshot;
    colors = committeeColorMap(snapshot ? [snapshot] : []);
  }
  return guardianColor(colors, address);
}
function guardianAvatar(address, name) {
  return `<span class="guardian-icon" data-guardian-color="${escapeHTML(address)}" style="background-color:${guardianColorFor(address)}" aria-hidden="true">${escapeHTML(guardianInitials(name))}</span>`;
}
function refreshGuardianColors() {
  document.querySelectorAll("[data-guardian-color]").forEach((el) => el.style.backgroundColor = guardianColorFor(el.dataset.guardianColor));
}
function guardianRows() {
  return posModels.guardians(posSources());
}
function chartSeries() {
  return posModels.series(posSources(), state.chart, state.period);
}
var $ = (s) => document.querySelector(s);
var state = { connected: false, chart: "total", period: "30", search: "" };
var icon = (name) => `<span class="metric-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.stake}</svg></span>`;
var ext = (url, label) => {
  let href;
  try {
    const u = new URL(String(url));
    if (!["https:", "http:", "mailto:"].includes(u.protocol))
      return escapeHTML(label);
    href = u.href;
  } catch {
    return escapeHTML(label);
  }
  return `<a class="text-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} \u2197</a>`;
};
var heading = (tag, title, extra = "") => `<div class="section-head"><div><div class="eyebrow">${tag}</div><h1>${title}</h1></div>${extra}</div>`;
var pill = (text, kind = "") => `<span class="pill ${kind}">${text}</span>`;
var stat = (name, value, unit, kind, sub = "") => `<div class="big-stat">${icon(kind)}<span class="metric-label">${name}</span><div class="metric-value">${value} <small>${unit}</small></div>${sub ? `<span class="muted">${sub}</span>` : ""}</div>`;
var overviewData = null;
var overviewLoading = false;
var overviewFetched = 0;
var overviewError = false;
var escapeHTML = (v) => String(v).replace(
  /[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
);
var liveNumber = (v) => Number.isFinite(v) ? v.toLocaleString("en-US") : "\u2014";
var stakeNumber = (v) => !Number.isFinite(v) ? "\u2014" : v >= 1e9 ? (v / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "B" : v >= 1e6 ? (v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "M" : liveNumber(v);
async function loadOverview() {
  if (overviewLoading || Date.now() - overviewFetched < 6e5) return;
  overviewLoading = true;
  try {
    const response = await fetch("/api/overview?v=8", {
      signal: AbortSignal.timeout(2e4)
    });
    if (!response.ok) throw Error("Overview unavailable");
    const data = await response.json();
    if (!data.sources) throw Error("Invalid overview");
    overviewData = data;
    refreshGuardianColors();
    document.querySelectorAll("[data-guardian-voted]").forEach((el) => {
      el.innerHTML = guardianParticipation(el.dataset.guardianVoted);
    });
    overviewError = false;
  } catch {
    overviewError = true;
  } finally {
    overviewLoading = false;
    overviewFetched = Date.now();
    if (["overview", "pos", "dao", "mypage"].includes(
      location.hash.slice(1) || "overview"
    ))
      render();
  }
}
setInterval(() => {
  if (!document.hidden && ["overview", "pos", "dao", "mypage"].includes(
    location.hash.slice(1) || "overview"
  ))
    loadOverview();
}, 3e4);
var networkSymbol = (network) => `<img class="network-symbol" src="${metricLogos[network.toLowerCase()]}" alt="${network}" width="18" height="18">`;
function posSources() {
  return overviewData?.sources || {};
}
function guardianSelfStakeRatio(d) {
  return Number.isFinite(d.selfStake) && Number.isFinite(d.effectiveStake) ? d.effectiveStake > 0 ? (d.selfStake / d.effectiveStake * 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + "%" : "N/A" : t("Unavailable");
}
function liveGuardianModal(id) {
  loadParticipation();
  const g = guardianRows()?.find((g2) => g2.address === id);
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
      ["Polygon", g.polygon]
    ].map(
      ([network, d]) => d ? `<section class="guardian-chain-profile"><h3>${networkSymbol(network)} ${network}</h3><dl class="detail-list">${row(t("Effective stake"), liveNumber(d.effectiveStake) + " ORBS")}${row(t("Self stake"), liveNumber(d.selfStake) + " ORBS")}${row(t("Self stake ratio"), guardianSelfStakeRatio(d))}${row(t("Delegated stake"), liveNumber(d.delegatedStake) + " ORBS")}${row(t("Number of Delegators"), Number.isSafeInteger(posSources().status?.data?.[network.toLowerCase()]?.[g.address]) ? liveNumber(posSources().status.data[network.toLowerCase()][g.address]) : "0")}${row(t("Committee"), d.inCommittee ? t("Participating") : t("Not in committee"))}${row(t("Registered"), d.registrationTime ? new Date(d.registrationTime * 1e3).toLocaleDateString(portalLocale()) : t("Unavailable"))}</dl></section>` : ""
    ).join(
      ""
    )}${!g.polygonKnown ? '<p class="muted">' + t("Polygon data temporarily unavailable.") + "</p>" : ""}${ext("https://analytics.orbs.network/ethereum/guardians/stake/" + g.address, t("Open Analytics"))}</div>`,
    true
  );
}
function liveProposalModal(id) {
  const data = posSources().snapshot?.data;
  const p = [...data?.proposals || [], ...data?.activeProposals || []].find(
    (p2) => p2.id === id
  );
  if (!p) return;
  openModal(
    `<div class="eyebrow">${t("ORBS IMPROVEMENT PROPOSAL")}</div><h2 id="dialog-title">${escapeHTML(p.title)}</h2><div class="proposal-body">${p.bodyHtml || escapeHTML(p.body || t("No description provided."))}</div>${ext("https://snapshot.org/#/s:orbs-network.eth/proposal/" + p.id, t("Read and vote on Snapshot"))}`
  );
}
var communityData = null;
var communityLoading = false;
var communityFetched = 0;
var communityError = false;
async function loadCommunity() {
  if (communityLoading || Date.now() - communityFetched < 6e5) return;
  communityLoading = true;
  try {
    const response = await fetch("/api/community?v=3", {
      signal: AbortSignal.timeout(3e4)
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
}, 3e4);
var accountAddress = null;
var accountParts = {};
var accountGeneration = 0;
var accountAbort = null;
var walletImport = null;
var accountPartNames = [
  "ethereum",
  "polygon",
  "votes",
  "history-ethereum",
  "history-polygon"
];
function shortAddress(a) {
  return a ? a.slice(0, 6) + "\u2026" + a.slice(-4) : "";
}
function loadWallet() {
  return walletImport ??= import("/wallet.js").catch((e) => {
    walletImport = null;
    throw e;
  });
}
async function connectWallet() {
  try {
    await loadWallet();
    await window.portalWallet.open();
  } catch {
    openModal(
      '<h2 id="dialog-title">' + t("Unable to open wallet connection") + "</h2><p>" + t("Please try again. Check that your browser can access Reown.") + "</p>"
    );
  }
}
async function loadAccountPart(part) {
  if (!accountAddress) return;
  const address = accountAddress, generation = accountGeneration;
  if (accountParts[part]?.loading) return;
  accountParts[part] = { ...accountParts[part], loading: true };
  try {
    const r = await fetch(`/api/account?address=${address}&part=${part}`, {
      signal: accountAbort.signal
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
  address = /^0x[0-9a-f]{40}$/i.test(address || "") ? address.toLowerCase() : null;
  if (address === accountAddress) return;
  accountAbort?.abort();
  accountGeneration++;
  accountAddress = address;
  state.connected = !!address;
  try {
    if (address) localStorage.setItem("orbs-portal-wallet-connected", "true");
    else localStorage.removeItem("orbs-portal-wallet-connected");
  } catch {
  }
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
window.addEventListener(
  "portal-wallet-account",
  (e) => setWalletAccount(e.detail.address, e.detail.userInitiated === true)
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
  menu.innerHTML = '<a href="#mypage">' + t("My Page") + '</a><button id="disconnect">' + t("Disconnect") + "</button>";
  $("#connect-wallet").parentElement.append(menu);
  $("#connect-wallet").setAttribute("aria-expanded", "true");
  menu.querySelector("a").focus();
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-account-retry]")) {
    loadAccountPart(
      e.target.closest("[data-account-retry]").dataset.accountRetry
    );
    render();
  }
  if (!e.target.closest("#wallet-dropdown") && !e.target.closest("#connect-wallet")) {
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
var returnFocus;
function openModal(content, guardian = false) {
  returnFocus = document.activeElement;
  $("#portal-dialog").classList.toggle("guardian-modal", guardian);
  $("#dialog-content").innerHTML = `<button class="modal-close" data-close aria-label="${t("Close dialog")}">\xD7</button>${content}`;
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
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
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
        0
      ],
      [
        "Tetra Mobile for iOS",
        t("Get Tetra Mobile on the App Store"),
        "https://apps.apple.com/kr/app/tetra-mobile/id6453168712?l=en-GB",
        1
      ],
      [
        "Tetra Mobile for Android",
        t("Get Tetra Mobile on Google Play"),
        "https://play.google.com/store/apps/details?id=com.orbs.pos.klip",
        2
      ]
    ].map(
      ([name, description, url, symbol]) => `<a class="staking-option" href="${url}" target="_blank" rel="noopener noreferrer"><span class="platform-icon" aria-hidden="true">${stakingAppIcons[symbol]}</span><span><strong>${name}</strong><small>${description}</small></span><span aria-hidden="true">\u2197</span></a>`
    ).join(
      ""
    )}</div><p class="muted staking-note">${t("Connect your wallet and select Ethereum or Polygon in Tetra. Tetra will ask you to connect separately.")}</p>`
  );
}
var scheduledRender = 0;
function scheduleRender() {
  if (!scheduledRender)
    scheduledRender = requestAnimationFrame(() => {
      scheduledRender = 0;
      render();
    });
}
var participationData = null;
var participationLoading = false;
var participationFetched = 0;
var participationError = false;
async function loadParticipation() {
  if (participationLoading || Date.now() - participationFetched < 6e5) return;
  participationLoading = true;
  try {
    const r = await fetch("/api/participation?v=2", { signal: AbortSignal.timeout(3e4) });
    if (!r.ok) throw Error();
    const data = await r.json();
    if (!Number.isInteger(data.total) || !data.counts) throw Error();
    participationData = data;
    participationError = false;
  } catch {
    participationError = true;
  } finally {
    participationLoading = false;
    participationFetched = Date.now();
    document.querySelectorAll("[data-guardian-voted]").forEach((el) => {
      el.innerHTML = guardianParticipation(el.dataset.guardianVoted);
    });
    if (location.hash === "#pos") scheduleRender();
  }
}
function guardianParticipation(address) {
  if (participationError) return `<span class="muted">${t("Unavailable")}</span>`;
  if (!participationData) return `<span class="muted">${t("Reading\u2026")}</span>`;
  const guardian = guardianRows()?.find((g) => g.address === address.toLowerCase());
  const times = [guardian?.ethereum?.registrationTime, guardian?.polygon?.registrationTime].filter((time) => Number.isFinite(time) && time > 0);
  const result = participationSince(participationData, address, times.length ? Math.min(...times) : null);
  return result ? `${result.count} / ${result.total}` : `<span class="muted">${t("Unavailable")}</span>`;
}
setInterval(() => {
  if (!document.hidden && location.hash === "#pos") loadParticipation();
}, 3e4);
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
    news: "community"
  };
  if (aliases[route]) {
    location.replace("#" + aliases[route]);
    return;
  }
  patchContent(
    $("#main"),
    pages[route] ? pages[route]() : heading(
      t("Page not found"),
      t("This page is not available."),
      '<a class="button" href="#overview">' + t("Back to Overview") + "</a>"
    )
  );
  document.title = `${{ overview: t("Overview"), pos: "POS", dao: "DAO", community: t("Community"), mypage: t("My Page") }[route] || t("Not found")} \xB7 ORBS ${t("Community")} Portal`;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === route);
    if (a.dataset.nav === route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("#connect-wallet").textContent = state.connected ? shortAddress(accountAddress) + " \u25BE" : t("Connect Wallet");
  $("#connect-wallet").setAttribute(
    "aria-label",
    state.connected ? t("Connected wallet: open account menu") : t("Connect Wallet")
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
    window.portalWallet?.disconnect().then(() => setWalletAccount(null)).catch(
      () => openModal(
        '<h2 id="dialog-title">' + t("Unable to disconnect") + "</h2><p>" + t("Please try again.") + "</p>"
      )
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
      `[data-${el.dataset.chart ? "chart" : "period"}="${el.dataset.chart || el.dataset.period}"]`
    ).focus();
  }
  if (el.dataset.slide) {
    const track = $("#carousel-" + el.dataset.slide);
    track.scrollBy({
      left: Number(el.dataset.direction) * (track.firstElementChild.getBoundingClientRect().width + 18),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "guardian-search") {
    state.search = e.target.value;
    patchContent($("#guardian-list"), guardianList());
  }
});
var {
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
  loadingValue
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
  }
});
var previousRoute = location.hash;
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
var themeMedia = matchMedia("(prefers-color-scheme: dark)");
var explicitTheme = false;
try {
  explicitTheme = ["light", "dark"].includes(
    localStorage.getItem("orbs-portal-theme")
  );
} catch {
}
function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === "dark";
  const label = dark ? t("Switch to light mode") : t("Switch to dark mode");
  $("#theme-toggle").setAttribute("aria-label", label);
  $("#theme-toggle").title = label;
}
$("#theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  explicitTheme = true;
  try {
    localStorage.setItem("orbs-portal-theme", next);
  } catch {
  }
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
    document.documentElement.dataset.theme = explicitTheme ? e.newValue : themeMedia.matches ? "dark" : "light";
    updateThemeLabel();
  }
});
updateThemeLabel();
document.addEventListener(
  "error",
  (e) => {
    if (e.target.matches?.(".social-thumbnail img")) {
      const a = e.target.closest(".social-thumbnail");
      if (["announcements", "blog"].includes(a.dataset.socialKind) && !e.target.dataset.logoFallback) {
        e.target.dataset.logoFallback = "true";
        e.target.src = "https://www.orbs.com/marketing/brand-assets/orbs-logo-vertical.svg";
        e.target.alt = "Orbs logo";
        a.classList.add("social-logo-thumbnail");
        return;
      }
      a.classList.add("image-unavailable");
      a.textContent = t("View image in original post \u2197");
    }
  },
  true
);
function shouldRestoreWallet() {
  try {
    return localStorage.getItem("orbs-portal-wallet-connected") === "true" || localStorage.getItem("@appkit/connection_status") === "connected" || !!localStorage.getItem("@appkit/eip155:connected_connector_id");
  } catch {
    return false;
  }
}
if (shouldRestoreWallet()) loadWallet().catch(() => {
});
setInterval(() => {
  if (state.connected && location.hash === "#mypage" && !document.hidden)
    accountPartNames.forEach((part) => {
      const p = accountParts[part];
      if (p?.data && Date.now() - p.fetchedAt >= 6e5) loadAccountPart(part);
    });
}, 3e4);
function copyAddressButton(address) {
  return `<button type="button" class="copy-address" data-copy-address="${escapeHTML(address)}" aria-label="${t("Copy address")}" title="${t("Copy address")}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button>`;
}
var addressToastTimer;
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
  (dialog.open ? document.querySelector("#dialog-content") : document.body).append(toast);
  addressToastTimer = setTimeout(() => toast.remove(), 3e3);
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
var addressFitter = createAddressFitter();
function observeGuardianAddresses() {
  addressFitter.observe(document.querySelector("#main"));
  addressFitter.observe(document.querySelector("#dialog-content"));
}
observeGuardianAddresses();
new MutationObserver((records) => {
  if (records.some(
    (r) => [...r.addedNodes, ...r.removedNodes].some((n) => n.nodeType === 1)
  ))
    observeGuardianAddresses();
}).observe(document.querySelector("#main"), { childList: true, subtree: true });
document.querySelector("#portal-dialog").addEventListener(
  "close",
  () => addressFitter.release(document.querySelector("#dialog-content"))
);
document.addEventListener("pointermove", (event) => {
  const chart2 = event.target.closest?.("[data-stake-chart]");
  if (!chart2) return;
  const series = chartSeries();
  if (!series?.length) return;
  const box = chart2.getBoundingClientRect(), x = (event.clientX - box.left) / box.width * 610, time = series[0].time + Math.max(0, Math.min(1, (x - 60) / 530)) * (series.at(-1).time - series[0].time);
  let lo = 0, hi = series.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (series[mid].time <= time) lo = mid;
    else hi = mid - 1;
  }
  const point = series[lo];
  const title = chart2.querySelector(".chart-point-title");
  const text = new Date(point.time * 1e3).toLocaleString(portalLocale()) + ": " + liveNumber(point.value) + " ORBS";
  if (title.textContent !== text) title.textContent = text;
});
function votedLabel() {
  return `${t("Voted")} <button type="button" class="voted-info" data-voted-info aria-label="${t("About voting participation")}" aria-expanded="false">i</button>`;
}
var votedInfoButton = null;
function closeVotedInfo() {
  document.getElementById("voted-tooltip")?.remove();
  votedInfoButton?.setAttribute("aria-expanded", "false");
  votedInfoButton?.removeAttribute("aria-describedby");
  votedInfoButton = null;
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-voted-info]");
  if (!button) {
    if (!event.target.closest("#voted-tooltip")) closeVotedInfo();
    return;
  }
  const wasOpen = button === votedInfoButton;
  closeVotedInfo();
  if (wasOpen) return;
  votedInfoButton = button;
  const tip = document.createElement("div");
  tip.id = "voted-tooltip";
  tip.className = "voted-tooltip";
  tip.setAttribute("role", "tooltip");
  tip.setAttribute("popover", "manual");
  tip.textContent = t("Proposals this guardian voted on / all proposals created since its earliest recorded guardian registration.");
  (button.closest("dialog") || document.body).append(tip);
  tip.showPopover?.();
  const rect = button.getBoundingClientRect(), box = tip.getBoundingClientRect();
  tip.style.left = Math.max(12, Math.min(rect.left, innerWidth - box.width - 12)) + "px";
  tip.style.top = (rect.bottom + 8 + box.height <= innerHeight - 12 ? rect.bottom + 8 : Math.max(12, rect.top - box.height - 8)) + "px";
  button.setAttribute("aria-expanded", "true");
  button.setAttribute("aria-describedby", tip.id);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && votedInfoButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    closeVotedInfo();
  }
}, true);
window.addEventListener("resize", closeVotedInfo);
document.addEventListener("scroll", closeVotedInfo, true);
document.addEventListener("close", closeVotedInfo, true);
window.addEventListener("hashchange", closeVotedInfo);
