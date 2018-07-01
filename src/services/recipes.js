import {ifElse, indentity} from 'ramda';
import storage, {KeyMissError} from '../utils/storage';
import locking from '../utils/locking';

export default {
    get () {
        return storage.get('recipes')
            .catch({name: KeyMissError.name}, () => [])
            .then((data) => new Map(data))
    },

    create (recipe) {
        const recipeLock = locking.create('recipes');

        return recipeLock.promise()
            .tap(() => console.log(`recipe:${recipe.id} next in line`))
            .then(() => this.get())
            .then((data) => storage.set('recipes', [...data.set(recipe.id, recipe).entries()]))
            .tap(() => console.log(`Unlocking for recipe:${recipe.id}`))
            .tap(recipeLock)
            .tap(() => console.log(`Unlocked for recipe:${recipe.id}`))
            .then((data) => new Map(data));
    }
}