import iframelyConfig from './config.js';
import {pathToFileURL} from "url";
import {join} from "path";

// Load global config from exec dir, because `iframely` can be used as library.
var globalConfig = await import(pathToFileURL(join(process.cwd(), 'config.js')).href);
globalConfig = globalConfig && globalConfig.default;
export default {...iframelyConfig, ...globalConfig};