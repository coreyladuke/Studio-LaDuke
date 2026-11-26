import {get,put,list} from '@vercel/blob';

export function blobStore(token){
 const prefix='world-builder/v1/';
 return {
  async read(path){
   const object=await get(prefix+path,{access:'private',token,useCache:path.startsWith('chunks/')});
   if(!object||object.statusCode===304)return null;
   return {bytes:Buffer.from(await new Response(object.stream).arrayBuffer()),etag:object.blob.etag};
  },
  async write(path,bytes,etag){
   try{
    await put(prefix+path,bytes,{access:'private',token,addRandomSuffix:false,
     allowOverwrite:etag!==null,...(etag?{ifMatch:etag}:{})});
   }catch(error){
    if(/precondition|already exists/i.test(error.message))error.code='conflict';
    throw error;
   }
  },
  async keys(path){
   const paths=[];
   let cursor;
   do {
    const page=await list({prefix:prefix+path,cursor,token});
    paths.push(...page.blobs.map(blob=>blob.pathname.slice(prefix.length)));
    cursor=page.hasMore?page.cursor:undefined;
   }while(cursor);
   return paths;
  }
 };
}
