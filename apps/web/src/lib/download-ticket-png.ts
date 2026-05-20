/** Rasterize a DOM node to PNG (WYSIWYG ticket download). */
export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
