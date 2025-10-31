// index.js
uninstallHandlers.push(un);
patched = true;
return true;
} catch (e) {
console.error('FileSizeOnPicker: patch failed', e);
return false;
}
}


function attachSizeToVNode(vnode) {
if (!vnode || typeof vnode !== 'object') return false;
// If vnode has props with file/attachment and size meta, append
const props = vnode.props || {};
const file = props.file || props.attachment || (props.message && props.message.file) || null;
if (file && typeof file.size === 'number') {
const sizeStr = humanFileSize(file.size);
const sizeNode = createSizeVNode(React, sizeStr);
if (!sizeNode) return false;
// Attach after the filename text if children exist
if (!props.children) {
vnode.props.children = [sizeNode];
} else if (Array.isArray(props.children)) {
// append
vnode.props.children = [...props.children, sizeNode];
} else {
vnode.props.children = [props.children, sizeNode];
}
return true;
}


// Search children recursively
const children = props.children;
if (Array.isArray(children)) {
for (const c of children) {
if (attachSizeToVNode(c)) return true;
}
} else if (children && typeof children === 'object') {
return attachSizeToVNode(children);
}
return false;
}


module.exports = {
onStart() {
try {
if (!Patcher || !after) {
showToast('FileSizeOnPicker: brak Patcher API w Revenge. Sprawdź wersję.');
console.error('Patcher not found', Patcher);
return;
}


if (!React) {
console.warn('React not found via Metro fallbacks — trying global.React');
}


const found = tryFindRowComponent();
if (!found) {
showToast('FileSizeOnPicker: nie znalazłem komponentu w Revenge. Włącz debugowanie i prześlij logi.');
console.warn('FileSizeOnPicker: tryFindRowComponent returned null');
return;
}


console.log('FileSizeOnPicker: found component via', found.via, found.comp);
const ok = patchComponent(found.comp);
if (ok) showToast('FileSizeOnPicker: włączony (Revenge)');
else showToast('FileSizeOnPicker: nie udało się zainstalować patcha — sprawdź konsolę');
} catch (e) {
console.error('FileSizeOnPicker: start error', e);
showToast('FileSizeOnPicker: błąd podczas uruchamiania (zobacz konsolę)');
}
},


onStop() {
try {
for (const u of uninstallHandlers) {
try { u(); } catch (e) {}
}
uninstallHandlers = [];
unpatchAll && unpatchAll();
patched = false;
showToast('FileSizeOnPicker: wyłączony');
} catch (e) {
console.error('FileSizeOnPicker: stop error', e);
}
}
};


/*
USAGE / TROUBLESHOOTING
- Install the folder containing manifest.json + index.js into Revenge's plugins folder.
- If plugin doesn't show sizes, open Revenge developer console and inspect the component names by running:
console.log(window.findByDisplayName && window.findByDisplayName.toString())
console.log(window.findByProps && window.findByProps('file','size'))
then send me the returned component name/object and I will harden the detection.
- If Revenge exposes a slightly different API, edit the `safeRequire` arrays at top to include the correct module names.
*/
