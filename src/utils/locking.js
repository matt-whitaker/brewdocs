import Promise from 'bluebird';

const locks = new Map();

function defer() {
    let resolve, reject;

    const promise = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
    });

    return {
        resolve: resolve,
        reject: reject,
        promise: () => promise
    };
}

export default {
    create (resource) {
        // Generate lock key
        const key = `${resource}.lock`;

        // Get the lock's promise (initialize if not set yet)
        const oldPromise = locks.get(key);

        // Create the deferred to resolve when unlocking
        const deferred = defer();

        // The new lock promise will be set in Map and returned
        const promise = oldPromise ? oldPromise.then(() => deferred.promise()) : Promise.resolve();
        locks.set(key, promise);

        function unlock(data) {
            try {
                // Ensure the previous is actually resolved before inching forward
                return (oldPromise || Promise.resolve())
                    .tap(() => {
                        deferred.resolve()
                    })
                    .then(() => data);
            } catch (e) {
                console.log(e);
                throw e;
            }
        }

        unlock.promise = () => {
            return promise;
        };

        return unlock;
    }
};