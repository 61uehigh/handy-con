from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib,json
root=Path(__file__).resolve().parent.parent
version=json.loads((root/'manifest.json').read_text())['version']
files=['manifest.json','background.js','debugger-fullscreen.js','remote.html','remote.js','style.css','gestures.js','player.js','control-icons.js','camera-handedness.js','hand-topology.js','vendor/LICENSE','vendor/vision_bundle.mjs','vendor/gesture_recognizer.task']
files += [str(p.relative_to(root)) for p in sorted((root/'vendor/wasm').glob('*')) if p.is_file()]
files += ['icons/icon-%s.png'%n for n in (16,32,48,128)]
out=root/'dist'/('HandyCon-%s.zip'%version)
with ZipFile(out,'w',ZIP_DEFLATED) as archive:
 for name in files: archive.write(root/name,name)
with ZipFile(out) as archive:
 assert archive.testzip() is None
 assert json.loads(archive.read('manifest.json'))['version']==version
checksum=hashlib.sha256(out.read_bytes()).hexdigest()
(root/'dist'/'SHA256SUMS.txt').write_text(checksum+'  '+out.name+'\n')
print(str(out)+' (%s bytes, %s files)'%(out.stat().st_size,len(files)))
