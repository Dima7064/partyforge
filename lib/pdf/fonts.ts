import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;
  const dir = path.join(process.cwd(), "public/fonts");
  Font.register({
    family: "PTSans",
    fonts: [
      { src: path.join(dir, "PT_Sans-Web-Regular.ttf") },
      { src: path.join(dir, "PT_Sans-Web-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(dir, "PT_Sans-Web-Italic.ttf"), fontStyle: "italic" },
      {
        src: path.join(dir, "PT_Sans-Web-BoldItalic.ttf"),
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}