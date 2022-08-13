const fs = require('fs')
const input = fs.readFileSync('./cangjie3.dict.yaml', 'utf-8')
const dictString = input.substring(input.indexOf('...\n') + 5)

const dictEntries = dictString.split('\n')
// Some characters have multiple IME codes, but we would ignore them as this is used to estimate character difficulty.

const filteredDictEntries = dictEntries.filter(entry =>
  // Filter out Unicode CJK Ext-E or after
  entry.indexOf('\t') === 1 &&
  entry.match(/\t(?:z|yyy)/) === null
)

fs.writeFileSync('./filteredCangjie3.txt', filteredDictEntries.join('\n'), 'utf-8')

const charByCJLength = {
  1: '',
  2: '',
  3: '',
  4: '',
  5: '',
}

filteredDictEntries.forEach(([c, t, ...codes]) => {
  charByCJLength[codes.length] += c
})

fs.writeFileSync('./charByCJLength.json', JSON.stringify(charByCJLength), 'utf-8')
