import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-math"], ["remark-gfm"]],
    rehypePlugins: [
      ["rehype-katex", { strict: false, output: "htmlAndMathml" }],
      ["rehype-slug"],
      ["rehype-autolink-headings"],
    ],
  },
});

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default withMDX(config);
