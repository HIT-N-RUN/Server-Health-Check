import isPortReachable from 'is-port-reachable';
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import Datastore from 'nedb';
import child_process from 'child_process';

const db = new Datastore({ filename: `./data/storage.data`, autoload: true});

db.loadDatabase(function (err) {
    if (err) {
        throw new Error('loadDatabase Error');
    }
});

const require = createRequire(import.meta.url); // construct the require method
const { targets, intervalDelay }= require("./config.json") // use the require method

const getCurrentTimeStamp = () => {
    const date = new Date();
    return new Date(+date + 3240 * 10000).toISOString().replace('T', ' ').replace(/\..*/, '');
}

const check = async () => {
    console.group(`${getCurrentTimeStamp()} - check start!`);
        
    for (let i = 0; i < targets.length; i++) {
        const { host = 'localhost', port = 80 } = targets[i];
        const rechable = await isPortReachable(port, { host });
        const resStr = rechable ? 'opened' : 'closed'
        var AED_Status = null;

        if (!rechable  && targets[i].AED) {
            const options = {};
            if (targets[i].cwd) {
                options.cwd = targets[i].cwd;
            }
            try {
                child_process.execSync(targets[i].AED, options);

                AED_Status = 'success'
            } catch (e) {
                AED_Status = 'fail';
            }
        }
        const row = {
            date: `${getCurrentTimeStamp()}`,
            status: resStr,
            url: `${host}:${port}`,
            name: targets[i].name,
            AED_Status: AED_Status
        }
        db.insert(row, function(err, newRow) {
            if (err) {
                throw new Error('db insert Error', JSON.stringify(newRow));
            }
        });
        
    }

    console.log('check finish');
    console.groupEnd();
}

function setIntervalAndExecute(fn, t) {
    fn();
    return setInterval(fn, t);
}

const intervalId = setIntervalAndExecute(() => {
    check();
}, intervalDelay)