import Datastore from 'nedb';

const db = new Datastore({ filename: `./data/storage.data`, autoload: true});

db.loadDatabase(function (err) {
    if (err) {
        throw new Error('loadDatabase Error');
    }
});

class Inspector {
    showError(callback) {
        db.find({ status: "closed" }, function(err, docs) {
            callback(docs);
        });
    }
    showLastStatus(callback) {
        db.find({ }).sort({ date: 1 }).limit(5).exec(function(err, docs) {
            callback(docs);
        })
    }
}

const InspectorObj = new Inspector();

process.argv.forEach(function (val, index, array) {
    switch(val) {
        case 'error': InspectorObj.showError(console.log); break;
        case 'last': InspectorObj.showLastStatus(console.log); break;
        default: break;
    }
});