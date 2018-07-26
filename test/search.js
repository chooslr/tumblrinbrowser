import assert from 'assert'
import { search, generateSearch } from '../rewired.v1.js'
import { recursiveAddPostTillDone } from '../src/util.js'

const recursiveTillEmpty = (name, word, page = 1, set = new Set()) =>
	search(name, word, page).then(posts => {
		posts.forEach(post => set.add(post))
		return !posts.length ? [...set.values()] : recursiveTillEmpty(name, word, page + 1, set)
	})

it('equal search() and generateSearch()', async () => {
	const name = 'staff'
	const word = 'future'
	const postsBySingle = await recursiveTillEmpty(name, word)
	const postsByGenerate = await generateSearch({ name, word }).then(recursiveAddPostTillDone)
	assert.equal(postsBySingle.length, postsByGenerate.length)
})