import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { h } from "hastscript";

/**
 * remark plugin: containerDirective (:::keyfact, :::delta) を
 * remark-rehype が正しいHTML要素に変換できるよう hast 情報を付与する。
 *
 * :::keyfact[ラベル]
 * 本文
 * :::
 *
 * →  <aside class="keyfact-card" role="note">
 *      <span class="keyfact-label">ラベル</span>
 *      <p>本文</p>
 *    </aside>
 */
export function remarkCustomDirectives() {
  return (tree: Root) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      if (node.type !== "containerDirective") return;

      const name: string = node.name;

      if (name === "keyfact") {
        const data = node.data || (node.data = {});
        const hast = h("aside.keyfact-card", { role: "note" });
        data.hName = hast.tagName;
        data.hProperties = hast.properties;

        // Extract label (directiveLabel paragraph) and convert to span
        const labelChild = node.children?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.data?.directiveLabel
        );
        if (labelChild) {
          labelChild.data = labelChild.data || {};
          labelChild.data.hName = "span";
          labelChild.data.hProperties = { className: ["keyfact-label"] };
        }
      }

      if (name === "delta") {
        const data = node.data || (node.data = {});
        const hast = h("aside.delta-card", { role: "note" });
        data.hName = hast.tagName;
        data.hProperties = hast.properties;

        // Prepend a NEW badge node
        const badge = {
          type: "paragraph",
          data: {
            hName: "span",
            hProperties: { className: ["delta-badge"] },
          },
          children: [{ type: "text", value: "NEW" }],
        };
        node.children = [badge, ...node.children];
      }
    });
  };
}
