import morphdom from "morphdom";

// Preserve nodes, focus, selection and native scroll positions across data refreshes.
export function patchContent(target, html) {
  const next = target.cloneNode(false);
  next.innerHTML = html;
  morphdom(target, next, {
    childrenOnly: true,
    getNodeKey(node) {
      if (node.nodeType !== 1) return;
      return node.id || node.getAttribute("data-ui-key") || undefined;
    },
    onBeforeElUpdated(from, to) {
      if (from.isEqualNode(to)) return false;
      if (from.matches("input,textarea") && from === document.activeElement)
        return false;
      if (
        from.matches("[data-full-address]") &&
        from.dataset.fullAddress === to.dataset.fullAddress
      )
        return false;
      return true;
    },
  });
}
