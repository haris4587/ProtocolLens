import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of ['index.html','style.css'])await copyFile('web/'+name,'dist/'+name);
await copyFile('deployment.json','dist/deployment.json');
await copyFile('contracts/protocol_lens.py','dist/protocol_lens.py');
await build({entryPoints:['web/app.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/app.js',minify:true});
