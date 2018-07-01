import Promise from 'bluebird';

export class KeyMissError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KeyMissError';
    }

    static get name () { return 'KeyMissError' }
}

const keyMissError = (key) => Promise.reject(new KeyMissError(`'${key}' not found.`));

export default {
    getSync (key) {
        const dataStr = localStorage.getItem(key);

        if (dataStr) return JSON.parse(dataStr);

        throw new KeyMissError(`'${key}' not found.`);
    },

    get (key) {
        return (new Promise((res, rej) =>
            res(this.getSync(key))))
            .then((data) => !data ? keyMissError(key) : data);

    },

    setSync (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return this.getSync(key);
    },

    set (key, value) {
        return (new Promise((res, rej) =>
            res(this.setSync(key, value))))
            .then(() => this.get(key));
    }
};