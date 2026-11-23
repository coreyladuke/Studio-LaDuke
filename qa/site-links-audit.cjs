/* Static path existence audit of all HTML entrypoints, scripts, images, anchors and stylesheet paths.
   Run: node qa/site-links-audit.cjs
   In addition to this, use a browser for dynamic routes and generated assets.
*/
const fs=require("fs"),path=require("path");
const root=process.cwd();
function collect(folder){
 return fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>{
  const f=path.join(folder,e.name);
  if(e.isDirectory())return e.name==="node_modules"||e.name===".git"?[]:collect(f);
  return e.name.endsWith(".html")?[f]:[];
 });
}
const htmlFiles=collect(root);
let nodes=0,missing=[],external=new Set(),links=0;
for(const file of htmlFiles){
 const text=fs.readFileSync(file,"utf8");
 const matches=[...text.matchAll(/(?:^|\s)(href|src|poster)\s*=\s*["']([^"']+)["']/gi)];
 for(const m of matches){
  nodes++;
  const attrib=m[1].toLowerCase(),literal=m[2].trim();
  if(/^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(literal)||literal==="")continue;
  if(/^(?:https?:)?\/\//i.test(literal)){try{external.add(new URL(literal, "https://studioladuke.com").hostname)}catch{};continue;}
  if(/[{}$]/.test(literal))continue;
  const rel=literal.split(/[?#]/)[0];
  if(rel==="")continue;
  let decoded;
  try{decoded=decodeURIComponent(rel)}catch{decoded=rel}
  const target=rel.startsWith("/")?path.join(root,decoded.replace(/^\/+/,"")):path.resolve(path.dirname(file),decoded);
  links++;
  if(!target.startsWith(root+path.sep)&&target!==root){missing.push({source:path.relative(root,file),attribute:attrib,link:literal,reason:"outside repository"});continue;}
  if(!fs.existsSync(target)) {
   if(path.extname(target)===""&&fs.existsSync(target+".html"))continue;
   missing.push({source:path.relative(root,file),attribute:attrib,link:literal,reason:"missing file"});
  }
 }
}
const result={htmlFiles:htmlFiles.length,referencedLocalFiles:links,checkedAttributes:nodes,missing,externalDomains:[...external].sort()};
console.log(JSON.stringify(result,null,2));
if(missing.length)process.exitCode=1;