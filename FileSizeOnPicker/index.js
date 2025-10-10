import { after } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";

const FilePickerRow = findByName("FilePickerRow", false);

let patch;

export default {
  onLoad: () => {
    patch = after("default", FilePickerRow, (args, res) => {
      try {
        const file = args[0]?.file;
        if (!file) return res;

        const size = formatFileSize(file.size);

        // dodajemy rozmiar obok nazwy
        if (res?.props?.children?.props?.children) {
          res.props.children.props.children += ` (${size})`;
        }
      } catch (e) {
        console.error("[FileSizeOnPicker]", e);
      }
      return res;
    });
  },
  onUnload: () => {
    patch?.();
  },
};

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
// @ sourceType=module

