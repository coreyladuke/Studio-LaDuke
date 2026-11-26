import {createWorldHandler} from '../lib/world-repository.mjs';

const token=process.env.BLOB_READ_WRITE_TOKEN;
const store=(token||process.env.BLOB_STORE_ID)?(await import('../lib/world-blob.mjs')).blobStore(token):null;
const handle=createWorldHandler({store,secret:process.env.WORLD_BUILDER_OWNER_PASSPHRASE});
export default {fetch:handle};
