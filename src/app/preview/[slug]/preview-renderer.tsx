"use client";

export function PreviewRenderer({ html }: { html: string }) {
  return (
    <iframe
      srcDoc={html}
      className="w-full h-screen border-0"
      title="Website Preview"
      sandbox="allow-scripts allow-same-origin"
      style={{ display: "block" }}
    />
  );
}
