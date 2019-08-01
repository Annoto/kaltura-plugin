
try { require('require-dir')('tasks'); } catch (err) { console.error(err); }

function defaultTask(cb) {
    // place code for your default task here
    cb();
}

exports.default = defaultTask
